import React from 'react';
import { useTranslation } from 'next-i18next';

type ProductItem = {
	src: string;
	alt: string;
	/** Model code shown as-is (e.g. BF-120BH) */
	model?: string;
	/** i18n key for localized label (e.g. slim window name) */
	labelKey?: string;
};

const PRODUCT_ITEMS: ProductItem[] = [
	{ model: 'BF-120BH', src: '/img/homepage/window-lineup/bf-120bh.png', alt: 'BF-120BH' },
	{ model: 'BF-225BH', src: '/img/homepage/window-lineup/bf-225bh.png', alt: 'BF-225BH' },
	{ model: 'BF-225WAJH', src: '/img/homepage/window-lineup/bf-225wajh.png', alt: 'BF-225WAJH' },
	{ model: 'BF-250BH', src: '/img/homepage/window-lineup/bf-250bh.png', alt: 'BF-250BH' },
	{ model: 'BF-295BH', src: '/img/homepage/window-lineup/bf-295bh.png', alt: 'BF-295BH' },
	{
		labelKey: 'WindowLineupProductSlimTT',
		src: '/img/homepage/window-lineup/slim-tt-window.png',
		alt: 'Slim T/T window',
	},
];

const Advertisement = () => {
	const { t } = useTranslation('common');

	return (
		<section className="window-lineup-section">
			<div className="window-lineup-inner">
				<header className="window-lineup-header">
					<h2 className="window-lineup-title">{t('WindowLineupTitle')}</h2>
					<p className="window-lineup-subtitle">{t('WindowLineupSubtitle')}</p>
					<p className="window-lineup-desc">{t('WindowLineupDesc')}</p>
				</header>

				<ul className="window-lineup-grid">
					{PRODUCT_ITEMS.map((item) => {
						const label = item.labelKey ? t(item.labelKey) : item.model ?? '';
						const key = item.model ?? item.labelKey ?? item.src;
						return (
							<li className="window-lineup-card" key={key}>
								<div className="window-lineup-card-media">
									<img src={item.src} alt={item.alt} className="window-lineup-card-img" />
								</div>
								<p className="window-lineup-card-label">{label}</p>
							</li>
						);
					})}
				</ul>
			</div>
		</section>
	);
};

export default Advertisement;
