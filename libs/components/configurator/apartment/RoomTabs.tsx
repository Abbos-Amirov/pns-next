'use client';

import React from 'react';
import { useTranslation } from 'next-i18next';
import type { RoomConfig } from './roomData';

interface RoomTabsProps {
  rooms: RoomConfig[];
  selectedRoomId: number;
  onSelect: (id: number) => void;
}

export function RoomTabs({ rooms, selectedRoomId, onSelect }: RoomTabsProps) {
  const { t } = useTranslation('configurator');

  return (
    <nav className="room-tabs">
      <div className="room-tabs-inner">
        {rooms.map((room) => (
          <button
            key={room.id}
            type="button"
            className={`room-tabs-item ${selectedRoomId === room.id ? 'active' : ''}`}
            onClick={() => onSelect(room.id)}
            aria-label={t(room.labelKey) || room.name}
            aria-current={selectedRoomId === room.id ? 'true' : undefined}
          >
            <span className="room-tabs-num">{room.id}</span>
            <span className="room-tabs-label">{t(room.labelKey) || room.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
