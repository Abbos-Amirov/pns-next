import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack, Box, Typography, IconButton, Button } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import PhoneIcon from '@mui/icons-material/Phone';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t, i18n } = useTranslation('common');
		const device = useDeviceDetect();
		const [authHeader, setAuthHeader] = useState<boolean>(false);
		const user = useReactiveVar(userVar);

		const memoizedValues = useMemo(() => {
			let title = '',
				desc = '',
				bgImage = '';

			switch (router.pathname) {
				case '/property':
					title = 'Property Search';
					desc = 'We are glad to see you again!';
					bgImage = '/img/banner/properties.png';
					break;
				case '/agent':
					title = 'Agents';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/agents.webp';
					break;
				case '/agent/detail':
					title = 'Agent Page';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/mypage':
					title = 'my page';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/header1.svg';
					break;
				case '/community':
					title = 'Community';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/community/detail':
					title = 'Community Detail';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/cs':
					title = 'CS';
					desc = 'We are glad to see you again!';
					bgImage = '/img/banner/header2.svg';
					break;
				case '/account/join':
					title = 'Login/Signup';
					desc = 'Authentication Process';
					bgImage = '/img/banner/header2.svg';
					setAuthHeader(true);
					break;
				case '/member':
					title = 'Member Page';
					desc = 'Home / For Rent';
					bgImage = '/img/banner/header1.svg';
					break;
				default:
					break;
			}

			return { title, desc, bgImage };
		}, [router.pathname]);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>Nestar</title>
						<meta name={'title'} content={`Nestar`} />
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
						<title>Nestar</title>
						<meta name={'title'} content={`Nestar`} />
					</Head>
					<Stack id="pc-wrap">
						{/* Dark Theme Navigation */}
						<Stack className={'navbar-dark'}>
							<Stack className={'container'}>
								{/* Logo - Left */}
								<Box component={'div'} className={'logo-left'}>
									<Link href={'/'}>
										<Box component={'div'} className={'kadhavu-logo-dark'}>
											<img src="/img/logo/favicon.svg" alt="KADHAVU Logo" className={'logo-icon-dark'} />
											<span className={'logo-text-dark'}>KADHAVU</span>
										</Box>
									</Link>
								</Box>

								{/* Navigation Links - Center */}
								<Box component={'div'} className={'nav-menu-dark'}>
									<Link href={'/'}>
										<span className={'nav-link-dark'}>HOME</span>
									</Link>
									<span className={'nav-separator-dark'}>/</span>
									<Link href={'/property'}>
										<span className={'nav-link-dark'}>PRODUCTS</span>
									</Link>
									<span className={'nav-separator-dark'}>/</span>
									<Link href={'/agent'}>
										<span className={'nav-link-dark'}>MEASURER</span>
									</Link>
									<span className={'nav-separator-dark'}>/</span>
									<Link href={'/community'}>
										<span className={'nav-link-dark'}>DOOR INSTALLER</span>
									</Link>
									<span className={'nav-separator-dark'}>/</span>
								
									
									<Link href={'/cs'}>
										<span className={'nav-link-dark'}>CONTACT US</span>
									</Link>
								</Box>

								{/* Right Actions */}
								<Box component={'div'} className={'nav-right-dark'}>
									<Box component={'a'} href="tel:+91170123023" className={'call-us-btn'}>
										<PhoneIcon className={'call-icon'} />
										<span>Call Us</span>
										<span className={'phone-number'}>(+91) 170-123-023</span>
									</Box>
									<IconButton className={'action-btn-dark'}>
										<SearchIcon />
									</IconButton>
									<IconButton className={'action-btn-dark'}>
										<MenuIcon />
									</IconButton>
								</Box>
							</Stack>
						</Stack>

						{/* Hero Section */}
						<Stack className={`header-basic ${authHeader && 'auth'}`}>
							<Stack className={'container'}>
								{/* TRUSTED COMPANY Badge */}
								<Box component={'div'} className={'trusted-badge'}>
									<Typography>TRUSTED COMPANY</Typography>
								</Box>

								{/* Headline */}
								<Box component={'div'} className={'hero-headline'}>
									<Typography component={'span'} className={'headline-text'}>
										Design{' '}
									</Typography>
									<Typography component={'span'} className={'headline-accent'}>
										Your{' '}
									</Typography>
									<br/>
									<Typography component={'span'} className={'headline-text'}>
										Inspired Doors
									</Typography>
								</Box>

								{/* Description */}
								

								{/* NEXT PROJECT Button */}
								<Button className={'next-project-btn'}>
									<Typography className={'next-project-text'}>NEXT</Typography>
									<Typography className={'next-project-text'}>PROJECT</Typography>
								</Button>
							</Stack>
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						{user?._id && <Chat />}

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
