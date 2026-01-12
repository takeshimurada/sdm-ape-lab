import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GreenMoleculeProps {
  position: [number, number, number];
  active: boolean;
  delay: number;
}

/**
 * Spline 마블 blob 스타일의 초록 분자
 * 유기적으로 움직이며 떠다니는 구체
 */
const GreenMolecule: React.FC<GreenMoleculeProps> = ({ position, active, delay }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const t = state.clock.getElapsedTime() * 0.5 + delay;
    const material = meshRef.current.material as THREE.MeshPhysicalMaterial;
    
    if (active) {
      // 랜덤한 방향으로 떠다님
      const floatX = Math.sin(t * 0.7 + delay) * 0.3;
      const floatY = Math.cos(t * 0.5 + delay) * 0.4 - t * 0.15; // 위로 떠오름
      const floatZ = Math.sin(t * 0.6 + delay * 1.5) * 0.2;
      
      meshRef.current.position.x = position[0] + floatX;
      meshRef.current.position.y = position[1] + floatY;
      meshRef.current.position.z = position[2] + floatZ;
      
      // 유기적으로 변형 (blob 느낌)
      const scaleX = 1.0 + Math.sin(t * 2 + delay) * 0.3;
      const scaleY = 1.0 + Math.cos(t * 1.8 + delay) * 0.3;
      const scaleZ = 1.0 + Math.sin(t * 2.2 + delay) * 0.3;
      meshRef.current.scale.set(scaleX, scaleY, scaleZ);
      
      // 회전
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.015;
      meshRef.current.rotation.z += 0.008;
      
      // 투명도: 서서히 나타났다가 사라짐
      const lifeTime = (t - delay) % 8.0;
      let opacity = 0;
      if (lifeTime < 1.0) {
        opacity = lifeTime; // Fade in
      } else if (lifeTime < 6.0) {
        opacity = 0.85; // Stay visible
      } else {
        opacity = 0.85 * (1 - (lifeTime - 6.0) / 2.0); // Fade out
      }
      material.opacity = THREE.MathUtils.lerp(material.opacity, opacity, 0.1);
      
      // 발광 강도
      material.emissiveIntensity = THREE.MathUtils.lerp(
        material.emissiveIntensity,
        15 + Math.sin(t * 3) * 5,
        0.1
      );
    } else {
      // 비활성화: 사라짐
      material.opacity = THREE.MathUtils.lerp(material.opacity, 0, 0.15);
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 0, 0.15);
      const targetScale = 0.1;
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1);
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScale, 0.1);
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, targetScale, 0.1);
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      {/* 고해상도 구체 */}
      <icosahedronGeometry args={[0.08, 4]} />
      <meshPhysicalMaterial
        color="#00ffaa"
        emissive="#00ff88"
        emissiveIntensity={0}
        transparent
        opacity={0}
        roughness={0.1}
        metalness={0.0}
        transmission={0.6}
        ior={1.4}
        thickness={1.0}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        reflectivity={1.0}
        sheen={0.5}
        sheenRoughness={0.3}
        sheenColor="#00ffcc"
        envMapIntensity={1.5}
        attenuationDistance={0.5}
        attenuationColor="#00ffaa"
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

export default GreenMolecule;
