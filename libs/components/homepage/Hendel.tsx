import React from 'react';
import { useTranslation } from 'next-i18next';

type HardwareItem = {
	src: string;
	alt: string;
	captionKey: string;
};

const HARDWARE_ITEMS: HardwareItem[] = [
	{
		src: '/img/homepage/hendel/linea-handle.png',
		alt: 'LINEA handle',
		captionKey: 'HardwareShowcaseItem1',
	},
	{
		src: '/img/homepage/hendel/autolock-handle.png',
		alt: 'Auto-locking handle',
		captionKey: 'HardwareShowcaseItem2',
	},
	{
		src: '/img/homepage/hendel/kitchen-window.png',
		alt: 'System kitchen window',
		captionKey: 'HardwareShowcaseItem3',
	},
	{
		src: '/img/homepage/hendel/clean-bumper.png',
		alt: 'Clean bumper',
		captionKey: 'HardwareShowcaseItem4',
	},
	{
		src: '/img/homepage/hendel/easy-open.png',
		alt: 'Easy-open hardware',
		captionKey: 'HardwareShowcaseItem5',
	},
];

const Hendel = () => {
	const { t } = useTranslation('common');
	const topRow = HARDWARE_ITEMS.slice(0, 3);
	const bottomRow = HARDWARE_ITEMS.slice(3, 5);

	return (
		<section className="hardware-showcase-section">
			<div className="hardware-showcase-inner">
				<header className="hardware-showcase-header">
					<h2 className="hardware-showcase-title">{t('HardwareShowcaseTitle')}</h2>
					<p className="hardware-showcase-subtitle">{t('HardwareShowcaseSubtitle')}</p>
				</header>

				<div className="hardware-showcase-rows">
					<div className="hardware-showcase-row hardware-showcase-row--three">
						{topRow.map((item) => (
							<article className="hardware-showcase-card" key={item.captionKey}>
								<div className="hardware-showcase-card-media">
									<img src={item.src} alt={item.alt} className="hardware-showcase-card-img" />
								</div>
								<p className="hardware-showcase-card-caption">{t(item.captionKey)}</p>
							</article>
						))}
					</div>
					<div className="hardware-showcase-row hardware-showcase-row--two">
						{bottomRow.map((item) => (
							<article className="hardware-showcase-card" key={item.captionKey}>
								<div className="hardware-showcase-card-media">
									<img src={item.src} alt={item.alt} className="hardware-showcase-card-img" />
								</div>
								<p className="hardware-showcase-card-caption">{t(item.captionKey)}</p>
							</article>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hendel;
