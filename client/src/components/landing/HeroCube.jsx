import React, { useRef, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

// Brand colors
const BRAND_COLORS = {
  primary: '#85C7F2',
  accent: '#0EA5E9',
  secondary: '#38BDF8',
};

// Simple wireframe cube
const WireframeCube = ({ size, color, rotationSpeed = 0.1, rotationAxes = [0, 1, 0] }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime * rotationSpeed;
      meshRef.current.rotation.x = t * rotationAxes[0];
      meshRef.current.rotation.y = t * rotationAxes[1];
      meshRef.current.rotation.z = t * rotationAxes[2];
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[size, size, size]} />
      <meshBasicMaterial 
        color={color} 
        wireframe={true}
      />
    </mesh>
  );
};

// Main structure
const HyperStructure = () => {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer cube */}
      <WireframeCube 
        size={3} 
        color={BRAND_COLORS.primary}
        rotationSpeed={0.15}
        rotationAxes={[0, 1, 0]}
      />
      
      {/* Middle cube */}
      <WireframeCube 
        size={2.2} 
        color={BRAND_COLORS.secondary}
        rotationSpeed={0.2}
        rotationAxes={[1, 0, 0.5]}
      />
      
      {/* Inner cube */}
      <WireframeCube 
        size={1.4} 
        color={BRAND_COLORS.accent}
        rotationSpeed={0.3}
        rotationAxes={[1, 0.7, 0]}
      />

      {/* Core sphere */}
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color={BRAND_COLORS.accent} />
      </mesh>
    </group>
  );
};

// Scene - removed Environment to reduce GPU load
const Scene = () => {
  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />
      <HyperStructure />
    </>
  );
};

// Loader
const Loader = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-[#85C7F2]/30 border-t-[#85C7F2] rounded-full animate-spin" />
  </div>
);

// Main component with mount guard
const HeroCube = () => {
  const [mounted, setMounted] = useState(false);

  // Delay canvas mounting to avoid HMR context issues
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => {
      clearTimeout(timer);
      setMounted(false);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="relative w-full h-80 sm:h-105 lg:h-150">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative w-full h-80 sm:h-105 lg:h-150">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 bg-linear-to-br from-[#85C7F2]/20 to-[#0EA5E9]/10 rounded-full blur-3xl" />
      </div>
      
      <Suspense fallback={<Loader />}>
        <Canvas
          camera={{ position: [0, 0, 7], fov: 45 }}
          gl={{ 
            alpha: true, 
            antialias: false,
            powerPreference: "low-power",
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false
          }}
          style={{ background: 'transparent' }}
          dpr={1}
          frameloop="always"
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default HeroCube;
