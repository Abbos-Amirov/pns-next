import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack, Box, Typography, IconButton, Button, Menu, MenuItem } from '@mui/material';
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
		const { mode, toggleTheme } = useThemeMode();
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
										className={'product-dropdown-dark measurer-dropdown-dark'}
										onMouseEnter={handleProductClick}
										onMouseLeave={handleProductClose}
									>
										<Box component={'span'} className={'nav-link-dark measurer-link-dark product-link-dark'}>
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
											className={'product-menu-dark product-menu-with-images-dark'}
										>
											<Link
												href={'/property/window'}
												className={'measurer-menu-card'}
												onClick={handleProductClose}
												style={{
													display: 'flex',
													flexDirection: 'column',
													flex: 1,
													minWidth: 0,
													textDecoration: 'none',
													color: '#ffffff',
												}}
											>
												<span
													className={'measurer-menu-card-label measurer-menu-card-label-dark'}
													style={{
														textAlign: 'center',
														fontWeight: 700,
														textTransform: 'uppercase',
														padding: '12px 16px 6px',
														background: '#252422',
														color: '#e0e0e0',
														display: 'block',
													}}
												>
													{t('Windows')}
												</span>
												<div
													className={'measurer-menu-card-image'}
													style={{
														width: '100%',
														height: 100,
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
												className={'measurer-menu-card'}
												onClick={handleProductClose}
												style={{
													display: 'flex',
													flexDirection: 'column',
													flex: 1,
													minWidth: 0,
													textDecoration: 'none',
													color: '#ffffff',
												}}
											>
												<span
													className={'measurer-menu-card-label measurer-menu-card-label-dark'}
													style={{
														textAlign: 'center',
														fontWeight: 700,
														textTransform: 'uppercase',
														padding: '12px 16px 6px',
														background: '#252422',
														color: '#e0e0e0',
														display: 'block',
													}}
												>
													{t('Doors')}
												</span>
												<div
													className={'measurer-menu-card-image'}
													style={{
														width: '100%',
														height: 100,
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
									<span className={'nav-separator-dark'}>/</span>
									<Box 
										component={'div'} 
										className={'measurer-dropdown-dark'}
										onMouseEnter={handleMeasurerClick}
										onMouseLeave={handleMeasurerClose}
									>
										<Link href={'/agent'} style={{ textDecoration: 'none' }}>
											<span className={'nav-link-dark measurer-link-dark'}>
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
											className={'measurer-menu-dark measurer-menu-with-images-dark'}
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
													color: '#ffffff',
												}}
											>
												<span
													className={'measurer-menu-card-label measurer-menu-card-label-dark'}
													style={{
														textAlign: 'center',
														fontWeight: 700,
														textTransform: 'uppercase',
														padding: '12px 16px 6px',
														background: '#252422',
														color: '#e0e0e0',
														display: 'block',
													}}
												>
													{t('Measurers')}
												</span>
												<div
													className={'measurer-menu-card-image'}
													style={{
														width: '100%',
														height: 100,
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
													color: '#ffffff',
												}}
											>
												<span
													className={'measurer-menu-card-label measurer-menu-card-label-dark'}
													style={{
														textAlign: 'center',
														fontWeight: 700,
														textTransform: 'uppercase',
														padding: '12px 16px 6px',
														background: '#252422',
														color: '#e0e0e0',
														display: 'block',
													}}
												>
													{t('Installers')}
												</span>
												<div
													className={'measurer-menu-card-image'}
													style={{
														width: '100%',
														height: 100,
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
											<span className={'nav-link-dark support-link-dark'}>
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
											className={'support-menu-dark support-menu-with-images-dark'}
										>
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
													color: '#ffffff',
												}}
											>
												<span
													className={'support-menu-card-label support-menu-card-label-dark'}
													style={{
														textAlign: 'center',
														fontWeight: 700,
														textTransform: 'uppercase',
														padding: '12px 16px 6px',
														background: '#252422',
														color: '#e0e0e0',
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
												href={'/our-services'}
												className={'support-menu-card'}
												onClick={handleSupportClose}
												style={{
													display: 'flex',
													flexDirection: 'column',
													flex: 1,
													minWidth: 0,
													textDecoration: 'none',
													color: '#ffffff',
												}}
											>
												<span
													className={'support-menu-card-label support-menu-card-label-dark'}
													style={{
														textAlign: 'center',
														fontWeight: 700,
														textTransform: 'uppercase',
														padding: '12px 16px 6px',
														background: '#252422',
														color: '#e0e0e0',
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
												href={'/about-me'}
												className={'support-menu-card'}
												onClick={handleSupportClose}
												style={{
													display: 'flex',
													flexDirection: 'column',
													flex: 1,
													minWidth: 0,
													textDecoration: 'none',
													color: '#ffffff',
												}}
											>
												<span
													className={'support-menu-card-label support-menu-card-label-dark'}
													style={{
														textAlign: 'center',
														fontWeight: 700,
														textTransform: 'uppercase',
														padding: '12px 16px 6px',
														background: '#252422',
														color: '#e0e0e0',
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
								</Box>
							</Stack>
						</Stack>

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
								<Box component={'div'} className={'hero-description'}>
									<Typography component={'p'} className={'description-text'}>
										{memoizedValues.desc}
									</Typography>
								</Box>

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
