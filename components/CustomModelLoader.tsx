
import React, { useRef, useLayoutEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CustomModelLoaderProps {
  url: string;
}

/**
 * MetaLab 스타일의 고점성 표면 밀착 액체
 * 인중의 굴곡을 따라 흐르는 유기적인 점성체
 */
const MetaLabGooeyDrip: React.FC<{ position: [number, number, number], active: boolean, delay: number }> = ({ position, active, delay }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    
    const t = state.clock.getElapsedTime() * 0.12 + delay;
    
    // 점성 스케일 애니메이션
    const targetScaleY = active ? 3.2 + Math.sin(t * 2.5) * 0.6 : 0;
    const targetScaleX = active ? 0.6 + Math.cos(t * 1.5) * 0.05 : 0.4;
    
    meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScaleY, 0.04);
    meshRef.current.scale.x = meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScaleX, 0.04);
    
    // 표면 추적 로직
    const dripProgress = meshRef.current.scale.y * 0.035;
    meshRef.current.position.y = position[1] - dripProgress;
    
    const surfaceCurve = Math.sin(Math.min(dripProgress * 12.0, Math.PI)) * 0.065;
    meshRef.current.position.z = position[2] + surfaceCurve;
    
    materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, active ? 0.95 : 0, 0.06);
    materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(materialRef.current.emissiveIntensity, active ? 15 : 0, 0.05);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.04, 32, 32]} />
      <meshPhysicalMaterial 
        ref={materialRef}
        color="#00ffa2" 
        emissive="#00ff88" 
        emissiveIntensity={0} 
        transparent 
        opacity={0}
        roughness={0}
        metalness={0.05}
        transmission={0.95} 
        ior={1.45} 
        thickness={0.6}
        clearcoat={1.0} 
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

const CustomModelLoader: React.FC<CustomModelLoaderProps> = ({ url }) => {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const noseLight = useRef<THREE.PointLight>(null);
  
  const { mouse, viewport } = useThree();
  const [scale, setScale] = useState(1);
  const [hoveringNose, setHoveringNose] = useState(false);

  useLayoutEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetScale = 2.5 / maxDim;
      setScale(targetScale);

      const center = box.getCenter(new THREE.Vector3());
      scene.position.sub(center);

      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = (child as THREE.Mesh);
          if (m.material) {
            const mat = m.material as THREE.MeshPhysicalMaterial;
            
            // 석재 질감 유지하되 가시성 향상을 위해 미세 조정
            mat.envMapIntensity = 0.15; // 약간의 환경광 반사를 허용하여 형태 정의
            mat.roughness = 0.85;       // 매트함을 유지하되 빛의 흐름을 조금 더 수용
            mat.metalness = 0.0;        // 금속성 없음
            
            if (mat.color) {
               // 어두운 곳에서 텍스처가 뭉치지 않도록 색상 강도 복구
               mat.color.multiplyScalar(1.0); 
            }
          }
        }
      });
    }
  }, [scene]);

  useFrame(() => {
    if (!groupRef.current) return;
    
    const targetX = -(mouse.y * viewport.height) / 30;
    const targetY = (mouse.x * viewport.width) / 30;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.05);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.05);

    if (noseLight.current) {
      const targetInt = hoveringNose ? 5 : 0;
      noseLight.current.intensity = THREE.MathUtils.lerp(noseLight.current.intensity, targetInt, 0.05);
    }
  });

  const nostrilL: [number, number, number] = [-0.075, -0.22, 0.88];
  const nostrilR: [number, number, number] = [0.075, -0.22, 0.88];

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={scale} />

      {/* interaction Area */}
      <group>
        {/* 코 히트박스 */}
        <mesh 
          position={[0, -0.25, 0.9]} 
          onPointerOver={() => setHoveringNose(true)} 
          onPointerOut={() => setHoveringNose(false)} 
          visible={false}
        >
          <boxGeometry args={[0.55, 0.35, 0.4]} />
        </mesh>

        <MetaLabGooeyDrip position={nostrilL} active={hoveringNose} delay={0} />
        <MetaLabGooeyDrip position={nostrilR} active={hoveringNose} delay={1.1} />

        <pointLight ref={noseLight} position={[0, -0.4, 1.0]} color="#00ff88" distance={0.8} decay={2.5} />
      </group>
    </group>
  );
};

export default CustomModelLoader;
