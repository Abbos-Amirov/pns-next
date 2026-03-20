/**
 * Apartment room data - matches floor plan numbering
 * 1-3: balcony exterior windows, 4-6: other exterior zones, 7-9: interior sliding doors
 */

export type WindowFrameColor = 'white' | 'darkGray' | 'warmBeige';

export const WINDOW_FRAME_COLORS: Record<WindowFrameColor, string> = {
  white: '#F7F7F4',
  darkGray: '#5C5C5C',
  warmBeige: '#E7CFA8',
};

export interface RoomDefinition {
  id: number;
  label: string;
  labelKey: string;
  type: 'exterior' | 'interior' | 'balcony';
  markerColor: string;
  position: [number, number, number];
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  markerPosition: [number, number, number];
  /** Room 1 only: camera position when viewing from outside (backyard) */
  cameraPositionOutside?: [number, number, number];
  cameraTargetOutside?: [number, number, number];
}

export const APARTMENT_ROOMS: RoomDefinition[] = [
  {
    id: 1,
    label: '거실 발코니',
    labelKey: 'room1',
    type: 'balcony',
    markerColor: '#e74c3c',
    position: [0, 0, 0],
    cameraPosition: [0, 1.5, 0.5],
    cameraTarget: [0, 1.4, 2.8],
    markerPosition: [-6.5, 2, -1],
    cameraPositionOutside: [0, 1.5, 5.5],
    cameraTargetOutside: [0, 1.4, 2.5],
  },
  {
    id: 2,
    label: '안방 발코니',
    labelKey: 'room2',
    type: 'balcony',
    markerColor: '#e74c3c',
    position: [0, 0, 0],
    cameraPosition: [-8, 5, 1],
    cameraTarget: [-6, 1.5, 1],
    markerPosition: [-6.5, 2, 1],
  },
  {
    id: 3,
    label: '침실2 발코니',
    labelKey: 'room3',
    type: 'balcony',
    markerColor: '#e74c3c',
    position: [0, 0, 0],
    cameraPosition: [3.5, 4, 3.5],
    cameraTarget: [3, 1.5, 2.5],
    markerPosition: [3.5, 2, 3],
  },
  {
    id: 4,
    label: '다용도실 발코니',
    labelKey: 'room4',
    type: 'exterior',
    markerColor: '#f1c40f',
    position: [0, 0, 0],
    cameraPosition: [6, 4, 0.5],
    cameraTarget: [4.5, 1.5, 0],
    markerPosition: [4.5, 2, 0.5],
  },
  {
    id: 5,
    label: '주방/서비스',
    labelKey: 'room5',
    type: 'exterior',
    markerColor: '#9b59b6',
    position: [0, 0, 0],
    cameraPosition: [4.5, 4, -1],
    cameraTarget: [4, 1.5, -0.5],
    markerPosition: [4, 2, -0.8],
  },
  {
    id: 6,
    label: '침실3',
    labelKey: 'room6',
    type: 'exterior',
    markerColor: '#3498db',
    position: [0, 0, 0],
    cameraPosition: [5, 4, -2.5],
    cameraTarget: [3.5, 1.5, -2],
    markerPosition: [3.8, 2, -2],
  },
  {
    id: 7,
    label: '거실 내부창',
    labelKey: 'room7',
    type: 'interior',
    markerColor: '#2ecc71',
    position: [0, 0, 0],
    cameraPosition: [0, 4, 5],
    cameraTarget: [0, 1.5, 2],
    markerPosition: [0, 2, 2],
  },
  {
    id: 8,
    label: '안방 내부창',
    labelKey: 'room8',
    type: 'interior',
    markerColor: '#2ecc71',
    position: [0, 0, 0],
    cameraPosition: [-2, 4, 3.5],
    cameraTarget: [-2, 1.5, 2.5],
    markerPosition: [-2, 2, 2.8],
  },
  {
    id: 9,
    label: '침실2 내부창',
    labelKey: 'room9',
    type: 'interior',
    markerColor: '#2ecc71',
    position: [0, 0, 0],
    cameraPosition: [1, 4, 3.5],
    cameraTarget: [1, 1.5, 2.5],
    markerPosition: [1.5, 2, 2.8],
  },
];
