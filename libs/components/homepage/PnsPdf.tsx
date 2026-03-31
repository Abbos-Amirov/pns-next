import React from 'react';
import { useTranslation } from 'next-i18next';

type PdfItem = {
	href: string;
	titleKey: string;
	thumb: string;
};

const PDF_ITEMS: PdfItem[] = [
	{ href: '/pdf/pns/pns-11.pdf', titleKey: 'PnsPdfItem1Title', thumb: '/img/pns-pdf-thumbs/1.png' },
	{ href: '/pdf/pns/pns-brochure-1.pdf', titleKey: 'PnsPdfItem2Title', thumb: '/img/pns-pdf-thumbs/2.png' },
	{ href: '/pdf/pns/pns-garman.pdf', titleKey: 'PnsPdfItem3Title', thumb: '/img/pns-pdf-thumbs/3.png' },
	{ href: '/pdf/pns/pns-2.pdf', titleKey: 'PnsPdfItem4Title', thumb: '/img/pns-pdf-thumbs/4.png' },
	{ href: '/pdf/pns/pns-3.pdf', titleKey: 'PnsPdfItem5Title', thumb: '/img/pns-pdf-thumbs/5.png' },
	{ href: '/pdf/pns/pns-4.pdf', titleKey: 'PnsPdfItem6Title', thumb: '/img/pns-pdf-thumbs/6.png' },
	{ href: '/pdf/pns/pns-5.pdf', titleKey: 'PnsPdfItem7Title', thumb: '/img/pns-pdf-thumbs/7.png' },
	{ href: '/pdf/pns/pns-6.pdf', titleKey: 'PnsPdfItem8Title', thumb: '/img/pns-pdf-thumbs/8.png' },
];

const PnsPdf = () => {
	const { t } = useTranslation('common');

	return (
		<section className="pns-pdf-section">
			<div className="pns-pdf-inner">
				<header className="pns-pdf-header">
					<h2 className="pns-pdf-title">{t('PnsPdfSectionTitle')}</h2>
					<p className="pns-pdf-subtitle">{t('PnsPdfSectionSubtitle')}</p>
					<p className="pns-pdf-desc">{t('PnsPdfSectionDesc')}</p>
				</header>

				<ul className="pns-pdf-gallery" role="list">
					{PDF_ITEMS.map((item) => (
						<li className="pns-pdf-gallery-item" key={item.href}>
							<a
								className="pns-pdf-card"
								href={item.href}
								target="_blank"
								rel="noopener noreferrer"
							>
								<div className="pns-pdf-card-visual">
									<img className="pns-pdf-card-bg" src={item.thumb} alt="" loading="lazy" />
									<div className="pns-pdf-card-scrim" aria-hidden />
									<span className="pns-pdf-card-badge" aria-hidden>
										PDF
									</span>
									<div className="pns-pdf-card-footer">
										<span className="pns-pdf-card-title">{t(item.titleKey)}</span>
										<span className="pns-pdf-card-cta">
											{t('PnsPdfOpenPdf')}
											<span className="pns-pdf-card-link-arrow" aria-hidden>
												↗
											</span>
										</span>
									</div>
								</div>
							</a>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
};

export default PnsPdf;
