
import React, { useRef, useLayoutEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CustomModelLoaderProps {
  url: string;
}

// Constants for 3D model configuration
const MODEL_CONFIG = {
  TARGET_SCALE: 2.5,
  ENV_MAP_INTENSITY: 0.15,
  ROUGHNESS: 0.85,
  METALNESS: 0.0,
  COLOR_MULTIPLIER: 1.0,
} as const;

// Constants for animation
const ANIMATION_CONFIG = {
  MOUSE_SENSITIVITY: 30,
  LERP_SPEED: 0.05,
  DRIP_SPEED: 0.12,
  DRIP_SCALE_Y_BASE: 3.2,
  DRIP_SCALE_Y_VARIATION: 0.6,
  DRIP_SCALE_X_BASE: 0.6,
  DRIP_SCALE_X_VARIATION: 0.05,
  DRIP_SCALE_X_INACTIVE: 0.4,
  DRIP_PROGRESS_MULTIPLIER: 0.035,
  SURFACE_CURVE_MULTIPLIER: 0.065,
  OPACITY_ACTIVE: 0.95,
  EMISSIVE_INTENSITY_ACTIVE: 15,
  NOSE_LIGHT_INTENSITY: 5,
} as const;

// Constants for geometry
const GEOMETRY_CONFIG = {
  DRIP_RADIUS: 0.04,
  DRIP_SEGMENTS: 32,
  NOSTRIL_LEFT: [-0.075, -0.22, 0.88] as [number, number, number],
  NOSTRIL_RIGHT: [0.075, -0.22, 0.88] as [number, number, number],
  NOSE_POSITION: [0, -0.25, 0.9] as [number, number, number],
  NOSE_HITBOX_SIZE: [0.55, 0.35, 0.4] as [number, number, number],
  LIGHT_POSITION: [0, -0.4, 1.0] as [number, number, number],
  LIGHT_DISTANCE: 0.8,
  LIGHT_DECAY: 2.5,
} as const;

// Constants for material
const MATERIAL_CONFIG = {
  COLOR: '#00ffa2',
  EMISSIVE: '#00ff88',
  LIGHT_COLOR: '#00ff88',
  IOR: 1.45,
  THICKNESS: 0.6,
  TRANSMISSION: 0.95,
  CLEARCOAT: 1.0,
} as const;

/**
 * MetaLab 스타일의 고점성 표면 밀착 액체
 * 인중의 굴곡을 따라 흐르는 유기적인 점성체
 */
const MetaLabGooeyDrip: React.FC<{ position: [number, number, number], active: boolean, delay: number }> = ({ position, active, delay }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    
    const t = state.clock.getElapsedTime() * ANIMATION_CONFIG.DRIP_SPEED + delay;
    
    // 점성 스케일 애니메이션
    const targetScaleY = active 
      ? ANIMATION_CONFIG.DRIP_SCALE_Y_BASE + Math.sin(t * 2.5) * ANIMATION_CONFIG.DRIP_SCALE_Y_VARIATION 
      : 0;
    const targetScaleX = active 
      ? ANIMATION_CONFIG.DRIP_SCALE_X_BASE + Math.cos(t * 1.5) * ANIMATION_CONFIG.DRIP_SCALE_X_VARIATION 
      : ANIMATION_CONFIG.DRIP_SCALE_X_INACTIVE;
    
    meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScaleY, 0.04);
    meshRef.current.scale.x = meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScaleX, 0.04);
    
    // 표면 추적 로직
    const dripProgress = meshRef.current.scale.y * ANIMATION_CONFIG.DRIP_PROGRESS_MULTIPLIER;
    meshRef.current.position.y = position[1] - dripProgress;
    
    const surfaceCurve = Math.sin(Math.min(dripProgress * 12.0, Math.PI)) * ANIMATION_CONFIG.SURFACE_CURVE_MULTIPLIER;
    meshRef.current.position.z = position[2] + surfaceCurve;
    
    const targetOpacity = active ? ANIMATION_CONFIG.OPACITY_ACTIVE : 0;
    const targetEmissive = active ? ANIMATION_CONFIG.EMISSIVE_INTENSITY_ACTIVE : 0;
    
    materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetOpacity, 0.06);
    materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(materialRef.current.emissiveIntensity, targetEmissive, 0.05);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[GEOMETRY_CONFIG.DRIP_RADIUS, GEOMETRY_CONFIG.DRIP_SEGMENTS, GEOMETRY_CONFIG.DRIP_SEGMENTS]} />
      <meshPhysicalMaterial 
        ref={materialRef}
        color={MATERIAL_CONFIG.COLOR}
        emissive={MATERIAL_CONFIG.EMISSIVE}
        emissiveIntensity={0} 
        transparent 
        opacity={0}
        roughness={0}
        metalness={0.05}
        transmission={MATERIAL_CONFIG.TRANSMISSION}
        ior={MATERIAL_CONFIG.IOR}
        thickness={MATERIAL_CONFIG.THICKNESS}
        clearcoat={MATERIAL_CONFIG.CLEARCOAT}
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
      const targetScale = MODEL_CONFIG.TARGET_SCALE / maxDim;
      setScale(targetScale);

      const center = box.getCenter(new THREE.Vector3());
      scene.position.sub(center);

      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = (child as THREE.Mesh);
          if (m.material) {
            const mat = m.material as THREE.MeshPhysicalMaterial;
            
            // 석재 질감 유지하되 가시성 향상을 위해 미세 조정
            mat.envMapIntensity = MODEL_CONFIG.ENV_MAP_INTENSITY;
            mat.roughness = MODEL_CONFIG.ROUGHNESS;
            mat.metalness = MODEL_CONFIG.METALNESS;
            
            if (mat.color) {
               mat.color.multiplyScalar(MODEL_CONFIG.COLOR_MULTIPLIER); 
            }
          }
        }
      });
    }
  }, [scene]);

  useFrame(() => {
    if (!groupRef.current) return;
    
    const targetX = -(mouse.y * viewport.height) / ANIMATION_CONFIG.MOUSE_SENSITIVITY;
    const targetY = (mouse.x * viewport.width) / ANIMATION_CONFIG.MOUSE_SENSITIVITY;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, ANIMATION_CONFIG.LERP_SPEED);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, ANIMATION_CONFIG.LERP_SPEED);

    if (noseLight.current) {
      const targetInt = hoveringNose ? ANIMATION_CONFIG.NOSE_LIGHT_INTENSITY : 0;
      noseLight.current.intensity = THREE.MathUtils.lerp(noseLight.current.intensity, targetInt, ANIMATION_CONFIG.LERP_SPEED);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={scale} />

      {/* interaction Area */}
      <group>
        {/* 코 히트박스 */}
        <mesh 
          position={GEOMETRY_CONFIG.NOSE_POSITION}
          onPointerOver={() => setHoveringNose(true)} 
          onPointerOut={() => setHoveringNose(false)} 
          visible={false}
        >
          <boxGeometry args={GEOMETRY_CONFIG.NOSE_HITBOX_SIZE} />
        </mesh>

        <MetaLabGooeyDrip position={GEOMETRY_CONFIG.NOSTRIL_LEFT} active={hoveringNose} delay={0} />
        <MetaLabGooeyDrip position={GEOMETRY_CONFIG.NOSTRIL_RIGHT} active={hoveringNose} delay={1.1} />

        <pointLight 
          ref={noseLight} 
          position={GEOMETRY_CONFIG.LIGHT_POSITION}
          color={MATERIAL_CONFIG.LIGHT_COLOR}
          distance={GEOMETRY_CONFIG.LIGHT_DISTANCE}
          decay={GEOMETRY_CONFIG.LIGHT_DECAY}
        />
      </group>
    </group>
  );
};

export default CustomModelLoader;
