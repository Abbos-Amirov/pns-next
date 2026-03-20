import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RoomDefinition } from './data/apartmentRooms';

interface RoomMarkerProps {
  room: RoomDefinition;
  isActive: boolean;
  onClick: () => void;
}

export function RoomMarker({ room, isActive, onClick }: RoomMarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current && (hovered || isActive)) {
      meshRef.current.scale.lerp(new THREE.Vector3(hovered || isActive ? 1.15 : 1, hovered || isActive ? 1.15 : 1, 1), 0.08);
    }
  });

  const glowIntensity = isActive ? 1 : hovered ? 0.6 : 0.3;

  return (
    <group
      position={room.markerPosition}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Glow ring */}
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.85, 32]} />
        <meshBasicMaterial
          color={room.markerColor}
          transparent
          opacity={glowIntensity}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Solid circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial color={room.markerColor} />
      </mesh>
      {/* Number label - simple 3D text simulation with a plane */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
