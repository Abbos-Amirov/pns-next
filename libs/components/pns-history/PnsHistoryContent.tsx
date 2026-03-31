import React from 'react';
import { useTranslation } from 'next-i18next';
import { PNS_HISTORY_YEARS } from '../../data/pnsHistoryYears';

type NewsItem = {
	metaKey: 'PnsHistoryNews1Meta' | 'PnsHistoryNews2Meta';
	titleKey: 'PnsHistoryNews1Title' | 'PnsHistoryNews2Title';
	bodyKey: 'PnsHistoryNews1Body' | 'PnsHistoryNews2Body';
	href: string;
};

const NEWS: NewsItem[] = [
	{
		metaKey: 'PnsHistoryNews1Meta',
		titleKey: 'PnsHistoryNews1Title',
		bodyKey: 'PnsHistoryNews1Body',
		href: 'https://www.mk.co.kr/news/business/5942109',
	},
	{
		metaKey: 'PnsHistoryNews2Meta',
		titleKey: 'PnsHistoryNews2Title',
		bodyKey: 'PnsHistoryNews2Body',
		href: 'https://www.chemlocus.co.kr/search/index?kw=pns',
	},
];

const PnsHistoryContent: React.FC = () => {
	const { t, i18n } = useTranslation('common');

	const linesForYear = (year: number): string[] => {
		const key = `PnsHistoryYear${year}`;
		// Massivlar ba'zan faqat `t(returnObjects)` bilan emas, to'g'ridan-to'g'ri resursdan o'qilishi kerak
		const bundle = i18n.getResourceBundle(i18n.language, 'common') as Record<string, unknown> | undefined;
		const fromBundle = bundle?.[key];
		if (Array.isArray(fromBundle)) {
			return fromBundle as string[];
		}
		const raw = t(key, { returnObjects: true });
		return Array.isArray(raw) ? (raw as string[]) : [];
	};

	return (
		<div className="pns-history-page" data-pns-history>
			<div className="pns-history-hero">
				<h1 className="pns-history-hero-title">{t('PnsHistoryPageTitle')}</h1>
				<p className="pns-history-hero-subtitle">{t('PnsHistoryPageSubtitle')}</p>
			</div>

			<div className="pns-history-timeline-wrap">
				<div className="pns-history-timeline">
					{PNS_HISTORY_YEARS.map((year) => {
						const lines = linesForYear(year);
						return (
							<div className="pns-history-year-block" key={year}>
								<span className="pns-history-year-label">{year}</span>
								<div className="pns-history-rail" aria-hidden />
								<ul className="pns-history-events">
									{lines.map((line, idx) => (
										<li key={`${year}-${idx}`} className="pns-history-event-line">
											{line}
										</li>
									))}
								</ul>
							</div>
						);
					})}
				</div>
			</div>

			<div className="pns-history-news-section">
				<h2 className="pns-history-news-heading">{t('PnsHistoryNewsSectionTitle')}</h2>
				<div className="pns-history-news-grid">
					{NEWS.map((item) => (
						<div key={item.href} className="pns-history-news-card">
							<p className="pns-history-news-meta">{t(item.metaKey)}</p>
							<a
								href={item.href}
								target="_blank"
								rel="noopener noreferrer"
								className="pns-history-news-title-link"
							>
								{t(item.titleKey)}
							</a>
							<p className="pns-history-news-body">{t(item.bodyKey)}</p>
							<a href={item.href} target="_blank" rel="noopener noreferrer" className="pns-history-news-more">
								{t('PnsHistoryNewsMore')}
							</a>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default PnsHistoryContent;
