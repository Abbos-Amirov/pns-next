'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

const GLASS_PROPS: THREE.MeshPhysicalMaterialParameters = {
  color: '#ffffff',
  transparent: true,
  opacity: 0.02,
  roughness: 0,
  metalness: 0,
  thickness: 0.2,
  transmission: 1,
  ior: 1.5,
  depthWrite: false,
  side: THREE.DoubleSide,
};

export interface PanoramicWindowProps {
  frameColor: string;
  leftPanelWidth?: number;
  centerPanelWidth?: number;
  rightPanelWidth?: number;
  height?: number;
  bottomFromFloor?: number;
  frameThickness?: number;
}

/**
 * [ narrow left ] [ large center ] [ narrow right ]
 * On back wall at z=0, camera inside looks at this
 */
export function PanoramicWindow({
  frameColor,
  leftPanelWidth = 1.15,
  centerPanelWidth = 5.5,
  rightPanelWidth = 1.15,
  height = 2.25,
  bottomFromFloor = 0.45,
  frameThickness = 0.04,
}: PanoramicWindowProps) {
  const totalWidth = leftPanelWidth + centerPanelWidth + rightPanelWidth;
  const glassInset = 0.03;
  const centerY = bottomFromFloor + height / 2;

  const glassMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ ...GLASS_PROPS }),
    []
  );

  return (
    <group position={[0, centerY, 0.02]}>
      {/* Slim outer frame */}
      <mesh position={[0, height / 2 + 0.04, 0]} castShadow>
        <boxGeometry args={[totalWidth + 0.1, 0.04, frameThickness + 0.02]} />
        <meshStandardMaterial color="#f0eeea" roughness={0.5} />
      </mesh>
      <mesh position={[0, -height / 2 - 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[totalWidth + 0.1, 0.05, 0.06]} />
        <meshStandardMaterial color="#f0eeea" roughness={0.5} />
      </mesh>
      <mesh position={[-totalWidth / 2 - 0.04, 0, 0]} castShadow>
        <boxGeometry args={[0.04, height + 0.08, frameThickness + 0.02]} />
        <meshStandardMaterial color="#f0eeea" roughness={0.5} />
      </mesh>
      <mesh position={[totalWidth / 2 + 0.04, 0, 0]} castShadow>
        <boxGeometry args={[0.04, height + 0.08, frameThickness + 0.02]} />
        <meshStandardMaterial color="#f0eeea" roughness={0.5} />
      </mesh>

      {/* LEFT PANEL */}
      <group position={[-centerPanelWidth / 2 - leftPanelWidth / 2, 0, 0.01]}>
        <mesh castShadow>
          <boxGeometry args={[leftPanelWidth, height, frameThickness]} />
          <meshStandardMaterial color={frameColor} roughness={0.25} metalness={0.06} />
        </mesh>
        <mesh position={[0, 0, frameThickness / 2 + 0.005]} material={glassMat} renderOrder={1}>
          <planeGeometry args={[leftPanelWidth - glassInset * 2, height - glassInset * 2]} />
        </mesh>
      </group>

      {/* CENTER PANEL */}
      <group position={[0, 0, 0.01]}>
        <mesh castShadow>
          <boxGeometry args={[centerPanelWidth, height, frameThickness]} />
          <meshStandardMaterial color={frameColor} roughness={0.25} metalness={0.06} />
        </mesh>
        <mesh position={[0, 0, frameThickness / 2 + 0.005]} material={glassMat} renderOrder={1}>
          <planeGeometry args={[centerPanelWidth - glassInset * 2, height - glassInset * 2]} />
        </mesh>
      </group>

      {/* RIGHT PANEL */}
      <group position={[centerPanelWidth / 2 + rightPanelWidth / 2, 0, 0.01]}>
        <mesh castShadow>
          <boxGeometry args={[rightPanelWidth, height, frameThickness]} />
          <meshStandardMaterial color={frameColor} roughness={0.25} metalness={0.06} />
        </mesh>
        <mesh position={[0, 0, frameThickness / 2 + 0.005]} material={glassMat} renderOrder={1}>
          <planeGeometry args={[rightPanelWidth - glassInset * 2, height - glassInset * 2]} />
        </mesh>
      </group>

      {/* Mullions */}
      <mesh position={[-centerPanelWidth / 2, 0, 0.02]} castShadow>
        <boxGeometry args={[0.03, height + 0.02, 0.015]} />
        <meshStandardMaterial color={frameColor} roughness={0.25} />
      </mesh>
      <mesh position={[centerPanelWidth / 2, 0, 0.02]} castShadow>
        <boxGeometry args={[0.03, height + 0.02, 0.015]} />
        <meshStandardMaterial color={frameColor} roughness={0.25} />
      </mesh>
    </group>
  );
}
