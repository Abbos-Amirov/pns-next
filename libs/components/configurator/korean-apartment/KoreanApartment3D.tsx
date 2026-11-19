import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import * as THREE from 'three';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';

/* ------------------------------------------------------------------ */
/*  Frame colours (same 3 options as the pricing panel)                 */
/* ------------------------------------------------------------------ */

export type FrameColorKey = 'White' | 'US201' | 'MQ808';

const FRAME_COLORS: { key: FrameColorKey; hex: string; wood: boolean }[] = [
  { key: 'White', hex: '#f2f2ef', wood: false },
  { key: 'US201', hex: '#b88a5c', wood: true }, // light oak
  { key: 'MQ808', hex: '#5a4433', wood: true }, // dark walnut / bronze
];

const isFrameColor = (v: string | null | undefined): v is FrameColorKey =>
  !!v && FRAME_COLORS.some((c) => c.key === v);

/* ------------------------------------------------------------------ */
/*  i18n (small, local dictionary)                                      */
/* ------------------------------------------------------------------ */

type Dict = Record<string, string>;
const DICT: Record<string, Dict> = {
  kr: {
    entrance: '현관', living: '거실', livingBalcony: '거실 발코니', master: '안방', masterBalcony: '안방 발코니',
    bed1: '침실 1', bed2: '침실 2', kitchen: '주방', overview: '전체 보기',
    White: '화이트', US201: '오크 (US201)', MQ808: '월넛 (MQ808)',
    frameColor: '창호 프레임 색상', open: '창 열기', close: '창 닫기', applyAll: '모든 방에 적용',
    hintOverview: '방을 선택해 내부로 들어가 보세요', hintEntrance: '어서 오세요! 아래에서 방을 선택하세요',
    hintDrag: '드래그하여 둘러보기 · 창을 클릭하면 열리고 닫혀요',
  },
  en: {
    entrance: 'Entrance', living: 'Living room', livingBalcony: 'Living balcony', master: 'Master bedroom',
    masterBalcony: 'Master balcony', bed1: 'Bedroom 1', bed2: 'Bedroom 2', kitchen: 'Kitchen', overview: 'Overview',
    White: 'White', US201: 'Oak (US201)', MQ808: 'Walnut (MQ808)',
    frameColor: 'Window frame color', open: 'Open window', close: 'Close window', applyAll: 'Apply to all rooms',
    hintOverview: 'Pick a room to walk inside', hintEntrance: 'Welcome! Choose a room below',
    hintDrag: 'Drag to look around · click a window to open / close it',
  },
  ru: {
    entrance: 'Прихожая', living: 'Гостиная', livingBalcony: 'Балкон гостиной', master: 'Главная спальня',
    masterBalcony: 'Балкон спальни', bed1: 'Спальня 1', bed2: 'Спальня 2', kitchen: 'Кухня', overview: 'Общий вид',
    White: 'Белый', US201: 'Дуб (US201)', MQ808: 'Орех (MQ808)',
    frameColor: 'Цвет рамы окна', open: 'Открыть окно', close: 'Закрыть окно', applyAll: 'Применить ко всем',
    hintOverview: 'Выберите комнату, чтобы войти', hintEntrance: 'Добро пожаловать! Выберите комнату ниже',
    hintDrag: 'Перетащите, чтобы осмотреться · клик по окну открывает / закрывает',
  },
  ja: {
    entrance: '玄関', living: 'リビング', livingBalcony: 'リビングバルコニー', master: '主寝室', masterBalcony: '主寝室バルコニー',
    bed1: '寝室 1', bed2: '寝室 2', kitchen: 'キッチン', overview: '全体表示',
    White: 'ホワイト', US201: 'オーク (US201)', MQ808: 'ウォールナット (MQ808)',
    frameColor: '窓枠カラー', open: '窓を開ける', close: '窓を閉める', applyAll: '全室に適用',
    hintOverview: '部屋を選んで中に入ってみましょう', hintEntrance: 'ようこそ！下から部屋を選んでください',
    hintDrag: 'ドラッグで見回す · 窓をクリックで開閉',
  },
  zh: {
    entrance: '玄关', living: '客厅', livingBalcony: '客厅阳台', master: '主卧', masterBalcony: '主卧阳台',
    bed1: '卧室 1', bed2: '卧室 2', kitchen: '厨房', overview: '全景',
    White: '白色', US201: '橡木 (US201)', MQ808: '胡桃木 (MQ808)',
    frameColor: '窗框颜色', open: '打开窗户', close: '关闭窗户', applyAll: '应用到所有房间',
    hintOverview: '选择房间进入参观', hintEntrance: '欢迎！请在下方选择房间',
    hintDrag: '拖动环顾四周 · 点击窗户开关',
  },
};

