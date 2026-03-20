'use client';

import React, { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WindowFrame } from './WindowFrame';
import { RoomMarker } from './RoomMarker';
import type { RoomDefinition } from './data/apartmentRooms';
import type { WindowFrameColor } from './ApartmentViewer';

const WALL_THICKNESS = 0.15;
const CEILING_HEIGHT = 2.8;
const FLOOR_Y = 0;

interface ApartmentSceneProps {
  rooms: RoomDefinition[];
  selectedRoomId: number;
  frameColor: WindowFrameColor;
  onRoomSelect: (id: number) => void;
}

function Wall({ position, size, rotation = 0 }: { position: [number, number, number]; size: [number, number]; rotation?: number }) {
  const geometry = useMemo(() => new THREE.BoxGeometry(size[0], size[1], WALL_THICKNESS), [size]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f0ede8', roughness: 0.9, metalness: 0.05 }), []);
  return (
    <mesh geometry={geometry} material={material} position={position} rotation={[0, rotation, 0]} castShadow receiveShadow />
  );
}

function Floor({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  const geometry = useMemo(() => new THREE.BoxGeometry(size[0], 0.02, size[1]), [size]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e5e0d8', roughness: 0.85, metalness: 0 }), []);
  return <mesh geometry={geometry} material={material} position={position} receiveShadow />;
}

function Ceiling({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  const geometry = useMemo(() => new THREE.BoxGeometry(size[0], 0.08, size[1]), [size]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f8f7f4', roughness: 0.95 }), []);
  return <mesh geometry={geometry} material={material} position={position} />;
}

export function ApartmentScene({ rooms, selectedRoomId, frameColor, onRoomSelect }: ApartmentSceneProps) {
  const frameHex = useMemo(() => {
    if (frameColor === 'white') return '#F7F7F4';
    if (frameColor === 'darkGray') return '#5C5C5C';
    return '#E7CFA8';
  }, [frameColor]);

  return (
    <>
      {/* Ambient + directional light */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 12, 6]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 8, 4]} intensity={0.4} />
      <pointLight position={[0, 4, 0]} intensity={0.3} />

      {/* Main living room floor */}
      <Floor position={[0, FLOOR_Y - 0.01, 0]} size={[8, 6]} />

      {/* Living room (center) - Room 7 area */}
      <Wall position={[-4, CEILING_HEIGHT / 2, 0]} size={[0.1, CEILING_HEIGHT]} />
      <Wall position={[4, CEILING_HEIGHT / 2, 0]} size={[0.1, CEILING_HEIGHT]} />
      <Wall position={[0, CEILING_HEIGHT / 2, -3]} size={[8, CEILING_HEIGHT]} />
      <group position={[0, CEILING_HEIGHT / 2, 3]}>
        <WindowFrame position={[-1.5, 0, 0]} size={[2, 1.8]} frameColor={frameHex} />
        <WindowFrame position={[1.5, 0, 0]} size={[2, 1.8]} frameColor={frameHex} />
      </group>

      {/* Balcony left - Rooms 1, 2 */}
      <Floor position={[-5.5, FLOOR_Y - 0.005, 0]} size={[2, 6]} />
      <group position={[-6.5, 1.5, -1]}>
        <WindowFrame position={[0, 0, 0]} size={[1.2, 1.6]} frameColor={frameHex} />
      </group>
      <group position={[-6.5, 1.5, 1]}>
        <WindowFrame position={[0, 0, 0]} size={[1.2, 1.6]} frameColor={frameHex} />
      </group>

      {/* Master bedroom (bottom-left) */}
      <Floor position={[-3, FLOOR_Y - 0.005, 2.5]} size={[3.5, 2.5]} />
      <group position={[-4.2, 1.4, 2.5]}>
        <WindowFrame position={[0, 0, 0]} size={[1.6, 1.5]} frameColor={frameHex} />
      </group>
      <group position={[-1.8, 1.4, 3.8]}>
        <WindowFrame position={[0, 0, 0]} size={[1.4, 1.5]} frameColor={frameHex} />
      </group>

      {/* Bedroom 2 (bottom-right) - Room 3, 9 */}
      <Floor position={[2, FLOOR_Y - 0.005, 2.5]} size={[2.5, 2.5]} />
      <group position={[3.2, 1.4, 2.5]}>
        <WindowFrame position={[0, 0, 0]} size={[1.2, 1.5]} frameColor={frameHex} />
      </group>
      <group position={[2, 1.4, 3.8]}>
        <WindowFrame position={[0, 0, 0]} size={[1.2, 1.5]} frameColor={frameHex} />
      </group>

      {/* Bedroom 3 (top-right) */}
      <Floor position={[2.5, FLOOR_Y - 0.005, -2]} size={[2.5, 2]} />
      <group position={[3.8, 1.3, -2]}>
        <WindowFrame position={[0, 0, 0]} size={[1.5, 1.4]} frameColor={frameHex} />
      </group>

      {/* Kitchen / Utility - Rooms 4, 5 */}
      <Floor position={[3.5, FLOOR_Y - 0.005, 0]} size={[2, 3]} />
      <group position={[5, 1.2, 0]}>
        <WindowFrame position={[0, 0, 0]} size={[1.2, 1.2]} frameColor={frameHex} />
      </group>
      <group position={[4, 1.2, -1.5]}>
        <WindowFrame position={[0, 0, 0]} size={[1, 1.1]} frameColor={frameHex} />
      </group>

      {/* Hallway / circulation */}
      <Floor position={[0, FLOOR_Y - 0.005, 0]} size={[2, 1.5]} />

      {/* Room markers */}
      {rooms.map((room) => (
        <RoomMarker
          key={room.id}
          room={room}
          isActive={selectedRoomId === room.id}
          onClick={() => onRoomSelect(room.id)}
        />
      ))}
    </>
  );
}
