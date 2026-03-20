'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { ViewerLayout } from './ViewerLayout';
import { RoomSidebar } from './RoomSidebar';
import { RoomTabs } from './RoomTabs';
import { ROOM_CONFIGS } from './roomData';
import type { WindowFrameColor } from './roomData';

interface ApartmentConfiguratorProps {
  showSidePanel?: boolean;
}

export default function ApartmentConfigurator({ showSidePanel = true }: ApartmentConfiguratorProps) {
  const [selectedRoomId, setSelectedRoomId] = useState(1);
  const [frameColor, setFrameColor] = useState<WindowFrameColor>('white');

  const selectedRoom = useMemo(
    () => ROOM_CONFIGS.find((r) => r.id === selectedRoomId) ?? ROOM_CONFIGS[0],
    [selectedRoomId]
  );

  const onRoomSelect = useCallback((id: number) => setSelectedRoomId(id), []);

  return (
    <div className="apartment-configurator">
      <div className="apartment-configurator-main">
        <div className="apartment-configurator-viewer">
          <ViewerLayout room={selectedRoom} frameColor={frameColor} />
        </div>
      </div>

      <RoomTabs
        rooms={ROOM_CONFIGS}
        selectedRoomId={selectedRoomId}
        onSelect={onRoomSelect}
      />

      {showSidePanel && (
        <RoomSidebar
          selectedRoom={selectedRoom}
          frameColor={frameColor}
          onFrameColorChange={setFrameColor}
        />
      )}
    </div>
  );
}
