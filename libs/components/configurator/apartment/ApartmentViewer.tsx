'use client';

import React, { useCallback, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
import { APARTMENT_ROOMS } from './data/apartmentRooms';
import { BottomRoomNavigator } from './BottomRoomNavigator';
import { WindowColorSwitcher } from './WindowColorSwitcher';
import type { WindowFrameColor } from './data/apartmentRooms';

const Apartment3DCanvas = dynamic(() => import('./Apartment3DCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%',
      height: '100%',
      minHeight: 500,
      background: '#e8e6e2',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#666',
      fontSize: 14,
    }}>
      Loading 3D...
    </div>
  ),
});

interface ApartmentViewerProps {
  /** Optional: reuse configurator panel layout */
  showSidePanel?: boolean;
}

export type { WindowFrameColor };

function ApartmentViewer({ showSidePanel = true }: ApartmentViewerProps) {
  const { t } = useTranslation('configurator');
  const [selectedRoomId, setSelectedRoomId] = useState(1);
  const [frameColor, setFrameColor] = useState<WindowFrameColor>('white');
  const [cameraMode, setCameraMode] = useState<'inside' | 'outside'>('inside');

  const selectedRoom = useMemo(() => APARTMENT_ROOMS.find((r) => r.id === selectedRoomId) ?? APARTMENT_ROOMS[0], [selectedRoomId]);
  const onRoomSelect = useCallback((id: number) => {
    setSelectedRoomId(id);
    setCameraMode('inside');
  }, []);

  const isLivingRoom = selectedRoomId === 1;

  return (
    <div className="apartment-viewer" style={{ flex: 1, minWidth: 0 }}>
      <div className="apartment-viewer-main" style={{ minHeight: '100%' }}>
        <div className="apartment-canvas-wrap">
          <Apartment3DCanvas
            selectedRoomId={selectedRoomId}
            selectedRoom={selectedRoom}
            frameColor={frameColor}
            onRoomSelect={onRoomSelect}
            cameraMode={cameraMode}
          />
        </div>
      </div>

      <BottomRoomNavigator
        rooms={APARTMENT_ROOMS}
        selectedRoomId={selectedRoomId}
        onRoomSelect={onRoomSelect}
        t={t}
      />

      {showSidePanel && (
        <aside className="apartment-panel">
          <h1 className="apartment-title">{t('apartment3DTitle')}</h1>
          <p className="apartment-subtitle">{t('apartment3DSubtitle')}</p>
          {isLivingRoom && (
            <div className="apartment-camera-toggle">
              <span className="apartment-color-switcher-label">{t('viewMode')}</span>
              <div className="apartment-camera-toggle-btns">
                <button
                  type="button"
                  className={`apartment-camera-toggle-btn ${cameraMode === 'inside' ? 'active' : ''}`}
                  onClick={() => setCameraMode('inside')}
                >
                  {t('viewInside')}
                </button>
                <button
                  type="button"
                  className={`apartment-camera-toggle-btn ${cameraMode === 'outside' ? 'active' : ''}`}
                  onClick={() => setCameraMode('outside')}
                >
                  {t('viewOutside')}
                </button>
              </div>
            </div>
          )}
          <WindowColorSwitcher selected={frameColor} onSelect={setFrameColor} t={t} />
        </aside>
      )}
    </div>
  );
}

export { ApartmentViewer };
export default ApartmentViewer;
