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
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import Menu from '@mui/material/Menu';
import { REACT_APP_API_URL } from '../config';
import NavMegaDrawer, { MegaPanel } from './NavMegaDrawer';
import { useThemeMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

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
	const { openAuthModal } = useAuth();
	const { t, i18n } = useTranslation('common');
	const router = useRouter();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string | null>('en');
	const drop = Boolean(anchorEl2);
	const [colorChange, setColorChange] = useState(false);
	const [bgColor, setBgColor] = useState<boolean>(false);
	const [topBarVisible, setTopBarVisible] = useState(true);
	const [megaPanel, setMegaPanel] = useState<MegaPanel | null>(null);
	const [navOverlayOpen, setNavOverlayOpen] = useState(false);

	const closeMega = () => setMegaPanel(null);
	/** Same section again → close; other section → switch panel without closing overlay */
	const toggleMega = (panel: MegaPanel) => {
		setMegaPanel((prev) => {
			if (prev === panel) return null;
			return panel;
		});
	};

	const openNavOverlay = () => {
		setMegaPanel(null);
		setNavOverlayOpen(true);
	};
	const closeNavOverlay = () => setNavOverlayOpen(false);

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

	useEffect(() => {
		setMegaPanel(null);
	}, [router.pathname]);

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
			<>
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
				<Stack
					id="navbar-primary"
					className={`navbar-main ${colorChange ? 'transparent' : ''} ${bgColor ? 'transparent' : ''}`}
					data-theme={mode}
				>
					<Stack className={'container premium-nav-container'}>
						<Box component={'div'} className={'logo-box premium-logo'}>
							<Link href={'/'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
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
							<Box
								component={'div'}
								className={'home-dropdown'}
								onClick={(e: React.MouseEvent) => {
									e.stopPropagation();
									setNavOverlayOpen(false);
									toggleMega('home');
								}}
							>
								<Box
									component={'span'}
									role={'button'}
									tabIndex={0}
									onKeyDown={(e: React.KeyboardEvent) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											setNavOverlayOpen(false);
											toggleMega('home');
										}
									}}
									className={`nav-link home-link ${megaPanel === 'home' ? 'is-open' : ''}`}
									sx={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
								>
									{t('Home')}
									<KeyboardArrowDownIcon className={'dropdown-icon'} />
								</Box>
							</Box>
							<span className={'nav-separator'}>/</span>
							<Box
								component={'div'}
								className={'product-dropdown'}
								onClick={(e: React.MouseEvent) => {
									e.stopPropagation();
									setNavOverlayOpen(false);
									toggleMega('product');
								}}
							>
								<Box component={'span'} className={`nav-link product-link ${megaPanel === 'product' ? 'is-open' : ''}`}>
									{t('Product')}
									<KeyboardArrowDownIcon className={'dropdown-icon'} />
								</Box>
							</Box>
							<span className={'nav-separator'}>/</span>
							<Box
								component={'div'}
								className={'measurer-dropdown'}
								onClick={(e: React.MouseEvent) => {
									e.stopPropagation();
									setNavOverlayOpen(false);
									toggleMega('experts');
								}}
							>
								<Box
									component={'span'}
									role={'button'}
									tabIndex={0}
									onKeyDown={(e: React.KeyboardEvent) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											setNavOverlayOpen(false);
											toggleMega('experts');
										}
									}}
									className={`nav-link measurer-link ${megaPanel === 'experts' ? 'is-open' : ''}`}
									sx={{ cursor: 'pointer' }}
								>
									{t('Exportlar')}
									<KeyboardArrowDownIcon className={'dropdown-icon'} />
								</Box>
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
								onClick={(e: React.MouseEvent) => {
									e.stopPropagation();
									setNavOverlayOpen(false);
									toggleMega('support');
								}}
							>
								<Box component={'span'} className={`nav-link support-link ${megaPanel === 'support' ? 'is-open' : ''}`}>
									<KeyboardArrowDownIcon className={'dropdown-icon'} />
									{t('Support')}
								</Box>
							</Box>
						</Box>

						<Box component={'div'} className={'nav-right'}>
							{user?._id ? (
								<>
									{/* Tartib: Dark mode, Language, Avatar+Name, Hamburger */}
									<IconButton 
										className={'profile-action-btn dark-mode-btn'} 
										size="small" 
										onClick={toggleTheme} 
										title={mode === 'dark' ? 'Light mode' : 'Dark mode'} 
										sx={{ 
											width: 53, height: 53, minWidth: 53, borderRadius: '50%', 
											backgroundColor: 'rgba(26, 95, 158, 0.25) !important', 
											color: '#1a5f9e !important',
											'&:hover': { backgroundColor: 'rgba(26, 95, 158, 0.4) !important' },
											'& svg': { fontSize: 22 }
										}}
									>
										{mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
									</IconButton>
									<IconButton className={'lang-switcher-btn-home'} onClick={langClick} sx={{ width: 53, height: 53, minWidth: 53, '& svg': { fontSize: 22 } }}>
										<LanguageIcon />
									</IconButton>
									<Link href={'/mypage'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
										<div
											className={'user-avatar-small'}
											style={{
												width: 29,
												height: 29,
												minWidth: 29,
												borderRadius: '50%',
												overflow: 'hidden',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												flexShrink: 0,
											}}
										>
											<img src={getUserImageSrc(user?.memberImage)} alt={user?.memberNick || t('User')} onError={(e) => { (e.target as HTMLImageElement).src = '/img/profile/defaultUser.svg'; }} style={{ width: '120%', height: '120%', objectFit: 'cover' }} />
										</div>
										<Typography className={'user-name-text'} sx={{ fontSize: 12, fontWeight: 600 }}>{user?.memberNick || 'User'}</Typography>
									</Link>
									<IconButton 
										className={'profile-action-btn hamburger-btn'} 
										size="small" 
										onClick={openNavOverlay} 
										title="Menu"
										sx={{ 
											width: 53, height: 53, minWidth: 53, borderRadius: '50%', 
											backgroundColor: 'rgba(26, 95, 158, 0.25) !important', 
											color: '#1a5f9e !important',
											'&:hover': { backgroundColor: 'rgba(26, 95, 158, 0.4) !important' },
											'& svg': { fontSize: 22 }
										}}
									>
										<MenuIcon />
									</IconButton>
								</>
							) : (
								<>
									<IconButton 
										className={'profile-action-btn dark-mode-btn'} 
										size="small" 
										onClick={toggleTheme} 
										title={mode === 'dark' ? 'Light mode' : 'Dark mode'}
										sx={{ 
											width: 53, height: 53, minWidth: 53, borderRadius: '50%', 
											backgroundColor: 'rgba(26, 95, 158, 0.25) !important', 
											color: '#1a5f9e !important',
											'&:hover': { backgroundColor: 'rgba(26, 95, 158, 0.4) !important' },
											'& svg': { fontSize: 22 }
										}}
									>
										{mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
									</IconButton>
									<IconButton className={'lang-switcher-btn-home'} onClick={langClick} sx={{ width: 53, height: 53, minWidth: 53, '& svg': { fontSize: 22 } }}>
										<LanguageIcon />
									</IconButton>
									<Button className={'login-signup-btn'} onClick={() => openAuthModal('login')} sx={{ py: 0.5, px: 1.5, fontSize: 13 }}>
										{t('Login/Signup')}
									</Button>
									<IconButton 
										className={'profile-action-btn hamburger-btn'} 
										size="small" 
										onClick={openNavOverlay} 
										title="Menu"
										sx={{ 
											width: 53, height: 53, minWidth: 53, borderRadius: '50%', 
											backgroundColor: 'rgba(26, 95, 158, 0.25) !important', 
											color: '#1a5f9e !important',
											'&:hover': { backgroundColor: 'rgba(26, 95, 158, 0.4) !important' },
											'& svg': { fontSize: 22 }
										}}
									>
										<MenuIcon />
									</IconButton>
								</>
							)}
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
						</Box>
					</Stack>
				</Stack>
			</Stack>

			{/* Full-screen Nav Overlay (hamburger menu) - drops from top, ~50% height */}
			<Drawer
				anchor="top"
				open={navOverlayOpen}
				onClose={closeNavOverlay}
				className={'nav-overlay-drawer nav-overlay-top'}
				sx={{
					zIndex: 1400,
					'& .MuiDrawer-paper': {
						width: '100%',
						maxWidth: '100%',
						height: 'auto',
						maxHeight: '50vh',
						top: 0,
						left: 0,
						right: 0,
						background: 'rgba(41, 125, 222, 0.04)',
						backdropFilter: 'blur(12px)',
						boxSizing: 'border-box',
					},
				}}
			>
				<div className={'nav-overlay-panel'} data-theme={mode}>
					<div className={'nav-overlay-header'}>
						<img src={mode === 'dark' ? '/img/logo/pns-arched-door-light.svg' : '/img/logo/pns-arched-door.svg'} alt="PNS" className={'nav-overlay-logo'} />
						<IconButton className={'nav-overlay-close'} onClick={closeNavOverlay} size="large">
							<CloseIcon />
						</IconButton>
					</div>
					<div className={'nav-overlay-content'}>
						<div className={'nav-overlay-grid'}>
							<Link href={'/'} className={'nav-overlay-card'} onClick={closeNavOverlay}>
								<div className={'nav-overlay-card-image'}>
									<img src={'/img/nav-overlay/home.png'} alt={t('Home')} />
								</div>
								<span className={'nav-overlay-card-label'}>{t('Home')}</span>
							</Link>
							<Link href={'/property/window'} className={'nav-overlay-card'} onClick={closeNavOverlay}>
								<div className={'nav-overlay-card-image'}>
									<img src={'/img/property/menu-product-window.png'} alt={t('Windows')} />
								</div>
								<span className={'nav-overlay-card-label'}>{t('Windows')}</span>
							</Link>
							<Link href={'/property/door'} className={'nav-overlay-card'} onClick={closeNavOverlay}>
								<div className={'nav-overlay-card-image'}>
									<img src={'/img/property/menu-product-door.png'} alt={t('Doors')} />
								</div>
								<span className={'nav-overlay-card-label'}>{t('Doors')}</span>
							</Link>
							<Link href={'/agent'} className={'nav-overlay-card'} onClick={closeNavOverlay}>
								<div className={'nav-overlay-card-image'}>
									<img src={'/img/experts/measurers.png'} alt={t('Measurers')} />
								</div>
								<span className={'nav-overlay-card-label'}>{t('Measurers')}</span>
							</Link>
							<Link href={'/installer'} className={'nav-overlay-card'} onClick={closeNavOverlay}>
								<div className={'nav-overlay-card-image'}>
									<img src={'/img/experts/installers.png'} alt={t('Installers')} />
								</div>
								<span className={'nav-overlay-card-label'}>{t('Installers')}</span>
							</Link>
							<Link href={'/city'} className={'nav-overlay-card'} onClick={closeNavOverlay}>
								<div className={'nav-overlay-card-image'}>
									<img src={'/img/banner/city pns.avif'} alt={t('City')} />
								</div>
								<span className={'nav-overlay-card-label'}>{t('City')}</span>
							</Link>
							<Link href={'/community'} className={'nav-overlay-card'} onClick={closeNavOverlay}>
								<div className={'nav-overlay-card-image'}>
									<img src={'/img/nav-overlay/community.png'} alt={t('Community')} />
								</div>
								<span className={'nav-overlay-card-label'}>{t('Community')}</span>
							</Link>
							{user?._id && (
								<Link href={'/mypage'} className={'nav-overlay-card'} onClick={closeNavOverlay}>
									<div className={'nav-overlay-card-image'}>
										<img src={getUserImageSrc(user?.memberImage)} alt={t('My Page')} onError={(e) => { (e.target as HTMLImageElement).src = '/img/profile/defaultUser.svg'; }} />
									</div>
									<span className={'nav-overlay-card-label'}>{t('My Page')}</span>
								</Link>
							)}
							<Link href={'/our-services'} className={'nav-overlay-card'} onClick={closeNavOverlay}>
								<div className={'nav-overlay-card-image'}>
									<img src={'/img/support/our-services.png'} alt={t('OurServices')} />
								</div>
								<span className={'nav-overlay-card-label'}>{t('OurServices')}</span>
							</Link>
							<Link href={'/cs'} className={'nav-overlay-card'} onClick={closeNavOverlay}>
								<div className={'nav-overlay-card-image'}>
									<img src={'/img/support/support.png'} alt={t('Support')} />
								</div>
								<span className={'nav-overlay-card-label'}>{t('Support')}</span>
							</Link>
							<Link href={'/pns-history/'} className={'nav-overlay-card'} onClick={closeNavOverlay}>
								<div className={'nav-overlay-card-image'}>
									<img src={'/img/contact/contact-hero.png'} alt={t('PnsHistoryNav')} />
								</div>
								<span className={'nav-overlay-card-label'}>{t('PnsHistoryNav')}</span>
							</Link>
							<Link href={'/repair-maintenance'} className={'nav-overlay-card'} onClick={closeNavOverlay}>
								<div className={'nav-overlay-card-image'}>
									<img src={'/img/support/our-services.png'} alt={t('RepairMaintenanceService')} />
								</div>
								<span className={'nav-overlay-card-label'}>{t('RepairMaintenanceService')}</span>
							</Link>
							<Link href={'/about-me'} className={'nav-overlay-card'} onClick={closeNavOverlay}>
								<div className={'nav-overlay-card-image'}>
									<img src={'/img/support/about-me.png'} alt={t('AboutMe')} />
								</div>
								<span className={'nav-overlay-card-label'}>{t('AboutMe')}</span>
							</Link>
							<Link href={'/contact-us'} className={'nav-overlay-card'} onClick={closeNavOverlay}>
								<div className={'nav-overlay-card-image'}>
									<img src={'/img/support/images.jpeg'} alt={t('ContactUs')} />
								</div>
								<span className={'nav-overlay-card-label'}>{t('ContactUs')}</span>
							</Link>
						</div>
					</div>
					<div className={'nav-overlay-footer'}>
						<span className={'nav-overlay-tagline'}>{t('Live your view')}</span>
					</div>
				</div>
			</Drawer>

			<NavMegaDrawer panel={megaPanel} onClose={closeMega} mode={mode} />
			</>
		);
	}
};

export default withRouter(Top);
