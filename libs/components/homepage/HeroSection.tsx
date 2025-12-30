import React from 'react';
import { Stack, Box, Button, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

const HeroSection = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const router = useRouter();
	const tooltipText = t('Configurator tooltip', {
		defaultValue: "Here you can choose the color that fits your home.",
	});
	const ctaText = t('Get in touch', { defaultValue: 'HOME COLOR' });

	if (device === 'mobile') {
		return (
			<Stack className={'hero-section mobile'}>
				<Stack className={'container'}>
					<Box component={'div'} className={'hero-content'}>
						<Box component={'div'} className={'trusted-badge'}>
							{t('TRUSTED COMPANY')}
						</Box>
						<Box component={'h1'} className={'hero-title'}>
							{t('Create your inspired doors')}
						</Box>
						<Box component={'p'} className={'hero-description'}>
							{t('Hero description')}
						</Box>
						<Tooltip
							title={tooltipText}
							arrow
							placement="top"
							enterDelay={150}
							PopperProps={{
								modifiers: [{ name: 'offset', options: { offset: [0, 10] } }],
							}}
						>
							<span>
								<Button className={'hero-cta-btn'} onClick={() => router.push('/configurator')}>
									{ctaText} <span className="cta-arrow">→</span>
								</Button>
							</span>
						</Tooltip>
					</Box>
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className={'hero-section'}>
			<Stack className={'container'}>
				<Box component={'div'} className={'hero-left'}>
					{/* Placeholder for door/window image */}
					<Box component={'div'} className={'hero-image'}>
						<img src="https://alderferglass.com/wp-content/uploads/2018/12/wdows.jpg" alt="Door" onError={(e) => {
							(e.target as HTMLImageElement).style.display = 'none';
						}} />
					</Box>
				</Box>
				<Box component={'div'} className={'hero-right'}>
					<Box component={'div'} className={'trusted-badge'}>
						{t('TRUSTED COMPANY')}
					</Box>
					<Box component={'h1'} className={'hero-title'}>
						{t('Create your inspired doors')}
					</Box>
					<Box component={'p'} className={'hero-description'}>
						{t('Hero description')}
					</Box>
					<Tooltip
						title={tooltipText}
						arrow
						placement="top"
						enterDelay={150}
						PopperProps={{
							modifiers: [{ name: 'offset', options: { offset: [0, 10] } }],
						}}
					>
						<span>
							<Button className={'hero-cta-btn'} onClick={() => router.push('/configurator')}>
								{ctaText} <span className="cta-arrow">→</span>
							</Button>
						</span>
					</Tooltip>
					<Box component={'div'} className={'video-play-button'}>
						<Box component={'div'} className={'play-button-bg'}>
							<PlayArrowIcon className={'play-icon'} />
						</Box>
					</Box>
				</Box>
			</Stack>
			{/* Background decorative elements */}
			<Box component={'div'} className={'hero-bg-circles'}></Box>
		</Stack>
	);
};

export default HeroSection;

