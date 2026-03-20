'use client';

import React from 'react';

/** Brown leather lounge chair - left-center foreground, faces window */
export function LoungeChairModel() {
  return (
    <group>
      <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.65, 0.07, 0.7]} />
        <meshStandardMaterial color="#8b7355" roughness={0.55} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0.58, -0.22]} rotation={[0.12, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.62, 0.48, 0.1]} />
        <meshStandardMaterial color="#8b7355" roughness={0.55} metalness={0.04} />
      </mesh>
      {[[-0.26, 0.06, 0.26], [0.26, 0.06, 0.26], [-0.26, 0.06, -0.26], [0.26, 0.06, -0.26]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.025, 0.22, 0.025]} />
          <meshStandardMaterial color="#b8b8b8" roughness={0.25} metalness={0.75} />
        </mesh>
      ))}
    </group>
  );
}
