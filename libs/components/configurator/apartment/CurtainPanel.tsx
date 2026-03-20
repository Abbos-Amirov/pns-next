'use client';

import React from 'react';
import { ROOM_HEIGHT } from './LivingRoomShell';

/** Curtain on right side of window - near back wall */
export function CurtainPanel() {
  return (
    <group position={[4.5, ROOM_HEIGHT / 2 - 0.01, 0.15]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.15, ROOM_HEIGHT - 0.2, 0.5]} />
        <meshStandardMaterial color="#b8ac9c" roughness={0.92} metalness={0} />
      </mesh>
    </group>
  );
}
