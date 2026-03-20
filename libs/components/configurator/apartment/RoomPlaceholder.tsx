'use client';

import React from 'react';
import type { RoomConfig } from './roomData';

interface RoomPlaceholderProps {
  room: RoomConfig;
}

export function RoomPlaceholder({ room }: RoomPlaceholderProps) {
  return (
    <div className="room-placeholder">
      <div className="room-placeholder-content">
        <div className="room-placeholder-icon">🪟</div>
        <h3 className="room-placeholder-title">{room.name}</h3>
        <p className="room-placeholder-subtitle">{room.subtitle}</p>
        <p className="room-placeholder-coming">3D scene coming soon</p>
      </div>
    </div>
  );
}
