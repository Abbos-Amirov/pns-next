import React, { useCallback, useMemo, useState } from 'react';
import {
  APARTMENT_SIZE_DATA,
  BOTTOM_NOTE,
  COLOR_OPTIONS,
  DOOR_OPTIONS,
  EXTRA_OPTIONS,
  GLASS_SPEC,
  HANDLE_SPEC,
  MOSQUITO_SCREEN,
  FUNCTIONAL_MATERIAL,
  PRICE_NOTICE,
  VAT_NOTE,
  WINDOW_PRICING_SUBTITLE,
  WINDOW_PRICING_TITLE,
} from './data/windowPricingData';
import type { ApartmentSizeData, ApartmentSizeKey, WindowProduct } from './data/windowPricingData';

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
  return n.toLocaleString('ko-KR');
};

const FLOOR_PLAN_IMAGES: Record<ApartmentSizeKey, string> = {
  '20': '/img/configurator/20pyon.png',
  '30': '/img/configurator/30pyon.png',
  '40': '/img/configurator/40pyon.png',
  '50': '/img/configurator/50pyon.png',
};

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

// --- PricingSummary ---
function PricingSummary({
  externalPrice,
  fullPrice,
}: {
  externalPrice: number;
  fullPrice: number;
}) {
  return (
    <div className="window-pricing-summary">
      <div className="window-pricing-price-row">
        <span className="label">외부창 기준</span>
        <span className="value">{formatPrice(externalPrice)} 원</span>
      </div>
      <div className="window-pricing-price-row">
        <span className="label">전체창 기준</span>
        <span className="value">{formatPrice(fullPrice)} 원</span>
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

// --- OptionsList ---
function OptionsList({ items }: { items: { name: string; priceModifier: string }[] }) {
  return (
    <div className="window-pricing-options-inner">
      {items.map((opt) => (
        <div key={opt.name} className="window-pricing-opt-row">
          <span>{opt.name}</span>
          <span>{opt.priceModifier}</span>
        </div>
      ))}
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

  const currentData = useMemo(
    () => APARTMENT_SIZE_DATA.find((d) => d.key === selectedSize) ?? APARTMENT_SIZE_DATA[2],
    [selectedSize]
  );

  const onSizeSelect = useCallback((k: ApartmentSizeKey) => setSelectedSize(k), []);

  const openModal = useCallback(() => {
    setModalSize(selectedSize);
    setModalOpen(true);
  }, [selectedSize]);

  const closeModal = useCallback(() => setModalOpen(false), []);

  return (
    <div className="window-pricing-showcase">
      {/* Left: Hero image */}
      <div className="window-pricing-hero">
        <div className="window-pricing-hero-image" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="window-pricing-hero-badge">
          <div className="window-pricing-hero-badge-row">
            <span>외부창 기준</span>
            <strong>{formatPrice(currentData.externalPrice)} 원</strong>
          </div>
          <div className="window-pricing-hero-badge-row">
            <span>전체창 기준</span>
            <strong>{formatPrice(currentData.fullPrice)} 원</strong>
          </div>
        </div>
      </div>

      {/* Right: Sticky panel */}
      <aside className="window-pricing-panel">
        <div className="window-pricing-panel-scroll">
          <h1 className="window-pricing-title">{WINDOW_PRICING_TITLE}</h1>
          <p className="window-pricing-subtitle">{WINDOW_PRICING_SUBTITLE}</p>

          <PricingSummary
            externalPrice={currentData.externalPrice}
            fullPrice={currentData.fullPrice}
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

          <h4 className="window-pricing-section-title">컬러 옵션</h4>
          <OptionsList items={COLOR_OPTIONS} />

          <div className="window-pricing-divider" />

          <h4 className="window-pricing-section-title">유리 사양</h4>
          <SpecBlock default={GLASS_SPEC.default} note={GLASS_SPEC.note} />

          <div className="window-pricing-divider" />

          <h4 className="window-pricing-section-title">도어 옵션</h4>
          <OptionsList items={DOOR_OPTIONS} />

          <div className="window-pricing-divider" />

          <h4 className="window-pricing-section-title">핸들</h4>
          <SpecBlock default={HANDLE_SPEC.default} note={HANDLE_SPEC.note} />

          <div className="window-pricing-divider" />

          <h4 className="window-pricing-section-title">방충망</h4>
          <div className="window-pricing-spec">
            <span className="spec-default">{MOSQUITO_SCREEN.join(' / ')}</span>
          </div>

          <div className="window-pricing-divider" />

          <h4 className="window-pricing-section-title">기능 부자재</h4>
          <SpecBlock default={FUNCTIONAL_MATERIAL} />

          <div className="window-pricing-divider" />

          <h4 className="window-pricing-section-title">추가 옵션</h4>
          <OptionsList items={EXTRA_OPTIONS} />

          <p className="window-pricing-bottom-note">{BOTTOM_NOTE}</p>

          <button type="button" className="window-pricing-cta">
            상담 및 견적 문의
          </button>

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
