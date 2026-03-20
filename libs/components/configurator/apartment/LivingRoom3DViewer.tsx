'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LivingRoomScene } from './LivingRoomScene';
import type { WindowFrameColor } from './roomData';

/**
 * Camera INSIDE the living room, standing and looking toward the window.
 * position: [0, 1.55, 5.8] - inside room, eye level
 * lookAt: [0, 1.35, 0] - window on back wall
 */
const CAMERA_POSITION: [number, number, number] = [0, 1.55, 5.8];
const CAMERA_TARGET: [number, number, number] = [0, 1.35, 0];

interface LivingRoom3DViewerProps {
  frameColor: WindowFrameColor;
}

function LivingRoom3DViewer({ frameColor }: LivingRoom3DViewerProps) {
  return (
    <Canvas
      gl={{ antialias: true, alpha: false }}
      shadows
      camera={{ position: CAMERA_POSITION, fov: 50, near: 0.05, far: 100 }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%', display: 'block' }}
      frameloop="always"
      onCreated={({ gl }) => gl.setClearColor('#eae6e2')}
    >
      <color attach="background" args={['#eae6e2']} />
      <OrbitControls
        target={CAMERA_TARGET}
        enablePan={true}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2 - 0.2}
        minDistance={4}
        maxDistance={7}
        minAzimuthAngle={-0.12}
        maxAzimuthAngle={0.12}
      />
      <LivingRoomScene frameColor={frameColor} />
    </Canvas>
  );
}

export default LivingRoom3DViewer;