/* ------------------------------------------------------------------ */
/*  Floor plan (metres). x → east, z → south (balcony side is +z)      */
/* ------------------------------------------------------------------ */

const H = 2.5; // ceiling height
const T = 0.16; // wall thickness

type WindowId = 'living' | 'livingBalcony' | 'master' | 'masterBalcony' | 'bed1' | 'bed2' | 'kitchen';

interface WindowSpec {
  id: WindowId;
  cx: number;
  z: number;
  width: number;
  bottom: number;
  top: number;
}

const WINDOWS: WindowSpec[] = [
  // inner big sliding doors (room → balcony)
  { id: 'living', cx: -0.75, z: 0, width: 4.6, bottom: 0.02, top: 2.3 },
  { id: 'master', cx: 4.5, z: 0, width: 3.6, bottom: 0.02, top: 2.3 },
  // outer balcony windows
  { id: 'livingBalcony', cx: -0.75, z: 1.6, width: 5.0, bottom: 0.45, top: 2.35 },
  { id: 'masterBalcony', cx: 4.5, z: 1.6, width: 4.4, bottom: 0.45, top: 2.35 },
  // bedroom & kitchen windows
  { id: 'bed1', cx: -5.25, z: 0, width: 2.4, bottom: 0.9, top: 2.2 },
  { id: 'bed2', cx: -5.25, z: -9, width: 2.0, bottom: 0.9, top: 2.2 },
  { id: 'kitchen', cx: -0.75, z: -9, width: 2.4, bottom: 1.1, top: 2.2 },
];

const opening = (w: WindowSpec) => ({ from: w.cx - w.width / 2, to: w.cx + w.width / 2, bottom: w.bottom, top: w.top });
const win = (id: WindowId) => WINDOWS.find((w) => w.id === id)!;
const door = (from: number, to: number, top = 2.1) => ({ from, to, bottom: 0, top });

interface Opening { from: number; to: number; bottom: number; top: number }
interface WallSpec { axis: 'x' | 'z'; at: number; from: number; to: number; openings?: Opening[]; color?: string }

const WALLS: WallSpec[] = [
  // exterior north (entrance side)
  { axis: 'x', at: -9, from: -7, to: 7, openings: [opening(win('bed2')), opening(win('kitchen')), door(5.1, 6.1)] },
  // exterior south line (rooms → balconies)
  { axis: 'x', at: 0, from: -7, to: 7, openings: [opening(win('bed1')), opening(win('living')), opening(win('master'))] },
  // balcony outer line
  { axis: 'x', at: 1.6, from: -3.5, to: 7, openings: [opening(win('livingBalcony')), opening(win('masterBalcony'))] },
  { axis: 'z', at: -7, from: -9, to: 0 },
  { axis: 'z', at: 7, from: -9, to: 1.6 },
  { axis: 'z', at: -3.5, from: 0, to: 1.6 },
  { axis: 'z', at: 2, from: 0, to: 1.6 },
  // interior
  { axis: 'z', at: -3.5, from: -9, to: 0, openings: [door(-5.6, -4.7), door(-4.3, -3.4)] },
  { axis: 'x', at: -4.5, from: -7, to: -3.5 },
  { axis: 'z', at: 2, from: -9, to: 0, openings: [door(-6.05, -5.1)] },
  { axis: 'x', at: -5, from: 2, to: 7, openings: [door(5.8, 6.7)] },
  { axis: 'x', at: -6.2, from: 2, to: 4.2, openings: [door(3.0, 3.8)] },
  { axis: 'z', at: 4.2, from: -9, to: -6.2 },
];

