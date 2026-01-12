
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
  DRIP_SPEED: 0.15,
  DRIP_COUNT: 8, // Number of segments in the drip
  DRIP_SEGMENT_SIZE: 0.028,
  DRIP_LENGTH: 0.35,
  DRIP_SURFACE_STICK: 0.08,
  OPACITY_ACTIVE: 0.92,
  EMISSIVE_INTENSITY_ACTIVE: 18,
  NOSE_LIGHT_INTENSITY: 3, // Reduced for subtle glow
  NOSE_LIGHT_HOVER_INTENSITY: 8, // Increased when pressing
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
 * 콧구멍에서 표면을 타고 흐르는 점성 액체
 * 여러 개의 구체가 연결되어 실제 액체처럼 흐름
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
        // 시간차를 두고 각 세그먼트가 나타남
        const segmentDelay = i * 0.15;
        const segmentProgress = Math.max(0, Math.min(1, (t - segmentDelay) * 0.8));
        
        // Y축: 아래로 흐름
        const flowDistance = segmentProgress * ANIMATION_CONFIG.DRIP_LENGTH;
        segment.position.y = position[1] - flowDistance;
        
        // Z축: 표면의 곡선을 따라감 (인중의 굴곡)
        const surfaceCurve = Math.sin(flowDistance * 8.0) * ANIMATION_CONFIG.DRIP_SURFACE_STICK;
        segment.position.z = position[2] + surfaceCurve;
        
        // X축: 약간의 흔들림 (자연스러운 흐름)
        const wiggle = Math.sin(t * 2.0 + i * 0.5) * 0.008;
        segment.position.x = position[0] + wiggle;
        
        // 크기: 흐르면서 약간씩 커짐
        const scale = 0.7 + segmentProgress * 0.3 + Math.sin(t * 3 + i) * 0.1;
        segment.scale.setScalar(scale);
        
        // 투명도: 부드럽게 나타남
        const opacity = THREE.MathUtils.lerp(
          material.opacity,
          Math.min(segmentProgress, ANIMATION_CONFIG.OPACITY_ACTIVE),
          0.1
        );
        material.opacity = opacity;
        material.emissiveIntensity = THREE.MathUtils.lerp(
          material.emissiveIntensity,
          segmentProgress * ANIMATION_CONFIG.EMISSIVE_INTENSITY_ACTIVE,
          0.08
        );
      } else {
        // 비활성화: 사라짐
        material.opacity = THREE.MathUtils.lerp(material.opacity, 0, 0.15);
        material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, 0, 0.15);
        segment.scale.setScalar(THREE.MathUtils.lerp(segment.scale.x, 0.3, 0.1));
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
        >
          <sphereGeometry args={[ANIMATION_CONFIG.DRIP_SEGMENT_SIZE, 16, 16]} />
          <meshPhysicalMaterial
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
      ))}
    </group>
  );
};

const CustomModelLoader: React.FC<CustomModelLoaderProps> = ({ url }) => {
  const [scene, setScene] = useState<THREE.Object3D | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const noseLight = useRef<THREE.PointLight>(null);
  
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

    if (noseLight.current) {
      // Subtle glow when hovering, brighter when pressing
      const targetInt = pressingNose 
        ? ANIMATION_CONFIG.NOSE_LIGHT_HOVER_INTENSITY 
        : (hoveringNose ? ANIMATION_CONFIG.NOSE_LIGHT_INTENSITY : 0);
      noseLight.current.intensity = THREE.MathUtils.lerp(noseLight.current.intensity, targetInt, ANIMATION_CONFIG.LERP_SPEED);
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
