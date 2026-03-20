'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraController } from './CameraController';
import { ApartmentScene } from './ApartmentScene';
import { LivingRoomScene } from './LivingRoomScene';
import { APARTMENT_ROOMS } from './data/apartmentRooms';
import type { RoomDefinition } from './data/apartmentRooms';
import type { WindowFrameColor } from './data/apartmentRooms';

interface Apartment3DCanvasProps {
  selectedRoomId: number;
  selectedRoom: RoomDefinition;
  frameColor: WindowFrameColor;
  onRoomSelect: (id: number) => void;
  cameraMode?: 'inside' | 'outside';
}

export default function Apartment3DCanvas({
  selectedRoomId,
  selectedRoom,
  frameColor,
  onRoomSelect,
  cameraMode = 'inside',
}: Apartment3DCanvasProps) {
  const isLivingRoom = selectedRoomId === 1;
  const camPos = isLivingRoom && cameraMode === 'outside' && selectedRoom.cameraPositionOutside
    ? selectedRoom.cameraPositionOutside
    : selectedRoom.cameraPosition;

  return (
    <Canvas
      gl={{ antialias: true, alpha: false }}
      shadows
      camera={{ position: camPos, fov: 50, near: 0.1, far: 100 }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%', display: 'block' }}
      frameloop="always"
      onCreated={({ gl }) => {
        gl.setClearColor('#e8e6e2');
      }}
    >
      <color attach="background" args={['#e8e6e2']} />
      <CameraController targetRoom={selectedRoom} cameraMode={cameraMode} />
      <Suspense fallback={null}>
        {isLivingRoom ? (
          <LivingRoomScene frameColor={frameColor} />
        ) : (
          <ApartmentScene
            rooms={APARTMENT_ROOMS}
            selectedRoomId={selectedRoomId}
            frameColor={frameColor}
            onRoomSelect={onRoomSelect}
          />
        )}
      </Suspense>
    </Canvas>
  );
}
