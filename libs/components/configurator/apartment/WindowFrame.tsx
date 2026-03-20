import React from 'react';
import * as THREE from 'three';

export type WindowFrameColor = 'white' | 'darkGray' | 'warmBeige';

interface WindowFrameProps {
  position: [number, number, number];
  size?: [number, number];
  frameColor: string;
  rotation?: [number, number, number];
}

export function WindowFrame({ position, size = [2, 1.5], frameColor: hex, rotation = [0, 0, 0] }: WindowFrameProps) {
  const depth = 0.08;

  return (
    <group position={position} rotation={rotation}>
      {/* Frame - outer border */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size[0], size[1], depth]} />
        <meshStandardMaterial
          color={hex}
          roughness={0.3}
          metalness={0.1}
          envMapIntensity={0.5}
        />
      </mesh>
      {/* Glass fill - inner */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[size[0] - 0.15, size[1] - 0.15]} />
        <meshPhysicalMaterial
          color="#e8f4fc"
          transparent
          opacity={0.75}
          roughness={0.05}
          metalness={0}
          thickness={0.5}
          transmission={0.9}
          ior={1.5}
        />
      </mesh>
    </group>
  );
}
