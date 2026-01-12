
import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ThreeFace: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { mouse, viewport } = useThree();
  
  // In a real production scenario, we would use a GLB model.
  // Here we use a sphere with a sophisticated material to simulate the provided face renderings.
  // We use the first image provided by the user as a reference (placeholder used here).
  const texture = useTexture('https://picsum.photos/1024/1024?grayscale');

  // We'll create a "Portrait Disc" that tracks the mouse
  useFrame((state) => {
    if (!meshRef.current) return;

    // Smoothly calculate target rotations based on mouse
    const targetX = -(mouse.y * viewport.height) / 8;
    const targetY = (mouse.x * viewport.width) / 8;

    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetX,
      0.1
    );
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetY,
      0.1
    );

    // Dynamic scale pulse
    const time = state.clock.getElapsedTime();
    const scale = 1.8 + Math.sin(time * 0.5) * 0.05;
    meshRef.current.scale.set(scale, scale, scale);
  });

  // Geometry for a high-quality "head" shape simulation
  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          map={texture}
          distort={0.1}
          speed={3}
          roughness={0.2}
          metalness={0.1}
          color="#ffffff"
        />
      </mesh>
      
      {/* Decorative Outer Rings for Spline-like aesthetic */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.005, 16, 100]} />
        <meshBasicMaterial color="#818cf8" transparent opacity={0.2} />
      </mesh>
      <mesh rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={[1.7, 0.005, 16, 100]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.1} />
      </mesh>
    </group>
  );
};

export default ThreeFace;
