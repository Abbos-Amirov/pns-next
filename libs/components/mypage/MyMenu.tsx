import React from 'react';
import { useRouter } from 'next/router';
import { Stack, Typography, Box, List, ListItem } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import PortraitIcon from '@mui/icons-material/Portrait';
import IconButton from '@mui/material/IconButton';
import { REACT_APP_API_URL } from '../../config';
import { logOut } from '../../auth';
import { sweetConfirmAlert, sweetMixinErrorAlert } from '../../sweetAlert';

const MyMenu = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const pathname = router.query.category ?? 'myProfile';
	const category: any = router.query?.category ?? 'myProfile';
	const user = useReactiveVar(userVar);

	/** HANDLERS **/
	const logoutHandler = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to logout?')) logOut();
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err.message);
		}
	};

	if (device === 'mobile') {
		return <div>MY MENU</div>;
	} else {
		return (
			<Stack width={'100%'} className={'mypage-sidebar'}>
				{/* Profile Header Section */}
				<Box component={'div'} className={'profile-header-section'}>
					<Box component={'div'} className={'profile-header-bg'}></Box>
					<Stack className={'profile-content'}>
						<Box component={'div'} className={'profile-avatar-wrapper'}>
							<img
								src={user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'}
								alt={'member-photo'}
								className={'profile-avatar'}
							/>
						</Box>
						<Stack className={'user-info-section'}>
							<Typography className={'user-name'}>{user?.memberNick || 'User'}</Typography>
							<Box component={'div'} className={'user-phone-section'}>
								<img src={'/img/icons/call.svg'} alt={'icon'} className={'phone-icon'} />
								<Typography className={'phone-number'}>{user?.memberPhone || 'No phone'}</Typography>
							</Box>
							{user?.memberType === 'ADMIN' ? (
								<a href="/_admin/users" target={'_blank'} className={'member-type-link'}>
									<Typography className={'member-type-badge'}>{user?.memberType}</Typography>
								</a>
							) : (
								<Typography className={'member-type-badge'}>{user?.memberType || 'USER'}</Typography>
							)}
						</Stack>
					</Stack>
				</Box>
				{/* Navigation Menu Sections */}
				<Stack className={'menu-sections'}>
					<Stack className={'menu-section'}>
						<Typography className="section-title" variant={'h6'}>
							MANAGE LISTINGS
						</Typography>
						<List className={'menu-list'}>
							{user.memberType === 'AGENT' && (
								<>
									{user.memberType === 'AGENT' && (
								<>
									<ListItem className={pathname === 'addProperty' ? 'menu-item-active' : 'menu-item'}>
										<Link
											href={{
												pathname: '/mypage',
												query: { category: 'addProperty' },
											}}
											scroll={false}
										>
											<Box component={'div'} className={'menu-item-content'}>
												{category === 'addProperty' ? (
													<img className={'menu-icon'} src={'/img/icons/whiteTab.svg'} alt={'icon'} />
												) : (
													<img className={'menu-icon'} src={'/img/icons/newTab.svg'} alt={'icon'} />
												)}
												<Typography className={'menu-item-text'} variant={'body2'}>
													Add Property
												</Typography>
											</Box>
										</Link>
									</ListItem>
									<ListItem className={pathname === 'myProperties' ? 'menu-item-active' : 'menu-item'}>
										<Link
											href={{
												pathname: '/mypage',
												query: { category: 'myProperties' },
											}}
											scroll={false}
										>
											<Box component={'div'} className={'menu-item-content'}>
												{category === 'myProperties' ? (
													<img className={'menu-icon'} src={'/img/icons/homeWhite.svg'} alt={'icon'} />
												) : (
													<img className={'menu-icon'} src={'/img/icons/home.svg'} alt={'icon'} />
												)}
												<Typography className={'menu-item-text'} variant={'body2'}>
													My Properties
												</Typography>
											</Box>
										</Link>
									</ListItem>
								</>
							)}
								</>
							)}
							{user.memberType === 'MEASURER' && (
								<>
									<ListItem className={pathname === 'myLocations' ? 'menu-item-active' : 'menu-item'}>
										<Link
											href={{
												pathname: '/mypage',
												query: { category: 'myLocations' },
											}}
											scroll={false}
										>
											<Box component={'div'} className={'menu-item-content'}>
												{category === 'myLocations' ? (
													<img className={'menu-icon'} src={'/img/icons/homeWhite.svg'} alt={'icon'} />
												) : (
													<img className={'menu-icon'} src={'/img/icons/home.svg'} alt={'icon'} />
												)}
												<Typography className={'menu-item-text'} variant={'body2'}>
													My Locations
												</Typography>
											</Box>
										</Link>
									</ListItem>
									<ListItem className={pathname === 'addLocation' ? 'menu-item-active' : 'menu-item'}>
										<Link
											href={{
												pathname: '/mypage',
												query: { category: 'addLocation' },
											}}
											scroll={false}
										>
											<Box component={'div'} className={'menu-item-content'}>
												{category === 'addLocation' ? (
													<img className={'menu-icon'} src={'/img/icons/whiteTab.svg'} alt={'icon'} />
												) : (
													<img className={'menu-icon'} src={'/img/icons/newTab.svg'} alt={'icon'} />
												)}
												<Typography className={'menu-item-text'} variant={'body2'}>
													Add Location
												</Typography>
											</Box>
										</Link>
									</ListItem>
								</>
							)}
							<ListItem className={pathname === 'myFavorites' ? 'menu-item-active' : 'menu-item'}>
								<Link
									href={{
										pathname: '/mypage',
										query: { category: 'myFavorites' },
									}}
									scroll={false}
								>
									<Box component={'div'} className={'menu-item-content'}>
										{category === 'myFavorites' ? (
											<img className={'menu-icon'} src={'/img/icons/likeWhite.svg'} alt={'icon'} />
										) : (
											<img className={'menu-icon'} src={'/img/icons/like.svg'} alt={'icon'} />
										)}
										<Typography className={'menu-item-text'} variant={'body2'}>
											My Favorites
										</Typography>
									</Box>
								</Link>
							</ListItem>
							<ListItem className={pathname === 'recentlyVisited' ? 'menu-item-active' : 'menu-item'}>
								<Link
									href={{
										pathname: '/mypage',
										query: { category: 'recentlyVisited' },
									}}
									scroll={false}
								>
									<Box component={'div'} className={'menu-item-content'}>
										{category === 'recentlyVisited' ? (
											<img className={'menu-icon'} src={'/img/icons/searchWhite.svg'} alt={'icon'} />
										) : (
											<img className={'menu-icon'} src={'/img/icons/search.svg'} alt={'icon'} />
										)}
										<Typography className={'menu-item-text'} variant={'body2'}>
											Recently Visited
										</Typography>
									</Box>
								</Link>
							</ListItem>
							<ListItem className={pathname === 'followers' ? 'menu-item-active' : 'menu-item'}>
								<Link
									href={{
										pathname: '/mypage',
										query: { category: 'followers' },
									}}
									scroll={false}
								>
									<Box component={'div'} className={'menu-item-content'}>
										<svg
											className={'menu-icon'}
											fill={category === 'followers' ? '#ffffff' : '#8B4513'}
											height="18px"
											width="18px"
											viewBox="0 0 328 328"
										>
											<g>
												<path d="M52.25,64.001c0,34.601,28.149,62.749,62.75,62.749c34.602,0,62.751-28.148,62.751-62.749 S149.602,1.25,115,1.25C80.399,1.25,52.25,29.4,52.25,64.001z" />
												<path d="M217.394,262.357c2.929,2.928,6.768,4.393,10.606,4.393c3.839,0,7.678-1.465,10.607-4.394 c5.857-5.858,5.857-15.356-0.001-21.214l-19.393-19.391l19.395-19.396c5.857-5.858,5.857-15.356-0.001-21.214 c-5.858-5.857-15.356-5.856-21.214,0.001l-30,30.002c-2.813,2.814-4.393,6.629-4.393,10.607c0,3.979,1.58,7.794,4.394,10.607 L217.394,262.357z" />
												<path d="M15,286.75h125.596c19.246,24.348,49.031,40,82.404,40c57.896,0,105-47.103,105-105 c0-57.896-47.104-105-105-105c-34.488,0-65.145,16.716-84.297,42.47c-7.764-1.628-15.695-2.47-23.703-2.47 c-63.411,0-115,51.589-115,115C0,280.034,6.716,286.75,15,286.75z M223,146.75c41.355,0,75,33.645,75,75s-33.645,75-75,75 s-75-33.645-75-75S181.644,146.75,223,146.75z" />
											</g>
										</svg>
										<Typography className={'menu-item-text'} variant={'body2'}>
											My Followers
										</Typography>
									</Box>
								</Link>
							</ListItem>
							<ListItem className={pathname === 'followings' ? 'menu-item-active' : 'menu-item'}>
								<Link
									href={{
										pathname: '/mypage',
										query: { category: 'followings' },
									}}
									scroll={false}
								>
									<Box component={'div'} className={'menu-item-content'}>
										<svg
											className={'menu-icon'}
											fill={category === 'followings' ? '#ffffff' : '#8B4513'}
											height="18px"
											width="18px"
											viewBox="0 0 328 328"
										>
											<g>
												<path d="M177.75,64.001C177.75,29.4,149.601,1.25,115,1.25c-34.602,0-62.75,28.15-62.75,62.751 S80.398,126.75,115,126.75C149.601,126.75,177.75,98.602,177.75,64.001z" />
												<path d="M228.606,181.144c-5.858-5.857-15.355-5.858-21.214-0.001c-5.857,5.857-5.857,15.355,0,21.214 l19.393,19.396l-19.393,19.391c-5.857,5.857-5.857,15.355,0,21.214c2.93,2.929,6.768,4.394,10.607,4.394 c3.838,0,7.678-1.465,10.605-4.393l30-29.998c2.813-2.814,4.395-6.629,4.395-10.607c0-3.978-1.58-7.793-4.394-10.607 L228.606,181.144z" />
												<path d="M223,116.75c-34.488,0-65.145,16.716-84.298,42.47c-7.763-1.628-15.694-2.47-23.702-2.47 c-63.412,0-115,51.589-115,115c0,8.284,6.715,15,15,15h125.596c19.246,24.348,49.03,40,82.404,40c57.896,0,105-47.103,105-105 C328,163.854,280.896,116.75,223,116.75z M223,296.75c-41.356,0-75-33.645-75-75s33.644-75,75-75c41.354,0,75,33.645,75,75 S264.354,296.75,223,296.75z" />
											</g>
										</svg>
										<Typography className={'menu-item-text'} variant={'body2'}>
											My Followings
										</Typography>
									</Box>
								</Link>
							</ListItem>
						</List>
					</Stack>
					<Stack className={'menu-section'}>
						<Typography className="section-title" variant={'h6'}>
							Community
						</Typography>
						<List className={'menu-list'}>
							<ListItem className={pathname === 'myArticles' ? 'menu-item-active' : 'menu-item'}>
								<Link
									href={{
										pathname: '/mypage',
										query: { category: 'myArticles' },
									}}
									scroll={false}
								>
									<Box component={'div'} className={'menu-item-content'}>
										{category === 'myArticles' ? (
											<img className={'menu-icon'} src={'/img/icons/discoveryWhite.svg'} alt={'icon'} />
										) : (
											<img className={'menu-icon'} src={'/img/icons/discovery.svg'} alt={'icon'} />
										)}
										<Typography className={'menu-item-text'} variant={'body2'}>
											Articles
										</Typography>
									</Box>
								</Link>
							</ListItem>
							<ListItem className={pathname === 'writeArticle' ? 'menu-item-active' : 'menu-item'}>
								<Link
									href={{
										pathname: '/mypage',
										query: { category: 'writeArticle' },
									}}
									scroll={false}
								>
									<Box component={'div'} className={'menu-item-content'}>
										{category === 'writeArticle' ? (
											<img className={'menu-icon'} src={'/img/icons/whiteTab.svg'} alt={'icon'} />
										) : (
											<img className={'menu-icon'} src={'/img/icons/newTab.svg'} alt={'icon'} />
										)}
										<Typography className={'menu-item-text'} variant={'body2'}>
											Write Article
										</Typography>
									</Box>
								</Link>
							</ListItem>
						</List>
					</Stack>
					<Stack className={'menu-section'}>
						<Typography className="section-title" variant={'h6'}>
							MANAGE ACCOUNT
						</Typography>
						<List className={'menu-list'}>
							<ListItem className={pathname === 'myProfile' ? 'menu-item-active' : 'menu-item'}>
								<Link
									href={{
										pathname: '/mypage',
										query: { category: 'myProfile' },
									}}
									scroll={false}
								>
									<Box component={'div'} className={'menu-item-content'}>
										{category === 'myProfile' ? (
											<img className={'menu-icon'} src={'/img/icons/userWhite.svg'} alt={'icon'} />
										) : (
											<img className={'menu-icon'} src={'/img/icons/user.svg'} alt={'icon'} />
										)}
										<Typography className={'menu-item-text'} variant={'body2'}>
											My Profile
										</Typography>
									</Box>
								</Link>
							</ListItem>
							<ListItem className={'menu-item'} onClick={logoutHandler} sx={{ cursor: 'pointer' }}>
								<Box component={'div'} className={'menu-item-content'}>
									<img className={'menu-icon'} src={'/img/icons/logout.svg'} alt={'icon'} />
									<Typography className={'menu-item-text'} variant={'body2'}>
										Logout
									</Typography>
								</Box>
							</ListItem>
						</List>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default MyMenu;
