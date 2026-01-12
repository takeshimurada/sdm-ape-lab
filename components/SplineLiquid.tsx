import React, { useRef } from 'react';
import Spline from '@splinetool/react-spline';

interface SplineLiquidProps {
  position: [number, number, number];
  active: boolean;
}

/**
 * Spline 액체 효과를 직접 임베드
 * prod.spline.design에서 실제 씬을 로드
 */
const SplineLiquid: React.FC<SplineLiquidProps> = ({ position, active }) => {
  const splineRef = useRef<any>(null);

  const onLoad = (splineApp: any) => {
    splineRef.current = splineApp;
  };

  if (!active) return null;

  return (
    <group position={position}>
      <Spline
        scene="https://prod.spline.design/A9zrnJpk87ptuwiF/scene.splinecode"
        onLoad={onLoad}
      />
    </group>
  );
};

export default SplineLiquid;
