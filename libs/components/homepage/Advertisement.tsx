import React from 'react';
import { Stack } from '@mui/material';

const Advertisement = () => {
	// Deraza va eshiklar mavzusiga mos video - loyihada mavjud
	const videoSrc = '/video/windows.mp4';

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
				<source src={videoSrc} type="video/mp4" />
			</video>
		</Stack>
	);
};

export default Advertisement;
