import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import '../../styles/ContributionOverlay.css';

export function ContributionOverlay({ developer, clickPosition, onClose }) {
    const overlayRef = useRef(null);
    const contentRef = useRef(null);

    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    // Focus trap
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.focus();
        }
    }, []);

    return (
        <motion.div
            ref={overlayRef}
            className="contribution-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={(e) => {
                if (e.target === overlayRef.current) {
                    onClose();
                }
            }}
        >
            {/* Backdrop blur */}
            <div className="contribution-overlay__backdrop" />

            {/* Content */}
            <motion.div
                ref={contentRef}
                className="contribution-overlay__content glass-surface-strong"
                initial={{
                    opacity: 0,
                    scale: 0.8,
                    x: clickPosition.x - window.innerWidth / 2,
                    y: clickPosition.y - window.innerHeight / 2
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    y: 0
                }}
                exit={{
                    opacity: 0,
                    scale: 0.9,
                    x: clickPosition.x - window.innerWidth / 2,
                    y: clickPosition.y - window.innerHeight / 2
                }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="overlay-title"
            >
                {/* Close button */}
                <button
                    className="contribution-overlay__close"
                    onClick={onClose}
                    aria-label="Close overlay"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="contribution-overlay__grid">
                    {/* Left: Developer Info */}
                    <div className="contribution-overlay__left">
                        <div className="contribution-overlay__avatar-container">
                            <div className="contribution-overlay__avatar-ring" />
                            <img
                                src={developer.avatar}
                                alt={developer.name}
                                className="contribution-overlay__avatar"
                            />
                            <div className="contribution-overlay__avatar-glow" />
                        </div>

                        <h2 id="overlay-title" className="contribution-overlay__name heading-lg">
                            {developer.name}
                        </h2>
                        <span className="contribution-overlay__role">{developer.role}</span>

                        {/* Links */}
                        <div className="contribution-overlay__links">
                            {developer.links.github && (
                                <a
                                    href={developer.links.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contribution-overlay__link"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    <span>GitHub</span>
                                </a>
                            )}
                            {developer.links.linkedin && (
                                <a
                                    href={developer.links.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contribution-overlay__link"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                    <span>LinkedIn</span>
                                </a>
                            )}
                            {developer.links.portfolio && (
                                <a
                                    href={developer.links.portfolio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contribution-overlay__link"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="2" y1="12" x2="22" y2="12" />
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                    </svg>
                                    <span>Portfolio</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Right: Contributions */}
                    <div className="contribution-overlay__right">
                        {/* Modules */}
                        <div className="contribution-overlay__section">
                            <h3 className="contribution-overlay__section-title heading-sm">
                                Modules Owned
                            </h3>
                            <div className="contribution-overlay__tags">
                                {developer.contributions.modules.map((module, i) => (
                                    <span key={i} className="contribution-overlay__tag">
                                        {module}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Features */}
                        <div className="contribution-overlay__section">
                            <h3 className="contribution-overlay__section-title heading-sm">
                                Key Contributions
                            </h3>
                            <ul className="contribution-overlay__list">
                                {developer.contributions.features.map((feature, i) => (
                                    <li key={i} className="contribution-overlay__list-item">
                                        <span className="contribution-overlay__list-icon">→</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Tech Stack */}
                        <div className="contribution-overlay__section">
                            <h3 className="contribution-overlay__section-title heading-sm">
                                Tech Stack
                            </h3>
                            <div className="contribution-overlay__tags contribution-overlay__tags--tech">
                                {developer.contributions.techStack.map((tech, i) => (
                                    <span key={i} className="contribution-overlay__tag contribution-overlay__tag--tech">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Decisions */}
                        <div className="contribution-overlay__section">
                            <h3 className="contribution-overlay__section-title heading-sm">
                                Technical Decisions
                            </h3>
                            <ul className="contribution-overlay__list contribution-overlay__list--decisions">
                                {developer.contributions.decisions.map((decision, i) => (
                                    <li key={i} className="contribution-overlay__list-item">
                                        <span className="contribution-overlay__list-icon">◆</span>
                                        {decision}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
