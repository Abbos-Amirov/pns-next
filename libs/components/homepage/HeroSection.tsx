import React, { useEffect, useState } from 'react';
import { Stack, Box, Button } from '@mui/material';
import WindowIcon from '@mui/icons-material/Window';
import DoorIcon from '@mui/icons-material/DoorFront';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

const HeroSection = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const router = useRouter();
	const [heroReady, setHeroReady] = useState(false);

	useEffect(() => {
		const id = window.setTimeout(() => setHeroReady(true), 60);
		return () => window.clearTimeout(id);
	}, []);

	const rootClass =
		device === 'mobile'
			? `hero-section premium-hero mobile${heroReady ? ' hero-ready' : ''}`
			: `hero-section premium-hero${heroReady ? ' hero-ready' : ''}`;

	const mobileConfigurator = (
		<Box
			component={'div'}
			className={'hero-configurator-mini hero-animate hero-animate--rise'}
			onClick={() => router.push('/configurator')}
			role="button"
			tabIndex={0}
			onKeyDown={(e: React.KeyboardEvent) => {
				if (e.key === 'Enter') router.push('/configurator');
			}}
		>
			<div className={'hero-configurator-mini-bg'} style={{ backgroundImage: 'url(/img/configurator/hero-1.png)' }} />
			<div className={'hero-configurator-mini-overlay'} />
			<span className={'hero-configurator-mini-label'}>{t('Configurator')} →</span>
		</Box>
	);

	const heroInner = (
		<Box component={'div'} className={'hero-content'}>
			<Box component={'h1'} className={'hero-title hero-animate hero-animate--from-left'}>
				{t('Live your view')}
			</Box>
			<Box component={'p'} className={'hero-description hero-animate hero-animate--from-right'}>
				{t('Explore our products')}
			</Box>
			<Box component={'div'} className={'hero-cta-block'}>
				<span className={'hero-cta-item hero-animate hero-animate--from-left'}>
					<Button className={'hero-cta-btn'} onClick={() => router.push('/property/window')}>
						<WindowIcon className={'cta-icon'} /> {t('Windows')}
					</Button>
				</span>
				<span className={'hero-cta-item hero-animate hero-animate--rise'}>
					<Button className={'hero-cta-btn'} onClick={() => router.push('/property/door')}>
						<DoorIcon className={'cta-icon'} /> {t('Doors')}
					</Button>
				</span>
				<span className={'hero-cta-item hero-animate hero-animate--from-right'}>
					<Button className={'hero-cta-btn'} onClick={() => router.push('/configurator')}>
						<DesignServicesIcon className={'cta-icon'} /> {t('UyDizayneri')}
					</Button>
				</span>
			</Box>
			{device === 'mobile' ? mobileConfigurator : null}
		</Box>
	);

	return (
		<Stack className={rootClass}>
			<Box component={'div'} className={'hero-bg-image'} />
			<Box component={'div'} className={'hero-overlay'} />
			<Stack className={'container'}>
				{heroInner}
			</Stack>
		</Stack>
	);
};

export default HeroSection;
