'use client';

import React, { useMemo } from 'react';
import { LivingRoomShell } from './LivingRoomShell';
import { PanoramicWindow } from './PanoramicWindow';
import { SofaModel } from './SofaModel';
import { LoungeChairModel } from './LoungeChairModel';
import { CoffeeTableModel } from './CoffeeTableModel';
import { FireplaceWall } from './FireplaceWall';
import { CurtainPanel } from './CurtainPanel';
import { OutdoorBackdrop } from './OutdoorBackdrop';
import type { WindowFrameColor } from './roomData';

interface LivingRoomSceneProps {
  frameColor: WindowFrameColor;
}

export function LivingRoomScene({ frameColor }: LivingRoomSceneProps) {
  const frameHex = useMemo(() => {
    if (frameColor === 'white') return '#F7F7F4';
    if (frameColor === 'darkGray') return '#4F5257';
    return '#E7CFA8';
  }, [frameColor]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[0, 12, 4]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <directionalLight position={[-5, 8, 2]} intensity={0.4} />
      <hemisphereLight args={["#e8f0f8", "#c8d4c8", 0.5]} />

      <fog attach="fog" args={["#eae8e4", 25, 55]} />

      <LivingRoomShell>
        {/* Panoramic window on BACK WALL at z=0 */}
        <group position={[0, 0, 0]}>
          <PanoramicWindow
            frameColor={frameHex}
            leftPanelWidth={1.15}
            centerPanelWidth={5.5}
            rightPanelWidth={1.15}
            height={2.25}
            bottomFromFloor={0.45}
            frameThickness={0.04}
          />
        </group>

        <CurtainPanel />
      </LivingRoomShell>

      <FireplaceWall />

      {/* Furniture - per user spec */}
      <group position={[-1.8, 0, 2.0]} rotation={[0, -0.2, 0]}>
        <LoungeChairModel />
      </group>
      <group position={[0, 0, 1.9]} rotation={[0, Math.PI / 2, 0]}>
        <CoffeeTableModel />
      </group>
      <group position={[3.2, 0, 2.0]} rotation={[0, Math.PI / 2, 0]}>
        <SofaModel />
      </group>

      <OutdoorBackdrop />
    </>
  );
}
