import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeveloperCard } from './DeveloperCard';
import { ContributionOverlay } from '../Overlay/ContributionOverlay';
import { developers } from '../../data/developers';
import '../../styles/DeveloperCarousel.css';

export function DeveloperCarousel() {
    const [selectedDeveloper, setSelectedDeveloper] = useState(null);
    const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const sectionRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [velocity, setVelocity] = useState(0);
    const lastX = useRef(0);
    const lastTime = useRef(Date.now());
    const animationRef = useRef(null);
    const isMouseOverCarousel = useRef(false);

    // Calculate card width based on viewport
    const getCardWidth = () => {
        if (!containerRef.current) return 600;
        return Math.min(containerRef.current.offsetWidth * 0.75, 800);
    };

    // Calculate which item is active
    const updateActiveIndex = useCallback(() => {
        if (!trackRef.current || !containerRef.current) return;

        const track = trackRef.current;
        const container = containerRef.current;
        const cardWidth = getCardWidth() + 40; // card width + gap
        const scrollCenter = track.scrollLeft + container.offsetWidth / 2;
        const newIndex = Math.round((scrollCenter - container.offsetWidth / 2) / cardWidth);

        setActiveIndex(Math.max(0, Math.min(newIndex, developers.length - 1)));
    }, []);

    // Scroll to specific card
    const scrollToCard = useCallback((index) => {
        if (!trackRef.current || !containerRef.current) return;

        const cardWidth = getCardWidth() + 40;
        const targetScroll = index * cardWidth;

        trackRef.current.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });

        setActiveIndex(index);
    }, []);

    // Wheel handler - capture wheel at window level to prevent page scroll when over carousel
    useEffect(() => {
        const handleWheel = (e) => {
            // Only hijack scroll when mouse is over the carousel section
            if (!isMouseOverCarousel.current) return;

            // Check if the carousel track has actually scrolled to the edge
            const track = trackRef.current;
            if (!track) return;

            const atStart = track.scrollLeft <= 0;
            const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;

            // Allow page scroll if we're at the edge and trying to scroll further
            const scrollingLeft = e.deltaY < 0;
            const scrollingRight = e.deltaY > 0;

            if ((atStart && scrollingLeft) || (atEnd && scrollingRight)) {
                // Allow natural page scroll when at carousel edges
                return;
            }

            // Prevent the page from scrolling
            e.preventDefault();
            e.stopPropagation();

            // Use vertical scroll for horizontal movement
            const scrollAmount = e.deltaY !== 0 ? e.deltaY : e.deltaX;
            track.scrollLeft += scrollAmount * 1.5;
            updateActiveIndex();
        };

        // Use capture phase at window level for maximum control
        window.addEventListener('wheel', handleWheel, { passive: false, capture: true });

        return () => {
            window.removeEventListener('wheel', handleWheel, { capture: true });
        };
    }, [updateActiveIndex]);

    // Inertia scrolling
    useEffect(() => {
        if (isDragging) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            return;
        }

        if (Math.abs(velocity) < 0.5) {
            updateActiveIndex();
            return;
        }

        const animate = () => {
            if (trackRef.current) {
                trackRef.current.scrollLeft += velocity;
                setVelocity(prev => prev * 0.92); // Friction

                if (Math.abs(velocity) > 0.5) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    updateActiveIndex();
                }
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isDragging, velocity, updateActiveIndex]);

    // Mouse/touch handlers for drag
    const handleDragStart = (e) => {
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        setIsDragging(true);
        setStartX(clientX);
        setScrollLeft(trackRef.current.scrollLeft);
        lastX.current = clientX;
        lastTime.current = Date.now();
        setVelocity(0);
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();

        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const walk = (startX - clientX) * 1.2;
        trackRef.current.scrollLeft = scrollLeft + walk;

        // Calculate velocity
        const now = Date.now();
        const dt = now - lastTime.current;
        if (dt > 0) {
            const dx = lastX.current - clientX;
            setVelocity(dx / dt * 16);
        }

        lastX.current = clientX;
        lastTime.current = now;
        updateActiveIndex();
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };



    // Card click handler
    const handleCardClick = (developer, e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setClickPosition({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        });
        setSelectedDeveloper(developer);
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft' && activeIndex > 0) {
            scrollToCard(activeIndex - 1);
        } else if (e.key === 'ArrowRight' && activeIndex < developers.length - 1) {
            scrollToCard(activeIndex + 1);
        }
    };

    return (
        <>
            <section
                ref={sectionRef}
                className="carousel-section"
                onMouseEnter={() => { isMouseOverCarousel.current = true; }}
                onMouseLeave={() => { isMouseOverCarousel.current = false; }}
            >
                <motion.div
                    className="carousel-header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="heading-lg">Meet the Engineers</h2>
                    <p className="text-body carousel-subtitle">
                        Click on any developer to explore their contributions
                    </p>
                </motion.div>

                <div
                    ref={containerRef}
                    className="carousel-container"
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    role="region"
                    aria-label="Developer carousel"
                >
                    <div
                        ref={trackRef}
                        className={`carousel-track ${isDragging ? 'is-dragging' : ''}`}
                        onMouseDown={handleDragStart}
                        onMouseMove={handleDragMove}
                        onMouseUp={handleDragEnd}
                        onMouseLeave={handleDragEnd}
                        onTouchStart={handleDragStart}
                        onTouchMove={handleDragMove}
                        onTouchEnd={handleDragEnd}
                    >
                        {developers.map((developer, index) => (
                            <DeveloperCard
                                key={developer.id}
                                developer={developer}
                                isActive={index === activeIndex}
                                onClick={(e) => handleCardClick(developer, e)}
                                index={index}
                            />
                        ))}
                    </div>
                </div>

                {/* Premium Progress Indicators */}
                <div className="carousel-progress">
                    <div className="carousel-progress__track">
                        <motion.div
                            className="carousel-progress__fill"
                            animate={{
                                width: `${((activeIndex + 1) / developers.length) * 100}%`
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                    </div>
                    <div className="carousel-progress__counter">
                        <span className="carousel-progress__current">{String(activeIndex + 1).padStart(2, '0')}</span>
                        <span className="carousel-progress__divider">/</span>
                        <span className="carousel-progress__total">{String(developers.length).padStart(2, '0')}</span>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <div className="carousel-nav">
                    <button
                        className="carousel-nav__btn carousel-nav__btn--prev"
                        onClick={() => scrollToCard(Math.max(0, activeIndex - 1))}
                        disabled={activeIndex === 0}
                        aria-label="Previous developer"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15,18 9,12 15,6" />
                        </svg>
                    </button>
                    <button
                        className="carousel-nav__btn carousel-nav__btn--next"
                        onClick={() => scrollToCard(Math.min(developers.length - 1, activeIndex + 1))}
                        disabled={activeIndex === developers.length - 1}
                        aria-label="Next developer"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9,6 15,12 9,18" />
                        </svg>
                    </button>
                </div>
            </section>

            <AnimatePresence>
                {selectedDeveloper && (
                    <ContributionOverlay
                        developer={selectedDeveloper}
                        clickPosition={clickPosition}
                        onClose={() => setSelectedDeveloper(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
