import React from 'react';
import { Stack, Box, Button } from '@mui/material';
import WindowIcon from '@mui/icons-material/Window';
import DoorIcon from '@mui/icons-material/DoorFront';
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
							<Button className={'hero-cta-btn'} onClick={() => router.push('/property')}>
								<WindowIcon className={'cta-icon'} /> {t('Windows')}
							</Button>
							<Button className={'hero-cta-btn'} onClick={() => router.push('/configurator')}>
								<DoorIcon className={'cta-icon'} /> {t('Doors')}
							</Button>
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
						<Button className={'hero-cta-btn'} onClick={() => router.push('/property')}>
							<WindowIcon className={'cta-icon'} /> {t('Windows')}
						</Button>
						<Button className={'hero-cta-btn'} onClick={() => router.push('/configurator')}>
							<DoorIcon className={'cta-icon'} /> {t('Doors')}
						</Button>
					</Box>
				</Box>
			</Stack>
		</Stack>
	);
};

export default HeroSection;

