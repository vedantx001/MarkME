import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ParticleField } from './ParticleField';
import { useReducedMotion } from '../../hooks/useReducedMotion';

function StaticBackground() {
    const { theme } = useTheme();

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: theme === 'dark'
                    ? 'radial-gradient(ellipse at 30% 20%, rgba(196, 154, 108, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(139, 101, 66, 0.06) 0%, transparent 50%)'
                    : 'radial-gradient(ellipse at 30% 20%, rgba(14, 165, 233, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(125, 211, 252, 0.08) 0%, transparent 50%)',
                zIndex: -1,
                transition: 'background 0.7s ease'
            }}
        />
    );
}

export function ThreeBackground({ mousePosition, scrollVelocity }) {
    const reducedMotion = useReducedMotion();
    const [webGLSupported, setWebGLSupported] = useState(true);

    useEffect(() => {
        // Check WebGL support
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) {
                setWebGLSupported(false);
            }
        } catch (e) {
            setWebGLSupported(false);
        }
    }, []);

    // If reduced motion or no WebGL, show static background
    if (reducedMotion || !webGLSupported) {
        return <StaticBackground />;
    }

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            pointerEvents: 'none'
        }}>
            <Suspense fallback={<StaticBackground />}>
                <Canvas
                    camera={{ position: [0, 0, 6], fov: 60 }}
                    dpr={[1, 1.5]}
                    gl={{
                        antialias: true,
                        alpha: true,
                        powerPreference: 'high-performance'
                    }}
                    style={{ background: 'transparent' }}
                >
                    <ParticleField
                        mousePosition={mousePosition}
                        scrollVelocity={scrollVelocity}
                        reducedMotion={reducedMotion}
                    />
                </Canvas>
            </Suspense>
        </div>
    );
}
