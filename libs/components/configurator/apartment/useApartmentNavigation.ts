'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { RoomDefinition } from './data/apartmentRooms';

const TRANSITION_DURATION = 800;

export function useApartmentNavigation(
  selectedRoomId: number,
  rooms: RoomDefinition[]
) {
  const { camera } = useThree();
  const animRef = useRef<number>(0);
  const startPos = useRef(new THREE.Vector3());
  const startTarget = useRef(new THREE.Vector3());
  const endPos = useRef(new THREE.Vector3());
  const endTarget = useRef(new THREE.Vector3());
  const startTime = useRef(0);

  const goToRoom = useCallback(
    (roomId: number) => {
      const room = rooms.find((r) => r.id === roomId);
      if (!room) return;

      startPos.current.copy(camera.position);
      startTarget.current.copy(camera as any).sub(new THREE.Vector3(0, 0, -5)).normalize();
      const controls = (camera as any).controls;
      if (controls && controls.target) {
        startTarget.current.copy(controls.target);
      }

      endPos.current.set(...room.cameraPosition);
      endTarget.current.set(...room.cameraTarget);
      startTime.current = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime.current;
        const progress = Math.min(elapsed / TRANSITION_DURATION, 1);
        const eased = 1 - Math.pow(1 - progress, 2);

        camera.position.lerpVectors(startPos.current, endPos.current, eased);
        if ((camera as any).controls?.target) {
          (camera as any).controls.target.lerpVectors(
            startTarget.current,
            endTarget.current,
            eased
          );
        } else {
          camera.lookAt(endTarget.current);
        }

        if (progress < 1) {
          animRef.current = requestAnimationFrame(animate);
        }
      };

      cancelAnimationFrame(animRef.current);
      animRef.current = requestAnimationFrame(animate);
    },
    [camera, rooms]
  );

  return { goToRoom };
}
