import React from 'react';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';

const DARK_BLUE = '#1a237e';
const LIGHT_BLUE = '#42a5f5';

const ICON_SIZE = 96;

const windows = [
	{
		nameKey: 'Picture',
		icon: (
			<svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect x="16" y="12" width="32" height="40" rx="2" stroke={DARK_BLUE} strokeWidth="2" fill="none" />
			</svg>
		),
	},
	{
		nameKey: 'Casement',
		icon: (
			<svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M16 12 L16 52 L32 52 L36 48 L52 48 L52 12 L16 12 Z" stroke={DARK_BLUE} strokeWidth="2" fill="none" />
				<path d="M16 32 L20 32" stroke={LIGHT_BLUE} strokeWidth="1.5" />
				<path d="M48 30 L48 34" stroke={LIGHT_BLUE} strokeWidth="1.5" />
			</svg>
		),
	},
	{
		nameKey: 'Awning',
		icon: (
			<svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M12 36 L12 20 L52 20 L52 36 L12 36 Z" stroke={DARK_BLUE} strokeWidth="2" fill="none" />
				<path d="M12 36 L16 32 L48 32 L52 36" stroke={DARK_BLUE} strokeWidth="2" fill="none" />
				<path d="M32 32 L32 36" stroke={LIGHT_BLUE} strokeWidth="1.5" />
			</svg>
		),
	},
	{
		nameKey: 'Horizontal Sliding',
		icon: (
			<svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect x="12" y="16" width="40" height="32" rx="2" stroke={DARK_BLUE} strokeWidth="2" fill="none" />
				<path d="M32 16 L32 48" stroke={LIGHT_BLUE} strokeWidth="1.5" />
				<path d="M48 30 L48 34" stroke={LIGHT_BLUE} strokeWidth="1.5" />
			</svg>
		),
	},
	{
		nameKey: 'Single Hung',
		icon: (
			<svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect x="20" y="8" width="24" height="48" rx="2" stroke={DARK_BLUE} strokeWidth="2" fill="none" />
				<path d="M20 32 L44 32" stroke={LIGHT_BLUE} strokeWidth="1.5" />
				<path d="M32 32 L32 48" stroke={LIGHT_BLUE} strokeWidth="1.5" />
			</svg>
		),
	},
	{
		nameKey: 'Double Hung',
		icon: (
			<svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect x="20" y="8" width="24" height="48" rx="2" stroke={DARK_BLUE} strokeWidth="2" fill="none" />
				<path d="M20 24 L44 24" stroke={LIGHT_BLUE} strokeWidth="1.5" />
				<path d="M20 40 L44 40" stroke={LIGHT_BLUE} strokeWidth="1.5" />
				<path d="M32 24 L32 40" stroke={LIGHT_BLUE} strokeWidth="1.5" />
				<path d="M32 8 L32 20" stroke={LIGHT_BLUE} strokeWidth="1.5" />
				<path d="M32 44 L32 56" stroke={LIGHT_BLUE} strokeWidth="1.5" />
			</svg>
		),
	},
];

const doors = [
	{
		nameKey: 'Patio Sliding',
		icon: (
			<svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect x="12" y="8" width="40" height="48" rx="2" stroke={DARK_BLUE} strokeWidth="2" fill="none" />
				<path d="M32 8 L32 56" stroke={LIGHT_BLUE} strokeWidth="1.5" />
				<path d="M48 28 L48 36" stroke={LIGHT_BLUE} strokeWidth="1.5" />
			</svg>
		),
	},
	{
		nameKey: 'French Swing',
		icon: (
			<svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M12 8 L12 56 L28 56 L30 54 L34 54 L36 56 L52 56 L52 8 L12 8 Z" stroke={DARK_BLUE} strokeWidth="2" fill="none" />
				<path d="M32 8 L32 56" stroke={DARK_BLUE} strokeWidth="2" />
				<path d="M28 30 L28 34" stroke={LIGHT_BLUE} strokeWidth="1.5" />
				<path d="M36 30 L36 34" stroke={LIGHT_BLUE} strokeWidth="1.5" />
			</svg>
		),
	},
	{
		nameKey: 'Multiple Sliding',
		icon: (
			<svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect x="8" y="16" width="48" height="32" rx="2" stroke={DARK_BLUE} strokeWidth="2" fill="none" />
				<path d="M14 16 L14 48" stroke={LIGHT_BLUE} strokeWidth="1" />
				<path d="M22 16 L22 48" stroke={LIGHT_BLUE} strokeWidth="1" />
				<path d="M30 16 L30 48" stroke={LIGHT_BLUE} strokeWidth="1" />
				<path d="M38 16 L38 48" stroke={LIGHT_BLUE} strokeWidth="1" />
				<path d="M46 16 L46 48" stroke={LIGHT_BLUE} strokeWidth="1" />
				<path d="M54 16 L54 48" stroke={LIGHT_BLUE} strokeWidth="1" />
				<path d="M22 24 L22 28" stroke={LIGHT_BLUE} strokeWidth="1.5" />
				<path d="M54 24 L54 28" stroke={LIGHT_BLUE} strokeWidth="1.5" />
			</svg>
		),
	},
	{
		nameKey: 'Multiple Folding',
		icon: (
			<svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M8 16 L8 48 L16 48 L20 44 L24 48 L28 44 L32 48 L36 44 L40 48 L44 44 L48 48 L56 48 L56 16 L8 16 Z" stroke={DARK_BLUE} strokeWidth="2" fill="none" />
				<path d="M16 16 L16 48" stroke={LIGHT_BLUE} strokeWidth="1" />
				<path d="M24 16 L24 48" stroke={LIGHT_BLUE} strokeWidth="1" />
				<path d="M32 16 L32 48" stroke={LIGHT_BLUE} strokeWidth="1" />
				<path d="M40 16 L40 48" stroke={LIGHT_BLUE} strokeWidth="1" />
				<path d="M48 16 L48 48" stroke={LIGHT_BLUE} strokeWidth="1" />
			</svg>
		),
	},
];

interface BrandSectionProps {
	titleKey: string;
	items: { nameKey: string; icon: React.ReactNode }[];
}

const BrandSection = ({ titleKey, items }: BrandSectionProps) => {
	const { t } = useTranslation('common');

	return (
		<div className="brand-category-section">
			<Stack direction="row" alignItems="center" className="brand-section-title">
				<div style={{ display: 'flex', alignItems: 'center', marginRight: 12, position: 'relative', width: 20, height: 20 }}>
					<div
						style={{
							width: 14,
							height: 14,
							backgroundColor: DARK_BLUE,
							borderRadius: '2px',
							position: 'absolute',
							left: 0,
							bottom: 0,
						}}
					/>
					<div
						style={{
							width: 10,
							height: 10,
							backgroundColor: LIGHT_BLUE,
							borderRadius: '2px',
							position: 'absolute',
							left: 8,
							top: 0,
						}}
					/>
				</div>
				<span className="brand-section-title-text">{t(titleKey)}</span>
			</Stack>

			<div className="brand-items-scroll-wrapper">
				<div className="brand-items-row">
					{items.map((item, index) => (
						<div key={index} className="brand-item">
							<div className="brand-item-icon">{item.icon}</div>
							<div className="brand-item-label">{t(item.nameKey)}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

const Brand = () => {
	return (
		<Stack className="brand-section">
			<Stack className="brand-container">
				<BrandSection titleKey="Windows" items={windows} />
				<BrandSection titleKey="Doors" items={doors} />
			</Stack>
		</Stack>
	);
};

export default Brand;
