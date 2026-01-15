
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
  ENV_MAP_INTENSITY: 0.15,
  ROUGHNESS: 0.85,
  METALNESS: 0.0,
  COLOR_MULTIPLIER: 1.0,
} as const;

// Constants for animation
const ANIMATION_CONFIG = {
  MOUSE_SENSITIVITY: 10,
  LERP_SPEED: 0.18,
} as const;

const CustomModelLoader: React.FC<CustomModelLoaderProps> = ({ url, onNosePress }) => {
  const [scene, setScene] = useState<THREE.Object3D | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  const { mouse, viewport, gl } = useThree();
  const [scale, setScale] = useState(1);
  
  // Touch gesture support
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchRotationRef = useRef({ x: 0, y: 0 });

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

  // Touch event handlers
  useEffect(() => {
    const canvas = gl.domElement;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && touchStartRef.current) {
        const deltaX = e.touches[0].clientX - touchStartRef.current.x;
        const deltaY = e.touches[0].clientY - touchStartRef.current.y;
        
        // Convert touch delta to rotation (similar sensitivity to mouse)
        touchRotationRef.current.x += deltaY * 0.005;
        touchRotationRef.current.y += deltaX * 0.005;
        
        // Limit rotation range to prevent viewing from behind
        // X-axis (vertical): -0.5 to 0.5 radians (~-30° to 30°)
        // Y-axis (horizontal): -1.0 to 1.0 radians (~-60° to 60°)
        touchRotationRef.current.x = Math.max(-0.5, Math.min(0.5, touchRotationRef.current.x));
        touchRotationRef.current.y = Math.max(-1.0, Math.min(1.0, touchRotationRef.current.y));
        
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    };

    const handleTouchEnd = () => {
      touchStartRef.current = null;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gl]);

  useLayoutEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      
      // 반응형 스케일: 화면 크기에 비례해서 연속적으로 변화
      const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
      
      // 선형 보간으로 부드러운 크기 변화
      const minWidth = 320;   // 최소 화면 (작은 폰)
      const maxWidth = 1920;  // 최대 화면 (큰 데스크톱)
      const minScale = 1.5;   // 최소 크기
      const maxScale = 3.0;   // 최대 크기 (머리가 잘리지 않도록)
      
      // 화면 너비를 0-1 범위로 정규화
      const normalizedWidth = Math.max(0, Math.min(1, (windowWidth - minWidth) / (maxWidth - minWidth)));
      
      // 부드러운 곡선 적용 (작은 화면에서는 천천히, 큰 화면에서는 빠르게)
      const easedWidth = normalizedWidth * normalizedWidth * (3 - 2 * normalizedWidth); // smoothstep
      
      // 최종 스케일 계산
      const baseScale = minScale + easedWidth * (maxScale - minScale);
      const targetScale = baseScale / maxDim;
      
      setScale(targetScale);

      const center = box.getCenter(new THREE.Vector3());
      scene.position.sub(center);
      scene.position.y -= 0.15; // 머리가 잘리지 않도록 아래로 이동

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
  }, [scene, viewport.width]);

  useFrame(() => {
    if (!groupRef.current) return;
    
    // Use touch rotation if available, otherwise use mouse
    let targetX, targetY;
    
    if (touchStartRef.current) {
      // Touch mode: use accumulated touch rotation
      targetX = touchRotationRef.current.x;
      targetY = touchRotationRef.current.y;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, ANIMATION_CONFIG.LERP_SPEED);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, ANIMATION_CONFIG.LERP_SPEED);
    } else {
      // Mouse mode: follow cursor
      targetX = -(mouse.y * viewport.height) / ANIMATION_CONFIG.MOUSE_SENSITIVITY;
      targetY = (mouse.x * viewport.width) / ANIMATION_CONFIG.MOUSE_SENSITIVITY;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, ANIMATION_CONFIG.LERP_SPEED);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, ANIMATION_CONFIG.LERP_SPEED);
      
      // Gradually decay touch rotation when using mouse
      touchRotationRef.current.x = THREE.MathUtils.lerp(touchRotationRef.current.x, targetX, 0.02);
      touchRotationRef.current.y = THREE.MathUtils.lerp(touchRotationRef.current.y, targetY, 0.02);
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
    </group>
  );
};

export default CustomModelLoader;
