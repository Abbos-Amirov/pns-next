import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { sweetConfirmAlert } from '../sweetAlert';
import { Stack, Box, IconButton, Typography } from '@mui/material';
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
import LanguageIcon from '@mui/icons-material/Language';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import Menu from '@mui/material/Menu';
import { REACT_APP_API_URL } from '../config';
import { useThemeMode } from '../context/ThemeContext';

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

const getUserImageSrc = (img?: string) => {
	if (!img) return '/img/profile/defaultUser.svg';
	if (img.startsWith('http://') || img.startsWith('https://')) return img;
	if (img.startsWith('/img/')) return img;
	return `${REACT_APP_API_URL}/${img}`;
};

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
	const { mode, toggleTheme } = useThemeMode();
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
	const [productAnchor, setProductAnchor] = useState<null | HTMLElement>(null);
	const productOpen = Boolean(productAnchor);
	const [supportAnchor, setSupportAnchor] = useState<null | HTMLElement>(null);
	const supportOpen = Boolean(supportAnchor);

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
			// Ensure client i18n updates immediately (esp. for newly added keys)
			try {
				await i18n.changeLanguage(locale);
				// reload common namespace to avoid stale cached resources in dev
				// @ts-ignore
				await i18n.reloadResources([locale], ['common']);
			} catch (e) {
				// ignore i18n errors; router locale switch still works
			}
			await router.push(router.asPath, router.asPath, { locale });
		},
		[i18n, router],
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

	const handleProductClick = (event: React.MouseEvent<HTMLElement>) => {
		setProductAnchor(event.currentTarget);
	};

	const handleProductClose = () => {
		setProductAnchor(null);
	};

	const handleSupportClick = (event: React.MouseEvent<HTMLElement>) => {
		setSupportAnchor(event.currentTarget);
	};

	const handleSupportClose = () => {
		setSupportAnchor(null);
	};

	if (device == 'mobile') {
		return (
			<Stack className={'top'} direction="row" alignItems="center" justifyContent="space-around" flexWrap="wrap" sx={{ gap: 1, py: 1 }}>
				<Link href={'/'}><div>{t('Home')}</div></Link>
				<Link href={'/property'}><div>{t('Products')}</div></Link>
				<Link href={'/installer'}><div>{t('Installers')}</div></Link>
				<Link href={'/community?articleCategory=FREE'}><div>{t('Community')}</div></Link>
				<Link href={'/cs'}><div>{t('CS')}</div></Link>
				<IconButton size="small" onClick={toggleTheme} sx={{ color: '#1a5f9e', p: 0.5 }} title={mode === 'dark' ? 'Light' : 'Dark'}>
					{mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
				</IconButton>
				<IconButton size="small" onClick={(e:any) => langClick(e)} sx={{ color: '#1a5f9e', p: 0.5 }}>
					<LanguageIcon />
				</IconButton>
				<Menu anchorEl={anchorEl2} open={drop} onClose={langClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} MenuListProps={{ 'aria-labelledby': 'mobile-lang-btn' }}>
					<MenuItem onClick={() => langChoice('en')} selected={lang === 'en'}>English</MenuItem>
					<MenuItem onClick={() => langChoice('kr')} selected={lang === 'kr'}>한국어</MenuItem>
					<MenuItem onClick={() => langChoice('ru')} selected={lang === 'ru'}>Русский</MenuItem>
					<MenuItem onClick={() => langChoice('zh')} selected={lang === 'zh'}>中文</MenuItem>
					<MenuItem onClick={() => langChoice('ja')} selected={lang === 'ja'}>日本語</MenuItem>
				</Menu>
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
										<span>{t('Logout')}</span>
									</Button>
								)}
								<CloseIcon className={'close-icon'} onClick={closeTopBar} />
							</Box>
						</Stack>
					</Stack>
				)}

				{/* Main Navigation */}
				<Stack className={`navbar-main ${colorChange ? 'transparent' : ''} ${bgColor ? 'transparent' : ''}`}>
					<Stack className={'container premium-nav-container'}>
						<Box component={'div'} className={'logo-box premium-logo'}>
							<Link href={'/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
								<Box component={'div'} className={'logo-icon'}>
									<img src={mode === 'dark' ? '/img/logo/pns-arched-door-light.svg' : '/img/logo/pns-arched-door.svg'} alt="PNS Window" className={'logo'} />
								</Box>
								<Box component={'div'} className={'logo-text-block'}>
									<span className={'logo-brand'}>PNSWINDOW</span>
									<span className={'logo-tagline'}>{t('WINDOWS & DOORS')}</span>
								</Box>
							</Link>
						</Box>
						<Box component={'div'} className={'nav-menu'}>
							<Link href={'/'}>
								<span className={'nav-link'}>{t('Home')}</span>
							</Link>
							<span className={'nav-separator'}>/</span>
							<Box
								component={'div'}
								className={'product-dropdown measurer-dropdown'}
								onMouseEnter={handleProductClick}
								onMouseLeave={handleProductClose}
							>
								<Box component={'span'} className={'nav-link measurer-link product-link'}>
									{t('Product')}
									<KeyboardArrowDownIcon className={'dropdown-icon'} />
								</Box>
								<Menu
									anchorEl={productAnchor}
									open={productOpen}
									onClose={handleProductClose}
									MenuListProps={{
										onMouseLeave: handleProductClose,
										sx: { display: 'flex', flexDirection: 'row', padding: 0, gap: 0 },
									}}
									anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
									transformOrigin={{ vertical: 'top', horizontal: 'left' }}
									className={'product-menu product-menu-with-images'}
								>
									<Link
										href={'/property/window'}
										className={'product-menu-card'}
										onClick={handleProductClose}
										style={{
											display: 'flex',
											flexDirection: 'column',
											flex: 1,
											minWidth: 0,
											textDecoration: 'none',
											color: '#39381c',
										}}
									>
										<span
											className={'product-menu-card-label'}
											style={{
												textAlign: 'center',
												fontWeight: 700,
												textTransform: 'uppercase',
												padding: '12px 16px 6px',
												background: '#f8f8f8',
												display: 'block',
											}}
										>
											{t('Windows')}
										</span>
										<div
											className={'product-menu-card-image'}
											style={{
												width: '100%',
												height: 80,
												overflow: 'hidden',
												padding: '0 12px 12px',
												boxSizing: 'border-box',
											}}
										>
											<img
												src={'/img/property/window1.jpg'}
												alt={t('Windows')}
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
													borderRadius: 4,
												}}
											/>
										</div>
									</Link>
									<Link
										href={'/property/door'}
										className={'product-menu-card'}
										onClick={handleProductClose}
										style={{
											display: 'flex',
											flexDirection: 'column',
											flex: 1,
											minWidth: 0,
											textDecoration: 'none',
											color: '#39381c',
										}}
									>
										<span
											className={'product-menu-card-label'}
											style={{
												textAlign: 'center',
												fontWeight: 700,
												textTransform: 'uppercase',
												padding: '12px 16px 6px',
												background: '#f8f8f8',
												display: 'block',
											}}
										>
											{t('Doors')}
										</span>
										<div
											className={'product-menu-card-image'}
											style={{
												width: '100%',
												height: 80,
												overflow: 'hidden',
												padding: '0 12px 12px',
												boxSizing: 'border-box',
											}}
										>
											<img
												src={'/img/property/bigImage.png'}
												alt={t('Doors')}
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
													borderRadius: 4,
												}}
											/>
										</div>
									</Link>
								</Menu>
							</Box>
							<span className={'nav-separator'}>/</span>
							<Box 
								component={'div'} 
								className={'measurer-dropdown'}
								onMouseEnter={handleMeasurerClick}
								onMouseLeave={handleMeasurerClose}
							>
								<Link href={'/agent'} style={{ textDecoration: 'none' }}>
									<span className={'nav-link measurer-link'}>
										{t('Exportlar')}
										<KeyboardArrowDownIcon className={'dropdown-icon'} />
									</span>
							</Link>
								<Menu
									anchorEl={measurerAnchor}
									open={measurerOpen}
									onClose={handleMeasurerClose}
									MenuListProps={{
										onMouseLeave: handleMeasurerClose,
										sx: { display: 'flex', flexDirection: 'row', padding: 0, gap: 0 },
									}}
									anchorOrigin={{
										vertical: 'bottom',
										horizontal: 'left',
									}}
									transformOrigin={{
										vertical: 'top',
										horizontal: 'left',
									}}
									className={'measurer-menu measurer-menu-with-images'}
								>
									<Link
									href={'/agent'}
									className={'measurer-menu-card'}
									onClick={handleMeasurerClose}
									style={{
										display: 'flex',
										flexDirection: 'column',
										flex: 1,
										minWidth: 0,
										textDecoration: 'none',
										color: '#39381c',
									}}
								>
										<span
											className={'measurer-menu-card-label'}
											style={{
												textAlign: 'center',
												fontWeight: 700,
												textTransform: 'uppercase',
												padding: '12px 16px 6px',
												background: '#f8f8f8',
												display: 'block',
											}}
										>
											{t('Measurers')}
										</span>
										<div
											className={'measurer-menu-card-image'}
											style={{
												width: '100%',
												height: 80,
												overflow: 'hidden',
												padding: '0 12px 12px',
												boxSizing: 'border-box',
											}}
										>
											<img
												src={'/img/experts/measurers.png'}
												alt={t('Measurers')}
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
													borderRadius: 4,
												}}
											/>
										</div>
									</Link>
									<Link
										href={'/installer'}
										className={'measurer-menu-card'}
										onClick={handleMeasurerClose}
										style={{
											display: 'flex',
											flexDirection: 'column',
											flex: 1,
											minWidth: 0,
											textDecoration: 'none',
											color: '#39381c',
										}}
									>
										<span
											className={'measurer-menu-card-label'}
											style={{
												textAlign: 'center',
												fontWeight: 700,
												textTransform: 'uppercase',
												padding: '12px 16px 6px',
												background: '#f8f8f8',
												display: 'block',
											}}
										>
											{t('Installers')}
										</span>
										<div
											className={'measurer-menu-card-image'}
											style={{
												width: '100%',
												height: 80,
												overflow: 'hidden',
												padding: '0 12px 12px',
												boxSizing: 'border-box',
											}}
										>
											<img
												src={'/img/experts/installers.png'}
												alt={t('Installers')}
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
													borderRadius: 4,
												}}
											/>
										</div>
									</Link>
								</Menu>
								
							</Box>
							<span className={'nav-separator'}>/</span>
							<Link href={'/city'}>
								<span className={'nav-link'}>{t('City')}</span>

							</Link>
							<span className={'nav-separator'}>/</span>
							<Link href={'/community'}>
								<span className={'nav-link'}>{t('Community')}</span>
							</Link>
							{user?._id && (
								<>
									<span className={'nav-separator'}>/</span>
									<Link href={'/mypage'}>
										<span className={'nav-link'}>{t('My Page')}</span>
									</Link>
								</>
							)}
							<span className={'nav-separator'}>/</span>
							<Box
								component={'div'}
								className={'support-dropdown'}
								onMouseEnter={handleSupportClick}
								onMouseLeave={handleSupportClose}
							>
								<Link href={'/cs'} style={{ textDecoration: 'none' }}>
									<span className={'nav-link support-link'}>
										<KeyboardArrowDownIcon className={'dropdown-icon'} />
										{t('Support')}
									</span>
								</Link>
								<Menu
									anchorEl={supportAnchor}
									open={supportOpen}
									onClose={handleSupportClose}
									MenuListProps={{
										onMouseLeave: handleSupportClose,
										sx: { display: 'flex', flexDirection: 'row', padding: 0, gap: 0 },
									}}
									anchorOrigin={{
										vertical: 'bottom',
										horizontal: 'right',
									}}
									transformOrigin={{
										vertical: 'top',
										horizontal: 'right',
									}}
									className={'support-menu support-menu-with-images'}
								>
									<Link
										href={'/our-services'}
										className={'support-menu-card'}
										onClick={handleSupportClose}
										style={{
											display: 'flex',
											flexDirection: 'column',
											flex: 1,
											minWidth: 0,
											textDecoration: 'none',
											color: '#39381c',
										}}
									>
										<span
											className={'support-menu-card-label'}
											style={{
												textAlign: 'center',
												fontWeight: 700,
												textTransform: 'uppercase',
												padding: '12px 16px 6px',
												background: '#f8f8f8',
												display: 'block',
											}}
										>
											{t('OurServices')}
										</span>
										<div
											className={'support-menu-card-image'}
											style={{
												width: '100%',
												height: 100,
												overflow: 'hidden',
												padding: '0 12px 12px',
												boxSizing: 'border-box',
											}}
										>
											<img
												src={'/img/support/our-services.png'}
												alt={t('OurServices')}
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
													borderRadius: 4,
												}}
											/>
										</div>
									</Link>
									<Link
										href={'/cs'}
										className={'support-menu-card'}
										onClick={handleSupportClose}
										style={{
											display: 'flex',
											flexDirection: 'column',
											flex: 1,
											minWidth: 0,
											textDecoration: 'none',
											color: '#39381c',
										}}
									>
										<span
											className={'support-menu-card-label'}
											style={{
												textAlign: 'center',
												fontWeight: 700,
												textTransform: 'uppercase',
												padding: '12px 16px 6px',
												background: '#f8f8f8',
												display: 'block',
											}}
										>
											{t('Support')}
										</span>
										<div
											className={'support-menu-card-image'}
											style={{
												width: '100%',
												height: 100,
												overflow: 'hidden',
												padding: '0 12px 12px',
												boxSizing: 'border-box',
											}}
										>
											<img
												src={'/img/support/support.png'}
												alt={t('Support')}
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
													borderRadius: 4,
												}}
											/>
										</div>
									</Link>
									<Link
										href={'/repair-maintenance'}
										className={'support-menu-card'}
										onClick={handleSupportClose}
										style={{
											display: 'flex',
											flexDirection: 'column',
											flex: 1,
											minWidth: 0,
											textDecoration: 'none',
											color: '#39381c',
										}}
									>
										<span
											className={'support-menu-card-label'}
											style={{
												textAlign: 'center',
												fontWeight: 700,
												textTransform: 'uppercase',
												padding: '12px 16px 6px',
												background: '#f8f8f8',
												display: 'block',
											}}
										>
											{t('RepairMaintenanceService')}
										</span>
										<div
											className={'support-menu-card-image'}
											style={{
												width: '100%',
												height: 100,
												overflow: 'hidden',
												padding: '0 12px 12px',
												boxSizing: 'border-box',
											}}
										>
											<img
												src={'/img/support/our-services.png'}
												alt={t('RepairMaintenanceService')}
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
													borderRadius: 4,
												}}
											/>
										</div>
									</Link>
									<Link
										href={'/about-me'}
										className={'support-menu-card'}
										onClick={handleSupportClose}
										style={{
											display: 'flex',
											flexDirection: 'column',
											flex: 1,
											minWidth: 0,
											textDecoration: 'none',
											color: '#39381c',
										}}
									>
										<span
											className={'support-menu-card-label'}
											style={{
												textAlign: 'center',
												fontWeight: 700,
												textTransform: 'uppercase',
												padding: '12px 16px 6px',
												background: '#f8f8f8',
												display: 'block',
											}}
										>
											{t('AboutMe')}
										</span>
										<div
											className={'support-menu-card-image'}
											style={{
												width: '100%',
												height: 100,
												overflow: 'hidden',
												padding: '0 12px 12px',
												boxSizing: 'border-box',
											}}
										>
											<img
												src={'/img/support/about-me.png'}
												alt={t('AboutMe')}
												style={{
													width: '100%',
													height: '100%',
													objectFit: 'cover',
													borderRadius: 4,
												}}
											/>
										</div>
									</Link>
								</Menu>
							</Box>
						</Box>

						<Box component={'div'} className={'nav-right'}>
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
								<MenuItem 
									onClick={() => langChoice('zh')} 
									selected={lang === 'zh'}
									className={'lang-menu-item-home'}
								>
									中文
								</MenuItem>
								<MenuItem 
									onClick={() => langChoice('ja')} 
									selected={lang === 'ja'}
									className={'lang-menu-item-home'}
								>
									日本語
								</MenuItem>
							</Menu>
							{user?._id ? (
								<Box component={'div'} className={'user-profile-section user-profile-with-actions'}>
									<Link href={'/mypage'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
										<div className={'user-avatar-small'}>
											<img 
												src={getUserImageSrc(user?.memberImage)} 
												alt={user?.memberNick || t('User')} 
												onError={(e) => {
													(e.target as HTMLImageElement).src = '/img/profile/defaultUser.svg';
												}}
											/>
										</div>
										<Typography className={'user-name-text'}>{user?.memberNick || 'User'}</Typography>
									</Link>
									<IconButton 
										className={'profile-action-btn dark-mode-btn'} 
										size="small" 
										onClick={toggleTheme} 
										title={mode === 'dark' ? 'Light mode' : 'Dark mode'} 
										sx={{ 
											ml: 0.5, 
											width: 40, 
											height: 40, 
											minWidth: 40, 
											borderRadius: '50%', 
											backgroundColor: 'rgba(26, 95, 158, 0.25) !important', 
											color: '#1a5f9e !important',
											'&:hover': { backgroundColor: 'rgba(26, 95, 158, 0.4) !important' },
											'& svg': { fontSize: 22 }
										}}
									>
										{mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
									</IconButton>
									<IconButton className={'profile-action-btn gear-btn'} size="small" onClick={() => router.push('/mypage')}>
										<SettingsIcon />
									</IconButton>
								</Box>
								
							) : (
								<Box component={'div'} className={'auth-with-dark-mode'}>
									<IconButton 
										className={'profile-action-btn dark-mode-btn sun-moon-toggle'} 
										size="small" 
										onClick={toggleTheme} 
										title={mode === 'dark' ? 'Light mode' : 'Dark mode'}
										sx={{ 
											width: 44, 
											height: 44, 
											minWidth: 44, 
											borderRadius: '50%', 
											backgroundColor: mode === 'dark' ? '#f59e0b' : '#1a5f9e',
											color: '#ffffff !important',
											marginRight: 1,
											'&:hover': { 
												backgroundColor: mode === 'dark' ? '#d97706' : '#144a7a',
												transform: 'scale(1.08)'
											},
											'& svg': { fontSize: 24 }
										}}
									>
										{mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
									</IconButton>
									<Button className={'login-signup-btn'} onClick={() => router.push('/account/join')}>
										{t('Login/Signup')}
									</Button>
								</Box>


								
							)}
						</Box>
					</Stack>
				</Stack>
			</Stack>
			
		);
	}
};

export default withRouter(Top);
