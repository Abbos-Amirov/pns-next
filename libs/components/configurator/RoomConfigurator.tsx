import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PointerLockControls, useCursor, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

type Swatch = { name: string; hex: string };

const SWATCHES: Swatch[] = [
  { name: 'White', hex: '#f2f2f2' },
  { name: 'US201', hex: '#e7d5bf' },
  { name: 'MQ808', hex: '#cbb79c' },
  { name: 'Black', hex: '#1b1b1f' },
  { name: 'Bronze', hex: '#7a5a3a' },
  { name: 'Gray', hex: '#7d828a' },
];

const WALL_SWATCHES: Swatch[] = [
  { name: 'Warm White', hex: '#f2f4f7' },
  { name: 'Sand', hex: '#e7d8c3' },
  { name: 'Greige', hex: '#c9c0b4' },
  { name: 'Soft Gray', hex: '#dfe3e8' },
  { name: 'Slate', hex: '#8b929c' },
  { name: 'Charcoal', hex: '#2a2c31' },
];

function isFrameMesh(obj: THREE.Object3D): obj is THREE.Mesh {
  // Naming rule: contains "frame" or starts with "frame_"
  const n = (obj.name || '').toLowerCase();
  // @ts-ignore
  return !!(obj as any)?.isMesh && (n.includes('frame') || n.startsWith('frame_'));
}

function isWallMesh(obj: THREE.Object3D): obj is THREE.Mesh {
  const n = (obj.name || '').toLowerCase();
  // @ts-ignore
  if (!(obj as any)?.isMesh) return false;
  if (n.includes('frame')) return false;
  // best-effort naming rule for real GLBs
  return n.includes('wall') || n.includes('walls') || n.startsWith('wall_');
}

function cloneMaterialIfNeeded(mesh: THREE.Mesh) {
  const ud: any = mesh.userData || {};
  if (ud._materialCloned) return;
  const m: any = (mesh as any).material;
  if (Array.isArray(m)) {
    (mesh as any).material = m.map((mm) => (mm?.clone ? mm.clone() : mm));
  } else if (m?.clone) {
    (mesh as any).material = m.clone();
  }
  ud._materialCloned = true;
  mesh.userData = ud;
}

function setEmissive(mesh: THREE.Mesh | null, hex: number) {
  if (!mesh) return;
  const mat: any = (mesh as any).material;
  const apply = (m: any) => {
    if (m && 'emissive' in m && m.emissive?.setHex) m.emissive.setHex(hex);
  };
  if (Array.isArray(mat)) mat.forEach(apply);
  else apply(mat);
}

function setColor(mesh: THREE.Mesh, hex: string) {
  cloneMaterialIfNeeded(mesh);
  const mat: any = (mesh as any).material;
  // three types in this repo can be strict about ColorRepresentation; hex strings like "#fff" are valid at runtime
  const color = new THREE.Color(hex as any);
  const apply = (m: any) => {
    if (m && 'color' in m && m.color?.copy) {
      m.color.copy(color);
      m.needsUpdate = true;
    }
  };
  if (Array.isArray(mat)) mat.forEach(apply);
  else apply(mat);
}

