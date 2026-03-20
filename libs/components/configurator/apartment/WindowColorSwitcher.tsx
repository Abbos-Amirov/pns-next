'use client';

import React from 'react';
import { WINDOW_FRAME_COLORS, type WindowFrameColor } from './data/apartmentRooms';

interface WindowColorSwitcherProps {
  selected: WindowFrameColor;
  onSelect: (color: WindowFrameColor) => void;
  t: (key: string) => string;
}

const COLOR_LABELS: Record<WindowFrameColor, string> = {
  white: 'colorWhite',
  darkGray: 'colorDarkGray',
  warmBeige: 'colorWarmBeige',
};

export function WindowColorSwitcher({ selected, onSelect, t }: WindowColorSwitcherProps) {
  const colors: WindowFrameColor[] = ['white', 'darkGray', 'warmBeige'];

  return (
    <div className="apartment-color-switcher">
      <span className="apartment-color-switcher-label">{t('windowFrameColor')}</span>
      <div className="apartment-color-switcher-options">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            className={`apartment-color-swatch ${selected === color ? 'active' : ''}`}
            onClick={() => onSelect(color)}
            style={{ background: WINDOW_FRAME_COLORS[color] }}
            title={t(COLOR_LABELS[color])}
            aria-label={t(COLOR_LABELS[color])}
          />
        ))}
      </div>
    </div>
  );
}
