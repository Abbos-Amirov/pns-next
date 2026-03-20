'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { RoomPlaceholder } from './RoomPlaceholder';
import type { RoomConfig } from './roomData';

const LivingRoom3DViewerDynamic = dynamic(() => import('./LivingRoom3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="viewer-loading">
      <span>Loading 3D scene...</span>
    </div>
  ),
});

interface ViewerLayoutProps {
  room: RoomConfig;
  frameColor: 'white' | 'darkGray' | 'warmBeige';
}

export function ViewerLayout({ room, frameColor }: ViewerLayoutProps) {
  if (room.id === 1 && room.status === 'ready') {
    return (
      <LivingRoom3DViewerDynamic
        frameColor={frameColor}
      />
    );
  }

  return <RoomPlaceholder room={room} />;
}
