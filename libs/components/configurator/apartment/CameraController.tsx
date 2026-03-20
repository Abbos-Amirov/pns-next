'use client';

import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { RoomDefinition } from './data/apartmentRooms';

const TRANSITION_MS = 900;

interface CameraControllerProps {
  targetRoom: RoomDefinition;
  cameraMode?: 'inside' | 'outside';
}

export function CameraController({ targetRoom, cameraMode = 'inside' }: CameraControllerProps) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const prevRoomRef = useRef<RoomDefinition>(targetRoom);
  const prevModeRef = useRef<'inside' | 'outside'>(cameraMode);
  const startPos = useRef(new THREE.Vector3());
  const startTarget = useRef(new THREE.Vector3());
  const animStart = useRef(0);

  const isRoom1 = targetRoom.id === 1;
  const useOutside = isRoom1 && cameraMode === 'outside';
  const endPos = useOutside && targetRoom.cameraPositionOutside
    ? targetRoom.cameraPositionOutside
    : targetRoom.cameraPosition;
  const endTarget = useOutside && targetRoom.cameraTargetOutside
    ? targetRoom.cameraTargetOutside
    : targetRoom.cameraTarget;

  useEffect(() => {
    const roomChanged = targetRoom.id !== prevRoomRef.current.id;
    const modeChanged = isRoom1 && cameraMode !== prevModeRef.current;
    if (roomChanged || modeChanged) {
      startPos.current.copy(camera.position);
      if (controlsRef.current?.target) {
        startTarget.current.copy(controlsRef.current.target);
      } else {
        startTarget.current.set(0, 0, 0);
      }
      prevRoomRef.current = targetRoom;
      prevModeRef.current = cameraMode;
      animStart.current = performance.now();
    }
  }, [targetRoom, cameraMode, isRoom1, camera]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const elapsed = performance.now() - animStart.current;
    const progress = Math.min(elapsed / TRANSITION_MS, 1);
    const eased = 1 - Math.pow(1 - progress, 2);

    const endPosVec = new THREE.Vector3(...endPos);
    const endTargetVec = new THREE.Vector3(...endTarget);

    camera.position.lerpVectors(startPos.current, endPosVec, eased);
    controls.target.lerpVectors(startTarget.current, endTargetVec, eased);

    if (progress >= 1) {
      camera.position.copy(endPosVec);
      controls.target.copy(endTargetVec);
    }
  });

  const minDist = isRoom1 ? 1.5 : 4;
  const maxDist = isRoom1 ? 12 : 18;

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={isRoom1}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minDistance={minDist}
      maxDistance={maxDist}
      target={[...endTarget]}
    />
  );
}
