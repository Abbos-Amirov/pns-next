import React from 'react';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';

interface EventData {
	titleKey: string;
	categoryKey: string;
	descKey: string;
	imageSrc: string;
}
const eventsData: EventData[] = [
	{ titleKey: 'Event1Title', categoryKey: 'Event1Category', descKey: 'Event1Desc', imageSrc: '/img/events/bino1.jpg' },
	{ titleKey: 'Event2Title', categoryKey: 'Event2Category', descKey: 'Event2Desc', imageSrc: '/img/events/bino4.jpg' },
	{ titleKey: 'Event3Title', categoryKey: 'Event3Category', descKey: 'Event3Desc', imageSrc: '/img/events/bino3.jpg' },
	{ titleKey: 'Event4Title', categoryKey: 'Event4Category', descKey: 'Event4Desc', imageSrc: '/img/events/bino2.jpg' },
];

const EventCard = ({ event, t }: { event: EventData; t: (key: string) => string }) => {
	return (
		<Stack
			className="event-card"
			role="article"
			style={{
				backgroundImage: `url(${event?.imageSrc})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
			}}
		>
			<div className={'info'}>
				<strong>{t(event?.categoryKey)}</strong>
				<span>{t(event?.titleKey)}</span>
			</div>
			<div className={'more'}>
				<span>{t(event?.descKey)}</span>
			</div>
		</Stack>
	);
};

const Events = () => {
	const { t } = useTranslation('common');

	return (
		<Stack className={'events'}>
			<Stack className={'container'}>
				<Stack className={'info-box'}>
					<div className={'left'}>
						<span className={'white'}>
							{t('Door & Window')} <span className={'accent'}>{t('Events')}</span>
						</span>
						<p className={'white'}>{t('EventsSubtitle')}</p>
					</div>
				</Stack>
				<Stack className={'card-wrapper'}>
					{eventsData.map((event: EventData, idx: number) => (
						<EventCard event={event} t={t} key={event?.titleKey + idx} />
					))}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default Events;
