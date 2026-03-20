'use client';

import React from 'react';
import { useTranslation } from 'next-i18next';
import { WindowFrameColorPicker } from './WindowFrameColorPicker';
import type { RoomConfig, WindowFrameColor } from './roomData';

interface RoomSidebarProps {
  selectedRoom: RoomConfig;
  frameColor: WindowFrameColor;
  onFrameColorChange: (color: WindowFrameColor) => void;
}

export function RoomSidebar({ selectedRoom, frameColor, onFrameColorChange }: RoomSidebarProps) {
  const { t } = useTranslation('configurator');

  return (
    <aside className="room-sidebar">
      <h1 className="room-sidebar-title">{t('apartment3DTitle')}</h1>
      <p className="room-sidebar-subtitle">{t('apartment3DSubtitle')}</p>

      <div className="room-sidebar-room-info">
        <h2 className="room-sidebar-room-name">
          Room {selectedRoom.id}: {selectedRoom.name}
        </h2>
        {selectedRoom.subtitle && (
          <p className="room-sidebar-room-subtitle">{selectedRoom.subtitle}</p>
        )}
      </div>

      {selectedRoom.hasFrameColorControl && (
        <WindowFrameColorPicker
          selected={frameColor}
          onSelect={onFrameColorChange}
        />
      )}

      {selectedRoom.status === 'placeholder' && (
        <p className="room-sidebar-note">
          {t('roomComingSoon') || 'Frame color options will be available when the room image is added.'}
        </p>
      )}
    </aside>
  );
}
