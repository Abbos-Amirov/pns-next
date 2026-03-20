'use client';

import React from 'react';

/** Room dimensions - width 12, depth 8, height 3.2 */
export const ROOM_WIDTH = 12;
export const ROOM_DEPTH = 8;
export const ROOM_HEIGHT = 3.2;
export const WALL_THICKNESS = 0.25;

/** Window on BACK WALL (z=0) - camera looks at this wall from inside */
const WINDOW_WIDTH = 7.8;
const WINDOW_HEIGHT = 2.25;
const WINDOW_BOTTOM = 0.45;
const WINDOW_TOP = WINDOW_BOTTOM + WINDOW_HEIGHT;
const WINDOW_LEFT = -WINDOW_WIDTH / 2;
const WINDOW_RIGHT = WINDOW_WIDTH / 2;

/**
 * Room shell: camera is INSIDE at z~5.8, looking toward window at z=0.
 * - Back wall (window wall): z = 0
 * - Front wall (behind camera): z = 8
 * - Left wall: x = -6
 * - Right wall: x = 6
 */
export function LivingRoomShell({ children }: { children?: React.ReactNode }) {
  const halfW = ROOM_WIDTH / 2;
  const halfT = WALL_THICKNESS / 2;

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -0.01, ROOM_DEPTH / 2]} receiveShadow>
        <boxGeometry args={[ROOM_WIDTH + 0.1, 0.02, ROOM_DEPTH + 0.1]} />
        <meshStandardMaterial color="#d8d0c4" roughness={0.7} metalness={0.02} />
      </mesh>

      {/* Rug - seating area */}
      <mesh position={[0, 0.002, 2]} receiveShadow>
        <boxGeometry args={[5, 0.006, 3.5]} />
        <meshStandardMaterial color="#a8a098" roughness={0.92} metalness={0} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, ROOM_HEIGHT + 0.04, ROOM_DEPTH / 2]} receiveShadow>
        <boxGeometry args={[ROOM_WIDTH + 0.1, 0.08, ROOM_DEPTH + 0.1]} />
        <meshStandardMaterial color="#fafaf6" roughness={0.96} metalness={0} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-halfW - halfT, ROOM_HEIGHT / 2 - 0.01, ROOM_DEPTH / 2]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, ROOM_HEIGHT + 0.02, ROOM_DEPTH + 0.1]} />
        <meshStandardMaterial color="#f5f3ef" roughness={0.9} metalness={0.02} />
      </mesh>

      {/* Right wall */}
      <mesh position={[halfW + halfT, ROOM_HEIGHT / 2 - 0.01, ROOM_DEPTH / 2]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, ROOM_HEIGHT + 0.02, ROOM_DEPTH + 0.1]} />
        <meshStandardMaterial color="#f5f3ef" roughness={0.9} metalness={0.02} />
      </mesh>

      {/* Front wall - behind camera at z=8 */}
      <mesh position={[0, ROOM_HEIGHT / 2 - 0.01, ROOM_DEPTH + halfT]} castShadow receiveShadow>
        <boxGeometry args={[ROOM_WIDTH + 0.1, ROOM_HEIGHT + 0.02, WALL_THICKNESS]} />
        <meshStandardMaterial color="#f5f3ef" roughness={0.9} metalness={0.02} />
      </mesh>

      {/* BACK WALL (z=0) - segments around window opening */}
      {/* Left segment: x from -6 to -3.9 */}
      <mesh position={[-4.95, ROOM_HEIGHT / 2 - 0.01, -halfT]} castShadow receiveShadow>
        <boxGeometry args={[2.1, ROOM_HEIGHT + 0.02, WALL_THICKNESS]} />
        <meshStandardMaterial color="#f5f3ef" roughness={0.9} metalness={0.02} />
      </mesh>
      {/* Right segment: x from 3.9 to 6 */}
      <mesh position={[4.95, ROOM_HEIGHT / 2 - 0.01, -halfT]} castShadow receiveShadow>
        <boxGeometry args={[2.1, ROOM_HEIGHT + 0.02, WALL_THICKNESS]} />
        <meshStandardMaterial color="#f5f3ef" roughness={0.9} metalness={0.02} />
      </mesh>
      {/* Top segment */}
      <mesh position={[0, (WINDOW_TOP + ROOM_HEIGHT) / 2, -halfT]} castShadow receiveShadow>
        <boxGeometry args={[WINDOW_WIDTH, ROOM_HEIGHT - WINDOW_TOP, WALL_THICKNESS]} />
        <meshStandardMaterial color="#f5f3ef" roughness={0.9} metalness={0.02} />
      </mesh>
      {/* Bottom segment - sill */}
      <mesh position={[0, WINDOW_BOTTOM / 2, -halfT]} castShadow receiveShadow>
        <boxGeometry args={[WINDOW_WIDTH, WINDOW_BOTTOM, WALL_THICKNESS]} />
        <meshStandardMaterial color="#f5f3ef" roughness={0.9} metalness={0.02} />
      </mesh>

      {children}
    </group>
  );
}
