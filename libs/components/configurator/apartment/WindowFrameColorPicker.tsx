'use client';

import React from 'react';
import { useTranslation } from 'next-i18next';
import { FRAME_COLORS, type WindowFrameColor } from './roomData';

interface WindowFrameColorPickerProps {
  selected: WindowFrameColor;
  onSelect: (color: WindowFrameColor) => void;
  disabled?: boolean;
}

const COLOR_KEYS: Record<WindowFrameColor, string> = {
  white: 'colorWhite',
  darkGray: 'colorDarkGray',
  warmBeige: 'colorWarmBeige',
};

export function WindowFrameColorPicker({ selected, onSelect, disabled }: WindowFrameColorPickerProps) {
  const { t } = useTranslation('configurator');
  const colors: WindowFrameColor[] = ['white', 'darkGray', 'warmBeige'];

  return (
    <div className="window-frame-color-picker">
      <span className="window-frame-color-picker-label">{t('windowFrameColor')}</span>
      <div className="window-frame-color-picker-options">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            className={`window-frame-color-swatch ${selected === color ? 'active' : ''}`}
            onClick={() => !disabled && onSelect(color)}
            style={{ background: FRAME_COLORS[color] }}
            title={t(COLOR_KEYS[color])}
            aria-label={t(COLOR_KEYS[color])}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
