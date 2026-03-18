import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  APARTMENT_SIZE_DATA,
  BOTTOM_NOTE,
  COLOR_OPTIONS,
  DOOR_OPTIONS,
  EXTRA_OPTIONS,
  FUNCTIONAL_OPTIONS,
  GLASS_SPEC,
  HANDLE_OPTIONS,
  HANDLE_SPEC,
  MOSQUITO_SCREEN,
  PRICE_NOTICE,
  VAT_NOTE,
  WINDOW_PRICING_SUBTITLE,
  WINDOW_PRICING_TITLE,
} from './data/windowPricingData';
import type { ApartmentSizeData, ApartmentSizeKey, DoorOption, WindowProduct } from './data/windowPricingData';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=80';

const NO_COLORS = [
  '#e74c3c', '#e67e22', '#e91e63', '#f1c40f', '#9b59b6', '#3498db',
  '#2ecc71', '#27ae60', '#1abc9c', '#16a085', '#2980b9', '#8e44ad',
];

const TABLE_COLS = [
  { key: 'index', label: 'NO' },
  { key: 'location', label: '위치' },
  { key: 'productName', label: '제품명' },
  { key: 'frame', label: '창짝' },
  { key: 'type', label: '종류' },
  { key: 'glassThickness', label: '유리두께' },
  { key: 'glassSpec', label: '기본유리사양' },
  { key: 'w', label: 'W' },
  { key: 'h', label: 'H' },
  { key: 'form', label: '형태' },
  { key: 'mosquitoScreen', label: '방충망' },
  { key: 'handle', label: '핸들' },
];

const formatPrice = (n: number): string => {
  return Math.round(n).toLocaleString('ko-KR');
};

