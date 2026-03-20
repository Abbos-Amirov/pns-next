'use client';

import React from 'react';
import type { RoomConfig, WindowFrameColor } from './roomData';
import { FRAME_COLORS } from './roomData';

interface RoomViewerProps {
  room: RoomConfig;
  frameColor: WindowFrameColor;
}

export function RoomViewer({ room, frameColor }: RoomViewerProps) {
  if (room.status === 'placeholder') {
    return (
      <div className="room-viewer room-viewer--placeholder">
        <div className="room-viewer-placeholder">
          <div className="room-viewer-placeholder-icon">🪟</div>
          <h3 className="room-viewer-placeholder-title">{room.name}</h3>
          <p className="room-viewer-placeholder-subtitle">{room.subtitle}</p>
          <p className="room-viewer-placeholder-coming">Image coming soon</p>
        </div>
      </div>
    );
  }

  const frameHex = FRAME_COLORS[frameColor];
  const overlay = room.frameOverlay;

  return (
    <div className="room-viewer">
      <div className="room-viewer-image-wrap">
        <div className="room-viewer-image-container">
          <img
            src={room.image}
            alt={room.name}
            className="room-viewer-image"
          />
          {room.hasFrameColorControl && overlay && (
            <div
              className="room-viewer-frame-overlay"
              style={{
                top: overlay.top,
                left: overlay.left,
                width: overlay.width,
                height: overlay.height,
                borderRadius: overlay.borderRadius || '0',
                border: '14px solid',
                borderColor: frameHex,
                boxSizing: 'border-box',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
