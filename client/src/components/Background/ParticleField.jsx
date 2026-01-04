import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { createNoise3D } from 'simplex-noise';
import * as THREE from 'three';

const noise3D = createNoise3D();

// Color palettes for themes - luxury metallics
const COLORS = {
    light: {
        primary: new THREE.Color('#0EA5E9'),    // Sky 500
        secondary: new THREE.Color('#38BDF8'),  // Sky 400
        tertiary: new THREE.Color('#7DD3FC'),   // Sky 300
    },
};

function ParticleLayer({
    count,
    size,
    speed,
    depth,
    mouseInfluence,
    mousePosition,
    scrollVelocity,
    reducedMotion
}) {
    const mesh = useRef();
    const { theme } = useTheme();

    // Create particle positions and attributes
    const { positions, colors, scales, velocities, originalPositions } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        const velocities = new Float32Array(count * 3);
        const originalPositions = new Float32Array(count * 3);

        const colorPalette = COLORS[theme] || COLORS.dark;
        const colorOptions = [colorPalette.primary, colorPalette.secondary, colorPalette.tertiary];

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Random positions in 3D space
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * depth;

            // Store original positions
            originalPositions[i3] = positions[i3];
            originalPositions[i3 + 1] = positions[i3 + 1];
            originalPositions[i3 + 2] = positions[i3 + 2];

            // Initial velocities
            velocities[i3] = (Math.random() - 0.5) * 0.01;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.005;

            // Random color from palette
            const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            // Random scales
            scales[i] = Math.random() * 0.5 + 0.5;
        }

        return { positions, colors, scales, velocities, originalPositions };
    }, [count, depth, theme]);

    // Update colors when theme changes
    const targetColors = useRef(new Float32Array(count * 3));

    useMemo(() => {
        const colorPalette = COLORS[theme] || COLORS.dark;
        const colorOptions = [colorPalette.primary, colorPalette.secondary, colorPalette.tertiary];

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
            targetColors.current[i3] = color.r;
            targetColors.current[i3 + 1] = color.g;
            targetColors.current[i3 + 2] = color.b;
        }
    }, [theme, count]);

    useFrame((state) => {
        if (!mesh.current || reducedMotion) return;

        const time = state.clock.elapsedTime * speed;
        const geometry = mesh.current.geometry;
        const positionAttribute = geometry.attributes.position;
        const colorAttribute = geometry.attributes.color;

        // Calculate mouse influence (centered at 0.5, 0.5)
        const mouseX = (mousePosition.x - 0.5) * 2;
        const mouseY = (mousePosition.y - 0.5) * 2;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Noise-based organic movement
            const noiseX = noise3D(
                originalPositions[i3] * 0.1 + time * 0.1,
                originalPositions[i3 + 1] * 0.1,
                originalPositions[i3 + 2] * 0.1
            );
            const noiseY = noise3D(
                originalPositions[i3] * 0.1,
                originalPositions[i3 + 1] * 0.1 + time * 0.1,
                originalPositions[i3 + 2] * 0.1
            );
            const noiseZ = noise3D(
                originalPositions[i3] * 0.1,
                originalPositions[i3 + 1] * 0.1,
                originalPositions[i3 + 2] * 0.1 + time * 0.05
            );

            // Apply noise movement
            positionAttribute.array[i3] = originalPositions[i3] + noiseX * 0.5;
            positionAttribute.array[i3 + 1] = originalPositions[i3 + 1] + noiseY * 0.5;
            positionAttribute.array[i3 + 2] = originalPositions[i3 + 2] + noiseZ * 0.3;

            // Mouse influence (subtle attraction/repulsion)
            const dx = mouseX * 2 - originalPositions[i3] * 0.1;
            const dy = -mouseY * 2 - originalPositions[i3 + 1] * 0.1;
            positionAttribute.array[i3] += dx * mouseInfluence * 0.3;
            positionAttribute.array[i3 + 1] += dy * mouseInfluence * 0.3;

            // Scroll velocity influence
            positionAttribute.array[i3 + 1] += scrollVelocity * (originalPositions[i3 + 2] > 0 ? 0.5 : -0.5);

            // Smooth color transition
            colorAttribute.array[i3] += (targetColors.current[i3] - colorAttribute.array[i3]) * 0.02;
            colorAttribute.array[i3 + 1] += (targetColors.current[i3 + 1] - colorAttribute.array[i3 + 1]) * 0.02;
            colorAttribute.array[i3 + 2] += (targetColors.current[i3 + 2] - colorAttribute.array[i3 + 2]) * 0.02;
        }

        positionAttribute.needsUpdate = true;
        colorAttribute.needsUpdate = true;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={size}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

export function ParticleField({ mousePosition, scrollVelocity, reducedMotion }) {
    return (
        <group>
            {/* Far background layer - slowest, smallest */}
            <ParticleLayer
                count={800}
                size={0.015}
                speed={0.15}
                depth={8}
                mouseInfluence={0.1}
                mousePosition={mousePosition}
                scrollVelocity={scrollVelocity}
                reducedMotion={reducedMotion}
            />

            {/* Mid layer */}
            <ParticleLayer
                count={500}
                size={0.025}
                speed={0.25}
                depth={5}
                mouseInfluence={0.2}
                mousePosition={mousePosition}
                scrollVelocity={scrollVelocity}
                reducedMotion={reducedMotion}
            />

            {/* Foreground layer - fastest, largest */}
            <ParticleLayer
                count={300}
                size={0.04}
                speed={0.4}
                depth={3}
                mouseInfluence={0.35}
                mousePosition={mousePosition}
                scrollVelocity={scrollVelocity}
                reducedMotion={reducedMotion}
            />
        </group>
    );
}
