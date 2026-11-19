import React, { useEffect, useState, useMemo } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Stack, Tab, Typography, Button, Pagination, CircularProgress } from '@mui/material';
import CommunityCard from '../../libs/components/common/CommunityCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { useQuery } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { Direction } from '../../libs/enums/common.enum';
import { sweetErrorHandling } from '../../libs/sweetAlert';
import { communityBoardTitleKey, communitySubKey } from '../../libs/i18n/communityBoardKeys';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Community: NextPage = ({ initialInput, ...props }: T) => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const router = useRouter();
	const { query } = router;
	const articleCategory = (query?.articleCategory as string) || 'FREE';
	const [searchCommunity, setSearchCommunity] = useState<BoardArticlesInquiry>({
		...initialInput,
		search: {
			...initialInput.search,
			articleCategory: (articleCategory as BoardArticleCategory) || initialInput.search.articleCategory,
		},
	});

	// Create board articles inquiry based on current category
	const boardArticlesInquiry: BoardArticlesInquiry = useMemo(() => {
		return {
			page: searchCommunity.page,
			limit: searchCommunity.limit || 10,
			sort: searchCommunity.sort || 'createdAt',
			direction: searchCommunity.direction || Direction.DESC,
			search: {
				articleCategory: (articleCategory as BoardArticleCategory) || BoardArticleCategory.FREE,
			},
		};
	}, [searchCommunity.page, searchCommunity.limit, searchCommunity.sort, searchCommunity.direction, articleCategory]);

	/** APOLLO REQUESTS **/
	const { data: boardArticlesData, loading: boardArticlesLoading, error: boardArticlesError, refetch } = useQuery(
		GET_BOARD_ARTICLES,
		{
			variables: {
				input: boardArticlesInquiry,
			},
			fetchPolicy: 'network-only',
			errorPolicy: 'all',
			onCompleted: (data) => {
				console.log('Board Articles Query Response:', data);
				if (data?.getBoardArticles) {
					console.log('Board Articles List:', data.getBoardArticles.list);
					console.log('Board Articles Total:', data.getBoardArticles.metaCounter?.[0]?.total);
				}
			},
			onError: (err) => {
				console.error('GetBoardArticles Query Error:', err);
				sweetErrorHandling(err).then();
			},
		}
	);

	// Extract board articles and total count
	const boardArticles: BoardArticle[] = boardArticlesData?.getBoardArticles?.list || [];
	const totalCount: number = boardArticlesData?.getBoardArticles?.metaCounter?.[0]?.total || 0;

	/** LIFECYCLES **/
	useEffect(() => {
		if (!query?.articleCategory) {
			router.push(
				{
					pathname: router.pathname,
					query: { articleCategory: 'FREE' },
				},
				router.pathname,
				{ shallow: true }
			);
		}
	}, [query?.articleCategory, router]);

	// Update searchCommunity when articleCategory changes
	useEffect(() => {
		if (articleCategory) {
			setSearchCommunity({
				...searchCommunity,
				page: 1,
				search: {
					articleCategory: articleCategory as BoardArticleCategory,
				},
			});
		}
	}, [articleCategory]);

	/** HANDLERS **/
	const tabChangeHandler = async (e: T, value: string) => {
		setSearchCommunity({
			...searchCommunity,
			page: 1,
			search: { articleCategory: value as BoardArticleCategory },
		});
		await router.push(
			{
				pathname: '/community',
				query: { articleCategory: value },
			},
			router.pathname,
			{ shallow: true }
		);
	};

	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	const activeCategory = searchCommunity.search.articleCategory || 'FREE';

	const articleListPanel = (
		<Stack className="list-box">
			{boardArticlesLoading ? (
				<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
					<CircularProgress sx={{ color: '#120d53' }} />
					<Typography sx={{ mt: 2, color: '#717171' }}>{t('CommunityLoadingArticles')}</Typography>
				</Stack>
			) : boardArticlesError ? (
				<Stack className={'no-data'}>
					<img src="/img/icons/icoAlert.svg" alt="" />
					<p>{t('CommunityErrorArticles', { message: boardArticlesError.message })}</p>
				</Stack>
			) : boardArticles.length === 0 ? (
				<Stack className={'no-data'}>
					<img src="/img/icons/icoAlert.svg" alt="" />
					<p>{t('CommunityNoArticles')}</p>
				</Stack>
			) : (
				boardArticles.map((boardArticle: BoardArticle) => {
					return <CommunityCard boardArticle={boardArticle} key={boardArticle?._id} />;
				})
			)}
		</Stack>
	);

	if (device === 'mobile') {
		return (
			<Stack className="mobile-community-page">
				<Stack className="mobile-section-head">
					<span className="mobile-eyebrow">{t('CommunityPageTitle')}</span>
					<h2 className="mobile-title">{t(communityBoardTitleKey(activeCategory))}</h2>
					<p className="mobile-subtitle">{t(communitySubKey(activeCategory))}</p>
				</Stack>

				<Stack className="mobile-community-tabs" direction="row">
					{(['FREE', 'RECOMMEND', 'NEWS', 'HUMOR'] as const).map((cat) => (
						<button
							key={cat}
							type="button"
							className={`mobile-community-tab ${activeCategory === cat ? 'active' : ''}`}
							onClick={(e: any) => tabChangeHandler(e, cat)}
						>
							{t(`CommunityTab${cat.charAt(0)}${cat.slice(1).toLowerCase()}`)}
						</button>
					))}
				</Stack>

				<button
					type="button"
					className="mobile-btn-accent mobile-community-write-btn"
					onClick={() =>
						router.push({
							pathname: '/mypage',
							query: { category: 'writeArticle' },
						})
					}
				>
					{t('CommunityWrite')}
				</button>

				<Stack className="mobile-community-list">
					{boardArticlesLoading ? (
						<Stack className="mobile-community-empty">
							<Typography>{t('CommunityLoadingArticles')}</Typography>
						</Stack>
					) : boardArticlesError ? (
						<Stack className="mobile-community-empty">
							<img src="/img/icons/icoAlert.svg" alt="" />
							<Typography>{t('CommunityErrorArticles', { message: boardArticlesError.message })}</Typography>
						</Stack>
					) : boardArticles.length === 0 ? (
						<Stack className="mobile-community-empty">
							<img src="/img/icons/icoAlert.svg" alt="" />
							<Typography>{t('CommunityNoArticles')}</Typography>
						</Stack>
					) : (
						boardArticles.map((boardArticle: BoardArticle) => (
							<CommunityCard boardArticle={boardArticle} key={boardArticle?._id} />
						))
					)}
				</Stack>

				{totalCount > 0 && (
					<Stack className="mobile-community-pagination">
						<Pagination
							count={Math.ceil(totalCount / (searchCommunity.limit || 10))}
							page={searchCommunity.page}
							shape="circular"
							color="primary"
							onChange={paginationHandler}
						/>
						<Typography className="mobile-community-total">
							{t('CommunityTotalArticles', { count: totalCount })}
						</Typography>
					</Stack>
				)}
			</Stack>
		);
	} else {
		return (
			<div id="community-list-page">
				<div className="container">
					<TabContext value={searchCommunity.search.articleCategory || 'FREE'}>
						<Stack className="main-box">
							<Stack className="left-config">
								<Stack className={'image-info'}>
									<img src={'/img/logo/logoText.svg'} alt="" />
									<Stack className={'community-name'}>
										<Typography className={'name'}>{t('CommunityPageTitle')}</Typography>
									</Stack>
								</Stack>

								<TabList
									orientation="vertical"
									aria-label={t('CommunityPageTitle')}
									TabIndicatorProps={{
										style: { display: 'none' },
									}}
									onChange={tabChangeHandler}
								>
									<Tab
										value={'FREE'}
										label={t('CommunityTabFree')}
										className={`tab-button ${activeCategory == 'FREE' ? 'active' : ''}`}
									/>
									<Tab
										value={'RECOMMEND'}
										label={t('CommunityTabRecommend')}
										className={`tab-button ${activeCategory == 'RECOMMEND' ? 'active' : ''}`}
									/>
									<Tab
										value={'NEWS'}
										label={t('CommunityTabNews')}
										className={`tab-button ${activeCategory == 'NEWS' ? 'active' : ''}`}
									/>
									<Tab
										value={'HUMOR'}
										label={t('CommunityTabHumor')}
										className={`tab-button ${activeCategory == 'HUMOR' ? 'active' : ''}`}
									/>
								</TabList>
							</Stack>
							<Stack className="right-config">
								<Stack className="panel-config">
									<Stack className="title-box">
										<Stack className="left">
											<Typography className="title">{t(communityBoardTitleKey(activeCategory))}</Typography>
											<Typography className="sub-title">{t(communitySubKey(activeCategory))}</Typography>
										</Stack>
										<Button
											onClick={() =>
												router.push({
													pathname: '/mypage',
													query: {
														category: 'writeArticle',
													},
												})
											}
											className="right"
										>
											{t('CommunityWrite')}
										</Button>
									</Stack>

									<TabPanel value="FREE">{articleListPanel}</TabPanel>
									<TabPanel value="RECOMMEND">{articleListPanel}</TabPanel>
									<TabPanel value="NEWS">{articleListPanel}</TabPanel>
									<TabPanel value="HUMOR">{articleListPanel}</TabPanel>
								</Stack>
							</Stack>
						</Stack>
					</TabContext>

					{totalCount > 0 && (
						<Stack className="pagination-config">
							<Stack className="pagination-box">
								<Pagination
									count={Math.ceil(totalCount / (searchCommunity.limit || 10))}
									page={searchCommunity.page}
									shape="circular"
									color="primary"
									onChange={paginationHandler}
								/>
							</Stack>
							<Stack className="total-result">
								<Typography>{t('CommunityTotalArticles', { count: totalCount })}</Typography>
							</Stack>
						</Stack>
					)}
				</div>
			</div>
		);
	}
};

Community.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {
			articleCategory: BoardArticleCategory.FREE,
		},
	},
};

export default withLayoutBasic(Community);
