
import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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
  MOUSE_SENSITIVITY: 10,
  LERP_SPEED: 0.18,
  DRIP_SPEED: 0.15, // 더 느린 흐름
  DRIP_COUNT: 16, // 더 많은 세그먼트로 부드러운 흐름
  DRIP_SEGMENT_SIZE: 0.035, // 약간 더 큰 구체
  DRIP_LENGTH: 0.8, // 더 긴 흐름
  DRIP_SURFACE_STICK: 0.08,
  OPACITY_ACTIVE: 0.92,
  EMISSIVE_INTENSITY_ACTIVE: 18,
  NOSE_LIGHT_INTENSITY: 6, // Glow intensity for left nostril
  NOSE_LIGHT_HOVER_INTENSITY: 6, // Same intensity for right nostril
  NOSTRIL_LIGHT_DISTANCE: 0.5, // Light distance from nostril
  NOSTRIL_LIGHT_DECAY: 1.5 // Light decay rate
} as const;

// Constants for geometry
const GEOMETRY_CONFIG = {
  DRIP_RADIUS: 0.04,
  DRIP_SEGMENTS: 32,
  NOSTRIL_LEFT: [-0.08, 0.05, 0.95] as [number, number, number],   // Much higher and forward
  NOSTRIL_RIGHT: [0.08, 0.05, 0.95] as [number, number, number],  // Much higher and forward
  NOSE_POSITION: [0, 0.02, 0.98] as [number, number, number],      // Hitbox higher
  NOSE_HITBOX_SIZE: [0.5, 0.3, 0.35] as [number, number, number],  // Smaller hitbox
  LIGHT_POSITION_LEFT: [-0.08, 0.05, 0.95] as [number, number, number],  // Left nostril light
  LIGHT_POSITION_RIGHT: [0.08, 0.05, 0.95] as [number, number, number], // Right nostril light
  LIGHT_DISTANCE: 0.5, // Focused small radius
  LIGHT_DECAY: 1.5    // Less decay for better visibility
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
 * 콧구멍에서 나오는 3D 광선 빔
 * 원뿔 형태로 빛이 발사되는 효과
 */
const LightBeam: React.FC<{ position: [number, number, number], active: boolean, direction: number }> = ({ position, active, direction }) => {
  const beamRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!beamRef.current) return;
    
    const material = beamRef.current.material as THREE.MeshPhysicalMaterial;
    const t = state.clock.getElapsedTime();
    
    if (active) {
      // 빛의 강도와 길이 애니메이션
      const pulseIntensity = 0.8 + Math.sin(t * 4) * 0.2;
      material.opacity = THREE.MathUtils.lerp(material.opacity, 0.6 * pulseIntensity, 0.1);
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 25 * pulseIntensity, 0.1);
      
      // 광선 길이 애니메이션
      const scaleY = THREE.MathUtils.lerp(beamRef.current.scale.y, 1.5 + Math.sin(t * 3) * 0.3, 0.08);
      beamRef.current.scale.y = scaleY;
      
      // 약간의 회전 효과
      beamRef.current.rotation.z = Math.sin(t * 2) * 0.05;
    } else {
      // 비활성화: 사라짐
      material.opacity = THREE.MathUtils.lerp(material.opacity, 0, 0.15);
      material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 0, 0.15);
      beamRef.current.scale.y = THREE.MathUtils.lerp(beamRef.current.scale.y, 0.1, 0.1);
    }
  });

  return (
    <mesh
      ref={beamRef}
      position={[position[0], position[1] - 0.3, position[2]]}
      rotation={[0, 0, direction * Math.PI / 12]}
    >
      {/* 원뿔 형태의 광선 */}
      <coneGeometry args={[0.04, 0.6, 16, 1, true]} />
      <meshPhysicalMaterial
        color={MATERIAL_CONFIG.COLOR}
        emissive={MATERIAL_CONFIG.EMISSIVE}
        emissiveIntensity={0}
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        roughness={0}
        metalness={0}
        transmission={0.9}
        ior={MATERIAL_CONFIG.IOR}
        thickness={0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

/**
 * 콧구멍에서 표면을 타고 흐르는 점성 액체
 * Spline 스타일의 부드러운 blob/metaball 효과
 * 유기적으로 늘어나고 뭉쳐지는 점성 액체
 */
const SurfaceFlowingLiquid: React.FC<{ position: [number, number, number], active: boolean, delay: number }> = ({ position, active, delay }) => {
  const groupRef = useRef<THREE.Group>(null);
  const segmentsRef = useRef<THREE.Mesh[]>([]);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const t = state.clock.getElapsedTime() * ANIMATION_CONFIG.DRIP_SPEED + delay;
    
    // 각 세그먼트를 표면을 따라 배치
    segmentsRef.current.forEach((segment, i) => {
      if (!segment) return;
      
      const material = segment.material as THREE.MeshPhysicalMaterial;
      
      if (active) {
        // 끝없이 반복되는 흐름 애니메이션
        const segmentDelay = i * 0.15;
        const loopTime = (t - segmentDelay) % 4.0; // 4초 루프로 더 느리게
        const segmentProgress = Math.max(0, Math.min(1, loopTime * 0.4));
        
        // Y축: 아래로 천천히 흐름 (점성 액체)
        const flowDistance = segmentProgress * ANIMATION_CONFIG.DRIP_LENGTH * 1.2;
        segment.position.y = position[1] - flowDistance;
        
        // Z축: 표면의 곡선을 따라감 (더 부드럽게)
        const surfaceCurve = Math.sin(flowDistance * 6.0) * ANIMATION_CONFIG.DRIP_SURFACE_STICK * 1.5;
        segment.position.z = position[2] + surfaceCurve;
        
        // X축: 유기적인 흔들림
        const wiggle = Math.sin(t * 1.5 + i * 0.8) * 0.012;
        segment.position.x = position[0] + wiggle;
        
        // 크기: 늘어나는 액체 효과 (blob 느낌)
        // 시작은 작게, 중간은 크게, 끝은 다시 작게
        const blobSize = Math.sin(segmentProgress * Math.PI) * 0.6 + 0.5;
        const breathe = Math.sin(t * 2 + i) * 0.15;
        const scale = (0.8 + blobSize + breathe) * 1.3;
        
        // Y축 스케일을 더 크게 해서 늘어지는 느낌
        segment.scale.set(scale * 0.9, scale * 1.4, scale * 0.9);
        
        // 투명도: 부드럽게 나타났다가 사라짐
        const fadeIn = Math.min(segmentProgress * 3, 1);
        const fadeOut = 1 - Math.pow(segmentProgress, 2);
        const opacity = THREE.MathUtils.lerp(
          material.opacity,
          ANIMATION_CONFIG.OPACITY_ACTIVE * fadeIn * fadeOut * 0.95,
          0.08
        );
        material.opacity = opacity;
        
        // 발광 효과: 더 강렬하게
        const glowIntensity = Math.sin(t * 3 + i) * 0.3 + 0.7;
        material.emissiveIntensity = THREE.MathUtils.lerp(
          material.emissiveIntensity,
          segmentProgress * ANIMATION_CONFIG.EMISSIVE_INTENSITY_ACTIVE * fadeOut * glowIntensity * 1.2,
          0.08
        );
        
        // 굴절률 애니메이션 (더 액체답게)
        material.transmission = 0.98;
        material.thickness = 0.8 + Math.sin(t * 2 + i) * 0.2;
      } else {
        // 비활성화: 부드럽게 사라짐
        material.opacity = THREE.MathUtils.lerp(material.opacity, 0, 0.12);
        material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 0, 0.12);
        const targetScale = 0.2;
        segment.scale.x = THREE.MathUtils.lerp(segment.scale.x, targetScale, 0.1);
        segment.scale.y = THREE.MathUtils.lerp(segment.scale.y, targetScale, 0.1);
        segment.scale.z = THREE.MathUtils.lerp(segment.scale.z, targetScale, 0.1);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: ANIMATION_CONFIG.DRIP_COUNT }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) segmentsRef.current[i] = el;
          }}
          position={position}
          castShadow
          receiveShadow
        >
          {/* 더 부드러운 구체 (세그먼트 증가) */}
          <sphereGeometry args={[ANIMATION_CONFIG.DRIP_SEGMENT_SIZE * 1.2, 32, 32]} />
          <meshPhysicalMaterial
            color={MATERIAL_CONFIG.COLOR}
            emissive={MATERIAL_CONFIG.EMISSIVE}
            emissiveIntensity={0}
            transparent
            opacity={0}
            roughness={0.05}
            metalness={0.0}
            transmission={0.98}
            ior={1.5}
            thickness={0.8}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            reflectivity={0.9}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

const CustomModelLoader: React.FC<CustomModelLoaderProps> = ({ url }) => {
  const [scene, setScene] = useState<THREE.Object3D | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const leftNostrilLight = useRef<THREE.PointLight>(null);
  const rightNostrilLight = useRef<THREE.PointLight>(null);
  
  const { mouse, viewport } = useThree();
  const [scale, setScale] = useState(1);
  const [hoveringNose, setHoveringNose] = useState(false);
  const [pressingNose, setPressingNose] = useState(false);

  // Load model with GLTFLoader directly
  useEffect(() => {
    const loader = new GLTFLoader();
    
    // Fetch the file as ArrayBuffer first to ensure proper binary handling
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch model: ${response.status}`);
        }
        return response.arrayBuffer();
      })
      .then(arrayBuffer => {
        console.log('File downloaded, size:', (arrayBuffer.byteLength / 1024 / 1024).toFixed(2) + 'MB');
        
        // Parse the ArrayBuffer
        loader.parse(
          arrayBuffer,
          '',
          (gltf) => {
            console.log('Model loaded successfully!', gltf);
            setScene(gltf.scene);
            setLoadError(null);
          },
          (error) => {
            console.error('Error parsing model:', error);
            setLoadError(error.message || 'Failed to parse model');
          }
        );
      })
      .catch(error => {
        console.error('Error fetching model:', error);
        setLoadError(error.message);
      });
  }, [url]);

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

    // Both nostrils always glow when pressing
    const targetInt = pressingNose ? ANIMATION_CONFIG.NOSE_LIGHT_INTENSITY : 0;
    
    if (leftNostrilLight.current) {
      leftNostrilLight.current.intensity = THREE.MathUtils.lerp(leftNostrilLight.current.intensity, targetInt, ANIMATION_CONFIG.LERP_SPEED);
    }
    
    if (rightNostrilLight.current) {
      rightNostrilLight.current.intensity = THREE.MathUtils.lerp(rightNostrilLight.current.intensity, targetInt, ANIMATION_CONFIG.LERP_SPEED);
    }
  });

  // Show error or loading state
  if (loadError) {
    console.error('Model failed to load:', loadError);
    return null;
  }

  if (!scene) {
    return null; // Loading...
  }

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={scale} />

      {/* interaction Area */}
      <group>
        {/* 코 히트박스 */}
        <mesh 
          position={GEOMETRY_CONFIG.NOSE_POSITION}
          onPointerOver={() => setHoveringNose(true)} 
          onPointerOut={() => {
            setHoveringNose(false);
            setPressingNose(false); // Release when leaving
          }}
          onPointerDown={() => setPressingNose(true)}
          onPointerUp={() => setPressingNose(false)}
          visible={false}
        >
          <boxGeometry args={GEOMETRY_CONFIG.NOSE_HITBOX_SIZE} />
        </mesh>

        <SurfaceFlowingLiquid position={GEOMETRY_CONFIG.NOSTRIL_LEFT} active={pressingNose} delay={0} />
        <SurfaceFlowingLiquid position={GEOMETRY_CONFIG.NOSTRIL_RIGHT} active={pressingNose} delay={1.1} />

        {/* 3D Light Beams from nostrils */}
        <LightBeam position={GEOMETRY_CONFIG.NOSTRIL_LEFT} active={pressingNose} direction={-1} />
        <LightBeam position={GEOMETRY_CONFIG.NOSTRIL_RIGHT} active={pressingNose} direction={1} />

        {/* Left nostril light */}
        <pointLight 
          ref={leftNostrilLight} 
          position={GEOMETRY_CONFIG.LIGHT_POSITION_LEFT}
          color={MATERIAL_CONFIG.LIGHT_COLOR}
          distance={GEOMETRY_CONFIG.LIGHT_DISTANCE}
          decay={GEOMETRY_CONFIG.LIGHT_DECAY}
        />
        
        {/* Right nostril light */}
        <pointLight 
          ref={rightNostrilLight} 
          position={GEOMETRY_CONFIG.LIGHT_POSITION_RIGHT}
          color={MATERIAL_CONFIG.LIGHT_COLOR}
          distance={GEOMETRY_CONFIG.LIGHT_DISTANCE}
          decay={GEOMETRY_CONFIG.LIGHT_DECAY}
        />
      </group>
    </group>
  );
};

export default CustomModelLoader;
