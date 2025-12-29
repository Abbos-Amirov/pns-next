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
}: {
  onHint: (t: string) => void;
  onSelectedName: (t: string | null) => void;
  selectedHex: string | null;
  wallHex: string | null;
}) {
  const { camera } = useThree();

  const windowHitRef = useRef<THREE.Mesh>(null!);
  const doorHitRef = useRef<THREE.Mesh>(null!);
  const windowPartsRef = useRef<Array<THREE.Mesh | null>>([]);
  const doorPartsRef = useRef<Array<THREE.Mesh | null>>([]);
  const backWallRef = useRef<THREE.Mesh>(null!);
  const leftWallRef = useRef<THREE.Mesh>(null!);
  const rightWallRef = useRef<THREE.Mesh>(null!);
  const room2BackWallRef = useRef<THREE.Mesh>(null!);
  const room2LeftWallRef = useRef<THREE.Mesh>(null!);
  const room2RightWallRef = useRef<THREE.Mesh>(null!);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<'window' | 'door' | null>(null);
  const [windowFrameHex, setWindowFrameHex] = useState<string>('#f2f2f2');
  const [doorFrameHex, setDoorFrameHex] = useState<string>('#f2f2f2');
  useCursor(!!hoveredName);

  useEffect(() => {
    // Make sure camera points to the demo window
    camera.position.set(0.5, 1.7, 6.5);
    camera.lookAt(0, 1.6, 0);
    onHint(
      'Demo mode: room.glb topilmadi. Deraza yoki eshik ROMini hover qiling (cursor pointer bo‘ladi), click qilib tanlang, keyin rang tanlang.',
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
    onHint('Rang romga qo‘llandi.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHex]);

  useEffect(() => {
    if (!wallHex) return;
    [backWallRef.current, leftWallRef.current, rightWallRef.current, room2BackWallRef.current, room2LeftWallRef.current, room2RightWallRef.current].forEach((m) => {
      if (m) setColor(m, wallHex);
    });
    onHint('Devor rangi o‘zgardi.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallHex]);

  const select = useCallback(
    (target: 'window' | 'door', label: string) => {
      setSelectedTarget(target);
      onSelectedName(label);
      onHint(`Tanlandi: ${label}. Endi rang tanlang.`);
    },
    [onHint, onSelectedName],
  );

  return (
    <>
      <ambientLight intensity={0.65} />
      <hemisphereLight args={[0xffffff, 0x333344, 1.0]} />
      <directionalLight position={[3, 6, 2]} intensity={1.15} castShadow />

      {/* Simple room */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#8d7f72" />
      </mesh>
      <mesh ref={backWallRef} position={[0, 2.2, -4]} receiveShadow>
        <planeGeometry args={[18, 8]} />
        <meshStandardMaterial color="#f2f4f7" />
      </mesh>
      <mesh ref={leftWallRef} position={[-4.5, 2.2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#eef1f5" />
      </mesh>
      <mesh ref={rightWallRef} position={[4.5, 2.2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#eef1f5" />
      </mesh>
      <mesh position={[0, 4.2, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#1b1b1f" />
      </mesh>

      {/* Outside view behind window */}
      <mesh position={[0, 2.2, -4.25]}>
        <planeGeometry args={[6.2, 3.2]} />
        <meshStandardMaterial color="#bfe3ff" />
      </mesh>

      {/* WINDOW: frame bars + real glass behind */}
      {(() => {
        // Window layout constants (keep corners perfectly 90deg)
        const cx = 0;
        const cy = 1.85;
        const cz = -3.92;
        const outerW = 6.9;
        const outerH = 3.6;
        const barT = 0.28;
        const depth = 0.18;
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
            {/* Glass */}
            <mesh position={[cx, cy, cz - 0.07]}>
              <boxGeometry args={[innerW, innerH, 0.03]} />
              <meshPhysicalMaterial
                color="#d6f0ff"
                transparent
                opacity={0.28}
                roughness={0.06}
                transmission={0.85}
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
              <mesh key={`wdiv-${i}`} position={[x, cy, cz + 0.02]} castShadow>
                <boxGeometry args={[0.06, innerH, 0.08]} />
                <meshStandardMaterial color={windowFrameHex} roughness={0.55} metalness={0.08} />
              </mesh>
            ))}

            {/* Window hitbox */}
            <mesh
              ref={windowHitRef}
              position={[cx, cy, cz]}
              onPointerOver={() => {
                setHoveredName('Window frame');
                windowPartsRef.current.forEach((m) => setEmissive(m, 0x111111));
                onHint('Deraza romi hover (click qilib tanlang).');
              }}
              onPointerOut={() => {
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
      <group position={[10, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[18, 18]} />
          <meshStandardMaterial color="#8d7f72" />
        </mesh>
        <mesh ref={room2BackWallRef} position={[0, 2.2, -4]} receiveShadow>
          <planeGeometry args={[18, 8]} />
          <meshStandardMaterial color="#f2f4f7" />
        </mesh>
        <mesh ref={room2LeftWallRef} position={[-4.5, 2.2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial color="#eef1f5" />
        </mesh>
        <mesh ref={room2RightWallRef} position={[4.5, 2.2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial color="#eef1f5" />
        </mesh>
        <mesh position={[0, 4.2, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[18, 18]} />
          <meshStandardMaterial color="#1b1b1f" />
        </mesh>

        {/* Outside view behind door */}
        <mesh position={[0, 2.2, -4.25]}>
          <planeGeometry args={[3.2, 3.2]} />
          <meshStandardMaterial color="#cfe9ff" />
        </mesh>

        {/* Door glass behind */}
        <mesh position={[0, 1.55, -3.99]}>
          <boxGeometry args={[1.25, 2.55, 0.03]} />
          <meshPhysicalMaterial
            color="#d6f0ff"
            transparent
            opacity={0.22}
            roughness={0.06}
            transmission={0.85}
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
            setHoveredName('Door frame');
            doorPartsRef.current.forEach((m) => setEmissive(m, 0x111111));
            onHint('Eshik romi hover (click qilib tanlang).');
          }}
          onPointerOut={() => {
            setHoveredName(null);
            doorPartsRef.current.forEach((m) => setEmissive(m, 0x000000));
          }}
          onClick={() => select('door', 'Door frame')}
        >
          <boxGeometry args={[2.0, 3.6, 0.6]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </group>

      {/* Easier camera control in demo */}
      <OrbitControls makeDefault enablePan enableZoom enableRotate target={[5, 1.7, -3.4]} />
    </>
  );
}

export default function RoomConfigurator({ modelUrl = '/models/room.glb' }: { modelUrl?: string }) {
  const [hint, setHint] = useState('Click inside the scene to start.');
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedHex, setSelectedHex] = useState<string | null>(null);
  const [wallHex, setWallHex] = useState<string | null>(WALL_SWATCHES[0]?.hex || null);
  const [modelAvailable, setModelAvailable] = useState<boolean | null>(null);

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
              />
            )}
          </Suspense>
        </Canvas>
        <div className="configurator-hud">
          <div className="configurator-hint">{hint}</div>
        </div>
      </div>

      <aside className="configurator-panel">
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


