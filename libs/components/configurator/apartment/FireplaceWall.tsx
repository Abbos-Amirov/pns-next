'use client';

import React from 'react';
import { ROOM_HEIGHT } from './LivingRoomShell';

/** Left wall - stone/concrete section with modern fireplace at x=-4.8 */
export function FireplaceWall() {
  return (
    <group position={[-4.8, ROOM_HEIGHT / 2 - 0.01, 0.5]}>
      <mesh position={[0, 0, 0.15]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 2.4, 0.1]} />
        <meshStandardMaterial color="#b0a89c" roughness={0.88} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.4, 0.2]}>
        <boxGeometry args={[1.0, 0.55, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.4, 0.22]}>
        <planeGeometry args={[0.85, 0.45]} />
        <meshBasicMaterial color="#e85c30" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}
