
import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

interface CustomModelLoaderProps {
  url: string;
  onNosePress?: (pressing: boolean) => void;
}

// Constants for 3D model configuration
const MODEL_CONFIG = {
  TARGET_SCALE: 2.5,
  ENV_MAP_INTENSITY: 0.15,
  ROUGHNESS: 0.85,
  METALNESS: 0.0,
  COLOR_MULTIPLIER: 1.0,
} as const;

// Constants for animation - Spline-style viscous liquid from prod.spline.design
const ANIMATION_CONFIG = {
  MOUSE_SENSITIVITY: 10,
  LERP_SPEED: 0.18,
  DRIP_SPEED: 0.08, // Very slow like honey
  DRIP_COUNT: 25, // Many overlapping segments for metaball
  DRIP_SEGMENT_SIZE: 0.065, // Large overlapping spheres
  DRIP_LENGTH: 1.5, // Long drip
  DRIP_SURFACE_STICK: 0.05,
  OPACITY_ACTIVE: 0.75, // Slightly transparent
  EMISSIVE_INTENSITY_ACTIVE: 28,
  NOSE_LIGHT_INTENSITY: 6,
  NOSE_LIGHT_HOVER_INTENSITY: 6,
  NOSTRIL_LIGHT_DISTANCE: 0.5,
  NOSTRIL_LIGHT_DECAY: 1.5
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

// Constants for material - Spline premium liquid (extracted from prod.spline.design)
const MATERIAL_CONFIG = {
  COLOR: '#00ffcc', // Bright cyan-green like Spline liquid
  EMISSIVE: '#00ffaa',
  LIGHT_COLOR: '#00ff99',
  IOR: 1.45, // Spline's standard IOR for liquid
  THICKNESS: 2.0, // Thick volumetric liquid
  TRANSMISSION: 1.0, // Full transmission
  CLEARCOAT: 1.0,
  CLEARCOAT_ROUGHNESS: 0.0, // Mirror finish
  ROUGHNESS: 0.0, // Zero roughness for glass
  METALNESS: 0.0, // Non-metallic for pure dielectric
  REFLECTIVITY: 1.0,
  SHEEN: 0.8, // Spline's fabric-like sheen
  SHEEN_ROUGHNESS: 0.2,
  SPECULAR_INTENSITY: 1.0, // High specular
  SPECULAR_COLOR: '#ffffff',
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
 * Spline 스타일: 유리처럼 맑고 반짝이는 고품질 액체
 * 메타볼 효과로 blob들이 서로 합쳐지는 느낌
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
        // 매우 느린 점성 액체 흐름 (꿀처럼)
        const segmentDelay = i * 0.08; // 세그먼트들이 매우 가까이 (거의 겹침)
        const loopTime = (t - segmentDelay) % 6.0; // 6초 루프로 더욱 느리게
        const segmentProgress = Math.max(0, Math.min(1, loopTime * 0.3));
        
        // Y축: 중력에 따라 천천히 늘어지는 액체
        const flowDistance = segmentProgress * ANIMATION_CONFIG.DRIP_LENGTH;
        const gravity = segmentProgress * segmentProgress; // 가속도
        segment.position.y = position[1] - flowDistance * (1 + gravity * 0.3);
        
        // Z축: 얼굴 표면을 따라 흐름
        const surfaceCurve = Math.sin(flowDistance * 5.0) * ANIMATION_CONFIG.DRIP_SURFACE_STICK;
        segment.position.z = position[2] + surfaceCurve;
        
        // X축: 부드러운 흔들림
        const wiggle = Math.sin(t * 1.2 + i * 0.6) * 0.015;
        segment.position.x = position[0] + wiggle;
        
        // 크기: 메타볼처럼 늘어나고 뭉쳐지는 효과
        // 세그먼트들이 겹쳐서 하나의 액체처럼 보임
        const blobPulse = Math.sin(segmentProgress * Math.PI * 1.5);
        const breathe = Math.sin(t * 2.5 + i * 0.8) * 0.12;
        const baseScale = 1.0 + blobPulse * 0.5 + breathe;
        
        // Y축을 더 크게 해서 물방울이 늘어지는 효과
        const stretchFactor = 1.0 + segmentProgress * 0.8;
        segment.scale.set(
          baseScale * 1.0,
          baseScale * stretchFactor * 1.3,
          baseScale * 1.0
        );
        
        // 투명도: 매우 높은 투명도로 유리 같은 효과
        const fadeIn = Math.min(segmentProgress * 4, 1);
        const fadeOut = 1 - Math.pow(segmentProgress, 1.5);
        const targetOpacity = ANIMATION_CONFIG.OPACITY_ACTIVE * fadeIn * fadeOut;
        material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.06);
        
        // 발광: 강렬한 내부 발광
        const glowPulse = Math.sin(t * 4 + i * 1.2) * 0.2 + 0.8;
        const glowIntensity = segmentProgress * ANIMATION_CONFIG.EMISSIVE_INTENSITY_ACTIVE * fadeOut * glowPulse;
        material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, glowIntensity, 0.06);
        
        // 동적 굴절률과 두께 (더 생동감)
        material.thickness = MATERIAL_CONFIG.THICKNESS + Math.sin(t * 3 + i) * 0.3;
        material.ior = MATERIAL_CONFIG.IOR + Math.sin(t * 2 + i * 0.5) * 0.05;
        
      } else {
        // 비활성화: 부드럽게 사라짐
        material.opacity = THREE.MathUtils.lerp(material.opacity, 0, 0.1);
        material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 0, 0.1);
        const targetScale = 0.15;
        segment.scale.x = THREE.MathUtils.lerp(segment.scale.x, targetScale, 0.08);
        segment.scale.y = THREE.MathUtils.lerp(segment.scale.y, targetScale, 0.08);
        segment.scale.z = THREE.MathUtils.lerp(segment.scale.z, targetScale, 0.08);
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
          {/* Ultra high-res sphere for Spline-quality smoothness */}
          <sphereGeometry args={[ANIMATION_CONFIG.DRIP_SEGMENT_SIZE, 128, 128]} />
          <meshPhysicalMaterial
            color={MATERIAL_CONFIG.COLOR}
            emissive={MATERIAL_CONFIG.EMISSIVE}
            emissiveIntensity={0}
            transparent
            opacity={0}
            roughness={MATERIAL_CONFIG.ROUGHNESS}
            metalness={MATERIAL_CONFIG.METALNESS}
            transmission={MATERIAL_CONFIG.TRANSMISSION}
            ior={MATERIAL_CONFIG.IOR}
            thickness={MATERIAL_CONFIG.THICKNESS}
            clearcoat={MATERIAL_CONFIG.CLEARCOAT}
            clearcoatRoughness={MATERIAL_CONFIG.CLEARCOAT_ROUGHNESS}
            reflectivity={MATERIAL_CONFIG.REFLECTIVITY}
            sheen={MATERIAL_CONFIG.SHEEN}
            sheenRoughness={MATERIAL_CONFIG.SHEEN_ROUGHNESS}
            sheenColor={MATERIAL_CONFIG.COLOR}
            specularIntensity={MATERIAL_CONFIG.SPECULAR_INTENSITY}
            specularColor={MATERIAL_CONFIG.SPECULAR_COLOR}
            envMapIntensity={2.0}
            attenuationDistance={0.5}
            attenuationColor={MATERIAL_CONFIG.COLOR}
            blending={THREE.NormalBlending}
            side={THREE.FrontSide}
            depthWrite={true}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
};

const CustomModelLoader: React.FC<CustomModelLoaderProps> = ({ url, onNosePress }) => {
  const [scene, setScene] = useState<THREE.Object3D | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const leftNostrilLight = useRef<THREE.PointLight>(null);
  const rightNostrilLight = useRef<THREE.PointLight>(null);
  
  const { mouse, viewport } = useThree();
  const [scale, setScale] = useState(1);
  const [hoveringNose, setHoveringNose] = useState(false);
  const [pressingNose, setPressingNose] = useState(false);

  // Notify parent when pressing state changes
  useEffect(() => {
    if (onNosePress) {
      onNosePress(pressingNose);
    }
  }, [pressingNose, onNosePress]);

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
