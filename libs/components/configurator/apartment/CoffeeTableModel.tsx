'use client';

import React from 'react';

/** Low rectangular coffee table - center foreground */
export function CoffeeTableModel() {
  return (
    <group>
      <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.035, 0.55]} />
        <meshStandardMaterial color="#454545" roughness={0.35} metalness={0.35} />
      </mesh>
      {[[-0.5, 0.16, 0.22], [0.5, 0.16, 0.22], [-0.5, 0.16, -0.22], [0.5, 0.16, -0.22]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.035, 0.32, 0.035]} />
          <meshStandardMaterial color="#383838" roughness={0.3} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
