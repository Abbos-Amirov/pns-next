import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { sweetConfirmAlert } from '../sweetAlert';
import { Stack, Box, IconButton } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import YouTubeIcon from '@mui/icons-material/YouTube';
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Menu from '@mui/material/Menu';

// Custom KakaoTalk Icon
const KakaoTalkIcon = ({ className }: { className?: string }) => (
	<svg
		className={className}
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="currentColor"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path d="M12 3C6.477 3 2 6.477 2 12c0 2.237.86 4.28 2.27 5.81L2 22l4.5-2.18c1.17.35 2.4.54 3.68.54h.64c5.523 0 10-3.477 10-7.78 0-4.303-4.477-7.78-10-7.78zm0 1.56c4.695 0 8.5 2.832 8.5 6.22 0 3.388-3.805 6.22-8.5 6.22a11.62 11.62 0 0 1-3.12-.42l-.35-.1-.3.15-2.9 1.4.55-2.64-.12-.25A8.19 8.19 0 0 1 3.5 12c0-3.388 3.805-6.22 8.5-6.22z" />
	</svg>
);

// Custom TikTok Icon
const TikTokIcon = ({ className }: { className?: string }) => (
	<svg
		className={className}
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="currentColor"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
	</svg>
);

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t, i18n } = useTranslation('common');
	const router = useRouter();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string | null>('en');
	const drop = Boolean(anchorEl2);
	const [colorChange, setColorChange] = useState(false);
	const [bgColor, setBgColor] = useState<boolean>(false);
	const [topBarVisible, setTopBarVisible] = useState(true);
	const [measurerAnchor, setMeasurerAnchor] = useState<null | HTMLElement>(null);
	const measurerOpen = Boolean(measurerAnchor);

	/** LIFECYCLES **/
	useEffect(() => {
		if (localStorage.getItem('locale') === null) {
			localStorage.setItem('locale', 'en');
			setLang('en');
		} else {
			setLang(localStorage.getItem('locale'));
		}
	}, [router]);

	useEffect(() => {
		switch (router.pathname) {
			case '/property/detail':
				setBgColor(true);
				break;
			default:
				break;
		}
	}, [router]);

	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	/** HANDLERS **/
	const langClick = (e: any) => {
		setAnchorEl2(e.currentTarget);
	};

	const langClose = () => {
		setAnchorEl2(null);
	};

	const langChoice = useCallback(
		async (locale: string) => {
			setLang(locale);
			localStorage.setItem('locale', locale);
			setAnchorEl2(null);
			await router.push(router.asPath, router.asPath, { locale });
		},
		[router],
	);

	const changeNavbarColor = () => {
		if (window.scrollY >= 50) {
			setColorChange(true);
		} else {
			setColorChange(false);
		}
	};

	if (typeof window !== 'undefined') {
		window.addEventListener('scroll', changeNavbarColor);
	}

	const closeTopBar = () => {
		setTopBarVisible(false);
	};

	const showTopBar = () => {
		setTopBarVisible(true);
	};

	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to logout?')) {
				logOut();
				await router.push('/');
			}
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err.message);
		}
	};

	const handleMeasurerClick = (event: React.MouseEvent<HTMLElement>) => {
		setMeasurerAnchor(event.currentTarget);
	};

	const handleMeasurerClose = () => {
		setMeasurerAnchor(null);
	};

	if (device == 'mobile') {
		return (
			<Stack className={'top'}>
				<Link href={'/'}>
					<div>{t('Home')}</div>
				</Link>
				<Link href={'/property'}>
					<div>{t('Properties')}</div>
				</Link>
				<Link href={'/installer'}>
					<div> {t('Installers')} </div>
				</Link>
				<Link href={'/community?articleCategory=FREE'}>
					<div> {t('Community')} </div>
				</Link>
				<Link href={'/cs'}>
					<div> {t('CS')} </div>
				</Link>
			</Stack>
		);
	} else {
		return (
			<Stack className={'navbar kadhavu-navbar'}>
				{/* Show Top Bar Button - when hidden */}
				{!topBarVisible && (
					<Box component={'div'} className={'show-top-bar-btn'} onClick={showTopBar}>
						<KeyboardArrowDownIcon className={'info-icon'} />
					</Box>
				)}
				{/* Top Bar */}
				{topBarVisible && (
					<Stack className={`top-bar ${topBarVisible ? 'show' : 'hide'}`}>
						<Stack className={'container'}>
							<Box component={'div'} className={'top-bar-left'}>
								<Box 
									component={'a'} 
									href="https://map.kakao.com/link/search/청남도 천안시 동남구 풍세면 풍세산단5로 61"
									target="_blank"
									rel="noopener noreferrer"
									className={'top-bar-item'}
									sx={{ textDecoration: 'none', cursor: 'pointer' }}
								>
									<LocationOnIcon className={'top-bar-icon'} />
									<span>청남도 천안시 동남구 풍세면 풍세산단5로 61</span>
								</Box>
								<Box component={'div'} className={'top-bar-item'}>
									<EmailIcon className={'top-bar-icon'} />
									<span>abbosamirov571@gmail.com</span>
								</Box>
							</Box>
							<Box component={'div'} className={'top-bar-right'}>
								<Box component={'div'} className={'top-bar-item'}>
									<AccessTimeIcon className={'top-bar-icon'} />
									<span>Hours: Mon-Fri: 8.00 am - 19.30</span>
								</Box>
								<Box component={'div'} className={'social-icons'}>
									<YouTubeIcon className={'social-icon'} />
									<KakaoTalkIcon className={'social-icon'} />
									<TikTokIcon className={'social-icon'} />
								</Box>
								{user?._id && (
									<Button className={'logout-btn-top'} onClick={logoutHandler}>
										<Logout className={'logout-icon'} />
										<span>Logout</span>
									</Button>
								)}
								<CloseIcon className={'close-icon'} onClick={closeTopBar} />
							</Box>
						</Stack>
					</Stack>
				)}

				{/* Main Navigation */}
				<Stack className={`navbar-main ${colorChange ? 'transparent' : ''} ${bgColor ? 'transparent' : ''}`}>
					<Stack className={'container'}>
						<Box component={'div'} className={'nav-menu'}>
							<Link href={'/'}>
								<span className={'nav-link'}>HOME</span>
							</Link>
							<span className={'nav-separator'}>/</span>
							<Link href={'/property'}>
								<span className={'nav-link'}>PRODUCTS</span>
							</Link>
							<span className={'nav-separator'}>/</span>
							<Box 
								component={'div'} 
								className={'measurer-dropdown'}
								onMouseEnter={handleMeasurerClick}
								onMouseLeave={handleMeasurerClose}
							>
								<Link href={'/agent'} style={{ textDecoration: 'none' }}>
									<span className={'nav-link measurer-link'}>
										EXPERTS
										<KeyboardArrowDownIcon className={'dropdown-icon'} />
									</span>
							</Link>
								<Menu
									anchorEl={measurerAnchor}
									open={measurerOpen}
									onClose={handleMeasurerClose}
									MenuListProps={{
										onMouseLeave: handleMeasurerClose,
									}}
									anchorOrigin={{
										vertical: 'bottom',
										horizontal: 'left',
									}}
									transformOrigin={{
										vertical: 'top',
										horizontal: 'left',
									}}
									className={'measurer-menu'}
								>
									<MenuItem 
										onClick={() => {
											handleMeasurerClose();
											router.push('/agent');
										}}
										className={'measurer-menu-item'}
									>
										MEASURER
									</MenuItem>
									<MenuItem 
										onClick={() => {
											handleMeasurerClose();
											router.push('/installer');
										}}
										className={'measurer-menu-item'}
									>
										INSTALLERS
									</MenuItem>
								</Menu>
								
							</Box>
							<span className={'nav-separator'}>/</span>
							<Link href={'/city'}>
								<span className={'nav-link'}>CITY</span>
							</Link>
							<span className={'nav-separator'}>/</span>
							<Link href={'/community'}>
								<span className={'nav-link'}>community</span>
							</Link>
							<span className={'nav-separator'}>/</span>
							<Link href={'/cs'}>
								<span className={'nav-link'}>CONTACT US</span>
							</Link>
						</Box>

						<Box component={'div'} className={'logo-box'}>
							<Link href={'/'}>
								<Box component={'div'} className={'kadhavu-logo'}>
									<Box component={'div'} className={'logo-icon'}>
										<img src="/img/logo/favicon.svg" alt="PNS DEV Logo" className={'logo'} />
									</Box>
									<span className={'logo-text'}>PNS DEV</span>
								</Box>
							</Link>
						</Box>

						<Box component={'div'} className={'nav-right'}>
							<Box 
								component={'a'} 
								href="tel:01082005998"
								className={'phone-box'}
								sx={{ textDecoration: 'none', cursor: 'pointer' }}
							>
								<PhoneIcon className={'phone-icon'} />
								<span>Call +82 010 8200 5998</span>
							</Box>
							{/* Language Switcher */}
							<IconButton 
								className={'lang-switcher-btn-home'}
								onClick={langClick}
							>
								<LanguageIcon />
							</IconButton>
							<Menu
								anchorEl={anchorEl2}
								open={drop}
								onClose={langClose}
								anchorOrigin={{
									vertical: 'bottom',
									horizontal: 'right',
								}}
								transformOrigin={{
									vertical: 'top',
									horizontal: 'right',
								}}
								className={'lang-menu-home'}
							>
								<MenuItem 
									onClick={() => langChoice('en')} 
									selected={lang === 'en'}
									className={'lang-menu-item-home'}
								>
									English
								</MenuItem>
								<MenuItem 
									onClick={() => langChoice('ru')} 
									selected={lang === 'ru'}
									className={'lang-menu-item-home'}
								>
									Русский
								</MenuItem>
								<MenuItem 
									onClick={() => langChoice('kr')} 
									selected={lang === 'kr'}
									className={'lang-menu-item-home'}
								>
									한국어
								</MenuItem>
							</Menu>
							<Box component={'div'} className={'auth-buttons'}>
								<Button 
									className={'login-btn'}
									onClick={() => router.push('/account/join?mode=login')}
								>
									LOGIN
								</Button>
								<Button 
									className={'signup-btn'}
									onClick={() => router.push('/account/join?mode=signup')}
								>
									SIGN UP
								</Button>
							</Box>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withRouter(Top);
