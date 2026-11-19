import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography, Box, Card, CardContent, Grid } from '@mui/material';
import CommunityCard from '../common/CommunityCard';
import { useReactiveVar, useQuery } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { BoardArticle } from '../../types/board-article/board-article';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticlesInquiry } from '../../types/board-article/board-article.input';
import { sweetErrorHandling } from '../../sweetAlert';
import ArticleIcon from '@mui/icons-material/Article';
import { Direction } from '../../enums/common.enum';

const MyArticles: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [searchCommunity, setSearchCommunity] = useState<BoardArticlesInquiry>({
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	});
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const { data: articlesData, loading, error, refetch } = useQuery(GET_BOARD_ARTICLES, {
		variables: {
			input: {
				page: searchCommunity.page,
				limit: searchCommunity.limit,
				sort: searchCommunity.sort,
				direction: searchCommunity.direction,
				search: {
					...searchCommunity.search,
					memberId: user._id,
				},
			},
		},
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		skip: !user._id || !searchCommunity.page || !searchCommunity.limit,
		onError: (err) => {
			console.error('Articles Query Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (articlesData?.getBoardArticles) {
			const articles = articlesData.getBoardArticles.list || [];
			// Debug: Log article images to see their format
			console.log('Articles with images:', articles.map((article: BoardArticle) => ({
				_id: article._id,
				title: article.articleTitle,
				image: article.articleImage,
			})));
			setBoardArticles(articles);
			
			const metaCounter = articlesData.getBoardArticles.metaCounter;
			const total = Array.isArray(metaCounter) 
				? (metaCounter[0]?.total || 0)
				: (metaCounter?.total || 0);
			setTotalCount(total);
		}
	}, [articlesData]);

	useEffect(() => {
		if (user._id) {
			refetch();
		}
	}, [searchCommunity, user._id, refetch]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	if (device === 'mobile') {
		return (
			<Stack className={'mobile-myarticles-page'}>
				<Stack className={'mobile-mypage-tab-header'}>
					<Typography className={'mobile-mypage-tab-title'}>My Articles</Typography>
					{totalCount > 0 && <Typography className={'mobile-mypage-tab-count'}>{totalCount}</Typography>}
				</Stack>
				{loading ? (
					<Stack className={'mobile-empty-state'}>
						<Typography>Loading articles...</Typography>
					</Stack>
				) : error ? (
					<Stack className={'mobile-empty-state'}>
						<Typography>Error loading articles</Typography>
					</Stack>
				) : boardArticles?.length > 0 ? (
					<>
						<Stack className={'mobile-articles-list'}>
							{boardArticles.map((boardArticle: BoardArticle) => {
								const imagePath = boardArticle?.articleImage
									? boardArticle.articleImage.startsWith('http')
										? boardArticle.articleImage
										: boardArticle.articleImage.startsWith('/img/')
										? boardArticle.articleImage
										: `${process.env.REACT_APP_API_URL}/${boardArticle.articleImage}`
									: '/img/community/communityImg.png';
								return (
									<div className={'mobile-article-card'} key={boardArticle._id}>
										<div className={'mobile-article-card-img'} style={{ backgroundImage: `url(${imagePath})` }} />
										<div className={'mobile-article-card-body'}>
											<Typography className={'mobile-article-card-title'}>{boardArticle?.articleTitle}</Typography>
											<Stack className={'mobile-article-card-meta'} direction={'row'}>
												<span>{boardArticle?.articleViews ?? 0} views</span>
												<span>{boardArticle?.articleLikes ?? 0} likes</span>
											</Stack>
										</div>
									</div>
								);
							})}
						</Stack>
						<Stack className={'mobile-pagination'}>
							<Pagination
								count={Math.max(1, Math.ceil((totalCount || boardArticles.length) / searchCommunity.limit))}
								page={searchCommunity.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
					</>
				) : (
					<Stack className={'mobile-empty-state'}>
						<ArticleIcon />
						<Typography>No Articles Found</Typography>
						<Typography className={'mobile-empty-hint'}>You haven't published any articles yet.</Typography>
					</Stack>
				)}
			</Stack>
		);
	} else
		return (
			<Box component={'div'} className={'my-articles-page'}>
				{/* Header Section */}
				<Card className={'articles-header-card'} sx={{ mb: 3 }}>
					<CardContent>
						<Stack direction={'row'} alignItems={'center'} spacing={2}>
							<div
								style={{
									width: 56,
									height: 56,
									borderRadius: '12px',
									backgroundColor: 'rgba(139, 69, 19, 0.1)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#120d53',
								}}
							>
								<ArticleIcon sx={{ fontSize: 32 }} />
							</div>
							<div>
								<Typography variant={'h4'} className={'page-title'} sx={{ fontWeight: 700, mb: 0.5 }}>
									My Articles
								</Typography>
								<Typography variant={'body2'} sx={{ color: '#717171' }}>
									Your published articles
								</Typography>
							</div>
							<div style={{ flex: 1 }} />
							<div
								style={{
									padding: '8px 16px',
									borderRadius: '12px',
									backgroundColor: 'rgba(139, 69, 19, 0.1)',
									color: '#120d53',
									fontWeight: 600,
									fontSize: '14px',
								}}
							>
								Total: {totalCount}
							</div>
						</Stack>
					</CardContent>
				</Card>

				{/* Articles List */}
				{loading ? (
					<Card>
						<CardContent sx={{ p: 4, textAlign: 'center' }}>
							<Typography variant={'body2'} sx={{ color: '#717171' }}>
								Loading articles...
							</Typography>
						</CardContent>
					</Card>
				) : error ? (
					<Card>
						<CardContent sx={{ p: 4, textAlign: 'center' }}>
							<Typography variant={'body2'} color={'error'}>
								Error loading articles: {error.message}
							</Typography>
						</CardContent>
					</Card>
				) : boardArticles?.length > 0 ? (
					<>
						<Grid container spacing={3} sx={{ mb: 3 }}>
							{boardArticles.map((boardArticle: BoardArticle) => (
								<Grid item xs={12} sm={6} md={4} lg={4} key={boardArticle._id}>
									<CommunityCard boardArticle={boardArticle} size={'small'} />
								</Grid>
							))}
						</Grid>

						{/* Pagination - Always show */}
						<Card sx={{ mt: 3, position: 'relative', zIndex: 10 }}>
							<CardContent sx={{ py: 3, px: 3 }}>
								<Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
									<Typography variant={'body1'} sx={{ color: '#717171', fontSize: '15px', fontWeight: 500 }}>
										Showing {((searchCommunity.page - 1) * searchCommunity.limit) + 1} to{' '}
										{Math.min(searchCommunity.page * searchCommunity.limit, totalCount || boardArticles.length)} of {totalCount || boardArticles.length} articles
									</Typography>
									<Pagination
										count={Math.max(1, Math.ceil((totalCount || boardArticles.length) / searchCommunity.limit))}
										page={searchCommunity.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
										size="large"
										sx={{
											'& .MuiPaginationItem-root': {
												fontSize: '16px',
												minWidth: '40px',
												height: '40px',
												fontWeight: 500,
											},
											'& .MuiPaginationItem-root.Mui-selected': {
												backgroundColor: '#120d53',
												color: '#ffffff',
												fontSize: '16px',
												fontWeight: 600,
												'&:hover': {
													backgroundColor: '#6B3410',
												},
											},
											'& .MuiPaginationItem-root:hover': {
												backgroundColor: 'rgba(139, 69, 19, 0.1)',
											},
										}}
									/>
								</Stack>
							</CardContent>
						</Card>
					</>
				) : (
					<Card>
						<CardContent sx={{ p: 6, textAlign: 'center' }}>
							<div
								style={{
									width: 120,
									height: 120,
									margin: '0 auto 24px',
									borderRadius: '50%',
									backgroundColor: 'rgba(139, 69, 19, 0.1)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<ArticleIcon sx={{ fontSize: 60, color: '#120d53' }} />
							</div>
							<Typography variant={'h6'} sx={{ fontWeight: 600, mb: 1, color: '#181a20' }}>
								No Articles Found
							</Typography>
							<Typography variant={'body2'} sx={{ color: '#717171' }}>
								You haven't published any articles yet.
							</Typography>
						</CardContent>
					</Card>
				)}
			</Box>
		);
};

MyArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MyArticles;
