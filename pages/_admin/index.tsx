import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
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
	const { t } = useTranslation('common');
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

	/** Brand: navy harmony #1e3a5f → #152238 → #101827 */
	const brand = {
		navy1: '#1e3a5f',
		navy2: '#152238',
		navy3: '#101827',
	} as const;

	const statCards = [
		{
			titleKey: 'AdminTotalUsers',
			value: stats.totalUsers,
			icon: <PeopleIcon sx={{ fontSize: 40 }} />,
			color: brand.navy1,
			bgColor: 'rgba(30, 58, 95, 0.14)',
			path: '/_admin/users',
		},
		{
			titleKey: 'AdminProducts',
			value: stats.totalProperties,
			icon: <HomeWorkIcon sx={{ fontSize: 40 }} />,
			color: brand.navy2,
			bgColor: 'rgba(21, 34, 56, 0.14)',
			path: '/_admin/products',
		},
		{
			titleKey: 'AdminCommunityArticles',
			value: stats.totalArticles,
			icon: <ArticleIcon sx={{ fontSize: 40 }} />,
			color: '#2d4d7a',
			bgColor: 'rgba(45, 77, 122, 0.12)',
			path: '/_admin/community',
		},
		{
			titleKey: 'AdminCSInquiries',
			value: stats.totalInquiries,
			icon: <SupportAgentIcon sx={{ fontSize: 40 }} />,
			color: brand.navy3,
			bgColor: 'rgba(16, 24, 39, 0.12)',
			path: '/_admin/cs/inquiry',
		},
	];

	const quickLinks = [
		{ titleKey: 'AdminUserManagement', path: '/_admin/users', icon: <PeopleIcon />, color: brand.navy1 },
		{ titleKey: 'AdminProductManagement', path: '/_admin/products', icon: <HomeWorkIcon />, color: brand.navy2 },
		{ titleKey: 'AdminCommunityManagement', path: '/_admin/community', icon: <ArticleIcon />, color: '#2d4d7a' },
		{ titleKey: 'AdminFAQManagement', path: '/_admin/cs/faq', icon: <SupportAgentIcon />, color: brand.navy3 },
		{ titleKey: 'AdminNoticeManagement', path: '/_admin/cs/notice', icon: <ArticleIcon />, color: brand.navy1 },
		{ titleKey: 'AdminInquiryManagement', path: '/_admin/cs/inquiry', icon: <SupportAgentIcon />, color: brand.navy2 },
	];

	return (
		<Box component={'div'} className={'admin-dashboard'}>
			{/* Welcome Section with Logout */}
			<Box component={'div'} className={'welcome-section'}>
				<Box component={'div'} className={'welcome-content'}>
					<Typography variant={'h2'} className={'welcome-title'}>
						{t('AdminWelcomeBack', { name: user?.memberNick || 'Admin' })}
					</Typography>
					<Typography variant={'body1'} className={'welcome-subtitle'}>
						{t('AdminHereIsWhatsHappening')}
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
									<Box component="div">
										<Typography variant={'body2'} className={'stat-label'} sx={{ color: 'rgba(24, 26, 32, 0.55)', mb: 1 }}>
											{t(card.titleKey)}
										</Typography>
										<Typography variant={'h4'} className={'stat-value'} sx={{ color: card.color, fontWeight: 700 }}>
											{card.value.toLocaleString()}
										</Typography>
									</Box>
									<Box
										component="div"
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
							{t('AdminQuickLinks')}
						</Typography>
						<TrendingUpIcon sx={{ color: '#1e3a5f', fontSize: 28, opacity: 0.95 }} />
					</Stack>
					<Grid container spacing={2}>
						{quickLinks.map((link, index) => (
							<Grid item xs={12} sm={6} md={4} key={index}>
								<Button
									fullWidth
									variant={'outlined'}
									className={'quick-link-btn'}
									onClick={() => handleNavigate(link.path)}
									startIcon={<Box component="span" sx={{ color: link.color }}>{link.icon}</Box>}
									endIcon={<ArrowForwardIcon sx={{ fontSize: 20, color: 'rgba(30, 58, 95, 0.35)' }} />}
									sx={{
										p: 2,
										justifyContent: 'space-between',
										borderRadius: '12px',
										borderColor: 'rgba(30, 58, 95, 0.18)',
										color: '#181a20',
										textTransform: 'none',
										'&:hover': {
											borderColor: link.color,
											backgroundColor: `${link.color}18`,
											transform: 'translateX(4px)',
										},
									transition: 'all 0.3s ease',
									}}
							>
								<Typography variant={'body1'} sx={{ fontWeight: 500 }}>
									{t(link.titleKey)}
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

export const getStaticProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale || 'en', ['common'])),
	},
});

export default withAdminLayout(AdminHome);
