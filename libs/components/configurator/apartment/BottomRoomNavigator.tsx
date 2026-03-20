'use client';

import React from 'react';
import type { RoomDefinition } from './data/apartmentRooms';

interface BottomRoomNavigatorProps {
  rooms: RoomDefinition[];
  selectedRoomId: number;
  onRoomSelect: (id: number) => void;
  t: (key: string) => string;
}

export function BottomRoomNavigator({ rooms, selectedRoomId, onRoomSelect, t }: BottomRoomNavigatorProps) {
  return (
    <nav className="apartment-nav">
      <div className="apartment-nav-inner">
        {rooms.map((room) => (
          <button
            key={room.id}
            type="button"
            className={`apartment-nav-item ${selectedRoomId === room.id ? 'active' : ''}`}
            onClick={() => onRoomSelect(room.id)}
            aria-label={t(room.labelKey) || room.label}
            aria-current={selectedRoomId === room.id ? 'true' : undefined}
          >
            <span className="apartment-nav-num">{room.id}</span>
            <span className="apartment-nav-label">{t(room.labelKey) || room.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