function RoomScene({
  modelUrl,
  onHint,
  onSelectedName,
  selectedHex,
  wallHex,
}: {
  modelUrl: string;
  onHint: (t: string) => void;
  onSelectedName: (t: string | null) => void;
  selectedHex: string | null;
  wallHex: string | null;
}) {
  const gltf = useGLTF(modelUrl);
  const { camera, raycaster, gl } = useThree();

  const selectableFramesRef = useRef<THREE.Mesh[]>([]);
  const wallMeshesRef = useRef<THREE.Mesh[]>([]);
  const hoveredRef = useRef<THREE.Mesh | null>(null);
  const selectedRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<any>(null);

  const [hovered, setHovered] = useState<THREE.Mesh | null>(null);
  useCursor(!!hovered);

  // First-person movement (WASD)
  const keysRef = useRef({ w: false, a: false, s: false, d: false });
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k in keysRef.current) (keysRef.current as any)[k] = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k in keysRef.current) (keysRef.current as any)[k] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // Build selectable frames list once
  useEffect(() => {
    const frames: THREE.Mesh[] = [];
    const walls: THREE.Mesh[] = [];
    (gltf as any)?.scene?.traverse?.((obj: THREE.Object3D) => {
      if (isFrameMesh(obj)) {
        frames.push(obj);
        obj.castShadow = true;
        obj.receiveShadow = true;
        // Prevent global color change if the model shares materials
        cloneMaterialIfNeeded(obj);
      }
      if (isWallMesh(obj)) {
        walls.push(obj);
        obj.receiveShadow = true;
        cloneMaterialIfNeeded(obj);
      }
    });
    selectableFramesRef.current = frames;
    wallMeshesRef.current = walls;
    if (frames.length) onHint('Hover a frame, click to select, then choose a color.');
    else onHint('No frame meshes found. Name meshes like *Frame* or prefix frame_ in your GLB.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltf]);

  // Apply color to selected
  useEffect(() => {
    if (!selectedHex) return;
    if (!selectedRef.current) {
      onHint('Select a frame first (hover + click).');
      return;
    }
    setColor(selectedRef.current, selectedHex);
    onHint(`Applied color to ${selectedRef.current.name || 'frame'}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHex]);

  useEffect(() => {
    if (!wallHex) return;
    const walls = wallMeshesRef.current;
    if (!walls.length) {
      onHint('No wall meshes found in GLB. Name wall meshes like *wall* to enable wall color.');
      return;
    }
    walls.forEach((m) => setColor(m, wallHex));
    onHint('Applied wall color.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallHex]);

  const mouseCenter = useMemo(() => new THREE.Vector2(0, 0), []);

  useFrame((state, delta) => {
    // Hover raycast from screen center (good for pointer lock)
    raycaster.setFromCamera(mouseCenter, camera);
    const hits = raycaster.intersectObjects(selectableFramesRef.current, true);
    const nextHovered = (hits?.[0]?.object as THREE.Mesh) || null;

    if (hoveredRef.current !== nextHovered) {
      setEmissive(hoveredRef.current, 0x000000);
      hoveredRef.current = nextHovered;
      setEmissive(nextHovered, 0x111111);
      setHovered(nextHovered);
      if (nextHovered) onHint(`Hovering: ${nextHovered.name || 'frame'} (click to select)`);
    }

    // Movement only when locked
    const controls: any = (state as any).controls;
    if (!controls?.isLocked) return;
    const keys = keysRef.current;
    const direction = new THREE.Vector3(
      (keys.d ? 1 : 0) + (keys.a ? -1 : 0),
      0,
      (keys.s ? 1 : 0) + (keys.w ? -1 : 0),
    );
    if (direction.lengthSq() > 0) direction.normalize();
    const speed = 2.5;
    controls.moveRight(direction.x * speed * delta);
    controls.moveForward(direction.z * speed * delta);
  });

  const onClick = useCallback(() => {
    const h = hoveredRef.current;
    if (!h) return;
    selectedRef.current = h;
    onSelectedName(h.name || 'frame');
    onHint(`Selected: ${h.name || 'frame'}. Now pick a color.`);
  }, [onHint, onSelectedName]);

  // Mouse interaction on the canvas:
  // - first click locks pointer
  // - later clicks select hovered frame
  useEffect(() => {
    const dom = gl.domElement;
    const onMouseDown = () => {
      const ctl = controlsRef.current;
      if (!ctl?.isLocked) {
        ctl?.lock?.();
        return;
      }
      onClick();
    };
    dom.addEventListener('mousedown', onMouseDown);
    return () => dom.removeEventListener('mousedown', onMouseDown);
  }, [gl, onClick]);

  // When leaving pointer lock, clear hover highlight
  const onUnlock = useCallback(() => {
    setEmissive(hoveredRef.current, 0x000000);
    hoveredRef.current = null;
    setHovered(null);
  }, []);

  return (
    <>
      {/* Lights */}
      <hemisphereLight args={[0xffffff, 0x333344, 1.0]} />
      <directionalLight position={[3, 6, 2]} intensity={1.0} />

      {/* Model */}
      {/* @ts-ignore */}
      <primitive object={(gltf as any).scene} />

      {/* Controls */}
      <PointerLockControls
        ref={controlsRef}
        makeDefault
        onUnlock={onUnlock}
        onLock={() => onHint('Pointer locked. Hover + click to select, WASD to move.')}
      />
    </>
  );
}

function FallbackDemoScene({
  onHint,
  onSelectedName,
  selectedHex,
  wallHex,
  mode,
}: {
  onHint: (t: string) => void;
  onSelectedName: (t: string | null) => void;
  selectedHex: string | null;
  wallHex: string | null;
  mode: 'design' | 'explore';
}) {
  const { camera, raycaster } = useThree();
  // Outside view should be simple & clean (not affected by wall color)
  const OUTSIDE_COLOR = '#bfe3ff';
  const ROOM_H = 4.4; // wall/ceiling height in world units (keep consistent)
  const WALL_Y = ROOM_H / 2;
  const FLOOR_H = ROOM_H + 0.65; // floor-to-floor distance for stacked building view

  const MAIN_OFFSET: [number, number, number] = [0, 0, 0];
  const WING_X_OFFSET: [number, number, number] = [22, 0, 0];
  const WING_Z_OFFSET: [number, number, number] = [0, 0, 22];

  // Unlit "outside" so wall color/lighting never makes it look like the interior wall
  const outsideTex = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    // Sky gradient
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#8fd0ff');
    g.addColorStop(0.55, '#cfeeff');
    g.addColorStop(0.78, '#eef9ff');
    g.addColorStop(1, '#f7fbff');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);

    // Soft horizon haze band
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(0, 350, 512, 80);

    // Subtle ground (very soft, not "nature")
    const ground = ctx.createLinearGradient(0, 420, 0, 512);
    ground.addColorStop(0, 'rgba(120,150,120,0.12)');
    ground.addColorStop(1, 'rgba(90,110,90,0.22)');
    ctx.fillStyle = ground;
    ctx.fillRect(0, 420, 512, 92);

    // Minimal distant hills (low-contrast)
    ctx.beginPath();
    ctx.moveTo(0, 430);
    ctx.bezierCurveTo(120, 380, 220, 455, 330, 410);
    ctx.bezierCurveTo(390, 385, 460, 435, 512, 405);
    ctx.lineTo(512, 512);
    ctx.lineTo(0, 512);
    ctx.closePath();
    ctx.fillStyle = 'rgba(80,95,110,0.10)';
    ctx.fill();

    // Soft sun glow
    const rg = ctx.createRadialGradient(410, 130, 8, 410, 130, 170);
    rg.addColorStop(0, 'rgba(255,255,255,0.85)');
    rg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, 512, 512);
    const tex = new THREE.CanvasTexture(c);
    // three typings differ by version; keep it compatible
    // @ts-ignore
    (tex as any).colorSpace = (THREE as any).SRGBColorSpace;
    // @ts-ignore (older three)
    (tex as any).encoding = (THREE as any).sRGBEncoding;
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Helper: 3-pane window dividers where center pane is larger (left/right smaller)
  const threePaneDividerXs = useCallback((cx: number, innerW: number) => {
    // side panes = 25% each, center = 50%
    return [cx - innerW * 0.25, cx + innerW * 0.25];
  }, []);

  // Static furniture variants for upper floors (same idea as ground floor, but each floor different)
  const pickHex = useCallback((seed: number, list: Swatch[]) => list[Math.abs(seed) % list.length]?.hex || '#f2f2f2', []);
  const rand01 = useCallback((seed: number) => {
    const x = Math.sin(seed * 999.1) * 10000;
    return x - Math.floor(x);
  }, []);
  const renderStaticFurniture = useCallback(
    (seed: number) => {
      const variant = Math.abs(seed) % 4;
      const sofaC = pickHex(seed + 1, SWATCHES);
      const tableC = pickHex(seed + 2, SWATCHES);
      const tvC = pickHex(seed + 3, SWATCHES);

      // small jitter so each floor looks different
      const jx = (rand01(seed + 11) - 0.5) * 0.4;
      const jz = (rand01(seed + 22) - 0.5) * 0.35;

      const baseZ = 1.2 + jz; // keep away from window (window is at negative z)
      const tvZ = 1.05 + jz * 0.4;
      const sofaX = 2.7 + jx;
      const tableX = 0.9 + jx * 0.6;

      // Variant shapes: all are simple boxes but different proportions
      if (variant === 0) {
        // Standard sofa + coffee table + TV
        return (
          <group>
            {/* rug */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.0, 0.02, baseZ]} receiveShadow>
              <planeGeometry args={[5.0, 3.2]} />
              <meshStandardMaterial color="#6b6f78" roughness={0.95} metalness={0} opacity={0.9} transparent />
            </mesh>
            {/* sofa */}
            <mesh position={[sofaX, 0.55, baseZ]} castShadow receiveShadow>
              <boxGeometry args={[2.25, 0.6, 1.25]} />
              <meshStandardMaterial color={sofaC} roughness={0.78} metalness={0.02} />
            </mesh>
            <mesh position={[sofaX, 1.05, baseZ - 0.45]} castShadow>
              <boxGeometry args={[2.25, 0.45, 0.28]} />
              <meshStandardMaterial color={sofaC} roughness={0.82} metalness={0.02} />
            </mesh>
            {/* table */}
            <mesh position={[tableX, 0.42, baseZ]} castShadow receiveShadow>
              <boxGeometry args={[1.55, 0.08, 0.85]} />
              <meshStandardMaterial color={tableC} roughness={0.65} metalness={0.05} />
            </mesh>
            {/* TV */}
            <mesh position={[-4.18, 1.35, tvZ]} rotation={[0, Math.PI / 2, 0]} castShadow>
              <boxGeometry args={[1.8, 1.05, 0.08]} />
              <meshStandardMaterial color={tvC} roughness={0.35} metalness={0.25} />
            </mesh>
            <mesh position={[-4.14, 1.35, tvZ]} rotation={[0, Math.PI / 2, 0]} castShadow>
              <boxGeometry args={[1.6, 0.9, 0.02]} />
              <meshStandardMaterial color="#0b1a2b" emissive="#081624" emissiveIntensity={0.6} roughness={0.4} metalness={0.1} />
            </mesh>
          </group>
        );
      }
      if (variant === 1) {
        // Sofa-bed style + larger rug + slightly bigger table
        return (
          <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.05, 0.02, baseZ]} receiveShadow>
              <planeGeometry args={[5.6, 3.6]} />
              <meshStandardMaterial color="#7b7f88" roughness={0.95} metalness={0} opacity={0.9} transparent />
            </mesh>
            <mesh position={[sofaX, 0.55, baseZ]} castShadow receiveShadow>
              <boxGeometry args={[2.55, 0.6, 1.45]} />
              <meshStandardMaterial color={sofaC} roughness={0.78} metalness={0.02} />
            </mesh>
            <mesh position={[sofaX, 0.28, baseZ + 0.82]} castShadow receiveShadow>
              <boxGeometry args={[2.45, 0.18, 0.58]} />
              <meshStandardMaterial color={sofaC} roughness={0.82} metalness={0.01} />
            </mesh>
            <mesh position={[tableX, 0.44, baseZ]} castShadow receiveShadow>
              <boxGeometry args={[1.75, 0.09, 0.95]} />
              <meshStandardMaterial color={tableC} roughness={0.6} metalness={0.06} />
            </mesh>
            <mesh position={[-4.18, 1.38, tvZ]} rotation={[0, Math.PI / 2, 0]} castShadow>
              <boxGeometry args={[1.95, 1.1, 0.08]} />
              <meshStandardMaterial color={tvC} roughness={0.35} metalness={0.25} />
            </mesh>
            <mesh position={[-4.14, 1.38, tvZ]} rotation={[0, Math.PI / 2, 0]} castShadow>
              <boxGeometry args={[1.75, 0.95, 0.02]} />
              <meshStandardMaterial color="#0b1a2b" emissive="#081624" emissiveIntensity={0.6} roughness={0.4} metalness={0.1} />
            </mesh>
          </group>
        );
      }
      if (variant === 2) {
        // Two-seat sofa + side table (small) + TV closer
        return (
          <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.9, 0.02, baseZ]} receiveShadow>
              <planeGeometry args={[4.6, 3.0]} />
              <meshStandardMaterial color="#676b73" roughness={0.95} metalness={0} opacity={0.9} transparent />
            </mesh>
            <mesh position={[sofaX, 0.55, baseZ + 0.1]} castShadow receiveShadow>
              <boxGeometry args={[1.85, 0.6, 1.1]} />
              <meshStandardMaterial color={sofaC} roughness={0.78} metalness={0.02} />
            </mesh>
            <mesh position={[sofaX, 1.05, baseZ - 0.25]} castShadow>
              <boxGeometry args={[1.85, 0.45, 0.25]} />
              <meshStandardMaterial color={sofaC} roughness={0.82} metalness={0.02} />
            </mesh>
            <mesh position={[sofaX + 1.45, 0.5, baseZ + 0.35]} castShadow receiveShadow>
              <boxGeometry args={[0.6, 0.06, 0.6]} />
              <meshStandardMaterial color={tableC} roughness={0.65} metalness={0.05} />
            </mesh>
            <mesh position={[-4.18, 1.32, tvZ]} rotation={[0, Math.PI / 2, 0]} castShadow>
              <boxGeometry args={[1.65, 0.95, 0.08]} />
              <meshStandardMaterial color={tvC} roughness={0.35} metalness={0.25} />
            </mesh>
            <mesh position={[-4.14, 1.32, tvZ]} rotation={[0, Math.PI / 2, 0]} castShadow>
              <boxGeometry args={[1.45, 0.8, 0.02]} />
              <meshStandardMaterial color="#0b1a2b" emissive="#081624" emissiveIntensity={0.6} roughness={0.4} metalness={0.1} />
            </mesh>
          </group>
        );
      }
      // variant === 3
      return (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.1, 0.02, baseZ]} receiveShadow>
            <planeGeometry args={[5.3, 3.4]} />
            <meshStandardMaterial color="#6a6e77" roughness={0.95} metalness={0} opacity={0.9} transparent />
          </mesh>
          {/* L-sofa hint (2 blocks) */}
          <mesh position={[sofaX, 0.55, baseZ]} castShadow receiveShadow>
            <boxGeometry args={[2.05, 0.6, 1.25]} />
            <meshStandardMaterial color={sofaC} roughness={0.78} metalness={0.02} />
          </mesh>
          <mesh position={[sofaX + 0.7, 0.55, baseZ + 0.75]} castShadow receiveShadow>
            <boxGeometry args={[1.25, 0.6, 1.0]} />
            <meshStandardMaterial color={sofaC} roughness={0.78} metalness={0.02} />
          </mesh>
          <mesh position={[tableX, 0.42, baseZ + 0.05]} castShadow receiveShadow>
            <boxGeometry args={[1.4, 0.08, 0.75]} />
            <meshStandardMaterial color={tableC} roughness={0.65} metalness={0.05} />
          </mesh>
          <mesh position={[-4.18, 1.36, tvZ]} rotation={[0, Math.PI / 2, 0]} castShadow>
            <boxGeometry args={[1.9, 1.05, 0.08]} />
            <meshStandardMaterial color={tvC} roughness={0.35} metalness={0.25} />
          </mesh>
          <mesh position={[-4.14, 1.36, tvZ]} rotation={[0, Math.PI / 2, 0]} castShadow>
            <boxGeometry args={[1.7, 0.9, 0.02]} />
            <meshStandardMaterial color="#0b1a2b" emissive="#081624" emissiveIntensity={0.6} roughness={0.4} metalness={0.1} />
          </mesh>
        </group>
      );
    },
    [pickHex, rand01, threePaneDividerXs],
  );

  const windowHitRef = useRef<THREE.Mesh>(null!);
  const doorHitRef = useRef<THREE.Mesh>(null!);
  const windowPartsRef = useRef<Array<THREE.Mesh | null>>([]);
  const doorPartsRef = useRef<Array<THREE.Mesh | null>>([]);
  const sofaPartsRef = useRef<Array<THREE.Mesh | null>>([]);
  const tablePartsRef = useRef<Array<THREE.Mesh | null>>([]);
  const tvPartsRef = useRef<Array<THREE.Mesh | null>>([]);
  const sofaHitRef = useRef<THREE.Mesh>(null!);
  const tableHitRef = useRef<THREE.Mesh>(null!);
  const tvHitRef = useRef<THREE.Mesh>(null!);
  const smallWindow1HitRef = useRef<THREE.Mesh>(null!);
  const smallWindow1PartsRef = useRef<Array<THREE.Mesh | null>>([]);
  const smallWindow2HitRef = useRef<THREE.Mesh>(null!);
  const smallWindow2PartsRef = useRef<Array<THREE.Mesh | null>>([]);
  const backWallRefs = useRef<Array<THREE.Mesh | null>>([]);
  const leftWallRef = useRef<THREE.Mesh>(null!);
  const rightWallRef = useRef<THREE.Mesh>(null!);
  const room2BackWallRefs = useRef<Array<THREE.Mesh | null>>([]);
  const room2LeftWallRef = useRef<THREE.Mesh>(null!);
  const room2RightWallRef = useRef<THREE.Mesh>(null!);
  const room3BackWallRefs = useRef<Array<THREE.Mesh | null>>([]);
  const room3LeftWallRef = useRef<THREE.Mesh>(null!);
  const room3RightWallRef = useRef<THREE.Mesh>(null!);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<'window' | 'door' | 'sofa' | 'table' | 'tv' | null>(null);
  const [windowFrameHex, setWindowFrameHex] = useState<string>('#f2f2f2');
  const [doorFrameHex, setDoorFrameHex] = useState<string>('#f2f2f2');
  const [sofaHex, setSofaHex] = useState<string>('#7a5a3a');
  const [tableHex, setTableHex] = useState<string>('#cbb79c');
  const [tvHex, setTvHex] = useState<string>('#1b1b1f');
  useCursor(!!hoveredName);

  useEffect(() => {
    // Default view: show the 5-floor building; user can still orbit/zoom in
    camera.position.set(16, 16, 26);
    camera.lookAt(0, ROOM_H * 2.2, -4);
    onHint(
      'Demo: deraza/eshik romini yoki mebelni (divan/ustol/TV) tanlab rang bering. Oynadan tashqari ko‘rinadi.',
    );
    onSelectedName(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedHex) return;
    if (!selectedTarget) {
      onHint('Avval deraza/eshik romini tanlang.');
      return;
    }
    if (selectedTarget === 'window') setWindowFrameHex(selectedHex);
    if (selectedTarget === 'door') setDoorFrameHex(selectedHex);
    if (selectedTarget === 'sofa') setSofaHex(selectedHex);
    if (selectedTarget === 'table') setTableHex(selectedHex);
    if (selectedTarget === 'tv') setTvHex(selectedHex);
    onHint('Rang romga qo‘llandi.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHex]);

  useEffect(() => {
    if (!wallHex) return;
    const walls = [
      ...(backWallRefs.current || []),
      leftWallRef.current,
      rightWallRef.current,
      ...(room2BackWallRefs.current || []),
      room2LeftWallRef.current,
      room2RightWallRef.current,
      ...(room3BackWallRefs.current || []),
      room3LeftWallRef.current,
      room3RightWallRef.current,
    ].filter(Boolean) as THREE.Mesh[];
    walls.forEach((m) => setColor(m, wallHex));
    onHint('Devor rangi o‘zgardi.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallHex]);

  const select = useCallback(
    (target: 'window' | 'door' | 'sofa' | 'table' | 'tv', label: string) => {
      setSelectedTarget(target);
      onSelectedName(label);
      onHint(`Tanlandi: ${label}. Endi rang tanlang.`);
    },
    [onHint, onSelectedName],
  );

  // Explore mode (WASD + pointer lock)
  const pointerRef = useRef<any>(null);
  const keysRef = useRef({ w: false, a: false, s: false, d: false });
  const hoveredExploreRef = useRef<'window' | 'door' | 'sofa' | 'table' | 'tv' | null>(null);
  const mouseCenter = useMemo(() => new THREE.Vector2(0, 0), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k in keysRef.current) (keysRef.current as any)[k] = true;
    };
    const up = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k in keysRef.current) (keysRef.current as any)[k] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useFrame((_, delta) => {
    if (mode !== 'explore') return;
    const ctl = pointerRef.current;
    if (!ctl?.isLocked) return;

    // Movement
    const keys = keysRef.current;
    const dir = new THREE.Vector3((keys.d ? 1 : 0) + (keys.a ? -1 : 0), 0, (keys.s ? 1 : 0) + (keys.w ? -1 : 0));
    if (dir.lengthSq() > 0) dir.normalize();
    const speed = 2.6;
    ctl.moveRight(dir.x * speed * delta);
    ctl.moveForward(dir.z * speed * delta);

    // Clamp inside simple bounds
    const obj = ctl.getObject?.();
    if (obj) {
      obj.position.y = 1.7;
      obj.position.x = THREE.MathUtils.clamp(obj.position.x, -8, 18);
      obj.position.z = THREE.MathUtils.clamp(obj.position.z, -10, 14);
    }

    // Center raycast to selectables
    raycaster.setFromCamera(mouseCenter, camera);
    const hits = raycaster.intersectObjects(
      [
        windowHitRef.current,
        smallWindow1HitRef.current,
        smallWindow2HitRef.current,
        doorHitRef.current,
        sofaHitRef.current,
        tableHitRef.current,
        tvHitRef.current,
      ].filter(Boolean) as THREE.Object3D[],
      true,
    );
    const hit = hits?.[0]?.object || null;
    let next: 'window' | 'door' | 'sofa' | 'table' | 'tv' | null = null;
    if (hit === doorHitRef.current) next = 'door';
    else if (hit === sofaHitRef.current) next = 'sofa';
    else if (hit === tableHitRef.current) next = 'table';
    else if (hit === tvHitRef.current) next = 'tv';
    else if (hit) next = 'window';

    if (hoveredExploreRef.current !== next) {
      // clear
      windowPartsRef.current.forEach((m) => setEmissive(m, 0x000000));
      smallWindow1PartsRef.current.forEach((m) => setEmissive(m, 0x000000));
      smallWindow2PartsRef.current.forEach((m) => setEmissive(m, 0x000000));
      doorPartsRef.current.forEach((m) => setEmissive(m, 0x000000));
      sofaPartsRef.current.forEach((m) => setEmissive(m, 0x000000));
      tablePartsRef.current.forEach((m) => setEmissive(m, 0x000000));
      tvPartsRef.current.forEach((m) => setEmissive(m, 0x000000));
      setHoveredName(null);

      if (next === 'door') {
        doorPartsRef.current.forEach((m) => setEmissive(m, 0x111111));
        setHoveredName('Door frame');
      } else if (next === 'sofa') {
        sofaPartsRef.current.forEach((m) => setEmissive(m, 0x111111));
        setHoveredName('Sofa');
      } else if (next === 'table') {
        tablePartsRef.current.forEach((m) => setEmissive(m, 0x111111));
        setHoveredName('Table');
      } else if (next === 'tv') {
        tvPartsRef.current.forEach((m) => setEmissive(m, 0x111111));
        setHoveredName('TV');
      } else if (next === 'window') {
        // We don't know which window exactly; highlight all windows in explore
        windowPartsRef.current.forEach((m) => setEmissive(m, 0x111111));
        smallWindow1PartsRef.current.forEach((m) => setEmissive(m, 0x111111));
        smallWindow2PartsRef.current.forEach((m) => setEmissive(m, 0x111111));
        setHoveredName('Window frame');
      }
      hoveredExploreRef.current = next;
    }
  });

  return (
    <>
      <ambientLight intensity={0.65} />
      <hemisphereLight args={[0xffffff, 0x333344, 1.0]} />
      {/* Slightly more "real" lighting: warm sun from outside + soft fill */}
      <directionalLight position={[0, 6.5, -6]} intensity={1.55} castShadow />
      <directionalLight position={[-4, 3.5, 5]} intensity={0.35} />

      {/* 5-floor building view: add 4 static floors above the interactive ground floor */}
      {Array.from({ length: 4 }).map((_, i) => {
        const floorIndex = i + 1; // 1..4
        const y0 = floorIndex * FLOOR_H;
        const wallColor = wallHex || '#f2f4f7';
        const sideWallColor = wallHex || '#eef1f5';

        // Window constants (match the interactive big window)
        const cx = 0;
        const cy = WALL_Y;
        const cz = -3.92;
        const outerW = 6.9;
        const outerH = ROOM_H - 0.35;
        const barT = 0.18;
        const depth = 0.14;
        const innerW = outerW - barT * 2;
        const innerH = outerH - barT * 2;
        const topY = cy + outerH / 2 - barT / 2;
        const botY = cy - outerH / 2 + barT / 2;
        const leftX = cx - outerW / 2 + barT / 2;
        const rightX = cx + outerW / 2 - barT / 2;
        const div1 = cx - innerW / 4;
        const div2 = cx;
        const div3 = cx + innerW / 4;

        // Back wall strips with cut-out (match current pad logic, slightly smaller than frame)
        const wallW = 18;
        const wallH = ROOM_H;
        const wallZ = -4;
        const pad = -0.04;
        const holeW = outerW + pad;
        const holeH = outerH + pad;
        const left = cx - holeW / 2;
        const right = cx + holeW / 2;
        const bottom = cy - holeH / 2;
        const top = cy + holeH / 2;
        const topH = Math.max(0.01, wallH - top);
        const bottomH = Math.max(0.01, bottom);
        const sideH = Math.max(0.01, holeH);
        const leftW = Math.max(0.01, left + wallW / 2);
        const rightW = Math.max(0.01, wallW / 2 - right);

        return (
          <group key={`floor-${floorIndex}`} position={[MAIN_OFFSET[0], y0 + MAIN_OFFSET[1], MAIN_OFFSET[2]]}>
            {/* floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[18, 18]} />
              <meshStandardMaterial color="#8d7f72" />
            </mesh>

            {/* back wall (4 strips) */}
            <mesh position={[0, top + topH / 2, wallZ]} receiveShadow>
              <planeGeometry args={[wallW, topH]} />
              <meshStandardMaterial color={wallColor} />
            </mesh>
            <mesh position={[0, bottomH / 2, wallZ]} receiveShadow>
              <planeGeometry args={[wallW, bottomH]} />
              <meshStandardMaterial color={wallColor} />
            </mesh>
            <mesh position={[-wallW / 2 + leftW / 2, cy, wallZ]} receiveShadow>
              <planeGeometry args={[leftW, sideH]} />
              <meshStandardMaterial color={wallColor} />
            </mesh>
            <mesh position={[wallW / 2 - rightW / 2, cy, wallZ]} receiveShadow>
              <planeGeometry args={[rightW, sideH]} />
              <meshStandardMaterial color={wallColor} />
            </mesh>

            {/* side walls */}
            <mesh position={[-4.5, WALL_Y, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
              <planeGeometry args={[8, ROOM_H]} />
              <meshStandardMaterial color={sideWallColor} />
            </mesh>
            <mesh position={[4.5, WALL_Y, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
              <planeGeometry args={[8, ROOM_H]} />
              <meshStandardMaterial color={sideWallColor} />
            </mesh>

            {/* ceiling */}
            <mesh position={[0, ROOM_H, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[18, 18]} />
              <meshStandardMaterial color="#1b1b1f" />
            </mesh>

            {/* balcony facade */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -7.0]} receiveShadow>
              <planeGeometry args={[10, 4.5]} />
              <meshStandardMaterial color="#b9b3ab" roughness={0.95} metalness={0.02} />
            </mesh>
            <mesh position={[0, 1.05, -6.4]} castShadow>
              <boxGeometry args={[9.6, 0.06, 0.06]} />
              <meshStandardMaterial color="#e6e6e6" roughness={0.6} metalness={0.2} />
            </mesh>

            {/* outside view */}
            <mesh position={[cx, cy, -6.2]}>
              <planeGeometry args={[innerW * 1.35, innerH * 1.35]} />
              <meshBasicMaterial color="#ffffff" map={outsideTex as any} />
            </mesh>

            {/* glass */}
            <mesh position={[cx, cy, cz - 0.07]}>
              <boxGeometry args={[innerW, innerH, 0.03]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transparent
                opacity={0.16}
                roughness={0.03}
                transmission={0.92}
                thickness={0.15}
                ior={1.45}
              />
            </mesh>

            {/* frame */}
            {[
              { p: [cx, topY, cz], s: [outerW, barT, depth] },
              { p: [cx, botY, cz], s: [outerW, barT, depth] },
              { p: [leftX, cy, cz], s: [barT, outerH, depth] },
              { p: [rightX, cy, cz], s: [barT, outerH, depth] },
            ].map((cfg, idx) => (
              <mesh key={`sfbar-${floorIndex}-${idx}`} position={cfg.p as any} castShadow>
                <boxGeometry args={cfg.s as any} />
                <meshStandardMaterial color={windowFrameHex} roughness={0.55} metalness={0.08} />
              </mesh>
            ))}
            {[div1, div2, div3].map((x, idx) => (
              <mesh key={`sfdiv-${floorIndex}-${idx}`} position={[x, cy, cz + 0.02]} castShadow>
                <boxGeometry args={[0.045, innerH, 0.08]} />
                <meshStandardMaterial color={windowFrameHex} roughness={0.55} metalness={0.08} />
              </mesh>
            ))}

            {/* furniture on this floor (static, but each floor different) */}
            <group>{renderStaticFurniture(1000 + floorIndex)}</group>
          </group>
        );
      })}

      {/* Side buildings: stack Room2 and Room3 wings up as well (same style, different window sizes & 3-pane layout) */}
      {Array.from({ length: 4 }).map((_, i) => {
        const floorIndex = i + 1;
        const y0 = floorIndex * FLOOR_H;
        const wallColor = wallHex || '#f2f4f7';
        const sideWallColor = wallHex || '#eef1f5';

        const renderWingFloor = (key: string, base: [number, number, number], variant: 'x' | 'z') => {
          // Window sizes differ per wing variant
          const cx = variant === 'x' ? -3.2 : 3.0;
          const cy = WALL_Y;
          const cz = -3.92;
          const outerW = variant === 'x' ? 3.15 : 2.75;
          const outerH = variant === 'x' ? 2.25 : 2.05;
          const barT = 0.16;
          const depth = 0.12;
          const innerW = outerW - barT * 2;
          const innerH = outerH - barT * 2;
          const topY = cy + outerH / 2 - barT / 2;
          const botY = cy - outerH / 2 + barT / 2;
          const leftX = cx - outerW / 2 + barT / 2;
          const rightX = cx + outerW / 2 - barT / 2;
          const [d1, d2] = threePaneDividerXs(cx, innerW);

          // Back wall cut-out (slightly smaller than frame)
          const wallW = 18;
          const wallH = ROOM_H;
          const wallZ = -4;
          const pad = -0.04;
          const holeW = outerW + pad;
          const holeH = outerH + pad;
          const left = cx - holeW / 2;
          const right = cx + holeW / 2;
          const bottom = cy - holeH / 2;
          const top = cy + holeH / 2;
          const topH = Math.max(0.01, wallH - top);
          const bottomH = Math.max(0.01, bottom);
          const sideH = Math.max(0.01, holeH);
          const leftW = Math.max(0.01, left + wallW / 2);
          const rightW = Math.max(0.01, wallW / 2 - right);

          return (
            <group key={key} position={[base[0], base[1] + y0, base[2]]}>
              {/* floor */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[18, 18]} />
                <meshStandardMaterial color="#8d7f72" />
              </mesh>

              {/* back wall strips (cut-out for window) */}
              <mesh position={[0, top + topH / 2, wallZ]} receiveShadow>
                <planeGeometry args={[wallW, topH]} />
                <meshStandardMaterial color={wallColor} />
              </mesh>
              <mesh position={[0, bottomH / 2, wallZ]} receiveShadow>
                <planeGeometry args={[wallW, bottomH]} />
                <meshStandardMaterial color={wallColor} />
              </mesh>
              <mesh position={[-wallW / 2 + leftW / 2, cy, wallZ]} receiveShadow>
                <planeGeometry args={[leftW, sideH]} />
                <meshStandardMaterial color={wallColor} />
              </mesh>
              <mesh position={[wallW / 2 - rightW / 2, cy, wallZ]} receiveShadow>
                <planeGeometry args={[rightW, sideH]} />
                <meshStandardMaterial color={wallColor} />
              </mesh>

              {/* side walls + ceiling */}
              <mesh position={[-4.5, WALL_Y, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[8, ROOM_H]} />
                <meshStandardMaterial color={sideWallColor} />
              </mesh>
              <mesh position={[4.5, WALL_Y, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
                <planeGeometry args={[8, ROOM_H]} />
                <meshStandardMaterial color={sideWallColor} />
              </mesh>
              <mesh position={[0, ROOM_H, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[18, 18]} />
                <meshStandardMaterial color="#1b1b1f" />
              </mesh>

              {/* outside view */}
              <mesh position={[cx, cy, -6.2]}>
                <planeGeometry args={[innerW * 1.35, innerH * 1.35]} />
                <meshBasicMaterial color="#ffffff" map={outsideTex as any} />
              </mesh>

              {/* glass */}
              <mesh position={[cx, cy, cz - 0.07]}>
                <boxGeometry args={[innerW, innerH, 0.03]} />
                <meshPhysicalMaterial
                  color="#ffffff"
                  transparent
                  opacity={0.14}
                  roughness={0.03}
                  transmission={0.92}
                  thickness={0.12}
                  ior={1.45}
                />
              </mesh>

              {/* frame bars */}
              {[
                { p: [cx, topY, cz], s: [outerW, barT, depth] },
                { p: [cx, botY, cz], s: [outerW, barT, depth] },
                { p: [leftX, cy, cz], s: [barT, outerH, depth] },
                { p: [rightX, cy, cz], s: [barT, outerH, depth] },
              ].map((cfg, idx) => (
                <mesh key={`${key}-bar-${idx}`} position={cfg.p as any} castShadow>
                  <boxGeometry args={cfg.s as any} />
                  <meshStandardMaterial color={windowFrameHex} roughness={0.55} metalness={0.08} />
                </mesh>
              ))}

              {/* 3-pane dividers: 2 inner posts */}
              {[d1, d2].map((x, idx) => (
                <mesh key={`${key}-div-${idx}`} position={[x, cy, cz + 0.02]} castShadow>
                  <boxGeometry args={[0.05, innerH, 0.08]} />
                  <meshStandardMaterial color={windowFrameHex} roughness={0.55} metalness={0.08} />
                </mesh>
              ))}

              {/* furniture (smaller) */}
              <group scale={0.88} position={[0, 0, 0.1]}>
                {renderStaticFurniture(2000 + floorIndex + (variant === 'x' ? 10 : 20))}
              </group>
            </group>
          );
        };

        return (
          <React.Fragment key={`wing-floors-${floorIndex}`}>
            {renderWingFloor(`wingx-${floorIndex}`, WING_X_OFFSET, 'x')}
            {renderWingFloor(`wingz-${floorIndex}`, WING_Z_OFFSET, 'z')}
          </React.Fragment>
        );
      })}

      {/* Simple room */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#8d7f72" />
      </mesh>
      {/* Back wall with a "hole" for the big window so outside is actually visible */}
      {(() => {
        const wallW = 18;
        const wallH = ROOM_H;
        const wallZ = -4;
        // Match window size (same numbers used below)
        const winW = 6.9;
        const winH = ROOM_H - 0.35;
        // Keep the wall cut-out slightly SMALLER than the frame so there is no visible gap
        const pad = -0.04;
        const holeW = winW + pad;
        const holeH = winH + pad;
        const cx = 0;
        const cy = WALL_Y;
        const left = cx - holeW / 2;
        const right = cx + holeW / 2;
        const bottom = cy - holeH / 2;
        const top = cy + holeH / 2;

        const topH = Math.max(0.01, wallH - top);
        const bottomH = Math.max(0.01, bottom);
        const sideH = Math.max(0.01, holeH);
        const leftW = Math.max(0.01, left + wallW / 2);
        const rightW = Math.max(0.01, wallW / 2 - right);

        return (
          <>
            {/* top strip */}
            <mesh
              ref={(el) => {
                backWallRefs.current[0] = el;
              }}
              position={[0, top + topH / 2, wallZ]}
              receiveShadow
            >
              <planeGeometry args={[wallW, topH]} />
              <meshStandardMaterial color="#f2f4f7" />
            </mesh>
            {/* bottom strip */}
            <mesh
              ref={(el) => {
                backWallRefs.current[1] = el;
              }}
              position={[0, bottomH / 2, wallZ]}
              receiveShadow
            >
              <planeGeometry args={[wallW, bottomH]} />
              <meshStandardMaterial color="#f2f4f7" />
            </mesh>
            {/* left strip */}
            <mesh
              ref={(el) => {
                backWallRefs.current[2] = el;
              }}
              position={[-wallW / 2 + leftW / 2, cy, wallZ]}
              receiveShadow
            >
              <planeGeometry args={[leftW, sideH]} />
              <meshStandardMaterial color="#f2f4f7" />
            </mesh>
            {/* right strip */}
            <mesh
              ref={(el) => {
                backWallRefs.current[3] = el;
              }}
              position={[wallW / 2 - rightW / 2, cy, wallZ]}
              receiveShadow
            >
              <planeGeometry args={[rightW, sideH]} />
              <meshStandardMaterial color="#f2f4f7" />
            </mesh>
          </>
        );
      })()}
      <mesh ref={leftWallRef} position={[-4.5, WALL_Y, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, ROOM_H]} />
        <meshStandardMaterial color="#eef1f5" />
      </mesh>
      <mesh ref={rightWallRef} position={[4.5, WALL_Y, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, ROOM_H]} />
        <meshStandardMaterial color="#eef1f5" />
      </mesh>
      <mesh position={[0, ROOM_H, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#1b1b1f" />
      </mesh>

      {/* Simple balcony outside the big window (just to feel more real) */}
      <group position={[0, 0, 0]}>
        {/* balcony floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -7.0]} receiveShadow>
          <planeGeometry args={[10, 4.5]} />
          <meshStandardMaterial color="#b9b3ab" roughness={0.95} metalness={0.02} />
        </mesh>
        {/* railing */}
        <mesh position={[0, 1.05, -6.4]} castShadow>
          <boxGeometry args={[9.6, 0.06, 0.06]} />
          <meshStandardMaterial color="#e6e6e6" roughness={0.6} metalness={0.2} />
        </mesh>
        {Array.from({ length: 12 }).map((_, i) => {
          const x = -4.6 + i * (9.2 / 11);
          return (
            <mesh key={`rail-${i}`} position={[x, 0.6, -6.4]} castShadow>
              <boxGeometry args={[0.05, 0.9, 0.05]} />
              <meshStandardMaterial color="#efefef" roughness={0.6} metalness={0.15} />
            </mesh>
          );
        })}
      </group>

      {/* Furniture (doesn't block window view): sofa right, coffee table center, TV left */}
      <group>
        {/* Sofa-bed (two-person) - rotated to face TV (left) */}
        <group position={[2.75, 0, 1.1]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh
            ref={(el) => {
              sofaPartsRef.current[0] = el;
            }}
            position={[0, 0.55, 0.0]}
            castShadow
            receiveShadow
          >
            {/* base is deeper (bed-like) */}
            <boxGeometry args={[2.55, 0.6, 1.35]} />
            <meshStandardMaterial color={sofaHex} roughness={0.75} metalness={0.02} />
          </mesh>
          {/* pull-out bed platform (front) */}
          <mesh
            ref={(el) => {
              sofaPartsRef.current[4] = el;
            }}
            position={[0, 0.28, 0.82]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[2.45, 0.18, 0.58]} />
            <meshStandardMaterial color={sofaHex} roughness={0.8} metalness={0.01} />
          </mesh>
          <mesh
            ref={(el) => {
              sofaPartsRef.current[1] = el;
            }}
            position={[0, 1.05, -0.55]}
            castShadow
          >
            <boxGeometry args={[2.55, 0.45, 0.28]} />
            <meshStandardMaterial color={sofaHex} roughness={0.8} metalness={0.02} />
          </mesh>
          {/* chaise extension (right) */}
          <mesh
            ref={(el) => {
              sofaPartsRef.current[5] = el;
            }}
            position={[0.72, 0.45, 0.55]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[1.05, 0.5, 0.7]} />
            <meshStandardMaterial color={sofaHex} roughness={0.8} metalness={0.01} />
          </mesh>
          {/* Armrests */}
          <mesh
            ref={(el) => {
              sofaPartsRef.current[2] = el;
            }}
            position={[1.1, 0.95, 0.0]}
            castShadow
          >
            <boxGeometry args={[0.25, 0.8, 1.35]} />
            <meshStandardMaterial color={sofaHex} roughness={0.8} metalness={0.02} />
          </mesh>
          <mesh
            ref={(el) => {
              sofaPartsRef.current[3] = el;
            }}
            position={[-1.1, 0.95, 0.0]}
            castShadow
          >
            <boxGeometry args={[0.25, 0.8, 1.35]} />
            <meshStandardMaterial color={sofaHex} roughness={0.8} metalness={0.02} />
          </mesh>
          {/* Sofa hitbox */}
          <mesh
            ref={sofaHitRef}
            position={[0, 0.9, 0.0]}
            onPointerOver={() => {
              if (mode === 'explore') return;
              setHoveredName('Sofa');
              sofaPartsRef.current.forEach((m) => setEmissive(m, 0x111111));
              onHint('Divan hover (click qilib tanlang).');
            }}
            onPointerOut={() => {
              if (mode === 'explore') return;
              setHoveredName(null);
              sofaPartsRef.current.forEach((m) => setEmissive(m, 0x000000));
            }}
            onClick={() => select('sofa', 'Sofa')}
          >
            <boxGeometry args={[3.1, 1.4, 1.8]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </group>

        {/* Coffee table (center) */}
        <mesh
          ref={(el) => {
            tablePartsRef.current[0] = el;
          }}
          position={[0.9, 0.42, 1.25]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.55, 0.08, 0.85]} />
          <meshStandardMaterial color={tableHex} roughness={0.65} metalness={0.05} />
        </mesh>
        {[
          [0.25, 0.2, 0.9],
          [1.55, 0.2, 0.9],
          [0.25, 0.2, 1.6],
          [1.55, 0.2, 1.6],
        ].map((p, i) => (
          <mesh
            key={`tleg-${i}`}
            ref={(el) => {
              tablePartsRef.current[1 + i] = el;
            }}
            position={p as any}
            castShadow
          >
            <boxGeometry args={[0.06, 0.5, 0.06]} />
            <meshStandardMaterial color={tableHex} roughness={0.7} metalness={0.05} />
          </mesh>
        ))}
        <mesh
          ref={tableHitRef}
          position={[0.9, 0.35, 1.25]}
          onPointerOver={() => {
            if (mode === 'explore') return;
            setHoveredName('Table');
            tablePartsRef.current.forEach((m) => setEmissive(m, 0x111111));
            onHint('Ustol hover (click qilib tanlang).');
          }}
          onPointerOut={() => {
            if (mode === 'explore') return;
            setHoveredName(null);
            tablePartsRef.current.forEach((m) => setEmissive(m, 0x000000));
          }}
          onClick={() => select('table', 'Table')}
        >
          <boxGeometry args={[2.0, 1.0, 1.3]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* Rug (neutral) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.0, 0.02, 1.25]} receiveShadow>
          <planeGeometry args={[5.0, 3.2]} />
          <meshStandardMaterial color="#6b6f78" roughness={0.95} metalness={0} opacity={0.9} transparent />
        </mesh>

        {/* TV (left wall) */}
        <mesh
          ref={(el) => {
            tvPartsRef.current[0] = el;
          }}
          position={[-4.18, 1.35, 1.1]}
          rotation={[0, Math.PI / 2, 0]}
          castShadow
        >
          <boxGeometry args={[1.8, 1.05, 0.08]} />
          <meshStandardMaterial color={tvHex} roughness={0.35} metalness={0.25} />
        </mesh>
        <mesh
          ref={(el) => {
            tvPartsRef.current[1] = el;
          }}
          position={[-4.14, 1.35, 1.1]}
          rotation={[0, Math.PI / 2, 0]}
          castShadow
        >
          <boxGeometry args={[1.6, 0.9, 0.02]} />
          <meshStandardMaterial color="#0b1a2b" emissive="#081624" emissiveIntensity={0.6} roughness={0.4} metalness={0.1} />
        </mesh>
        <mesh
          ref={(el) => {
            tvPartsRef.current[2] = el;
          }}
          position={[-4.25, 0.45, 1.1]}
          rotation={[0, Math.PI / 2, 0]}
          castShadow
        >
          <boxGeometry args={[1.2, 0.25, 0.6]} />
          <meshStandardMaterial color={tvHex} roughness={0.45} metalness={0.25} />
        </mesh>
        <mesh
          ref={tvHitRef}
          position={[-4.15, 1.1, 1.1]}
          rotation={[0, Math.PI / 2, 0]}
          onPointerOver={() => {
            if (mode === 'explore') return;
            setHoveredName('TV');
            tvPartsRef.current.forEach((m) => setEmissive(m, 0x111111));
            onHint('TV hover (click qilib tanlang).');
          }}
          onPointerOut={() => {
            if (mode === 'explore') return;
            setHoveredName(null);
            tvPartsRef.current.forEach((m) => setEmissive(m, 0x000000));
          }}
          onClick={() => select('tv', 'TV')}
        >
          <boxGeometry args={[2.2, 1.8, 1.1]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      {/* WINDOW: frame bars + real glass behind */}
      {(() => {
        // Window layout constants (keep corners perfectly 90deg)
        const cx = 0;
        const cy = WALL_Y;
        const cz = -3.92;
        const outerW = 6.9;
        const outerH = ROOM_H - 0.35; // almost full wall height
        const barT = 0.18; // thinner frame
        const depth = 0.14;
        const innerW = outerW - barT * 2;
        const innerH = outerH - barT * 2;

        const topY = cy + outerH / 2 - barT / 2;
        const botY = cy - outerH / 2 + barT / 2;
        const leftX = cx - outerW / 2 + barT / 2;
        const rightX = cx + outerW / 2 - barT / 2;

        // Divider x positions (4 panes => 3 dividers)
        const div1 = cx - innerW / 4;
        const div2 = cx;
        const div3 = cx + innerW / 4;

        return (
          <>
            {/* Outside view (simple sky) */}
            <mesh position={[cx, cy, -6.2]}>
              <planeGeometry args={[innerW * 1.35, innerH * 1.35]} />
              <meshBasicMaterial color="#ffffff" map={outsideTex as any} />
            </mesh>

            {/* Glass */}
            <mesh position={[cx, cy, cz - 0.07]}>
              <boxGeometry args={[innerW, innerH, 0.03]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transparent
                opacity={0.16}
                roughness={0.03}
                transmission={0.92}
                thickness={0.15}
                ior={1.45}
              />
            </mesh>

            {/* Frame bars */}
            {[
              { key: 'top', p: [cx, topY, cz], s: [outerW, barT, depth] },
              { key: 'bottom', p: [cx, botY, cz], s: [outerW, barT, depth] },
              { key: 'left', p: [leftX, cy, cz], s: [barT, outerH, depth] },
              { key: 'right', p: [rightX, cy, cz], s: [barT, outerH, depth] },
            ].map((cfg, idx) => (
              <mesh
                key={cfg.key}
                ref={(el) => {
                  windowPartsRef.current[idx] = el;
                }}
                position={cfg.p as any}
                castShadow
              >
                <boxGeometry args={cfg.s as any} />
                <meshStandardMaterial color={windowFrameHex} roughness={0.55} metalness={0.08} />
              </mesh>
            ))}

            {/* Dividers (same color as frame) */}
            {[div1, div2, div3].map((x, i) => (
              <mesh
                key={`wdiv-${i}`}
                ref={(el) => {
                  windowPartsRef.current[4 + i] = el;
                }}
                position={[x, cy, cz + 0.02]}
                castShadow
              >
                <boxGeometry args={[0.045, innerH, 0.08]} />
                <meshStandardMaterial color={windowFrameHex} roughness={0.55} metalness={0.08} />
              </mesh>
            ))}

            {/* Window hitbox */}
            <mesh
              ref={windowHitRef}
              position={[cx, cy, cz]}
              onPointerOver={() => {
          if (mode === 'explore') return;
                setHoveredName('Window frame');
                windowPartsRef.current.forEach((m) => setEmissive(m, 0x111111));
                onHint('Deraza romi hover (click qilib tanlang).');
              }}
              onPointerOut={() => {
          if (mode === 'explore') return;
                setHoveredName(null);
                windowPartsRef.current.forEach((m) => setEmissive(m, 0x000000));
              }}
              onClick={() => select('window', 'Window frame')}
            >
              <boxGeometry args={[outerW + 0.3, outerH + 0.3, 0.7]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </>
        );
      })()}

      {/* SECOND ROOM (door is here, not next to window) */}
      <group position={[22, 0, 0]}>
        {/* Small window in Room 2 */}
        {(() => {
          const cx = -3.2;
          const cy = WALL_Y;
          const cz = -3.92;
          const outerW = 3.0;
          const outerH = 2.2;
          const barT = 0.16;
          const depth = 0.12;
          const innerW = outerW - barT * 2;
          const innerH = outerH - barT * 2;
          const topY = cy + outerH / 2 - barT / 2;
          const botY = cy - outerH / 2 + barT / 2;
          const leftX = cx - outerW / 2 + barT / 2;
          const rightX = cx + outerW / 2 - barT / 2;
          // 3-pane layout: center bigger, sides smaller
          const d1 = cx - innerW * 0.25;
          const d2 = cx + innerW * 0.25;
          return (
            <>
              <mesh position={[cx, cy, cz - 0.12]}>
                <planeGeometry args={[innerW, innerH]} />
                <meshBasicMaterial color="#ffffff" map={outsideTex as any} />
              </mesh>
              <mesh position={[cx, cy, cz - 0.07]}>
                <boxGeometry args={[innerW, innerH, 0.03]} />
                <meshPhysicalMaterial color="#ffffff" transparent opacity={0.14} transmission={0.92} thickness={0.12} ior={1.45} roughness={0.03} />
              </mesh>
              {[
                { p: [cx, topY, cz], s: [outerW, barT, depth] },
                { p: [cx, botY, cz], s: [outerW, barT, depth] },
                { p: [leftX, cy, cz], s: [barT, outerH, depth] },
                { p: [rightX, cy, cz], s: [barT, outerH, depth] },
              ].map((cfg, idx) => (
                <mesh
                  key={`r2w-${idx}`}
                  ref={(el) => {
                    smallWindow1PartsRef.current[idx] = el;
                  }}
                  position={cfg.p as any}
                  castShadow
                >
                  <boxGeometry args={cfg.s as any} />
                  <meshStandardMaterial color={windowFrameHex} roughness={0.55} metalness={0.08} />
                </mesh>
              ))}
              {/* dividers (same color) */}
              {[d1, d2].map((x, i) => (
                <mesh
                  key={`r2wdiv-${i}`}
                  ref={(el) => {
                    smallWindow1PartsRef.current[4 + i] = el;
                  }}
                  position={[x, cy, cz + 0.02]}
                  castShadow
                >
                  <boxGeometry args={[0.05, innerH, 0.08]} />
                  <meshStandardMaterial color={windowFrameHex} roughness={0.55} metalness={0.08} />
                </mesh>
              ))}
              <mesh
                ref={smallWindow1HitRef}
                position={[cx, cy, cz]}
                onPointerOver={() => {
                  if (mode === 'explore') return;
                  setHoveredName('Small window (Room 2)');
                  smallWindow1PartsRef.current.forEach((m) => setEmissive(m, 0x111111));
                  onHint('Kichik deraza romi hover (click qilib tanlang).');
                }}
                onPointerOut={() => {
                  if (mode === 'explore') return;
                  setHoveredName(null);
                  smallWindow1PartsRef.current.forEach((m) => setEmissive(m, 0x000000));
                }}
                onClick={() => select('window', 'Small window (Room 2)')}
              >
                <boxGeometry args={[outerW + 0.2, outerH + 0.2, 0.6]} />
                <meshBasicMaterial transparent opacity={0} />
              </mesh>
            </>
          );
        })()}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[18, 18]} />
          <meshStandardMaterial color="#8d7f72" />
        </mesh>
        {/* Room2 back wall: cut-outs for small window + door, with reveals like the big window */}
        {(() => {
          const wallW = 18;
          const wallH = ROOM_H;
          const wallZ = -4;
          const cy = WALL_Y;

          // Holes (sizes match the actual frame areas with a little padding)
          // Cut-outs slightly smaller than frame outer size to avoid visible gaps
          const win = { cx: -3.2, cy: WALL_Y, w: 3.0 - 0.04, h: 2.2 - 0.04 };
          // Door frame outer height is ~3.22 (3.2 bars + 0.22 top/bottom thickness)
          const door = { cx: 0.0, cy: 1.55, w: 1.65 - 0.04, h: 3.22 - 0.04 };
          const holes = [
            { l: win.cx - win.w / 2, r: win.cx + win.w / 2, b: win.cy - win.h / 2, t: win.cy + win.h / 2 },
            { l: door.cx - door.w / 2, r: door.cx + door.w / 2, b: Math.max(0, door.cy - door.h / 2), t: door.cy + door.h / 2 },
          ];

          const xs = [-wallW / 2, ...holes.flatMap((h) => [h.l, h.r]), wallW / 2]
            .map((n) => +n.toFixed(4))
            .sort((a, b) => a - b)
            .filter((v, i, a) => i === 0 || Math.abs(v - a[i - 1]) > 1e-4);
          const ys = [0, ...holes.flatMap((h) => [h.b, h.t]), wallH]
            .map((n) => +n.toFixed(4))
            .sort((a, b) => a - b)
            .filter((v, i, a) => i === 0 || Math.abs(v - a[i - 1]) > 1e-4);

          const cells: Array<{ x: number; y: number; w: number; h: number }> = [];
          for (let xi = 0; xi < xs.length - 1; xi++) {
            for (let yi = 0; yi < ys.length - 1; yi++) {
              const x0 = xs[xi];
              const x1 = xs[xi + 1];
              const y0 = ys[yi];
              const y1 = ys[yi + 1];
              const xm = (x0 + x1) / 2;
              const ym = (y0 + y1) / 2;
              const insideHole = holes.some((h) => xm > h.l && xm < h.r && ym > h.b && ym < h.t);
              if (insideHole) continue;
              const w = Math.max(0.01, x1 - x0);
              const h = Math.max(0.01, y1 - y0);
              cells.push({ x: xm, y: ym, w, h });
            }
          }

          return (
            <>
              {cells.map((c, idx) => (
                <mesh
                  key={`r2wall-${idx}`}
                  ref={(el) => {
                    room2BackWallRefs.current[idx] = el;
                  }}
                  position={[c.x, c.y, wallZ]}
                  receiveShadow
                >
                  <planeGeometry args={[c.w, c.h]} />
                  <meshStandardMaterial color="#f2f4f7" />
                </mesh>
              ))}
              {/* tiny outside landing for the door (more realistic, doesn't block anything) */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, -6.4]} receiveShadow>
                <planeGeometry args={[3.8, 2.2]} />
                <meshStandardMaterial color="#b9b3ab" roughness={0.95} metalness={0.02} />
              </mesh>
            </>
          );
        })()}
        <mesh ref={room2LeftWallRef} position={[-4.5, WALL_Y, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[8, ROOM_H]} />
          <meshStandardMaterial color="#eef1f5" />
        </mesh>
        <mesh ref={room2RightWallRef} position={[4.5, WALL_Y, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[8, ROOM_H]} />
          <meshStandardMaterial color="#eef1f5" />
        </mesh>
        <mesh position={[0, ROOM_H, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[18, 18]} />
          <meshStandardMaterial color="#1b1b1f" />
        </mesh>

        {/* Outside nature behind door glass */}
        <mesh position={[0, 1.55, -4.06]}>
          <planeGeometry args={[1.25, 2.55]} />
          <meshBasicMaterial color="#ffffff" map={outsideTex as any} />
        </mesh>

        {/* Door glass */}
        <mesh position={[0, 1.55, -3.99]}>
          <boxGeometry args={[1.25, 2.55, 0.03]} />
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.14}
            roughness={0.03}
            transmission={0.92}
            thickness={0.15}
            ior={1.45}
          />
        </mesh>

        {/* Door frame bars */}
        {[
          { p: [0, 3.05, -3.92], s: [1.65, 0.22, 0.14] }, // top
          { p: [0, 0.05, -3.92], s: [1.65, 0.22, 0.14] }, // bottom
          { p: [-0.72, 1.55, -3.92], s: [0.22, 3.2, 0.14] }, // left
          { p: [0.72, 1.55, -3.92], s: [0.22, 3.2, 0.14] }, // right
        ].map((cfg, idx) => (
          <mesh
            key={`dbar-${idx}`}
            ref={(el) => {
              doorPartsRef.current[idx] = el;
            }}
            position={cfg.p as any}
            castShadow
          >
            <boxGeometry args={cfg.s as any} />
            <meshStandardMaterial color={doorFrameHex} roughness={0.55} metalness={0.08} />
          </mesh>
        ))}
        {/* Handle */}
        <mesh position={[0.55, 1.55, -3.88]}>
          <boxGeometry args={[0.06, 0.28, 0.06]} />
          <meshStandardMaterial color="#c9a26e" metalness={0.3} roughness={0.4} />
        </mesh>

        {/* Door hitbox */}
        <mesh
          ref={doorHitRef}
          position={[0, 1.55, -3.92]}
          onPointerOver={() => {
            if (mode === 'explore') return;
            setHoveredName('Door frame');
            doorPartsRef.current.forEach((m) => setEmissive(m, 0x111111));
            onHint('Eshik romi hover (click qilib tanlang).');
          }}
          onPointerOut={() => {
            if (mode === 'explore') return;
            setHoveredName(null);
            doorPartsRef.current.forEach((m) => setEmissive(m, 0x000000));
          }}
          onClick={() => select('door', 'Door frame')}
        >
          <boxGeometry args={[2.0, 3.6, 0.6]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      {/* ROOM 3 (another small window) */}
      <group position={[0, 0, 22]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[18, 18]} />
          <meshStandardMaterial color="#8d7f72" />
        </mesh>
        {/* Room3 back wall: cut-out for small window + reveals */}
        {(() => {
          const wallW = 18;
          const wallH = ROOM_H;
          const wallZ = -4;
          // small window in room3 (same numbers below with small padding)
          // Cut-out slightly smaller than the frame to avoid visible gaps
          const win = { cx: 3.0, cy: WALL_Y, w: 2.4 - 0.04, h: 2.1 - 0.04 };
          const hole = { l: win.cx - win.w / 2, r: win.cx + win.w / 2, b: win.cy - win.h / 2, t: win.cy + win.h / 2 };

          const xs = [-wallW / 2, hole.l, hole.r, wallW / 2]
            .map((n) => +n.toFixed(4))
            .sort((a, b) => a - b)
            .filter((v, i, a) => i === 0 || Math.abs(v - a[i - 1]) > 1e-4);
          const ys = [0, hole.b, hole.t, wallH]
            .map((n) => +n.toFixed(4))
            .sort((a, b) => a - b)
            .filter((v, i, a) => i === 0 || Math.abs(v - a[i - 1]) > 1e-4);

          const cells: Array<{ x: number; y: number; w: number; h: number }> = [];
          for (let xi = 0; xi < xs.length - 1; xi++) {
            for (let yi = 0; yi < ys.length - 1; yi++) {
              const x0 = xs[xi];
              const x1 = xs[xi + 1];
              const y0 = ys[yi];
              const y1 = ys[yi + 1];
              const xm = (x0 + x1) / 2;
              const ym = (y0 + y1) / 2;
              const inside = xm > hole.l && xm < hole.r && ym > hole.b && ym < hole.t;
              if (inside) continue;
              cells.push({ x: xm, y: ym, w: Math.max(0.01, x1 - x0), h: Math.max(0.01, y1 - y0) });
            }
          }

          return (
            <>
              {cells.map((c, idx) => (
                <mesh
                  key={`r3wall-${idx}`}
                  ref={(el) => {
                    room3BackWallRefs.current[idx] = el;
                  }}
                  position={[c.x, c.y, wallZ]}
                  receiveShadow
                >
                  <planeGeometry args={[c.w, c.h]} />
                  <meshStandardMaterial color="#f2f4f7" />
                </mesh>
              ))}
            </>
          );
        })()}
        <mesh ref={room3LeftWallRef} position={[-4.5, WALL_Y, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[8, ROOM_H]} />
          <meshStandardMaterial color="#eef1f5" />
        </mesh>
        <mesh ref={room3RightWallRef} position={[4.5, WALL_Y, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[8, ROOM_H]} />
          <meshStandardMaterial color="#eef1f5" />
        </mesh>
        <mesh position={[0, ROOM_H, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[18, 18]} />
          <meshStandardMaterial color="#1b1b1f" />
        </mesh>

        {(() => {
          const cx = 3.0;
          const cy = WALL_Y;
          const cz = -3.92;
          const outerW = 2.4;
          const outerH = 2.1;
          const barT = 0.16;
          const depth = 0.12;
          const innerW = outerW - barT * 2;
          const innerH = outerH - barT * 2;
          const topY = cy + outerH / 2 - barT / 2;
          const botY = cy - outerH / 2 + barT / 2;
          const leftX = cx - outerW / 2 + barT / 2;
          const rightX = cx + outerW / 2 - barT / 2;
          const d1 = cx - innerW * 0.25;
          const d2 = cx + innerW * 0.25;
          return (
            <>
              <mesh position={[cx, cy, cz - 0.12]}>
                <planeGeometry args={[innerW, innerH]} />
                <meshBasicMaterial color="#ffffff" map={outsideTex as any} />
              </mesh>
              <mesh position={[cx, cy, cz - 0.07]}>
                <boxGeometry args={[innerW, innerH, 0.03]} />
                <meshPhysicalMaterial color="#ffffff" transparent opacity={0.14} transmission={0.92} thickness={0.12} ior={1.45} roughness={0.03} />
              </mesh>
              {[
                { p: [cx, topY, cz], s: [outerW, barT, depth] },
                { p: [cx, botY, cz], s: [outerW, barT, depth] },
                { p: [leftX, cy, cz], s: [barT, outerH, depth] },
                { p: [rightX, cy, cz], s: [barT, outerH, depth] },
              ].map((cfg, idx) => (
                <mesh
                  key={`r3w-${idx}`}
                  ref={(el) => {
                    smallWindow2PartsRef.current[idx] = el;
                  }}
                  position={cfg.p as any}
                  castShadow
                >
                  <boxGeometry args={cfg.s as any} />
                  <meshStandardMaterial color={windowFrameHex} roughness={0.55} metalness={0.08} />
                </mesh>
              ))}
              {[d1, d2].map((x, i) => (
                <mesh
                  key={`r3wdiv-${i}`}
                  ref={(el) => {
                    smallWindow2PartsRef.current[4 + i] = el;
                  }}
                  position={[x, cy, cz + 0.02]}
                  castShadow
                >
                  <boxGeometry args={[0.05, innerH, 0.08]} />
                  <meshStandardMaterial color={windowFrameHex} roughness={0.55} metalness={0.08} />
                </mesh>
              ))}
              <mesh
                ref={smallWindow2HitRef}
                position={[cx, cy, cz]}
                onPointerOver={() => {
                  if (mode === 'explore') return;
                  setHoveredName('Small window (Room 3)');
                  smallWindow2PartsRef.current.forEach((m) => setEmissive(m, 0x111111));
                  onHint('Kichik deraza romi hover (click qilib tanlang).');
                }}
                onPointerOut={() => {
                  if (mode === 'explore') return;
                  setHoveredName(null);
                  smallWindow2PartsRef.current.forEach((m) => setEmissive(m, 0x000000));
                }}
                onClick={() => select('window', 'Small window (Room 3)')}
              >
                <boxGeometry args={[outerW + 0.2, outerH + 0.2, 0.6]} />
                <meshBasicMaterial transparent opacity={0} />
              </mesh>
            </>
          );
        })()}
      </group>

      {/* Easier camera control in demo */}
      {mode === 'design' ? (
        <OrbitControls makeDefault enablePan enableZoom enableRotate target={[0, 1.6, -3.6]} />
      ) : (
        <PointerLockControls
          ref={pointerRef}
          makeDefault
          onUnlock={() => {
            setHoveredName(null);
            windowPartsRef.current.forEach((m) => setEmissive(m, 0x000000));
            smallWindow1PartsRef.current.forEach((m) => setEmissive(m, 0x000000));
            smallWindow2PartsRef.current.forEach((m) => setEmissive(m, 0x000000));
            doorPartsRef.current.forEach((m) => setEmissive(m, 0x000000));
            sofaPartsRef.current.forEach((m) => setEmissive(m, 0x000000));
            tablePartsRef.current.forEach((m) => setEmissive(m, 0x000000));
            tvPartsRef.current.forEach((m) => setEmissive(m, 0x000000));
          }}
          onLock={() => onHint('Explore: WASD bilan yuring. Hover bo‘lsa click qilib tanlang.')}
        />
      )}
    </>
  );
}

export default function RoomConfigurator({ modelUrl = '/models/room.glb' }: { modelUrl?: string }) {
  const [hint, setHint] = useState('Click inside the scene to start.');
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedHex, setSelectedHex] = useState<string | null>(null);
  const [wallHex, setWallHex] = useState<string | null>(WALL_SWATCHES[0]?.hex || null);
  const [modelAvailable, setModelAvailable] = useState<boolean | null>(null);
  const [mode, setMode] = useState<'design' | 'explore'>('design');

  useEffect(() => {
    let cancelled = false;
    // Check model exists to avoid runtime overlay crash on 404
    fetch(modelUrl, { method: 'HEAD' })
      .then((r) => {
        if (cancelled) return;
        setModelAvailable(r.ok);
      })
      .catch(() => {
        if (cancelled) return;
        setModelAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [modelUrl]);

  const onPick = (hex: string) => setSelectedHex(hex);
  const onPickWall = (hex: string) => setWallHex(hex);

  return (
    <div className="configurator">
      <div className="configurator-canvas">
        <Canvas
          shadows
          camera={{ fov: 65, near: 0.1, far: 200, position: [0, 1.6, 4] }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#101014']} />
          <Suspense fallback={null}>
            {modelAvailable === true ? (
              <RoomScene
                modelUrl={modelUrl}
                onHint={setHint}
                onSelectedName={setSelectedName}
                selectedHex={selectedHex}
                wallHex={wallHex}
              />
            ) : (
              <FallbackDemoScene
                onHint={setHint}
                onSelectedName={setSelectedName}
                selectedHex={selectedHex}
                wallHex={wallHex}
                mode={mode}
              />
            )}
          </Suspense>
        </Canvas>
        <div className="configurator-hud">
          <div className="configurator-hint">{hint}</div>
        </div>
      </div>

      <aside className="configurator-panel">
        <div className="configurator-panel-title">Mode</div>
        <div className="configurator-panel-sub">Design: mouse bilan aylaning. Explore: WASD bilan ichkariga kiring.</div>
        <div className="configurator-mode">
          <button
            type="button"
            className={mode === 'design' ? 'configurator-mode-btn active' : 'configurator-mode-btn'}
            onClick={() => setMode('design')}
          >
            Design
          </button>
          <button
            type="button"
            className={mode === 'explore' ? 'configurator-mode-btn active' : 'configurator-mode-btn'}
            onClick={() => setMode('explore')}
          >
            Explore (WASD)
          </button>
        </div>

        <div className="configurator-panel-divider" />

        <div className="configurator-panel-title">Frame color</div>
        <div className="configurator-panel-sub">
          {selectedName ? `Selected: ${selectedName}` : 'Select a window/door frame first'}
        </div>
        <div className="configurator-swatches">
          {SWATCHES.map((s) => (
            <button
              key={s.name}
              type="button"
              className="configurator-swatch"
              title={s.name}
              style={{ background: s.hex }}
              onClick={() => onPick(s.hex)}
            />
          ))}
        </div>

        <div className="configurator-panel-divider" />

        <div className="configurator-panel-title">Wall color</div>
        <div className="configurator-panel-sub">Changes only walls (separate from door/window frames)</div>
        <div className="configurator-swatches">
          {WALL_SWATCHES.map((s) => (
            <button
              key={s.name}
              type="button"
              className="configurator-swatch"
              title={s.name}
              style={{ background: s.hex }}
              onClick={() => onPickWall(s.hex)}
            />
          ))}
        </div>

        <div className="configurator-note">
          Model path: <code>{modelUrl}</code>
          <br />
          Mesh naming rule: contains <code>frame</code> or starts with <code>frame_</code>
          {modelAvailable === false ? (
            <>
              <br />
              <strong>Model not found:</strong> add <code>public/models/room.glb</code> to use your real room.
            </>
          ) : null}
        </div>
      </aside>
    </div>
  );
}


