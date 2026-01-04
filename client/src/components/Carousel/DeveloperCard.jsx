import { useState } from 'react';
import { motion } from 'framer-motion';
import '../../styles/DeveloperCard.css';

export function DeveloperCard({ developer, isActive, onClick, index }) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <motion.article
            className={`developer-card ${isActive ? 'is-active' : ''}`}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: index * 0.1 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick(e);
                }
            }}
            role="button"
            aria-label={`View ${developer.name}'s contributions`}
        >
            <div className="developer-card__frame">
                {/* Image */}
                <div className="developer-card__image-container">
                    <img
                        src={developer.avatar}
                        alt={developer.name}
                        className={`developer-card__image ${imageLoaded ? 'loaded' : ''}`}
                        onLoad={() => setImageLoaded(true)}
                        loading="lazy"
                    />

                    {/* Gradient overlay */}
                    <div className="developer-card__gradient" />
                </div>

                {/* Always visible role label - centered like reference */}
                <div className="developer-card__label">
                    <span className="developer-card__role">{developer.role}</span>
                </div>

                {/* Play button indicator */}
                <div className="developer-card__play">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="8,5 19,12 8,19" />
                    </svg>
                </div>

                {/* Hover overlay with full info */}
                <motion.div
                    className="developer-card__info"
                    initial={false}
                    animate={{
                        opacity: isHovered ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="developer-card__glass">
                        <h3 className="developer-card__name heading-md">{developer.name}</h3>
                        <span className="developer-card__role-full">{developer.role}</span>

                        <ul className="developer-card__highlights">
                            {developer.highlights.map((highlight, i) => (
                                <li key={i} className="developer-card__highlight">
                                    <span className="developer-card__highlight-dot" />
                                    {highlight}
                                </li>
                            ))}
                        </ul>

                        <span className="developer-card__cta">Click to explore →</span>
                    </div>
                </motion.div>
            </div>
        </motion.article>
    );
}