type RoomId = 'overview' | 'entrance' | 'living' | 'livingBalcony' | 'master' | 'masterBalcony' | 'bed1' | 'bed2' | 'kitchen';

interface RoomView {
  id: RoomId;
  pos: [number, number, number];
  target: [number, number, number];
  windowId?: WindowId;
  label?: [number, number]; // label position on floor plan (x, z)
  autoOpen?: WindowId; // inner door that opens automatically when visiting
}

const VIEWS: RoomView[] = [
  { id: 'overview', pos: [0, 17, 12.5], target: [0, 0, -3.6] },
  { id: 'entrance', pos: [3.6, 1.6, -5.6], target: [5.6, 1.1, -9], label: [5.6, -7.6] },
  { id: 'living', pos: [-0.75, 1.6, -4.4], target: [-0.75, 1.2, 0], windowId: 'living', label: [-0.75, -2.5] },
  { id: 'livingBalcony', pos: [-3.05, 1.6, 0.3], target: [0.2, 1.3, 1.6], windowId: 'livingBalcony', label: [-0.75, 0.8], autoOpen: 'living' },
  { id: 'master', pos: [4.3, 1.6, -4.5], target: [4.5, 1.2, 0], windowId: 'master', label: [4.5, -2.5] },
  { id: 'masterBalcony', pos: [2.45, 1.6, 0.3], target: [5.3, 1.3, 1.6], windowId: 'masterBalcony', label: [4.5, 0.8], autoOpen: 'master' },
  { id: 'bed1', pos: [-5.0, 1.6, -4.0], target: [-5.25, 1.5, 0], windowId: 'bed1', label: [-5.25, -2.2] },
  { id: 'bed2', pos: [-5.0, 1.6, -4.9], target: [-5.25, 1.5, -9], windowId: 'bed2', label: [-5.25, -6.8] },
  { id: 'kitchen', pos: [-0.75, 1.6, -3.6], target: [-0.75, 1.55, -9], windowId: 'kitchen', label: [-0.75, -7] },
];

const NAV_ORDER: RoomId[] = ['entrance', 'living', 'livingBalcony', 'master', 'masterBalcony', 'bed1', 'bed2', 'kitchen'];

const FLOORS: { id: RoomId; x: [number, number]; z: [number, number]; color: string }[] = [
  { id: 'living', x: [-3.5, 2], z: [-5, 0], color: '#b48a62' },
  { id: 'kitchen', x: [-3.5, 2], z: [-9, -5], color: '#b48a62' },
  { id: 'master', x: [2, 7], z: [-5, 0], color: '#a98260' },
  { id: 'bed1', x: [-7, -3.5], z: [-4.5, 0], color: '#a98260' },
  { id: 'bed2', x: [-7, -3.5], z: [-9, -4.5], color: '#a98260' },
  { id: 'entrance', x: [2, 7], z: [-9, -5], color: '#cfcac2' },
  { id: 'livingBalcony', x: [-3.5, 2], z: [0, 1.6], color: '#8d9094' },
  { id: 'masterBalcony', x: [2, 7], z: [0, 1.6], color: '#8d9094' },
];

/* ------------------------------------------------------------------ */
/*  Materials                                                           */
/* ------------------------------------------------------------------ */

function makeWoodTexture(base: string): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 90; i++) {
    const y = Math.random() * 256;
    const dark = Math.random() > 0.45;
    g.strokeStyle = dark ? `rgba(40,25,10,${0.05 + Math.random() * 0.12})` : `rgba(255,240,220,${0.04 + Math.random() * 0.08})`;
    g.lineWidth = 0.6 + Math.random() * 2;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= 256; x += 16) g.lineTo(x, y + Math.sin(x / 40 + i) * 2.5);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function useFrameMaterials() {
  return useMemo(() => {
    const out = {} as Record<FrameColorKey, THREE.MeshStandardMaterial>;
    FRAME_COLORS.forEach((c) => {
      out[c.key] = c.wood
        ? new THREE.MeshStandardMaterial({ map: makeWoodTexture(c.hex), roughness: 0.55, metalness: 0.05 })
        : new THREE.MeshStandardMaterial({ color: new THREE.Color().setStyle(c.hex), roughness: 0.4, metalness: 0.05 });
    });
    return out;
  }, []);
}

