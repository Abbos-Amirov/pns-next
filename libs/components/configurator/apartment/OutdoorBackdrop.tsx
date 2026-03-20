'use client';

import React from 'react';
import { Sky } from '@react-three/drei';
import { ROOM_HEIGHT } from './LivingRoomShell';

/** Bright sky/city visible THROUGH the window - behind back wall at z=0 */
export function OutdoorBackdrop() {
  return (
    <group position={[0, ROOM_HEIGHT / 2, -2]}>
      <Sky sunPosition={[60, 30, 80]} turbidity={3} rayleigh={1.2} />
      <mesh position={[0, 0.5, 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 18]} />
        <meshBasicMaterial color="#a8c8e8" depthWrite={false} />
      </mesh>
      {[-6, -4, -2, 0, 2, 4, 6].map((x, i) => (
        <mesh key={i} position={[x, 0.4 + (i % 2) * 0.2, 1.5]} castShadow>
          <boxGeometry args={[0.8, 0.3 + (i % 3) * 0.2, 0.2]} />
          <meshStandardMaterial color="#8a8a8a" roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, -0.5, 0.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 12]} />
        <meshStandardMaterial color="#7a8a7a" roughness={0.95} />
      </mesh>
    </group>
  );
}
