import React from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const Brand = () => {
	const device = useDeviceDetect();

	// Company data with logos
	const companies = [
		{ 
			name: 'WINDOWS&DOOR', 
			slogan: '',
			icon: (
				<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="10" y="15" width="40" height="35" rx="2" stroke="#181a20" strokeWidth="2" fill="none"/>
					<path d="M10 25 L50 25" stroke="#181a20" strokeWidth="2"/>
					<path d="M30 15 L30 50" stroke="#181a20" strokeWidth="2"/>
				</svg>
			)
		},
		{ 
			name: 'CASH BUYER NETWORK', 
			slogan: '',
			icon: (
				<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M15 20 L15 45 L25 45 L25 35 L35 35 L35 45 L45 45 L45 20 L15 20 Z" stroke="#181a20" strokeWidth="2" fill="none"/>
					<path d="M20 25 L20 30" stroke="#181a20" strokeWidth="2"/>
					<path d="M25 25 L25 30" stroke="#181a20" strokeWidth="2"/>
					<path d="M30 25 L30 30" stroke="#181a20" strokeWidth="2"/>
					<path d="M35 25 L35 30" stroke="#181a20" strokeWidth="2"/>
					<path d="M40 25 L40 30" stroke="#181a20" strokeWidth="2"/>
					<circle cx="30" cy="15" r="5" stroke="#181a20" strokeWidth="2" fill="none"/>
				</svg>
			)
		},
		{ 
			name: 'OPEN DOOR', 
			slogan: 'YOUR SLOGAN HERE',
			icon: (
				<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="15" y="20" width="30" height="30" rx="2" stroke="#181a20" strokeWidth="2" fill="none"/>
					<path d="M15 20 L15 50" stroke="#181a20" strokeWidth="2"/>
					<circle cx="40" cy="35" r="3" stroke="#181a20" strokeWidth="2" fill="none"/>
				</svg>
			)
		},
		{ 
			name: 'BUILDHOUSE', 
			slogan: '',
			icon: (
				<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="20" y="25" width="20" height="20" rx="2" stroke="#181a20" strokeWidth="2" fill="none" transform="rotate(-5 30 35)"/>
					<rect x="22" y="27" width="16" height="16" rx="1" stroke="#181a20" strokeWidth="2" fill="none" transform="rotate(5 30 35)"/>
				</svg>
			)
		},
		{ 
			name: 'COMPANY', 
			slogan: 'TAG LINE HERE',
			icon: (
				<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M15 30 Q20 20, 30 25 Q40 20, 45 30" stroke="#181a20" strokeWidth="2" fill="none"/>
					<path d="M15 35 Q20 25, 30 30 Q40 25, 45 35" stroke="#181a20" strokeWidth="2" fill="none"/>
					<path d="M15 40 Q20 30, 30 35 Q40 30, 45 40" stroke="#181a20" strokeWidth="2" fill="none"/>
				</svg>
			)
		},
		{ 
			name: 'WINDOW', 
			slogan: 'TAG LINE HERE',
			icon: (
				<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x="15" y="20" width="30" height="25" rx="2" stroke="#181a20" strokeWidth="2" fill="none"/>
					<rect x="17" y="22" width="26" height="21" rx="1" stroke="#181a20" strokeWidth="1.5" fill="none"/>
					<path d="M30 20 L30 43" stroke="#181a20" strokeWidth="1.5"/>
					<path d="M15 32.5 L45 32.5" stroke="#181a20" strokeWidth="1.5"/>
				</svg>
			)
		},
	];

	if (device === 'mobile') {
		return (
			<Stack className={'brand-section'}>
				<Stack className={'container'}>
					<Stack className={'brand-content'}>
						<Box component={'div'} className={'trusted-text'}>
							<span>Trusted by</span>
							<span className={'highlight'}>500+</span>
							<span>companies</span>
						</Box>
						<Stack className={'companies-row'}>
							{companies.map((company, index) => (
								<Box key={index} component={'div'} className={'company-item'}>
									<Box component={'div'} className={'company-icon'}>
										{company.icon}
									</Box>
									<Box component={'div'} className={'company-name'}>{company.name}</Box>
									{company.slogan && (
										<Box component={'div'} className={'company-slogan'}>{company.slogan}</Box>
									)}
								</Box>
							))}
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'brand-section'}>
				<Stack className={'container'}>
					<Stack className={'brand-content'}>
						<Box component={'div'} className={'trusted-text'}>
							<span>Trusted by</span>
							<span className={'highlight'}>500+</span>
							<span>companies</span>
						</Box>
						<Stack className={'companies-row'}>
							{companies.map((company, index) => (
								<Box key={index} component={'div'} className={'company-item'}>
									<Box component={'div'} className={'company-icon'}>
										{company.icon}
									</Box>
									<Box component={'div'} className={'company-name'}>{company.name}</Box>
									{company.slogan && (
										<Box component={'div'} className={'company-slogan'}>{company.slogan}</Box>
									)}
								</Box>
							))}
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Brand;