const glassMaterial = new THREE.MeshStandardMaterial({
  color: '#cfe8f2',
  transparent: true,
  opacity: 0.16,
  roughness: 0.05,
  metalness: 0.2,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const handleMaterial = new THREE.MeshStandardMaterial({ color: '#d9d9d9', metalness: 0.6, roughness: 0.3 });
const wallMaterial = new THREE.MeshStandardMaterial({ color: '#f1efea', roughness: 0.95 });

/* ------------------------------------------------------------------ */
/*  Walls                                                               */
/* ------------------------------------------------------------------ */

function Wall({ spec }: { spec: WallSpec }) {
  const pieces = useMemo(() => {
    const list: { a: number; b: number; y0: number; y1: number }[] = [];
    const ops = [...(spec.openings ?? [])].sort((p, q) => p.from - q.from);
    let cursor = spec.from;
    ops.forEach((o) => {
      if (o.from > cursor) list.push({ a: cursor, b: o.from, y0: 0, y1: H });
      if (o.bottom > 0) list.push({ a: o.from, b: o.to, y0: 0, y1: o.bottom });
      if (o.top < H) list.push({ a: o.from, b: o.to, y0: o.top, y1: H });
      cursor = o.to;
    });
    if (cursor < spec.to) list.push({ a: cursor, b: spec.to, y0: 0, y1: H });
    return list;
  }, [spec]);

  return (
    <group>
      {pieces.map((p, i) => {
        const len = p.b - p.a;
        const mid = (p.a + p.b) / 2;
        const h = p.y1 - p.y0;
        const pos: [number, number, number] =
          spec.axis === 'x' ? [mid, p.y0 + h / 2, spec.at] : [spec.at, p.y0 + h / 2, mid];
        const size: [number, number, number] = spec.axis === 'x' ? [len + T, h, T] : [T, h, len];
        return (
          <mesh key={i} position={pos} material={wallMaterial}>
            <boxGeometry args={size} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Sliding window unit: wide centre pair + narrow side sashes          */
/* ------------------------------------------------------------------ */

function Bar({ p, s, m }: { p: [number, number, number]; s: [number, number, number]; m: THREE.Material }) {
  return (
    <mesh position={p} material={m}>
      <boxGeometry args={s} />
    </mesh>
  );
}

function Sash({ w, h, m, handleX }: { w: number; h: number; m: THREE.Material; handleX: number }) {
  const p = 0.055;
  const d = 0.05;
  return (
    <group>
      <Bar p={[0, h / 2 - p / 2, 0]} s={[w, p, d]} m={m} />
      <Bar p={[0, -h / 2 + p / 2, 0]} s={[w, p, d]} m={m} />
      <Bar p={[-w / 2 + p / 2, 0, 0]} s={[p, h, d]} m={m} />
      <Bar p={[w / 2 - p / 2, 0, 0]} s={[p, h, d]} m={m} />
      <mesh material={glassMaterial}>
        <planeGeometry args={[w - p * 2, h - p * 2]} />
      </mesh>
      <Bar p={[handleX, 0, 0.04]} s={[0.025, 0.22, 0.03]} m={handleMaterial} />
      <Bar p={[handleX, 0, -0.04]} s={[0.025, 0.22, 0.03]} m={handleMaterial} />
    </group>
  );
}

function WindowUnit({
  spec,
  material,
  open,
  onToggle,
}: {
  spec: WindowSpec;
  material: THREE.Material;
  open: boolean;
  onToggle: (id: WindowId) => void;
}) {
  const W = spec.width;
  const Hh = spec.top - spec.bottom;
  const f = 0.07; // outer frame profile
  const Wi = W - f * 2;
  const Hi = Hh - f * 2;
  const s = Wi * 0.2; // narrow side sash
  const c = Wi * 0.6; // wide centre
  const ov = 0.03; // overlap between sashes

  const sashes = useMemo(
    () => [
      { w: s + ov, x: -Wi / 2 + s / 2, z: 0.032, dx: s * 0.95, hx: s / 2 - 0.06 },
      { w: c / 2 + ov, x: -Wi / 2 + s + c / 4, z: -0.032, dx: (c / 2) * 0.95, hx: c / 4 - 0.06 },
      { w: c / 2 + ov, x: -Wi / 2 + s + (3 * c) / 4, z: 0.032, dx: 0, hx: -c / 4 + 0.06 },
      { w: s + ov, x: Wi / 2 - s / 2, z: -0.032, dx: -s * 0.95, hx: -s / 2 + 0.06 },
    ],
    [Wi, s, c],
  );

  const refs = useRef<(THREE.Group | null)[]>([]);
  useFrame((_, dt) => {
    sashes.forEach((sh, i) => {
      const g = refs.current[i];
      if (!g) return;
      const target = sh.x + (open ? sh.dx : 0);
      g.position.x += (target - g.position.x) * Math.min(1, dt * 4);
    });
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onToggle(spec.id);
  };

  return (
    <group
      position={[spec.cx, spec.bottom, spec.z]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = '';
      }}
    >
      {/* outer frame */}
      <Bar p={[0, Hh - f / 2, 0]} s={[W, f, 0.15]} m={material} />
      <Bar p={[0, f / 2, 0]} s={[W, f, 0.15]} m={material} />
      <Bar p={[-W / 2 + f / 2, Hh / 2, 0]} s={[f, Hh, 0.15]} m={material} />
      <Bar p={[W / 2 - f / 2, Hh / 2, 0]} s={[f, Hh, 0.15]} m={material} />
      {sashes.map((sh, i) => (
        <group key={i} ref={(g) => (refs.current[i] = g)} position={[sh.x, f + Hi / 2, sh.z]}>
          <Sash w={sh.w} h={Hi} m={material} handleX={sh.hx} />
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Furniture (simple, low-poly)                                        */
/* ------------------------------------------------------------------ */

function Box({ p, s, c, r = 0 }: { p: [number, number, number]; s: [number, number, number]; c: string; r?: number }) {
  return (
    <mesh position={p} rotation={[0, r, 0]}>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={0.8} />
    </mesh>
  );
}

function Bed({ x, z, w, l, r = 0, blanket = '#e9e4dc' }: { x: number; z: number; w: number; l: number; r?: number; blanket?: string }) {
  return (
    <group position={[x, 0, z]} rotation={[0, r, 0]}>
      <Box p={[0, 0.18, 0]} s={[w, 0.36, l]} c="#8a6a4f" />
      <Box p={[0, 0.42, 0.05]} s={[w - 0.06, 0.16, l - 0.12]} c={blanket} />
      <Box p={[0, 0.6, -l / 2 + 0.04]} s={[w, 1.2, 0.08]} c="#5c4636" />
      <Box p={[0, 0.56, -l / 2 + 0.3]} s={[w * 0.7, 0.12, 0.35]} c="#ffffff" />
    </group>
  );
}

function Furniture() {
  return (
    <group>
      {/* living */}
      <Box p={[-3.3, 0.25, -2.4]} s={[0.4, 0.5, 2.4]} c="#2d2f33" />
      <Box p={[-3.38, 1.35, -2.4]} s={[0.06, 0.95, 1.7]} c="#111" />
      <Box p={[-0.9, 0.006, -2.4]} s={[2.6, 0.012, 1.9]} c="#3a4252" />
      <Box p={[-0.9, 0.4, -2.4]} s={[1.2, 0.06, 0.7]} c="#7a5536" />
      <group position={[1.35, 0, -2.4]}>
        <Box p={[0, 0.22, 0]} s={[0.95, 0.44, 2.6]} c="#5d6168" />
        <Box p={[0.35, 0.62, 0]} s={[0.25, 0.5, 2.6]} c="#5d6168" />
        <Box p={[0, 0.5, -1.25]} s={[0.95, 0.3, 0.2]} c="#5d6168" />
        <Box p={[0, 0.5, 1.25]} s={[0.95, 0.3, 0.2]} c="#5d6168" />
      </group>
      {/* plants on balconies */}
      <Box p={[1.5, 0.35, 1.1]} s={[0.4, 0.7, 0.4]} c="#f5f5f5" />
      <mesh position={[1.5, 1.05, 1.1]}>
        <sphereGeometry args={[0.38, 12, 10]} />
        <meshStandardMaterial color="#4f7a3a" />
      </mesh>
      {/* kitchen */}
      <Box p={[-0.75, 0.45, -8.62]} s={[5.2, 0.9, 0.6]} c="#e8e6e1" />
      <Box p={[-0.75, 0.92, -8.62]} s={[5.2, 0.04, 0.62]} c="#cfcac2" />
      <Box p={[-0.75, 0.45, -6.8]} s={[2.2, 0.9, 0.9]} c="#f0eee9" />
      <Box p={[-0.75, 0.92, -6.8]} s={[2.3, 0.04, 1.0]} c="#3b3b3b" />
      {/* master */}
      <Bed x={6.0} z={-2.5} w={1.6} l={2.1} r={-Math.PI / 2} />
      <Box p={[2.35, 0.9, -3.8]} s={[0.6, 1.8, 1.6]} c="#d8d2c8" />
      {/* bed rooms */}
      <Bed x={-6.4} z={-2.3} w={1.1} l={2.0} r={Math.PI} blanket="#d7e3ef" />
      <Bed x={-6.4} z={-7.3} w={1.1} l={2.0} blanket="#efe0d7" />
      <Box p={[-3.9, 0.38, -7.6]} s={[0.6, 0.76, 1.2]} c="#c9b79f" />
      {/* entrance */}
      <Box p={[6.75, 1.0, -7.2]} s={[0.4, 2.0, 2.4]} c="#e3ddd3" />
      <Box p={[5.6, 0.05, -8.4]} s={[1.6, 0.1, 1.0]} c="#9e9890" />
      <Box p={[5.6, 1.05, -9.0]} s={[1.0, 2.1, 0.06]} c="#3d3f44" />
      <Box p={[5.98, 1.05, -8.94]} s={[0.04, 0.3, 0.04]} c="#c0c0c0" />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Outside: sky, hills, balcony railings                               */
/* ------------------------------------------------------------------ */

function Outdoors() {
  const hills = useMemo(() => {
    const list: { x: number; z: number; r: number; h: number; c: string }[] = [];
    for (let i = 0; i < 40; i++) {
      const south = i % 2 === 0;
      list.push({
        x: -160 + Math.random() * 320,
        z: south ? 110 + Math.random() * 60 : -110 - Math.random() * 60,
        r: 28 + Math.random() * 22,
        h: 22 + Math.random() * 14,
        c: ['#5d8a4e', '#6f9a5c', '#4f7b45'][i % 3],
      });
    }
    return list;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -30, 0]}>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#87a86e" />
      </mesh>
      {hills.map((h, i) => (
        <mesh key={i} position={[h.x, -30 + h.h / 2, h.z]}>
          <coneGeometry args={[h.r, h.h, 10]} />
          <meshStandardMaterial color={h.c} flatShading />
        </mesh>
      ))}
      {/* building slab + balcony railings */}
      <Box p={[0, -0.15, -3.7]} s={[14.4, 0.3, 11]} c="#d9d6d0" />
      {[{ a: -3.5, b: 2 }, { a: 2, b: 7 }].map((r, i) => (
        <group key={i}>
          <Box p={[(r.a + r.b) / 2, 1.0, 1.95]} s={[r.b - r.a, 0.05, 0.05]} c="#f4f4f4" />
          {Array.from({ length: Math.floor((r.b - r.a) / 0.15) }).map((_, j) => (
            <Box key={j} p={[r.a + 0.08 + j * 0.15, 0.5, 1.95]} s={[0.025, 1.0, 0.025]} c="#f4f4f4" />
          ))}
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Camera rig: flies over the walls between rooms                      */
/* ------------------------------------------------------------------ */

function CameraRig({ view, onArrive }: { view: RoomView; onArrive: () => void }) {
  const { camera, controls } = useThree() as unknown as { camera: THREE.PerspectiveCamera; controls: any };
  const anim = useRef({ active: false, t: 0, fromPos: new THREE.Vector3(), fromTarget: new THREE.Vector3(), lift: 0 });
  const toPos = useMemo(() => new THREE.Vector3(...view.pos), [view]);
  const toTarget = useMemo(() => new THREE.Vector3(...view.target), [view]);

  useEffect(() => {
    if (!controls) return;
    const a = anim.current;
    a.fromPos.copy(camera.position);
    a.fromTarget.copy(controls.target);
    a.t = 0;
    a.active = true;
    // when moving between two rooms, arc up over the walls
    a.lift = camera.position.y < 4 && view.id !== 'overview' ? 4.5 : 0;
    controls.enabled = false;
  }, [view, controls, camera]);

  useFrame((_, dt) => {
    const a = anim.current;
    if (!a.active || !controls) return;
    a.t = Math.min(1, a.t + dt / 1.6);
    const e = a.t < 0.5 ? 4 * a.t ** 3 : 1 - Math.pow(-2 * a.t + 2, 3) / 2;
    camera.position.lerpVectors(a.fromPos, toPos, e);
    camera.position.y += Math.sin(Math.PI * e) * a.lift;
    controls.target.lerpVectors(a.fromTarget, toTarget, e);
    controls.update();
    if (a.t >= 1) {
      a.active = false;
      if (view.id !== 'overview') {
        // first-person look-around: orbit around a point just in front of the eye
        const dir = toTarget.clone().sub(toPos).normalize().multiplyScalar(0.05);
        controls.target.copy(toPos).add(dir);
        controls.update();
      }
      controls.enabled = true;
      onArrive();
    }
  });
  return null;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                      */
/* ------------------------------------------------------------------ */

interface Props {
  /** colour selected in the pricing panel – applied to every window */
  color?: string | null;
  /** called when the user picks a colour inside a room */
  onColorChange?: (key: FrameColorKey) => void;
  /** overlay content (e.g. price badge) */
  children?: React.ReactNode;
}

const initialColor = (c?: string | null): FrameColorKey => (isFrameColor(c) ? c : 'White');

export default function KoreanApartment3D({ color, onColorChange, children }: Props) {
  const { locale } = useRouter();
  const t = (k: string) => (DICT[locale || 'kr'] ?? DICT.en)[k] ?? DICT.en[k] ?? k;

  const [roomId, setRoomId] = useState<RoomId>('overview');
  const [arrived, setArrived] = useState(false);
  const [colors, setColors] = useState<Record<WindowId, FrameColorKey>>(() =>
    WINDOWS.reduce((acc, w) => ({ ...acc, [w.id]: initialColor(color) }), {} as Record<WindowId, FrameColorKey>),
  );
  const [openState, setOpenState] = useState<Partial<Record<WindowId, boolean>>>({});
  const lastEmitted = useRef<string | null | undefined>(color);
  const materials = useFrameMaterials();

  // panel colour → all windows (skip echo of our own change)
  useEffect(() => {
    if (!isFrameColor(color) || color === lastEmitted.current) return;
    lastEmitted.current = color;
    setColors((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, color])) as Record<WindowId, FrameColorKey>);
  }, [color]);

  const view = VIEWS.find((v) => v.id === roomId)!;

  const goTo = useCallback((id: RoomId) => {
    setArrived(false);
    setRoomId(id);
    const v = VIEWS.find((x) => x.id === id);
    if (v?.autoOpen) setOpenState((s) => ({ ...s, [v.autoOpen!]: true }));
  }, []);

  const toggleWindow = useCallback((id: WindowId) => setOpenState((s) => ({ ...s, [id]: !s[id] })), []);

  const pickColor = (key: FrameColorKey, all = false) => {
    setColors((prev) =>
      all
        ? (Object.fromEntries(Object.keys(prev).map((k) => [k, key])) as Record<WindowId, FrameColorKey>)
        : { ...prev, [view.windowId!]: key },
    );
    lastEmitted.current = key;
    onColorChange?.(key);
  };

  const activeWindow = view.windowId;
  const showColorPanel = arrived && !!activeWindow;

  return (
    <div className="kapt3d">
      <Canvas camera={{ position: VIEWS[0].pos, fov: 60, near: 0.05, far: 800 }} dpr={[1, 2]} gl={{ antialias: true }}>
        <color attach="background" args={['#cfe4f3']} />
        <fog attach="fog" args={['#dcebf5', 80, 420]} />
        <hemisphereLight args={['#ffffff', '#b9a98f', 0.75]} />
        <ambientLight intensity={0.25} />
        <directionalLight position={[10, 18, 14]} intensity={0.9} />
        <pointLight position={[-0.75, 2.3, -2.5]} intensity={0.25} distance={8} />
        <pointLight position={[4.5, 2.3, -2.5]} intensity={0.2} distance={7} />

        {/* floors (clickable in overview) */}
        {FLOORS.map((fl) => (
          <mesh
            key={fl.id + fl.x[0]}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[(fl.x[0] + fl.x[1]) / 2, 0.001, (fl.z[0] + fl.z[1]) / 2]}
            onClick={(e) => {
              if (roomId !== 'overview') return;
              e.stopPropagation();
              goTo(fl.id);
            }}
          >
            <planeGeometry args={[fl.x[1] - fl.x[0], fl.z[1] - fl.z[0]]} />
            <meshStandardMaterial color={fl.color} roughness={0.7} />
          </mesh>
        ))}
        {/* bathroom floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.1, 0.002, -7.6]}>
          <planeGeometry args={[2.2, 2.8]} />
          <meshStandardMaterial color="#e2e6e8" />
        </mesh>
        {/* ceiling – faces down, so it is invisible from the overview camera */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, -3.7]}>
          <planeGeometry args={[14, 10.6]} />
          <meshStandardMaterial color="#fbfbfa" />
        </mesh>

        {WALLS.map((w, i) => (
          <Wall key={i} spec={w} />
        ))}
        {WINDOWS.map((w) => (
          <WindowUnit key={w.id} spec={w} material={materials[colors[w.id]]} open={!!openState[w.id]} onToggle={toggleWindow} />
        ))}
        <Furniture />
        <Outdoors />

        {roomId === 'overview' &&
          arrived &&
          VIEWS.filter((v) => v.label).map((v) => (
            <Html key={v.id} position={[v.label![0], 0.3, v.label![1]]} center zIndexRange={[20, 0]}>
              <button type="button" className="kapt3d-label" onClick={() => goTo(v.id)}>
                {t(v.id)}
              </button>
            </Html>
          ))}

        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={roomId === 'overview'}
          rotateSpeed={roomId === 'overview' ? 0.7 : -0.35}
          minDistance={0.01}
          maxDistance={30}
          maxPolarAngle={roomId === 'overview' ? 1.25 : Math.PI - 0.3}
          minPolarAngle={roomId === 'overview' ? 0.2 : 0.3}
        />
        <CameraRig view={view} onArrive={() => setArrived(true)} />
      </Canvas>

      {/* ---------------- overlay UI ---------------- */}
      {children && <div className="kapt3d-badge">{children}</div>}

      {roomId !== 'overview' && (
        <button type="button" className="kapt3d-overview-btn" onClick={() => goTo('overview')}>
          ⌂ {t('overview')}
        </button>
      )}

      {arrived && (
        <div className="kapt3d-hint">
          {roomId === 'overview' ? t('hintOverview') : roomId === 'entrance' ? t('hintEntrance') : t('hintDrag')}
        </div>
      )}

      {showColorPanel && activeWindow && (
        <div className="kapt3d-color-panel">
          <div className="kapt3d-color-title">
            <strong>{t(roomId)}</strong> · {t('frameColor')}
          </div>
          <div className="kapt3d-swatches">
            {FRAME_COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`kapt3d-swatch ${colors[activeWindow] === c.key ? 'active' : ''}`}
                onClick={() => pickColor(c.key)}
                title={t(c.key)}
              >
                <span className="kapt3d-swatch-dot" style={{ background: c.hex }} />
                <span className="kapt3d-swatch-name">{t(c.key)}</span>
              </button>
            ))}
          </div>
          <div className="kapt3d-actions">
            <button type="button" onClick={() => toggleWindow(activeWindow)}>
              {openState[activeWindow] ? t('close') : t('open')}
            </button>
            <button type="button" onClick={() => pickColor(colors[activeWindow], true)}>
              {t('applyAll')}
            </button>
          </div>
        </div>
      )}

      <nav className="kapt3d-nav">
        {NAV_ORDER.map((id) => (
          <button key={id} type="button" className={roomId === id ? 'active' : ''} onClick={() => goTo(id)}>
            {t(id)}
          </button>
        ))}
      </nav>
    </div>
  );
}