// --- AnimatedNumber (counting up/down when value changes) ---
function useAnimatedNumber(target: number, duration = 380) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const rafRef = useRef<number>(0);
  const startRef = useRef(0);

  useEffect(() => {
    if (target === prevRef.current) return;
    const startVal = prevRef.current;
    prevRef.current = target;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2);
      const current = Math.round(startVal + (target - startVal) * eased);
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

const FLOOR_PLAN_IMAGES: Record<ApartmentSizeKey, string> = {
  '20': '/img/configurator/20pyon.png',
  '30': '/img/configurator/30pyon.png',
  '40': '/img/configurator/40pyon.png',
  '50': '/img/configurator/50pyon.png',
};

// --- HeroBadge (animated prices) ---
function HeroBadge({ externalTotal, fullTotal }: { externalTotal: number; fullTotal: number }) {
  const animExternal = useAnimatedNumber(externalTotal);
  const animFull = useAnimatedNumber(fullTotal);
  return (
    <div className="window-pricing-hero-badge">
      <div className="window-pricing-hero-badge-row">
        <span>외부창 기준</span>
        <strong>{formatPrice(animExternal)} 원</strong>
      </div>
      <div className="window-pricing-hero-badge-row">
        <span>전체창 기준</span>
        <strong>{formatPrice(animFull)} 원</strong>
      </div>
    </div>
  );
}

// --- SizeTabs ---
function SizeTabs({
  sizes,
  selectedKey,
  onSelect,
}: {
  sizes: ApartmentSizeData[];
  selectedKey: ApartmentSizeKey;
  onSelect: (k: ApartmentSizeKey) => void;
}) {
  return (
    <div className="window-pricing-size-tabs">
      {sizes.map((s) => (
        <button
          key={s.key}
          type="button"
          className={`window-pricing-size-tab ${s.key === selectedKey ? 'active' : ''}`}
          onClick={() => onSelect(s.key)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// --- PricingSummary (with animated numbers) ---
function PricingSummary({
  externalPrice,
  fullPrice,
}: {
  externalPrice: number;
  fullPrice: number;
}) {
  const animExternal = useAnimatedNumber(externalPrice);
  const animFull = useAnimatedNumber(fullPrice);
  return (
    <div className="window-pricing-summary">
      <div className="window-pricing-price-row">
        <span className="label">외부창 기준</span>
        <span className="value">{formatPrice(animExternal)} 원</span>
      </div>
      <div className="window-pricing-price-row">
        <span className="label">전체창 기준</span>
        <span className="value">{formatPrice(animFull)} 원</span>
      </div>
      <div className="window-pricing-price-row">
        <span className="label">기준</span>
        <span className="value">원</span>
      </div>
      <div className="window-pricing-vat">{VAT_NOTE}</div>
      <div className="window-pricing-notice">{PRICE_NOTICE}</div>
    </div>
  );
}

// --- ProductTable ---
function ProductTable({ products, title }: { products: WindowProduct[]; title: string }) {
  return (
    <div className="window-pricing-table-section">
      <h4 className="window-pricing-table-title">{title}</h4>
      <div className="window-pricing-table-wrap">
        <table className="window-pricing-table">
          <thead>
            <tr>
              {TABLE_COLS.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((row, idx) => (
              <tr key={row.index} className={idx % 2 === 1 ? 'alt' : ''}>
                <td className="no-cell">
                  <span
                    className="no-badge"
                    style={{ background: NO_COLORS[(row.index - 1) % NO_COLORS.length] }}
                  >
                    {row.index}
                  </span>
                </td>
                <td>{row.location}</td>
                <td>{row.productName}</td>
                <td>{row.frame}</td>
                <td>{row.type}</td>
                <td>{row.glassThickness}</td>
                <td>{row.glassSpec}</td>
                <td>{row.w}</td>
                <td>{row.h}</td>
                <td>{row.form}</td>
                <td>{row.mosquitoScreen}</td>
                <td>{row.handle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- OptionCard (circular swatch: 기본 badge, selected border, label + price) ---
function OptionCard<T extends { name: string; priceModifier: string; hex?: string; isDefault?: boolean }>({
  item,
  isSelected,
  onClick,
}: {
  item: T;
  isSelected: boolean;
  onClick: () => void;
}) {
  const bg = item.hex || '#f0f2f5';
  return (
    <button
      type="button"
      className={`window-pricing-opt-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="window-pricing-opt-card-swatch" style={{ background: bg }}>
        {item.isDefault && <span className="window-pricing-opt-badge">기본</span>}
      </div>
      <div className="window-pricing-opt-card-label">{item.name}</div>
      <div className="window-pricing-opt-card-price">{item.priceModifier}</div>
    </button>
  );
}

// --- ColorOptionsSection (toggle: click same to deselect, different to select) ---
function ColorOptionsSection({
  items,
  selectedName,
  onSelect,
}: {
  items: typeof COLOR_OPTIONS;
  selectedName: string | null;
  onSelect: (name: string | null) => void;
}) {
  return (
    <div className="window-pricing-opt-section">
      <div className="window-pricing-opt-grid">
        {items.map((opt) => (
          <OptionCard
            key={opt.name}
            item={opt}
            isSelected={selectedName === opt.name}
            onClick={() => onSelect(selectedName === opt.name ? null : opt.name)}
          />
        ))}
      </div>
      <p className="window-pricing-opt-footnote">
        *이해를 돕기 위한 이미지 자료로 실제 환경과 다를 수 있습니다.
      </p>
    </div>
  );
}

// --- GlassSpecSection ---
function GlassSpecSection({
  default: def,
  hex,
  note,
}: {
  default: string;
  hex?: string;
  note?: string;
}) {
  return (
    <div className="window-pricing-opt-section">
      <div className="window-pricing-opt-grid">
        <div className="window-pricing-opt-card selected">
          <div
            className="window-pricing-opt-card-swatch"
            style={{ background: hex || '#b8dce8' }}
          >
            <span className="window-pricing-opt-badge">기본</span>
          </div>
          <div className="window-pricing-opt-card-label">{def}</div>
        </div>
      </div>
      {note && (
        <p className="window-pricing-opt-footnote">
          * {note}
        </p>
      )}
    </div>
  );
}

// --- DoorDetailModal ---
function DoorDetailModal({
  option,
  isOpen,
  onClose,
}: {
  option: DoorOption | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen || !option?.modal) return null;
  const { title, subtitle, heroImage, description, gallery } = option.modal;
  return (
    <div className="window-pricing-door-modal-overlay" onClick={onClose}>
      <div
        className="window-pricing-door-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="window-pricing-door-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="window-pricing-door-modal-title">{title}</h2>
        <div className="window-pricing-door-modal-body">
          <div className="window-pricing-door-modal-hero">
            <img src={heroImage} alt={option.name} />
          </div>
          <div className="window-pricing-door-modal-content">
            {subtitle && (
              <h3 className="window-pricing-door-modal-subtitle">{subtitle}</h3>
            )}
            {description && (
              <p className="window-pricing-door-modal-desc">{description}</p>
            )}
          </div>
        </div>
        {gallery && gallery.length > 0 && (
          <div className="window-pricing-door-modal-gallery">
            {gallery.map((item, idx) => (
              <div key={idx} className="window-pricing-door-modal-gallery-item">
                <img src={item.image} alt={item.label} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- DoorOptionCard (circular image + label + 더보기 + price) ---
function DoorOptionCard({
  item,
  isSelected,
  onSelect,
  onViewMore,
}: {
  item: DoorOption;
  isSelected: boolean;
  onSelect: () => void;
  onViewMore: () => void;
}) {
  const hasModal = !!item.modal;
  return (
    <div className="window-pricing-door-card">
      <button
        type="button"
        className={`window-pricing-door-card-thumb-wrap ${isSelected ? 'selected' : ''}`}
        onClick={onSelect}
      >
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.name}
            className="window-pricing-door-card-thumb"
          />
        ) : (
          <div
            className="window-pricing-door-card-thumb window-pricing-door-card-placeholder"
            style={{ background: item.hex || '#f0f2f5' }}
          />
        )}
        {item.isDefault && (
          <span className="window-pricing-opt-badge">기본</span>
        )}
      </button>
      <div className="window-pricing-door-card-label">{item.name}</div>
      {hasModal && (
        <button
          type="button"
          className={`window-pricing-door-card-more ${isSelected ? 'selected' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onViewMore();
          }}
        >
          더보기
        </button>
      )}
      <div className="window-pricing-door-card-price">{item.priceModifier}</div>
    </div>
  );
}

// --- DoorOptionsSection (toggle: click same to deselect) ---
function DoorOptionsSection({
  items,
  selectedName,
  onSelect,
  subHeader,
  onViewMore,
}: {
  items: typeof DOOR_OPTIONS;
  selectedName: string | null;
  onSelect: (name: string | null) => void;
  subHeader?: string;
  onViewMore: (option: DoorOption) => void;
}) {
  return (
    <div className="window-pricing-opt-section">
      {subHeader && (
        <p className="window-pricing-opt-subheader">{subHeader}</p>
      )}
      <div className="window-pricing-door-grid">
        {items.map((opt) => (
          <DoorOptionCard
            key={opt.name}
            item={opt}
            isSelected={selectedName === opt.name}
            onSelect={() => onSelect(selectedName === opt.name ? null : opt.name)}
            onViewMore={() => onViewMore(opt)}
          />
        ))}
      </div>
    </div>
  );
}

// --- HandleOptionsSection (3 visible, 더보기 reveals 4+) ---
function HandleOptionsSection({
  items,
  selectedName,
  onSelect,
}: {
  items: typeof HANDLE_OPTIONS;
  selectedName: string | null;
  onSelect: (name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const initialCount = 3;
  const visibleItems = expanded ? items : items.slice(0, initialCount);
  const hasMore = items.length > initialCount;

  return (
    <div className="window-pricing-opt-section">
      <div className="window-pricing-handle-grid">
        {visibleItems.map((opt) => (
          <button
            key={opt.name}
            type="button"
            className={`window-pricing-handle-card ${selectedName === opt.name ? 'selected' : ''}`}
            onClick={() => onSelect(opt.name)}
          >
            <div className="window-pricing-handle-card-thumb-wrap">
              <img src={opt.thumbnail} alt={opt.name} />
              {opt.isDefault && (
                <span className="window-pricing-opt-badge">기본</span>
              )}
            </div>
            <span className="window-pricing-handle-card-label">{opt.name}</span>
          </button>
        ))}
      </div>
      {hasMore && !expanded && (
        <button
          type="button"
          className="window-pricing-handle-more"
          onClick={() => setExpanded(true)}
        >
          더보기
        </button>
      )}
      <p className="window-pricing-opt-footnote">{HANDLE_SPEC.note}</p>
    </div>
  );
}

// --- FunctionalOptionsSection (circular thumbs) ---
function FunctionalOptionsSection({
  items,
  selectedName,
  onSelect,
}: {
  items: typeof FUNCTIONAL_OPTIONS;
  selectedName: string | null;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="window-pricing-opt-section">
      <div className="window-pricing-handle-grid">
        {items.map((opt) => (
          <button
            key={opt.name}
            type="button"
            className={`window-pricing-handle-card ${selectedName === opt.name ? 'selected' : ''}`}
            onClick={() => onSelect(opt.name)}
          >
            <div className="window-pricing-handle-card-thumb-wrap">
              <img src={opt.thumbnail} alt={opt.name} />
              {opt.isDefault && (
                <span className="window-pricing-opt-badge">기본</span>
              )}
            </div>
            <span className="window-pricing-handle-card-label">{opt.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// --- ExtraOptionsSection (circular grid, multi-select toggle, like image) ---
function ExtraOptionsSection({
  items,
  selectedNames,
  onToggle,
}: {
  items: typeof EXTRA_OPTIONS;
  selectedNames: string[];
  onToggle: (name: string) => void;
}) {
  return (
    <div className="window-pricing-opt-section">
      <p className="window-pricing-opt-subheader">현장 상황에 따라 필요 시 추가</p>
      <div className="window-pricing-extra-grid">
        {items.map((opt) => (
          <button
            key={opt.name}
            type="button"
            className={`window-pricing-extra-card ${selectedNames.includes(opt.name) ? 'selected' : ''}`}
            onClick={() => onToggle(opt.name)}
          >
            <div className="window-pricing-extra-card-thumb" />
            <span className="window-pricing-extra-card-label">{opt.name}</span>
            <span className="window-pricing-extra-card-price">{opt.priceModifier}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// --- SpecBlock ---
function SpecBlock({ default: def, note }: { default: string; note?: string }) {
  return (
    <div className="window-pricing-spec">
      <span className="spec-default">{def}</span>
      {note && <span className="spec-note">{note}</span>}
    </div>
  );
}

// --- ModalDetailTable (for overlay) ---
function ModalDetailTable({ products, title }: { products: WindowProduct[]; title: string }) {
  return (
    <div className="window-pricing-modal-table-section">
      <h4 className="window-pricing-modal-table-title">{title}</h4>
      <div className="window-pricing-modal-table-wrap">
        <table className="window-pricing-modal-table">
          <thead>
            <tr>
              {TABLE_COLS.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((row, idx) => (
              <tr key={row.index} className={idx % 2 === 1 ? 'alt' : ''}>
                <td className="no-cell">
                  <span
                    className="no-badge"
                    style={{ background: NO_COLORS[(row.index - 1) % NO_COLORS.length] }}
                  >
                    {row.index}
                  </span>
                </td>
                <td>{row.location}</td>
                <td>{row.productName}</td>
                <td>{row.frame}</td>
                <td>{row.type}</td>
                <td>{row.glassThickness}</td>
                <td>{row.glassSpec}</td>
                <td>{row.w}</td>
                <td>{row.h}</td>
                <td>{row.form}</td>
                <td>{row.mosquitoScreen}</td>
                <td>{row.handle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- DetailModal ---
function DetailModal({
  isOpen,
  onClose,
  sizes,
  selectedKey,
  onSizeChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  sizes: ApartmentSizeData[];
  selectedKey: ApartmentSizeKey;
  onSizeChange: (k: ApartmentSizeKey) => void;
}) {
  if (!isOpen) return null;
  const data = sizes.find((d) => d.key === selectedKey) ?? sizes[0];
  return (
    <div className="window-pricing-modal-overlay" onClick={onClose}>
      <div className="window-pricing-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="window-pricing-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="window-pricing-modal-header">
          <h2 className="window-pricing-modal-title">상세 창호표</h2>
          <div className="window-pricing-modal-size-tabs">
            {sizes.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`window-pricing-modal-size-tab ${s.key === selectedKey ? 'active' : ''}`}
                onClick={() => onSizeChange(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="window-pricing-modal-body">
          <div className="window-pricing-modal-composition">
            <img src={FLOOR_PLAN_IMAGES[data.key]} alt={`아파트 평면도 (${data.label})`} />
          </div>
          <ModalDetailTable products={data.fullWindowProducts} title={`${data.label} 전체창`} />
          <ModalDetailTable products={data.externalWindowProducts} title={`${data.label} 외부창`} />
        </div>
      </div>
    </div>
  );
}

// --- Main component ---
export default function WindowPricingShowcase() {
  const [selectedSize, setSelectedSize] = useState<ApartmentSizeKey>('40');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSize, setModalSize] = useState<ApartmentSizeKey>('40');
  const [selectedColor, setSelectedColor] = useState<string | null>('White');
  const [selectedDoor, setSelectedDoor] = useState<string | null>('없음');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [selectedHandle, setSelectedHandle] = useState<string | null>('리네아핸들');
  const [selectedFunctional, setSelectedFunctional] = useState<string | null>('클린범퍼');
  const [doorModalOption, setDoorModalOption] = useState<DoorOption | null>(null);
  const [panelExpanded, setPanelExpanded] = useState(false);

  const currentData = useMemo(
    () => APARTMENT_SIZE_DATA.find((d) => d.key === selectedSize) ?? APARTMENT_SIZE_DATA[2],
    [selectedSize]
  );

  const optionTotal = useMemo(() => {
    let total = 0;
    const colorOpt = COLOR_OPTIONS.find((c) => c.name === selectedColor);
    if (colorOpt) total += colorOpt.priceValue;
    const doorOpt = DOOR_OPTIONS.find((d) => d.name === selectedDoor);
    if (doorOpt) total += doorOpt.priceValue;
    selectedExtras.forEach((name) => {
      const opt = EXTRA_OPTIONS.find((e) => e.name === name);
      if (opt) total += opt.priceValue;
    });
    return total;
  }, [selectedColor, selectedDoor, selectedExtras]);

  const externalTotal = currentData.externalPrice + optionTotal;
  const fullTotal = currentData.fullPrice + optionTotal;

  const onSizeSelect = useCallback((k: ApartmentSizeKey) => setSelectedSize(k), []);

  const onExtraToggle = useCallback((name: string) => {
    setSelectedExtras((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }, []);

  const openModal = useCallback(() => {
    setModalSize(selectedSize);
    setModalOpen(true);
  }, [selectedSize]);

  const closeModal = useCallback(() => setModalOpen(false), []);

  return (
    <div className={`window-pricing-showcase ${panelExpanded ? 'panel-expanded' : ''}`}>
      {/* Left: Hero image + backdrop when expanded */}
      <div
        className="window-pricing-hero"
        onClick={panelExpanded ? () => setPanelExpanded(false) : undefined}
      >
        <div className="window-pricing-hero-image" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <HeroBadge externalTotal={externalTotal} fullTotal={fullTotal} />
        {panelExpanded && <div className="window-pricing-hero-backdrop" aria-hidden />}
      </div>

      {/* Right: Sticky panel */}
      <aside className="window-pricing-panel">
        <button
          type="button"
          className="window-pricing-panel-grip"
          onClick={() => setPanelExpanded(true)}
          aria-label="패널 확장"
          title="당기면 패널 확장"
        >
          <span className="window-pricing-panel-grip-icon">⋯</span>
        </button>
        <div className="window-pricing-panel-scroll">
          <h1 className="window-pricing-title">{WINDOW_PRICING_TITLE}</h1>
          <p className="window-pricing-subtitle">{WINDOW_PRICING_SUBTITLE}</p>

          <PricingSummary
            externalPrice={externalTotal}
            fullPrice={fullTotal}
          />

          <SizeTabs sizes={APARTMENT_SIZE_DATA} selectedKey={selectedSize} onSelect={onSizeSelect} />

          {/* Product composition */}
          <div className="window-pricing-composition">
            <h4 className="window-pricing-section-title">제품구성</h4>
            <div className="window-pricing-composition-image">
              <img src={FLOOR_PLAN_IMAGES[selectedSize]} alt={`아파트 평면도 (${currentData.label})`} />
            </div>
          </div>

          <ProductTable products={currentData.fullWindowProducts} title={`${currentData.label} 전체창`} />
          <ProductTable products={currentData.externalWindowProducts} title={`${currentData.label} 외부창`} />

          <div className="window-pricing-divider" />

          <h4 className="window-pricing-section-title centered">컬러 옵션</h4>
          <ColorOptionsSection
            items={COLOR_OPTIONS}
            selectedName={selectedColor}
            onSelect={setSelectedColor}
          />

          <div className="window-pricing-divider" />

          <h4 className="window-pricing-section-title centered">유리 사양</h4>
          <GlassSpecSection
            default={GLASS_SPEC.default}
            hex={GLASS_SPEC.hex}
            note={GLASS_SPEC.note}
          />

          <div className="window-pricing-divider" />

          <h4 className="window-pricing-section-title centered">도어 옵션</h4>
          <DoorOptionsSection
            items={DOOR_OPTIONS}
            selectedName={selectedDoor}
            onSelect={setSelectedDoor}
            subHeader="프레임 두께 22mm, 강화유리 5T"
            onViewMore={setDoorModalOption}
          />
          <DoorDetailModal
            option={doorModalOption}
            isOpen={!!doorModalOption}
            onClose={() => setDoorModalOption(null)}
          />

          <div className="window-pricing-divider" />

          <h4 className="window-pricing-section-title centered">핸들</h4>
          <HandleOptionsSection
            items={HANDLE_OPTIONS}
            selectedName={selectedHandle}
            onSelect={setSelectedHandle}
          />

          <div className="window-pricing-divider" />

          <h4 className="window-pricing-section-title">방충망</h4>
          <div className="window-pricing-spec">
            <span className="spec-default">{MOSQUITO_SCREEN.join(' / ')}</span>
          </div>

          <div className="window-pricing-divider" />

          <h4 className="window-pricing-section-title centered">기능성 부자재</h4>
          <FunctionalOptionsSection
            items={FUNCTIONAL_OPTIONS}
            selectedName={selectedFunctional}
            onSelect={setSelectedFunctional}
          />

          <div className="window-pricing-divider" />

          <h4 className="window-pricing-section-title centered">추가 옵션</h4>
          <ExtraOptionsSection
            items={EXTRA_OPTIONS}
            selectedNames={selectedExtras}
            onToggle={onExtraToggle}
          />

          <p className="window-pricing-bottom-note">{BOTTOM_NOTE}</p>

          <button type="button" className="window-pricing-cta window-pricing-cta-primary">
            최종 견적 보기
          </button>

          <a
            href="https://accounts.kakao.com/login/?continue=https%3A%2F%2Fpf.kakao.com%2F_gvlGG%2Fchat%3Fapi_ver%3D1.1%26kakao_agent%3Dsdk%252F2.5.0%2520os%252Fjavascript%2520sdk_type%252Fjavascript%2520lang%252Fko-KR%2520device%252FMacIntel%2520origin%252Fhttps%25253A%25252F%25252Fwww.pnswindow.co.kr%26app_key%3Df34b1ee4e3e3fd04ef97563bcb8868a6%26referer%3Dhttps%253A%252F%252Fwww.pnswindow.co.kr%252Fhtml%252F01_product%252Fp_order.php#login"
            target="_blank"
            rel="noopener noreferrer"
            className="window-pricing-cta window-pricing-cta-kakao"
          >
            <span className="window-pricing-kakao-icon" aria-hidden>💬</span>
            카카오 상담
          </a>

          <button type="button" className="window-pricing-detail-btn" onClick={openModal}>
            상세 창호표 보기
          </button>
        </div>
      </aside>

      <DetailModal
        isOpen={modalOpen}
        onClose={closeModal}
        sizes={APARTMENT_SIZE_DATA}
        selectedKey={modalSize}
        onSizeChange={setModalSize}
      />
    </div>
  );
}
