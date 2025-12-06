import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, Stack, MenuItem, Card, CardContent, Chip, Button } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArticleIcon from '@mui/icons-material/Article';
import CommunityArticleList from '../../../libs/components/admin/community/CommunityArticleList';
import { BoardArticlesInquiry } from '../../../libs/types/board-article/board-article.input';
import { BoardArticle } from '../../../libs/types/board-article/board-article';
import { BoardArticleCategory, BoardArticleStatus } from '../../../libs/enums/board-article.enum';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../../libs/sweetAlert';
import { BoardArticleUpdate } from '../../../libs/types/board-article/board-article.update';
import { useQuery, useMutation } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { UPDATE_BOARD_ARTICLE_BY_ADMIN, REMOVE_BOARD_ARTICLE_BY_ADMIN } from '../../../apollo/admin/mutation';

const AdminCommunity: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<any>([]);
	const [communityInquiry, setCommunityInquiry] = useState<BoardArticlesInquiry>(initialInquiry);
	const [articles, setArticles] = useState<BoardArticle[]>([]);
	const [articleTotal, setArticleTotal] = useState<number>(0);
	const [value, setValue] = useState('ALL');
	const [searchType, setSearchType] = useState<string>(
		communityInquiry?.search?.articleCategory || 'ALL'
	);

	/** APOLLO REQUESTS **/
	const { data: articlesData, loading, error, refetch: refetchArticles } = useQuery(GET_BOARD_ARTICLES, {
		variables: { input: communityInquiry },
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		onError: (err) => {
			console.error('Articles Query Error:', err);
			sweetErrorHandling(err).then();
		},
		onCompleted: (data) => {
			console.log('Query completed with data:', data);
		},
	});

	// Debug logs
	console.log('Community Inquiry:', communityInquiry);
	console.log('Articles Data:', articlesData);
	console.log('Loading:', loading);
	console.log('Error:', error);

	const [updateArticleByAdmin] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN);
	const [removeArticleByAdmin] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN);

	/** LIFECYCLES **/
	useEffect(() => {
		if (articlesData?.getBoardArticles) {
			console.log('Articles Data:', articlesData.getBoardArticles);
			const articlesList = articlesData.getBoardArticles.list || [];
			console.log('Articles List:', articlesList);
			// Filter by articleStatus if needed (client-side filtering)
			let filteredArticles = Array.isArray(articlesList) ? articlesList : [];
			
			if (value !== 'ALL') {
				filteredArticles = filteredArticles.filter((article: BoardArticle) => {
					if (value === 'ACTIVE') {
						return article.articleStatus === BoardArticleStatus.ACTIVE;
					} else if (value === 'DELETE') {
						return article.articleStatus === BoardArticleStatus.DELETE;
					}
					return true;
				});
			}
			
			setArticles(filteredArticles);
			
			// metaCounter array ko'rinishida keladi: [{ total: 4 }]
			const metaCounter = articlesData.getBoardArticles.metaCounter;
			const total = Array.isArray(metaCounter) 
				? (metaCounter[0]?.total || 0)
				: (metaCounter?.total || 0);
			setArticleTotal(total); // Use total from backend
			console.log('Filtered Articles:', filteredArticles);
			console.log('Total from metaCounter:', total);
		} else {
			console.log('No articles data:', articlesData);
		}
	}, [articlesData, value]);

	useEffect(() => {
		refetchArticles();
	}, [communityInquiry, refetchArticles]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		communityInquiry.page = newPage + 1;
		setCommunityInquiry({ ...communityInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		communityInquiry.limit = parseInt(event.target.value, 10);
		communityInquiry.page = 1;
		setCommunityInquiry({ ...communityInquiry });
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => {
		setAnchorEl([]);
	};

	const tabChangeHandler = async (event: any, newValue: string) => {
		setValue(newValue);
		// Note: getBoardArticles doesn't support articleStatus filter, so we filter client-side
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				setCommunityInquiry({
					...communityInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						articleCategory: newValue as BoardArticleCategory,
					},
				});
			} else {
				// For "All Categories", we need to query all categories
				// Since BoardArticlesInquiry requires articleCategory, we'll use FREE as default
				setCommunityInquiry({
					...communityInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						// articleCategory ni undefined qilish - barcha category'larni ko'rsatish uchun
					},
				});
			}
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

	const updateArticleHandler = async (updateData: BoardArticleUpdate) => {
		try {
			await updateArticleByAdmin({
				variables: { input: updateData },
			});
			await sweetTopSuccessAlert('Article updated successfully!');
			menuIconCloseHandler();
			await refetchArticles();
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	const removeArticleHandler = async (id: string) => {
		try {
			await removeArticleByAdmin({
				variables: { input: id },
			});
			await sweetTopSuccessAlert('Article removed successfully!');
			await refetchArticles();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content community-page'}>
			{/* Header Section */}
			<Card className={'page-header-card'} sx={{ mb: 3 }}>
				<CardContent>
					<Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
						<Stack direction={'row'} alignItems={'center'} spacing={2}>
							<Box
								sx={{
									width: 56,
									height: 56,
									borderRadius: '12px',
									backgroundColor: 'rgba(233, 44, 40, 0.1)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#E92C28',
								}}
							>
								<ArticleIcon sx={{ fontSize: 32 }} />
							</Box>
							<Box>
								<Typography variant={'h4'} className={'page-title'} sx={{ fontWeight: 700, mb: 0.5 }}>
									Community Management
								</Typography>
								<Typography variant={'body2'} sx={{ color: '#717171' }}>
									Manage and monitor all community articles
								</Typography>
							</Box>
						</Stack>
						<Chip
							label={`Total: ${articleTotal}`}
							sx={{
								backgroundColor: 'rgba(233, 44, 40, 0.1)',
								color: '#E92C28',
								fontWeight: 600,
								fontSize: '14px',
								height: '36px',
							}}
						/>
					</Stack>
				</CardContent>
			</Card>

			{/* Filters and Search Section */}
			<Card className={'filters-card'} sx={{ mb: 3 }}>
				<CardContent>
					<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
						<TabContext value={value}>
							{/* Status Tabs */}
							<Box component={'div'} sx={{ mb: 3 }}>
								<Stack direction={'row'} spacing={1} className={'status-tabs'}>
									<Button
										variant={value === 'ALL' ? 'contained' : 'outlined'}
										onClick={(e: any) => tabChangeHandler(e, 'ALL')}
										className={value === 'ALL' ? 'tab-btn active' : 'tab-btn'}
										sx={{
											textTransform: 'none',
											borderRadius: '8px',
											px: 3,
											py: 1,
											fontWeight: 600,
											...(value === 'ALL'
												? {
														backgroundColor: '#E92C28',
														color: '#fff',
														'&:hover': { backgroundColor: '#c91f1a' },
												  }
												: {
														borderColor: '#e0e0e0',
														color: '#424242',
														'&:hover': { borderColor: '#E92C28', backgroundColor: 'rgba(233, 44, 40, 0.05)' },
												  }),
										}}
									>
										All
									</Button>
									<Button
										variant={value === 'ACTIVE' ? 'contained' : 'outlined'}
										onClick={(e: any) => tabChangeHandler(e, 'ACTIVE')}
										className={value === 'ACTIVE' ? 'tab-btn active' : 'tab-btn'}
										sx={{
											textTransform: 'none',
											borderRadius: '8px',
											px: 3,
											py: 1,
											fontWeight: 600,
											...(value === 'ACTIVE'
												? {
														backgroundColor: '#229a16',
														color: '#fff',
														'&:hover': { backgroundColor: '#1a7a11' },
												  }
												: {
														borderColor: '#e0e0e0',
														color: '#424242',
														'&:hover': { borderColor: '#229a16', backgroundColor: 'rgba(34, 154, 22, 0.05)' },
												  }),
										}}
									>
										Active
									</Button>
									<Button
										variant={value === 'DELETE' ? 'contained' : 'outlined'}
										onClick={(e: any) => tabChangeHandler(e, 'DELETE')}
										className={value === 'DELETE' ? 'tab-btn active' : 'tab-btn'}
										sx={{
											textTransform: 'none',
											borderRadius: '8px',
											px: 3,
											py: 1,
											fontWeight: 600,
											...(value === 'DELETE'
												? {
														backgroundColor: '#757575',
														color: '#fff',
														'&:hover': { backgroundColor: '#5a5a5a' },
												  }
												: {
														borderColor: '#e0e0e0',
														color: '#424242',
														'&:hover': { borderColor: '#757575', backgroundColor: 'rgba(117, 117, 117, 0.05)' },
												  }),
										}}
									>
										Deleted
									</Button>
								</Stack>
							</Box>

							<Divider sx={{ mb: 3 }} />

							{/* Filter */}
							<Stack direction={'row'} spacing={2} className={'search-filter-area'}>
								<Select
									value={searchType}
									sx={{
										minWidth: '200px',
										borderRadius: '8px',
										'& .MuiOutlinedInput-notchedOutline': {
											borderColor: '#e0e0e0',
										},
										'&:hover .MuiOutlinedInput-notchedOutline': {
											borderColor: '#E92C28',
										},
										'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
											borderColor: '#E92C28',
										},
									}}
									startAdornment={
										<Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
											<FilterListIcon sx={{ color: '#E92C28', fontSize: 20 }} />
										</Box>
									}
								>
									<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
										All Categories
									</MenuItem>
									{Object.values(BoardArticleCategory).map((category: string) => (
										<MenuItem value={category} onClick={() => searchTypeHandler(category)} key={category}>
											{category}
										</MenuItem>
									))}
								</Select>
							</Stack>
						</TabContext>
					</Box>
				</CardContent>
			</Card>

			{/* Table Section */}
			<Card className={'table-card'}>
				<CardContent sx={{ p: 0 }}>
					{loading ? (
						<Box sx={{ p: 4, textAlign: 'center' }}>
							<Typography variant={'body2'}>Loading articles...</Typography>
						</Box>
					) : error ? (
						<Box sx={{ p: 4, textAlign: 'center' }}>
							<Typography variant={'body2'} color={'error'}>
								Error loading articles: {error.message}
							</Typography>
						</Box>
					) : (
						<CommunityArticleList
							articles={articles}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updateArticleHandler={updateArticleHandler}
							removeArticleHandler={removeArticleHandler}
						/>
					)}

					<Box sx={{ px: 3, pb: 2 }}>
						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={articleTotal}
							rowsPerPage={communityInquiry?.limit}
							page={communityInquiry?.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
							sx={{
								'& .MuiTablePagination-toolbar': {
									paddingLeft: 0,
								},
								'& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
									fontWeight: 500,
								},
							}}
						/>
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
};

AdminCommunity.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			// articleCategory ni undefined qoldirish - barcha category'larni ko'rsatish uchun
		},
	},
};

export default withAdminLayout(AdminCommunity);
