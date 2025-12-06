import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import { useRouter } from 'next/router';
import { Box, Stack, Card, CardContent, Typography, Button, Grid, IconButton } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ArticleIcon from '@mui/icons-material/Article';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LogoutIcon from '@mui/icons-material/Logout';
import { useReactiveVar, useQuery } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { logOut } from '../../libs/auth';
import { sweetConfirmAlert } from '../../libs/sweetAlert';
import { GET_ALL_MEMBERS_BY_ADMIN, GET_PRODUCTS, GET_CS_NOTICE_LIST } from '../../apollo/admin/query';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { MembersInquiry } from '../../libs/types/member/member.input';
import { ProductsInquiry } from '../../libs/types/product/products.input';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { NoticeInquiry } from '../../libs/types/notice/notice.inquiry';
import { Direction } from '../../libs/enums/common.enum';
import { NoticeCategory } from '../../libs/enums/notice.enum';

const AdminHome: NextPage = (props: any) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [stats, setStats] = useState({
		totalUsers: 0,
		totalProperties: 0,
		totalArticles: 0,
		totalInquiries: 0,
	});

	/** APOLLO REQUESTS **/
	// Members query
	const membersInquiry: MembersInquiry = {
		page: 1,
		limit: 1,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	};

	const { data: membersData } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		variables: { input: membersInquiry },
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
	});

	// Products query
	const productsInquiry: ProductsInquiry = {
		page: 1,
		limit: 1,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	};

	const { data: productsData } = useQuery(GET_PRODUCTS, {
		variables: { input: productsInquiry },
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
	});

	// Board Articles query
	const articlesInquiry: BoardArticlesInquiry = {
		page: 1,
		limit: 1,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	};

	const { data: articlesData } = useQuery(GET_BOARD_ARTICLES, {
		variables: { input: articlesInquiry },
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
	});

	// CS Inquiries query (using GET_CS_NOTICE_LIST with INQUIRY category)
	const inquiriesInquiry: NoticeInquiry = {
		page: 1,
		limit: 1,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {
			noticeCategory: NoticeCategory.INQUIRY,
		},
	};

	const { data: inquiriesData } = useQuery(GET_CS_NOTICE_LIST, {
		variables: { input: inquiriesInquiry },
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
	});

	/** LIFECYCLES **/
	useEffect(() => {
		// Members total
		let totalUsers = 0;
		if (membersData?.getAllMembersByAdmin?.metaCounter) {
			const metaCounter = membersData.getAllMembersByAdmin.metaCounter;
			totalUsers = Array.isArray(metaCounter) 
				? (metaCounter[0]?.total || 0)
				: (metaCounter?.total || 0);
		}

		// Products total
		let totalProperties = 0;
		if (productsData?.getProducts?.metaCounter) {
			const metaCounter = productsData.getProducts.metaCounter;
			totalProperties = Array.isArray(metaCounter) 
				? (metaCounter[0]?.total || 0)
				: (metaCounter?.total || 0);
		}

		// Articles total
		let totalArticles = 0;
		if (articlesData?.getBoardArticles?.metaCounter) {
			const metaCounter = articlesData.getBoardArticles.metaCounter;
			totalArticles = Array.isArray(metaCounter) 
				? (metaCounter[0]?.total || 0)
				: (metaCounter?.total || 0);
		}

		// Inquiries total (using GET_CS_NOTICE_LIST with INQUIRY category)
		let totalInquiries = 0;
		if (inquiriesData?.getCsNoticeList?.total !== undefined) {
			totalInquiries = inquiriesData.getCsNoticeList.total || 0;
		}

		setStats({
			totalUsers,
			totalProperties,
			totalArticles,
			totalInquiries,
		});
	}, [membersData, productsData, articlesData, inquiriesData]);

	/** HANDLERS **/
	const handleNavigate = (path: string) => {
		router.push(path);
	};

	const handleLogout = async () => {
		try {
			if (await sweetConfirmAlert('Do you want to logout?')) {
				logOut();
				await router.push('/');
			}
		} catch (err: any) {
			console.log('ERROR, logoutHandler:', err.message);
		}
	};

	const statCards = [
		{
			title: 'Total Users',
			value: stats.totalUsers,
			icon: <PeopleIcon sx={{ fontSize: 40 }} />,
			color: '#8B4513',
			bgColor: 'rgba(139, 69, 19, 0.1)',
			path: '/_admin/users',
		},
		{
			title: 'Products',
			value: stats.totalProperties,
			icon: <HomeWorkIcon sx={{ fontSize: 40 }} />,
			color: '#1646C1',
			bgColor: 'rgba(22, 70, 193, 0.1)',
			path: '/_admin/products',
		},
		{
			title: 'Community Articles',
			value: stats.totalArticles,
			icon: <ArticleIcon sx={{ fontSize: 40 }} />,
			color: '#E92C28',
			bgColor: 'rgba(233, 44, 40, 0.1)',
			path: '/_admin/community',
		},
		{
			title: 'CS Inquiries',
			value: stats.totalInquiries,
			icon: <SupportAgentIcon sx={{ fontSize: 40 }} />,
			color: '#229a16',
			bgColor: 'rgba(34, 154, 22, 0.1)',
			path: '/_admin/cs/inquiry',
		},
	];

	const quickLinks = [
		{ title: 'User Management', path: '/_admin/users', icon: <PeopleIcon />, color: '#8B4513' },
		{ title: 'Product Management', path: '/_admin/products', icon: <HomeWorkIcon />, color: '#1646C1' },
		{ title: 'Community Management', path: '/_admin/community', icon: <ArticleIcon />, color: '#E92C28' },
		{ title: 'FAQ Management', path: '/_admin/cs/faq', icon: <SupportAgentIcon />, color: '#229a16' },
		{ title: 'Notice Management', path: '/_admin/cs/notice', icon: <ArticleIcon />, color: '#8B4513' },
		{ title: 'Inquiry Management', path: '/_admin/cs/inquiry', icon: <SupportAgentIcon />, color: '#1646C1' },
	];

	return (
		<Box component={'div'} className={'admin-dashboard'}>
			{/* Welcome Section with Logout */}
			<Box component={'div'} className={'welcome-section'}>
				<Box component={'div'} className={'welcome-content'}>
					<Typography variant={'h2'} className={'welcome-title'}>
						Welcome back, {user?.memberNick || 'Admin'}! 👋
					</Typography>
					<Typography variant={'body1'} className={'welcome-subtitle'}>
						Here's what's happening with your platform today.
					</Typography>
				</Box>
				
			</Box>

			{/* Statistics Cards */}
			<Grid container spacing={3} sx={{ mb: 4 }}>
				{statCards.map((card, index) => (
					<Grid item xs={12} sm={6} md={3} key={index}>
						<Card
							className={'stat-card'}
							sx={{
								cursor: 'pointer',
								transition: 'all 0.3s ease',
								'&:hover': {
									transform: 'translateY(-4px)',
									boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
								},
							}}
							onClick={() => handleNavigate(card.path)}
						>
							<CardContent>
								<Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
									<Box>
										<Typography variant={'body2'} className={'stat-label'} sx={{ color: '#717171', mb: 1 }}>
											{card.title}
										</Typography>
										<Typography variant={'h4'} className={'stat-value'} sx={{ color: card.color, fontWeight: 700 }}>
											{card.value.toLocaleString()}
										</Typography>
									</Box>
									<Box
										sx={{
											width: 64,
											height: 64,
											borderRadius: '12px',
											backgroundColor: card.bgColor,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											color: card.color,
										}}
									>
										{card.icon}
									</Box>
								</Stack>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>

			{/* Quick Links Section */}
			<Card className={'quick-links-card'}>
				<CardContent>
					<Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} sx={{ mb: 3 }}>
						<Typography variant={'h5'} className={'section-title'} sx={{ fontWeight: 600 }}>
							Quick Links
						</Typography>
						<TrendingUpIcon sx={{ color: '#8B4513', fontSize: 28 }} />
					</Stack>
					<Grid container spacing={2}>
						{quickLinks.map((link, index) => (
							<Grid item xs={12} sm={6} md={4} key={index}>
								<Button
									fullWidth
									variant={'outlined'}
									className={'quick-link-btn'}
									onClick={() => handleNavigate(link.path)}
									startIcon={<Box sx={{ color: link.color }}>{link.icon}</Box>}
									endIcon={<ArrowForwardIcon sx={{ fontSize: 20, color: '#bdbdbd' }} />}
									sx={{
										p: 2,
										justifyContent: 'space-between',
										borderRadius: '12px',
										borderColor: '#e0e0e0',
										color: '#181a20',
										textTransform: 'none',
										'&:hover': {
											borderColor: link.color,
											backgroundColor: `${link.color}15`,
											transform: 'translateX(4px)',
										},
										transition: 'all 0.3s ease',
									}}
								>
									<Typography variant={'body1'} sx={{ fontWeight: 500 }}>
										{link.title}
									</Typography>
								</Button>
							</Grid>
						))}
					</Grid>
				</CardContent>
			</Card>
		</Box>
	);
};

export default withAdminLayout(AdminHome);
