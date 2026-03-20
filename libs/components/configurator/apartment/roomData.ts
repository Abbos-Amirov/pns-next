/**
 * Room configuration for image-based apartment configurator
 */

export type WindowFrameColor = 'white' | 'darkGray' | 'warmBeige';

export const FRAME_COLORS: Record<WindowFrameColor, string> = {
  white: '#F7F7F4',
  darkGray: '#4F5257',
  warmBeige: '#E7CFA8',
};

export interface RoomConfig {
  id: number;
  name: string;
  labelKey: string;
  subtitle?: string;
  image: string;
  hasFrameColorControl: boolean;
  status: 'ready' | 'placeholder';
  /** Frame overlay position (percentage) - for rooms with frame control */
  frameOverlay?: {
    top: string;
    left: string;
    width: string;
    height: string;
    borderRadius?: string;
  };
}

export const ROOM_CONFIGS: RoomConfig[] = [
  {
    id: 1,
    name: 'Living room',
    labelKey: 'room1',
    subtitle: 'Living room balcony',
    image: '/img/configurator/apartment/living-room.png',
    hasFrameColorControl: true,
    status: 'ready',
    frameOverlay: {
      top: '12%',
      left: '18%',
      width: '64%',
      height: '58%',
      borderRadius: '2px',
    },
  },
  {
    id: 2,
    name: 'Master bedroom',
    labelKey: 'room2',
    subtitle: 'Master bedroom balcony',
    image: '',
    hasFrameColorControl: false,
    status: 'placeholder',
  },
  {
    id: 3,
    name: 'Bedroom 2',
    labelKey: 'room3',
    subtitle: 'Bedroom 2 balcony',
    image: '',
    hasFrameColorControl: false,
    status: 'placeholder',
  },
  {
    id: 4,
    name: 'Multipurpose',
    labelKey: 'room4',
    subtitle: 'Multipurpose room',
    image: '',
    hasFrameColorControl: false,
    status: 'placeholder',
  },
  {
    id: 5,
    name: 'Kitchen / Service',
    labelKey: 'room5',
    subtitle: 'Kitchen and service area',
    image: '',
    hasFrameColorControl: false,
    status: 'placeholder',
  },
  {
    id: 6,
    name: 'Bedroom 3',
    labelKey: 'room6',
    subtitle: 'Bedroom 3',
    image: '',
    hasFrameColorControl: false,
    status: 'placeholder',
  },
  {
    id: 7,
    name: 'Living room',
    labelKey: 'room7',
    subtitle: 'Inner window area',
    image: '',
    hasFrameColorControl: false,
    status: 'placeholder',
  },
  {
    id: 8,
    name: 'Master bedroom',
    labelKey: 'room8',
    subtitle: 'Inner window area',
    image: '',
    hasFrameColorControl: false,
    status: 'placeholder',
  },
  {
    id: 9,
    name: 'Bedroom 2',
    labelKey: 'room9',
    subtitle: 'Inner window area',
    image: '',
    hasFrameColorControl: false,
    status: 'placeholder',
  },
];
