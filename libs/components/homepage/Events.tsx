import React from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface EventData {
	eventTitle: string;
	category: string;
	description: string;
	imageSrc: string;
}
const eventsData: EventData[] = [
	{
		eventTitle: 'Curved Facade & LED Line Showcase',
		category: 'FACADE',
		description:
			'See sleek curved aluminum frames, full‑height glazing, and clean LED details—built for premium modern exteriors.',
		imageSrc: '/img/events/bino1.jpg',
	},
	{
		eventTitle: 'Glass Room / Winter Garden Systems',
		category: 'GLASS ROOM',
		description:
			'Panoramic sliding walls and a skylight roof concept—perfect for terrace glass rooms and year‑round comfort builds.',
		imageSrc: '/img/events/bino4.jpg',
	},
	{
		eventTitle: 'Panoramic Sliding & Balcony Solutions',
		category: 'SLIDING',
		description:
			'Wide‑span sliding doors, rounded balcony glazing, and warm facade lighting—designed for elegant, open living spaces.',
		imageSrc: '/img/events/bino3.jpg',
	},
	{
		eventTitle: 'Arched Windows & Entry Door Collection',
		category: 'ARCH',
		description:
			'Classic arches with modern performance—custom curved frames, tall statement glass, and a clean insulated entry door look.',
		imageSrc: '/img/events/bino2.jpg',
	},
];

const EventCard = ({ event }: { event: EventData }) => {
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
			<Box component={'div'} className={'info'}>
				<strong>{event?.category}</strong>
				<span>{event?.eventTitle}</span>
			</Box>
			<Box component={'div'} className={'more'}>
				<span>{event?.description}</span>
			</Box>
		</Stack>
	);
};

const Events = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		// Not used on mobile home right now, but kept consistent
		return (
			<Stack className={'events'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span className={'white'}>
								Door &amp; Window <span className={'accent'}>Events</span>
							</span>
							<p className={'white'}>Workshops & showcases for doors and windows—curated for pros.</p>
						</Box>
					</Stack>
					<Stack className={'card-wrapper'}>
						{eventsData.map((event: EventData) => (
							<EventCard event={event} key={event?.eventTitle} />
						))}
					</Stack>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className={'events'}>
			<Stack className={'container'}>
				<Stack className={'info-box'}>
					<Box component={'div'} className={'left'}>
						<span className={'white'}>
							Door &amp; Window <span className={'accent'}>Events</span>
						</span>
						<p className={'white'}>Workshops & showcases for doors and windows—curated for pros.</p>
					</Box>
				</Stack>
				<Stack className={'card-wrapper'}>
					{eventsData.map((event: EventData) => (
						<EventCard event={event} key={event?.eventTitle} />
					))}
				</Stack>
			</Stack>
		</Stack>
	);
};

export default Events;
