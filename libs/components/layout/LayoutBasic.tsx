import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack, Box, Typography, IconButton, Button, Menu, MenuItem } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import AIChat from '../AIChat';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import TopBasic from '../TopBasic';
import { REACT_APP_API_URL } from '../../config';
import { useThemeMode } from '../../context/ThemeContext';

const getUserImageSrc = (img?: string) => {
	if (!img) return '/img/profile/defaultUser.svg';
	if (img.startsWith('http://') || img.startsWith('https://')) return img;
	if (img.startsWith('/img/')) return img;
	return `${REACT_APP_API_URL}/${img}`;
};

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t, i18n } = useTranslation('common');
		const device = useDeviceDetect();
		const [authHeader, setAuthHeader] = useState<boolean>(false);
		const user = useReactiveVar(userVar);
		const [lang, setLang] = useState<string | null>('en');
		const [langAnchor, setLangAnchor] = useState<null | HTMLElement>(null);
		const langOpen = Boolean(langAnchor);
		const [measurerAnchor, setMeasurerAnchor] = useState<null | HTMLElement>(null);
		const measurerOpen = Boolean(measurerAnchor);
		const [productAnchor, setProductAnchor] = useState<null | HTMLElement>(null);
		const productOpen = Boolean(productAnchor);
		const [supportAnchor, setSupportAnchor] = useState<null | HTMLElement>(null);
		const supportOpen = Boolean(supportAnchor);
		const [navOverlayOpen, setNavOverlayOpen] = useState(false);
		const { mode, toggleTheme } = useThemeMode();

		const openNavOverlay = () => setNavOverlayOpen(true);
		const closeNavOverlay = () => setNavOverlayOpen(false);
		const [headerBgIndex, setHeaderBgIndex] = useState(0);

		const headerBgImages = [
			'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1920&q=80',
			'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1920&q=80',
			'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
			'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1920&q=80',
		];

		useEffect(() => {
			const interval = setInterval(() => {
				setHeaderBgIndex((prev) => (prev + 1) % 5);
			}, 5000);
			return () => clearInterval(interval);
		}, []);

		const memoizedValues = useMemo(() => {
			let title = '',
				desc = '',
				bgImage = '';

			switch (router.pathname) {
				case '/property':
				case '/property/window':
				case '/property/door':
					title = t('Product Search');
					desc = t('We are glad to see you again!');
					bgImage = '/img/banner/properties.png';
					break;
				case '/agent':
					title = t('Measurer Page');
					desc = t('Home / For Rent');
					bgImage = '/img/banner/agents.webp';
					break;
				case '/agent/detail':
					title = t('Measurer Page');
					desc = t('Home / For Rent');
					bgImage = '/img/banner/header2.svg';
					break;
				case '/mypage':
					title = t('my page');
					desc = t('Home / For Rent');
					bgImage = '/img/banner/header1.svg';
					break;
				case '/community':
					title = t('Community');
					desc = t('Home / For Rent');
					bgImage = '/img/banner/header2.svg';
					break;
				case '/community/detail':
					title = t('Community Detail');
					desc = t('Home / For Rent');
					bgImage = '/img/banner/header2.svg';
					break;
				case '/cs':
					title = t('CS');
					desc = t('We are glad to see you again!');
					bgImage = '/img/banner/header2.svg';
					break;
				case '/our-services':
					title = t('OurServices');
					desc = t('OurServicesSubtitle');
					bgImage = '/img/banner/header2.svg';
					break;
				case '/repair-maintenance':
					title = t('RepairMaintenanceService');
					desc = t('RepairMaintenanceSubtitle');
					bgImage = '/img/banner/header2.svg';
					break;
				case '/account/join':
					title = t('Login/Signup');
					desc = t('Authentication Process');
					bgImage = '/img/banner/header2.svg';
					setAuthHeader(true);
					break;
				case '/member':
					title = t('Member Page');
					desc = t('Home / For Rent');
					bgImage = '/img/banner/header1.svg';
					break;
				default:
					break;
			}

			return { title, desc, bgImage };
		}, [router.pathname, i18n.language, t]);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		useEffect(() => {
			if (localStorage.getItem('locale') === null) {
				localStorage.setItem('locale', 'en');
				setLang('en');
			} else {
				setLang(localStorage.getItem('locale'));
			}
		}, [router]);

		/** HANDLERS **/
		const handleLangClick = (e: React.MouseEvent<HTMLElement>) => {
			setLangAnchor(e.currentTarget);
		};

		const handleLangClose = () => {
			setLangAnchor(null);
		};

		const handleLangChoice = useCallback(
			async (locale: string) => {
				setLang(locale);
				localStorage.setItem('locale', locale);
				setLangAnchor(null);
				await router.push(router.asPath, router.asPath, { locale });
			},
			[router],
		);

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

		/** HANDLERS **/

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>PNS_DEV</title>
						<meta name={'title'} content={`PNS_DEV`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>PNS_DEV</title>
						<meta name={'title'} content={`PNS_DEV`} />
					</Head>
					<Stack id="pc-wrap">

					<TopBasic/>
					
						{/* Dark Theme Navigation */}
						<Stack className={'navbar-dark'}>
							<Stack className={'container'}>
								{/* Logo - Left */}
								<Box component={'div'} className={'logo-left'}>
									<Link href={'/'}>
										<Box component={'div'} className={'kadhavu-logo-dark'}>
											<img src={mode === 'dark' ? '/img/logo/pns-arched-door-light.svg' : '/img/logo/pns-arched-door.svg'} alt="PNS Window" className={'logo-icon-dark'} />
											<span className={'logo-text-dark'}>PNSWINDOW</span>
										</Box>
									</Link>
								</Box>

								{/* Navigation Links - Center */}
								<Box component={'div'} className={'nav-menu-dark'}>
									<Link href={'/'}>
										<span className={'nav-link-dark'}>{t('Home')}</span>
									</Link>
									<span className={'nav-separator-dark'}>/</span>
									<Box
										component={'div'}
										className={'product-dropdown-dark'}
										onMouseEnter={handleProductClick}
										onMouseLeave={handleProductClose}
									>
										<Box component={'span'} className={`nav-link-dark product-link-dark ${productOpen ? 'is-open' : ''}`}>
											{t('Product')}
											<KeyboardArrowDownIcon className={'dropdown-icon-dark'} />
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
											className={'product-menu-dark product-menu-with-images-dark premium-mega-menu'}
										>
											<Link href={'/property/window'} className={'product-menu-card'} onClick={handleProductClose}>
												<span className={'product-menu-card-label support-menu-card-label-dark'}>{t('Windows')}</span>
												<div className={'product-menu-card-image'}>
													<img src={'/img/property/window1.jpg'} alt={t('Windows')} />
												</div>
											</Link>
											<Link href={'/property/door'} className={'product-menu-card'} onClick={handleProductClose}>
												<span className={'product-menu-card-label support-menu-card-label-dark'}>{t('Doors')}</span>
												<div className={'product-menu-card-image'}>
													<img src={'/img/property/bigImage.png'} alt={t('Doors')} />
												</div>
											</Link>
										</Menu>
									</Box>
									<span className={'nav-separator-dark'}>/</span>
									<Box 
										component={'div'} 
										className={'measurer-dropdown-dark'}
										onMouseEnter={handleMeasurerClick}
										onMouseLeave={handleMeasurerClose}
									>
										<Link href={'/agent'} style={{ textDecoration: 'none' }}>
											<span className={`nav-link-dark measurer-link-dark ${measurerOpen ? 'is-open' : ''}`}>
												{t('Experts')}
												<KeyboardArrowDownIcon className={'dropdown-icon-dark'} />
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
											className={'measurer-menu-dark measurer-menu-with-images-dark premium-mega-menu'}
										>
											<Link href={'/agent'} className={'measurer-menu-card'} onClick={handleMeasurerClose}>
												<span className={'measurer-menu-card-label measurer-menu-card-label-dark'}>{t('Measurers')}</span>
												<div className={'measurer-menu-card-image'}>
													<img src={'/img/experts/measurers.png'} alt={t('Measurers')} />
												</div>
											</Link>
											<Link href={'/installer'} className={'measurer-menu-card'} onClick={handleMeasurerClose}>
												<span className={'measurer-menu-card-label measurer-menu-card-label-dark'}>{t('Installers')}</span>
												<div className={'measurer-menu-card-image'}>
													<img src={'/img/experts/installers.png'} alt={t('Installers')} />
												</div>
											</Link>
										</Menu>
									</Box>
									<span className={'nav-separator-dark'}>/</span>
									<Link href={'/city'}>
										<span className={'nav-link-dark'}>{t('City')}</span>
									</Link>
									<span className={'nav-separator-dark'}>/</span>
									<Link href={'/community'}>
										<span className={'nav-link-dark'}>{t('Community')}</span>
									</Link>
									{user?._id && (
										<>
											<span className={'nav-separator-dark'}>/</span>
											<Link href={'/mypage'}>
												<span className={'nav-link-dark'}>{t('My Page')}</span>
											</Link>
										</>
									)}
									<span className={'nav-separator-dark'}>/</span>
									<Box
										component={'div'}
										className={'support-dropdown-dark'}
										onMouseEnter={handleSupportClick}
										onMouseLeave={handleSupportClose}
									>
										<Link href={'/cs'} style={{ textDecoration: 'none' }}>
											<span className={`nav-link-dark support-link-dark ${supportOpen ? 'is-open' : ''}`}>
												<KeyboardArrowDownIcon className={'dropdown-icon-dark'} />
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
											className={'support-menu-dark support-menu-with-images-dark premium-mega-menu'}
										>
											<Link href={'/our-services'} className={'support-menu-card'} onClick={handleSupportClose}>
												<span className={'support-menu-card-label support-menu-card-label-dark'}>{t('OurServices')}</span>
												<div className={'support-menu-card-image'}>
													<img src={'/img/support/our-services.png'} alt={t('OurServices')} />
												</div>
											</Link>
											<Link href={'/cs'} className={'support-menu-card'} onClick={handleSupportClose}>
												<span className={'support-menu-card-label support-menu-card-label-dark'}>{t('Support')}</span>
												<div className={'support-menu-card-image'}>
													<img src={'/img/support/support.png'} alt={t('Support')} />
												</div>
											</Link>
											<Link href={'/repair-maintenance'} className={'support-menu-card'} onClick={handleSupportClose}>
												<span className={'support-menu-card-label support-menu-card-label-dark'}>{t('RepairMaintenanceService')}</span>
												<div className={'support-menu-card-image'}>
													<img src={'/img/support/our-services.png'} alt={t('RepairMaintenanceService')} />
												</div>
											</Link>
											<Link href={'/about-me'} className={'support-menu-card'} onClick={handleSupportClose}>
												<span className={'support-menu-card-label support-menu-card-label-dark'}>{t('AboutMe')}</span>
												<div className={'support-menu-card-image'}>
													<img src={'/img/support/about-me.png'} alt={t('AboutMe')} />
												</div>
											</Link>
										</Menu>
									</Box>
								</Box>

								{/* Right Actions */}
								<Box component={'div'} className={'nav-right-dark'}>
									<Box component={'a'} href="tel:+91170123023" className={'call-us-btn'}>
										<PhoneIcon className={'call-icon'} />
										<span className={'phone-number'}>(+82) 010-8200-5998</span>
									</Box>
									{/* Dark mode + Language - yonma-yon */}
									<Box component={'div'} className={'lang-dark-group'}>
										<IconButton 
											className={'dark-mode-btn-dark'} 
											size="small" 
											onClick={toggleTheme} 
											title={mode === 'dark' ? 'Light mode' : 'Dark mode'}
										>
											{mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
										</IconButton>
										<IconButton 
											className={'lang-switcher-btn'}
											onClick={handleLangClick}
										>
											<LanguageIcon />
										</IconButton>
									</Box>
									<Menu
										anchorEl={langAnchor}
										open={langOpen}
										onClose={handleLangClose}
										anchorOrigin={{
											vertical: 'bottom',
											horizontal: 'right',
										}}
										transformOrigin={{
											vertical: 'top',
											horizontal: 'right',
										}}
										className={'lang-menu'}
									>
										<MenuItem 
											onClick={() => handleLangChoice('en')} 
											selected={lang === 'en'}
											className={'lang-menu-item'}
										>
											English
										</MenuItem>
										<MenuItem 
											onClick={() => handleLangChoice('ru')} 
											selected={lang === 'ru'}
											className={'lang-menu-item'}
										>
											Русский
										</MenuItem>
										<MenuItem 
											onClick={() => handleLangChoice('kr')} 
											selected={lang === 'kr'}
											className={'lang-menu-item'}
										>
											한국어
										</MenuItem>
										<MenuItem 
											onClick={() => handleLangChoice('zh')} 
											selected={lang === 'zh'}
											className={'lang-menu-item'}
										>
											中文
										</MenuItem>
										<MenuItem 
											onClick={() => handleLangChoice('ja')} 
											selected={lang === 'ja'}
											className={'lang-menu-item'}
										>
											日本語
										</MenuItem>
									</Menu>
									{/* Auth Buttons or User Profile */}
									{user?._id ? (
										<Box component={'div'} className={'user-profile-section-dark'}>
											<Link href={'/mypage'} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
												<div className={'user-avatar-small-dark'}>
													<img 
														src={getUserImageSrc(user?.memberImage)} 
														alt={user?.memberNick || t('User')} 
														onError={(e) => {
															(e.target as HTMLImageElement).src = '/img/profile/defaultUser.svg';
														}}
													/>
												</div>
												<Typography className={'user-name-text-dark'}>{user?.memberNick || t('User')}</Typography>
											</Link>
										</Box>
									) : (
										<Button 
											className={'login-signup-btn-dark'}
											onClick={() => router.push('/account/join')}
										>
											{t('Login/Signup')}
										</Button>
									)}
									{/* Hamburger - oxirida, yaqqol ko'rinadi */}
									<IconButton 
										className={'profile-action-btn hamburger-btn hamburger-btn-dark'}
										size="small" 
										onClick={openNavOverlay}
										title={t('Menu')}
										sx={{ 
											ml: 0.5,
											width: 40,
											height: 40,
											minWidth: 40,
											borderRadius: '50%',
											backgroundColor: 'rgba(201, 169, 98, 0.4) !important',
											color: '#c9a962 !important',
											'&:hover': { backgroundColor: 'rgba(201, 169, 98, 0.6) !important', color: '#e8dcc8 !important' },
											'& svg': { fontSize: 22 }
										}}
									>
										<MenuIcon />
									</IconButton>
								</Box>
							</Stack>
						</Stack>

						{/* Full-screen Nav Overlay (hamburger menu) */}
						<Drawer
							anchor="top"
							open={navOverlayOpen}
							onClose={closeNavOverlay}
							className={'nav-overlay-drawer'}
							sx={{
								'& .MuiDrawer-paper': {
									width: '100%',
									maxWidth: '100%',
									height: 'auto',
									maxHeight: '50vh',
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
												<img src={'/img/property/window1.jpg'} alt={t('Windows')} />
											</div>
											<span className={'nav-overlay-card-label'}>{t('Windows')}</span>
										</Link>
										<Link href={'/property/door'} className={'nav-overlay-card'} onClick={closeNavOverlay}>
											<div className={'nav-overlay-card-image'}>
												<img src={'/img/nav-overlay/doors.png'} alt={t('Doors')} />
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
												<img src={'/img/banner/properties.png'} alt={t('City')} />
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
									</div>
								</div>
								<div className={'nav-overlay-footer'}>
									<span className={'nav-overlay-tagline'}>{t('Live your view')}</span>
								</div>
							</div>
						</Drawer>

						{/* Hero Section */}
						<Stack className={`header-basic ${authHeader && 'auth'}`}>
							{/* Rotating background images */}
							{headerBgImages.map((src, i) => (
								<Box
									key={src}
									component={'div'}
									className={`header-basic-bg-slide ${i === headerBgIndex ? 'active' : ''}`}
									sx={{
										backgroundImage: `url(${src})`,
									}}
								/>
							))}
							<Box component={'div'} className={'header-basic-overlay'} />
							<Stack className={'container'}>
								{/* TRUSTED COMPANY Badge */}
								<Box component={'div'} className={'trusted-badge'}>
									<Typography>{t('TRUSTED COMPANY')}</Typography>
								</Box>

								{/* Headline */}
								<Box component={'div'} className={'hero-headline'}>
									<Typography component={'span'} className={'headline-text'}>
										{t('Design')}{' '}
									</Typography>
									<Typography component={'span'} className={'headline-accent'}>
										{t('Your')}{' '}
									</Typography>
									<br/>
									<Typography component={'span'} className={'headline-text'}>
										{t('Inspired Doors')}
									</Typography>
								</Box>

								{/* Description */}
								{/* <Box component={'div'} className={'hero-description'}>
									<Typography component={'p'} className={'description-text'}>
										{memoizedValues.desc}
									</Typography>
								</Box> */}

								{/* NEXT PROJECT Button */}
								<Button className={'next-project-btn'}>
									<Typography className={'next-project-text'}>{t('NEXT')}</Typography>
									<Typography className={'next-project-text'}>{t('PROJECT')}</Typography>
								</Button>
							</Stack>
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						 <Chat />
						 <AIChat />

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutBasic;
