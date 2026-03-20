'use client';

import React from 'react';

/** Modern white sectional - low profile, right side of room */
export function SofaModel() {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.4, 0.85]} />
        <meshStandardMaterial color="#f6f5f2" roughness={0.88} metalness={0} />
      </mesh>
      <mesh position={[0, 0.55, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[1.75, 0.45, 0.18]} />
        <meshStandardMaterial color="#eeebe6" roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[-0.88, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.45, 0.85]} />
        <meshStandardMaterial color="#f6f5f2" roughness={0.88} metalness={0} />
      </mesh>
      <mesh position={[0.88, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.45, 0.85]} />
        <meshStandardMaterial color="#f6f5f2" roughness={0.88} metalness={0} />
      </mesh>
      <mesh position={[-0.35, 0.68, -0.25]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.2, 0.12]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
      </mesh>
      <mesh position={[0.4, 0.66, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[0.25, 0.18, 0.1]} />
        <meshStandardMaterial color="#5a6b4a" roughness={0.9} />
      </mesh>
    </group>
  );
}
