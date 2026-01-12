
import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface ThreeTorsoProps {
  onFeatureClick: (name: string) => void;
}

const ThreeTorso: React.FC<ThreeTorsoProps> = ({ onFeatureClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const { mouse, viewport } = useThree();
  const [hovered, setHovered] = useState<string | null>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const targetX = -(mouse.y * viewport.height) / 20;
    const targetY = (mouse.x * viewport.width) / 20;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.05);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.05);
  });

  const glassMaterial = (isActive: boolean) => (
    <meshPhysicalMaterial
      color={isActive ? "#818cf8" : "#ffffff"}
      transmission={0.9}
      thickness={0.5}
      roughness={0.05}
      ior={1.5}
      clearcoat={1}
      emissive={isActive ? "#4f46e5" : "#000000"}
      emissiveIntensity={isActive ? 2 : 0}
    />
  );

  const InteractiveNode = ({ position, scale, name, type = "sphere" }: any) => (
    <mesh
      position={position}
      scale={scale}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(name); }}
      onPointerOut={() => { setHovered(null); }}
      onClick={(e) => { e.stopPropagation(); onFeatureClick(name); }}
    >
      {type === "sphere" ? <sphereGeometry args={[1, 32, 32]} /> : <capsuleGeometry args={[0.5, 1, 32, 32]} />}
      {glassMaterial(hovered === name)}
    </mesh>
  );

  return (
    <group ref={groupRef}>
      <pointLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-5, 2, 2]} intensity={1} color="#818cf8" />
      <spotLight position={[0, 5, -5]} intensity={4} color="#6366f1" angle={0.5} penumbra={1} />

      <mesh position={[0, -2.4, -0.3]} scale={[1.4, 0.9, 0.8]}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshPhysicalMaterial 
          color="#0f172a" 
          roughness={0.8} 
        />
      </mesh>
      
      <group position={[0, 0, 0]} ref={headRef}>
        <mesh scale={[1, 1.25, 0.95]}>
          <capsuleGeometry args={[0.9, 0.6, 32, 64]} />
          <meshPhysicalMaterial 
            color="#f2cbbd" 
            roughness={0.25} 
          />
        </mesh>

        <group position={[0, 0.3, -0.1]}>
          <mesh scale={[1.1, 0.7, 1.05]}>
            <sphereGeometry args={[1, 64, 32, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
            <meshPhysicalMaterial color="#0a0a0a" roughness={0.7} />
          </mesh>
        </group>

        {/* 윤곽선이 있는 링 제거, 오직 포인트 노드만 유지 */}
        <group position={[-0.35, 0.25, 0.9]}>
           <InteractiveNode scale={[0.07, 0.07, 0.07]} name="eyes" />
        </group>
        <group position={[0.35, 0.25, 0.9]}>
           <InteractiveNode scale={[0.07, 0.07, 0.07]} name="eyes" />
        </group>

        <InteractiveNode position={[0, -0.1, 1.05]} scale={[0.05, 0.05, 0.05]} name="nose" />
        <InteractiveNode position={[0, -0.6, 0.95]} scale={[0.18, 0.02, 0.05]} name="mouth" type="capsule" />
      </group>

      {[...Array(8)].map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={2} floatIntensity={2}>
          <mesh position={[Math.sin(i) * 4, Math.cos(i) * 3, -3]} scale={0.03}>
            <sphereGeometry />
            <meshBasicMaterial color="#4f46e5" transparent opacity={0.4} />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

export default ThreeTorso;
