import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack } from '@mui/material';

const Advertisement = () => {
	const device = useDeviceDetect();

	if (device == 'mobile') {
		return (
			<Stack className={'video-frame'}>
				<video
					autoPlay
					muted
					loop
					playsInline
					preload="auto"
					style={{ width: '100%', height: '100%', objectFit: 'cover' }}
				>
					<source src="https://www.shutterstock.com/ko/video/clip-3495846051-animation-modern-style-white-kitchen-dining-room?trackingId=3dcb1907-6bf1-4f1c-8909-18cd257ec154" type="video/mp4" />
				</video>
			</Stack>
		);
	} else {
		return (
			<Stack className={'video-frame'}>
				<video
					autoPlay
					muted
					loop
					playsInline
					preload="auto"
					style={{ width: '100%', height: '100%', objectFit: 'cover' }}
				>
					<source src="/video/home3.mp4" type="video/mp4" />
				</video>
			</Stack>
		);
	}
};

export default Advertisement;
