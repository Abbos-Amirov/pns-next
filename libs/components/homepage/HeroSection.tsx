import React from 'react';
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

	if (device === 'mobile') {
		return (
			<Stack className={'hero-section premium-hero mobile'}>
				<Box component={'div'} className={'hero-bg-image'} />
				<Box component={'div'} className={'hero-overlay'} />
				<Stack className={'container'}>
					<Box component={'div'} className={'hero-content'}>
						<Box component={'h1'} className={'hero-title'}>
							{t('Live your view')}
						</Box>
						<Box component={'p'} className={'hero-description'}>
							{t('Explore our products')}
						</Box>
						<Box component={'div'} className={'hero-cta-block'}>
							<Button className={'hero-cta-btn'} onClick={() => router.push('/property/window')}>
								<WindowIcon className={'cta-icon'} /> {t('Windows')}
							</Button>
							<Button className={'hero-cta-btn'} onClick={() => router.push('/property/door')}>
								<DoorIcon className={'cta-icon'} /> {t('Doors')}
							</Button>
							<Button className={'hero-cta-btn'} onClick={() => router.push('/configurator')}>
								<DesignServicesIcon className={'cta-icon'} /> {t('UyDizayneri')}
							</Button>
						</Box>
						<Box
							component={'div'}
							className={'hero-configurator-mini'}
							onClick={() => router.push('/configurator')}
							role="button"
							tabIndex={0}
							onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') router.push('/configurator'); }}
						>
							<div className={'hero-configurator-mini-bg'} style={{ backgroundImage: 'url(/img/configurator/hero-1.png)' }} />
							<div className={'hero-configurator-mini-overlay'} />
							<span className={'hero-configurator-mini-label'}>{t('Configurator')} →</span>
						</Box>
					</Box>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className={'hero-section premium-hero'}>
			<Box component={'div'} className={'hero-bg-image'} />
			<Box component={'div'} className={'hero-overlay'} />
			<Stack className={'container'}>
				<Box component={'div'} className={'hero-content'}>
					<Box component={'h1'} className={'hero-title'}>
						{t('Live your view')}
					</Box>
					<Box component={'p'} className={'hero-description'}>
						{t('Explore our products')}
					</Box>
					<Box component={'div'} className={'hero-cta-block'}>
						<Button className={'hero-cta-btn'} onClick={() => router.push('/property/window')}>
							<WindowIcon className={'cta-icon'} /> {t('Windows')}
						</Button>
						<Button className={'hero-cta-btn'} onClick={() => router.push('/property/door')}>
							<DoorIcon className={'cta-icon'} /> {t('Doors')}
						</Button>
						<Button className={'hero-cta-btn'} onClick={() => router.push('/configurator')}>
							<DesignServicesIcon className={'cta-icon'} /> {t('UyDizayneri')}
						</Button>
					</Box>
					
				</Box>
			</Stack>
		</Stack>
	);
};

export default HeroSection;

