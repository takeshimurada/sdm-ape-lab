import React, { useEffect, useState } from 'react';
import Spline from '@splinetool/react-spline';

interface SplineLiquidOverlayProps {
  active: boolean;
  nostrilSide: 'left' | 'right';
}

/**
 * Spline 액체를 화면에 오버레이
 * 콧구멍 위치에 정확히 배치
 */
const SplineLiquidOverlay: React.FC<SplineLiquidOverlayProps> = ({ active, nostrilSide }) => {
  const [loaded, setLoaded] = useState(false);

  const onLoad = (splineApp: any) => {
    setLoaded(true);
  };

  if (!active) return null;

  // 콧구멍 위치 계산 (화면 중앙 기준)
  const leftPosition = nostrilSide === 'left' ? '42%' : '58%';

  return (
    <div
      style={{
        position: 'fixed',
        left: leftPosition,
        top: '45%',
        width: '200px',
        height: '400px',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 5,
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}
    >
      <Spline
        scene="https://prod.spline.design/A9zrnJpk87ptuwiF/scene.splinecode"
        onLoad={onLoad}
      />
    </div>
  );
};

export default SplineLiquidOverlay;
