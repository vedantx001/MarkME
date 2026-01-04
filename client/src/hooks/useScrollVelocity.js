import { useState, useEffect, useRef } from 'react';

export function useScrollVelocity() {
    const [velocity, setVelocity] = useState(0);
    const lastScrollY = useRef(0);
    const lastTime = useRef(Date.now());

    useEffect(() => {
        let animationId;

        const handleScroll = () => {
            const currentTime = Date.now();
            const currentScrollY = window.scrollY;
            const timeDelta = Math.max(currentTime - lastTime.current, 1);
            const scrollDelta = currentScrollY - lastScrollY.current;

            // Calculate velocity (pixels per millisecond, normalized)
            const rawVelocity = Math.abs(scrollDelta) / timeDelta;
            const normalizedVelocity = Math.min(rawVelocity * 10, 1);

            setVelocity(normalizedVelocity);

            lastScrollY.current = currentScrollY;
            lastTime.current = currentTime;
        };

        const decay = () => {
            setVelocity(prev => {
                if (prev > 0.01) {
                    return prev * 0.95; // Smooth decay
                }
                return 0;
            });
            animationId = requestAnimationFrame(decay);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        animationId = requestAnimationFrame(decay);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return velocity;
}
