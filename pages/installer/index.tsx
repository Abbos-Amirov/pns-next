import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box, Pagination, Typography, TextField, Select, MenuItem, FormControl, InputAdornment } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Member } from '../../libs/types/member/member';
import { useQuery, useMutation } from '@apollo/client';
import { GET_INSTALLERS, GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { sweetErrorHandling, sweetTopSmallSuccessAlert, sweetErrorAlert } from '../../libs/sweetAlert';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { REACT_APP_API_URL } from '../../libs/config';
import { Direction } from '../../libs/enums/common.enum';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const InstallerList: NextPage = ({ initialInput, ...props }: any) => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [filterSortName, setFilterSortName] = useState('SortRecent');
	const [searchFilter, setSearchFilter] = useState<any>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [installers, setInstallers] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>('');

	// Fetch articles (My Articles) - for installer thumbnails
	const { data: articlesData } = useQuery(GET_BOARD_ARTICLES, {
		variables: {
			input: {
				page: 1,
				limit: 300,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: { articleCategory: BoardArticleCategory.FREE },
			} as BoardArticlesInquiry,
		},
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
	});

	const allArticles = articlesData?.getBoardArticles?.list || [];
	const installerArticleImages = React.useMemo(() => {
		const result: Record<string, string[]> = {};
		installers.forEach((installer) => {
			const memberArticles = allArticles.filter((a: any) => a.memberId === installer._id);
			const images = memberArticles
				.map((art: any) => art?.articleImage)
				.filter(Boolean)
				.slice(0, 3)
				.map((img: string) =>
					img.startsWith('http') ? img : `${REACT_APP_API_URL}/${img.replace(/^\/+/, '')}`,
				);
			result[installer._id] = images;
		});
		return result;
	}, [installers, allArticles]);

	/** APOLLO REQUESTS **/
	const { loading, error, refetch: getInstallersRefetch } = useQuery(GET_INSTALLERS, {
		variables: {
			input: {
				page: searchFilter.page || 1,
				limit: searchFilter.limit || 10,
				sort: searchFilter.sort || 'createdAt',
				direction: searchFilter.direction || 'DESC',
				search: searchFilter.search || {},
			},
		},
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		onCompleted: (data) => {
			if (data?.getInstallers) {
				const list = data.getInstallers.list || [];
				setInstallers(list);
				const metaCounter = data.getInstallers.metaCounter;
				const totalCount = Array.isArray(metaCounter)
					? (metaCounter[0]?.total || 0)
					: (metaCounter?.total || 0);
				setTotal(totalCount);
			}
		},
		onError: (err) => {
			console.error('GetInstallers Query Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			const input_obj = JSON.parse(router?.query?.input as string);
			setSearchFilter(input_obj);
		} else {
			router.replace(`/installer?input=${JSON.stringify(searchFilter)}`, `/installer?input=${JSON.stringify(searchFilter)}`);
		}
		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	useEffect(() => {
		if (getInstallersRefetch) {
			getInstallersRefetch({
				input: {
					page: searchFilter.page || 1,
					limit: searchFilter.limit || 10,
					sort: searchFilter.sort || 'createdAt',
					direction: searchFilter.direction || 'DESC',
					search: searchFilter.search || {},
				},
			});
		}
	}, [searchFilter, getInstallersRefetch]);

	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER, {
		onCompleted: (data) => {
			if (data?.likeTargetMember) {
				const updatedMember = data.likeTargetMember;
				const memberId = updatedMember._id;
				setInstallers((prev) =>
					prev.map((a) =>
						a._id === memberId
							? {
									...a,
									memberLikes: updatedMember.memberLikes ?? a.memberLikes,
									meLiked: updatedMember.meLiked || a.meLiked,
							  }
							: a,
					),
				);
				const isLiked = updatedMember.meLiked?.[0]?.myFavorite;
				sweetTopSmallSuccessAlert(isLiked ? 'Installer liked!' : 'Installer unliked!', 700).then();
			}
		},
		onError: (err) => {
			sweetErrorHandling(err).then();
			getInstallersRefetch?.({ input: searchFilter });
		},
	});

	/** HANDLERS **/
	const likeMemberHandler = async (user: any, id: string) => {
		if (!id) return;
		if (!user?._id) {
			sweetTopSmallSuccessAlert('Please login to like installers', 700).then();
			return;
		}
		const currentInstaller = installers.find((i) => i._id === id);
		if (!currentInstaller) return;
		const prevLiked = currentInstaller.meLiked?.[0]?.myFavorite;
		setInstallers((prev) =>
			prev.map((i) =>
				i._id === id
					? {
							...i,
							memberLikes: prevLiked ? (i.memberLikes || 0) - 1 : (i.memberLikes || 0) + 1,
							meLiked: prevLiked ? [] : [{ memberId: user._id, likeRefId: id, myFavorite: true }],
					  }
					: i,
			),
		);
		try {
			await likeTargetMember({ variables: { input: id } });
		} catch (err: any) {
			setInstallers((prev) => prev.map((i) => (i._id === id ? currentInstaller : i)));
			sweetErrorAlert(err?.message || 'Failed to like installer').then();
		}
	};

	const sortChangeHandler = (value: string) => {
		switch (value) {
			case 'Recent':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'DESC' });
				setFilterSortName('SortRecent');
				break;
			case 'Oldest order':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'ASC' });
				setFilterSortName('SortOldest');
				break;
			case 'Likes':
				setSearchFilter({ ...searchFilter, sort: 'memberLikes', direction: 'DESC' });
				setFilterSortName('Likes');
				break;
			case 'Views':
				setSearchFilter({ ...searchFilter, sort: 'memberViews', direction: 'DESC' });
				setFilterSortName('Views');
				break;
		}
	};

	const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		const next = { ...searchFilter, page: value };
		setSearchFilter(next);
		await router.push(`/installer?input=${JSON.stringify(next)}`, undefined, { scroll: false });
		setCurrentPage(value);
	};

	const getInstallerImageUrl = (installer: Member) => {
		if (!installer?.memberImage) return '/img/profile/defaultUser.svg';
		const img = installer.memberImage;
		return img.startsWith('http') ? img : `${REACT_APP_API_URL}/${img.replace(/^\/+/, '')}`;
	};

	if (device === 'mobile') {
		return (
			<div className="mobile-installer-list-page">
				<div className="mobile-section-head mobile-installer-head">
					<span className="mobile-eyebrow">{t('Experts') || 'EXPERTS'}</span>
					<h1 className="mobile-title">{t('FindInstaller') || 'Find an Installer'}</h1>
					<p className="mobile-subtitle">
						{t('InstallerListSubtitle') || 'Trusted window & door installation crews'}
					</p>
				</div>

				<div className="mobile-installer-toolbar">
					<div className="mobile-installer-search">
						<SearchIcon className="mobile-installer-search-icon" />
						<input
							type="text"
							placeholder={(t('SearchInstaller') as string) || 'Search installer...'}
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									setSearchFilter({
										...searchFilter,
										search: { ...searchFilter.search, text: searchText },
									});
								}
							}}
						/>
					</div>
					<FormControl className="mobile-installer-sort-control">
						<Select
							value={
								filterSortName === 'SortRecent' ? 'Recent' :
								filterSortName === 'SortOldest' ? 'Oldest order' :
								filterSortName === 'Likes' ? 'Likes' :
								filterSortName === 'Views' ? 'Views' : 'Recent'
							}
							onChange={(e) => sortChangeHandler(e.target.value as string)}
							IconComponent={KeyboardArrowDownRoundedIcon}
							className="mobile-installer-sort-select"
						>
							<MenuItem value="Recent">{t('SortRecent')}</MenuItem>
							<MenuItem value="Oldest order">{t('SortOldest')}</MenuItem>
							<MenuItem value="Likes">{t('Likes')}</MenuItem>
							<MenuItem value="Views">{t('Views')}</MenuItem>
						</Select>
					</FormControl>
				</div>

				<div className="mobile-installer-list">
					{loading ? (
						<div className="mobile-installer-state">{t('PropertyLoading') || 'Loading...'}</div>
					) : error ? (
						<div className="mobile-installer-state mobile-installer-state-error">
							{t('PropertyError')}: {error?.message}
						</div>
					) : installers?.length === 0 ? (
						<div className="mobile-installer-state">{t('PropertyNoProducts') || 'No installers found'}</div>
					) : (
						installers.map((installer) => {
							const detailHref = `/installer/detail?installerId=${installer._id}`;
							const liked = installer?.meLiked?.[0]?.myFavorite;
							const thumbs = installerArticleImages[installer._id] || [];
							return (
								<div key={installer._id} className="mobile-installer-card mobile-card">
									<Link href={detailHref} className="mobile-installer-card-media">
										<img src={getInstallerImageUrl(installer)} alt={installer?.memberNick || 'Installer'} />
										<button
											type="button"
											className="mobile-installer-like-btn"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												likeMemberHandler(user, installer._id);
											}}
											aria-label={liked ? 'Unlike' : 'Like'}
										>
											{liked ? (
												<FavoriteIcon className="mobile-installer-like-icon liked" />
											) : (
												<FavoriteBorderIcon className="mobile-installer-like-icon" />
											)}
										</button>
									</Link>
									<div className="mobile-installer-card-body">
										<h3 className="mobile-installer-card-name">
											{installer?.memberFullName || installer?.memberNick || 'Installer'}
										</h3>
										<span className="mobile-installer-card-role">{installer?.memberType || t('LabelRole')}</span>
										<p className="mobile-installer-card-desc">
											{installer?.memberDesc || t('InstallerDescDefault') || 'Professional installer'}
										</p>

										<div className="mobile-installer-card-meta-row">
											<div className="mobile-installer-meta-chip">
												<span className="mobile-installer-meta-label">{t('Experience')}</span>
												<span className="mobile-installer-meta-value">{installer?.memberExperience || '—'}</span>
											</div>
											<div className="mobile-installer-meta-chip">
												<span className="mobile-installer-meta-label">{t('Education')}</span>
												<span className="mobile-installer-meta-value">{installer?.memberEducation || '—'}</span>
											</div>
										</div>

										<div className="mobile-installer-card-stats-row">
											<span className="mobile-installer-stat">
												<VisibilityIcon className="mobile-installer-stat-icon" /> {installer?.memberViews ?? 0}
											</span>
											<span className="mobile-installer-stat">
												<FavoriteIcon className="mobile-installer-stat-icon" /> {installer?.memberLikes ?? 0}
											</span>
											<span className="mobile-installer-stat">{installer?.memberComments ?? 0} {t('Comments')}</span>
										</div>

										{thumbs.length > 0 && (
											<div className="mobile-installer-thumbs-row">
												{thumbs.slice(0, 3).map((src, idx) => (
													<Link key={idx} href={detailHref} className="mobile-installer-thumb">
														<img src={src} alt={`Article ${idx + 1}`} />
													</Link>
												))}
											</div>
										)}

										<Link href={detailHref} className="mobile-installer-view-btn mobile-btn-accent">
											<RemoveRedEyeIcon sx={{ fontSize: 18 }} />
											{t('ViewDetails')}
										</Link>
									</div>
								</div>
							);
						})
					)}
				</div>

				{installers.length > 0 && (
					<div className="mobile-installer-pagination">
						<Pagination
							page={currentPage}
							count={Math.ceil(total / (searchFilter.limit || 10))}
							onChange={paginationChangeHandler}
							shape="circular"
							color="primary"
						/>
						<Typography className="mobile-installer-total">
							{t('Total') || 'Total'} {total} {t('installer') || 'installer'}{total !== 1 ? 's' : ''}
						</Typography>
					</div>
				)}
			</div>
		);
	}

	return (
		<div id="installer-list-page" className="agent-scroll-stack installer-scroll-stack">
			<div className="container agent-stack-container">
				{/* Filter - unchanged per user request */}
				<Stack className={'filter-section agent-filter-top'}>
					<Box component={'div'} className={'filter-left agent-filter-left'}>
						<TextField
							fullWidth
							placeholder={t('SearchInstaller') || 'Search installer...'}
							value={searchText}
							onChange={(e: any) => setSearchText(e.target.value)}
							onKeyDown={(event: any) => {
								if (event.key === 'Enter') {
									setSearchFilter({
										...searchFilter,
										search: { ...searchFilter.search, text: searchText },
									});
								}
							}}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon sx={{ color: '#8B4513' }} />
									</InputAdornment>
								),
							}}
							sx={{
								'& .MuiOutlinedInput-root': {
									borderRadius: '40px',
									backgroundColor: '#fff',
									border: '1px solid #e0e0e0',
									'&:hover': { borderColor: '#8B4513' },
									'&.Mui-focused': { borderColor: '#8B4513' },
									'& fieldset': { border: 'none' },
								},
								'& .MuiInputBase-input': {
									padding: '14px 20px',
									fontSize: '14px',
									color: '#181a20',
								},
							}}
						/>
					</Box>
					<Box component={'div'} className={'filter-right agent-filter-right'}>
						<Box component={'div'} className={'sort-label'}>
							<FilterListIcon sx={{ color: '#8B4513', fontSize: '20px', marginRight: '8px' }} />
							<Typography sx={{ color: '#181a20', fontSize: '14px', fontWeight: 500, marginRight: '12px', whiteSpace: 'nowrap' }}>
								{t('SortBy')}:
							</Typography>
						</Box>
						<FormControl
							sx={{
								minWidth: 180,
								'& .MuiOutlinedInput-root': {
									borderRadius: '40px',
									backgroundColor: '#fff',
									border: '1px solid #e0e0e0',
									'&:hover': { borderColor: '#8B4513' },
									'&.Mui-focused': { borderColor: '#8B4513' },
									'& fieldset': { border: 'none' },
								},
								'& .MuiSelect-select': {
									padding: '14px 40px 14px 20px',
									fontSize: '14px',
									color: '#181a20',
									fontWeight: 500,
								},
							}}
						>
							<Select
								value={
									filterSortName === 'SortRecent' ? 'Recent' :
									filterSortName === 'SortOldest' ? 'Oldest order' :
									filterSortName === 'Likes' ? 'Likes' :
									filterSortName === 'Views' ? 'Views' : 'Recent'
								}
								onChange={(e) => sortChangeHandler(e.target.value as string)}
								IconComponent={KeyboardArrowDownRoundedIcon}
								sx={{ '& .MuiSvgIcon-root': { color: '#8B4513' } }}
							>
								<MenuItem value="Recent">{t('SortRecent')}</MenuItem>
								<MenuItem value="Oldest order">{t('SortOldest')}</MenuItem>
								<MenuItem value="Likes">{t('Likes')}</MenuItem>
								<MenuItem value="Views">{t('Views')}</MenuItem>
							</Select>
						</FormControl>
					</Box>
				</Stack>

				<div className="agent-stack-main">
					{loading ? (
						<div className="stack-loading">{t('PropertyLoading') || 'Loading...'}</div>
					) : error ? (
						<div className="stack-loading" style={{ color: '#e53935' }}>
							{t('PropertyError')}: {error?.message}
						</div>
					) : installers?.length === 0 ? (
						<div className="stack-loading">{t('PropertyNoProducts') || 'No installers found'}</div>
					) : (
						<>
							{installers.map((installer, i) => {
								const detailHref = `/installer/detail?installerId=${installer._id}`;
								return (
								<section
									key={installer._id}
									className="stack-section stack-section-unified agent-stack-section installer-card-unified"
									style={{ zIndex: i + 1 }}
								>
									<div className="installer-card-body">
										<h2 className="stack-h2">{installer?.memberFullName || installer?.memberNick || 'Installer'}</h2>

										<div className="installer-card-gallery-row">
											<div className="installer-card-image-col">
												<Link href={detailHref} className="stack-main-image-link">
													<img src={getInstallerImageUrl(installer)} alt={installer?.memberNick || 'Installer'} />
												</Link>
												<div className="stack-image-actions">
													<button
														type="button"
														className="stack-like-btn"
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															likeMemberHandler(user, installer._id);
														}}
														aria-label={installer?.meLiked?.[0]?.myFavorite ? 'Unlike' : 'Like'}
													>
														{installer?.meLiked?.[0]?.myFavorite ? (
															<FavoriteIcon className="stack-like-icon liked" />
														) : (
															<FavoriteBorderIcon className="stack-like-icon" />
														)}
													</button>
													<span className="stack-action-count">{installer?.memberLikes ?? 0}</span>
													<VisibilityIcon className="stack-views-icon" />
													<span className="stack-action-count">{installer?.memberViews ?? 0}</span>
												</div>
											</div>
											<div className="installer-card-desc-panel">
												<span className="stack-meta-label">{t('Description')}</span>
												<p className="stack-desc-value installer-card-desc-text">
													{installer?.memberDesc || t('InstallerDescDefault') || 'Professional installer'}
												</p>
											</div>
										</div>

										<div className="stack-meta-cards stack-meta-horizontal">
											<div className="stack-meta-input-row">
												<div className="stack-meta-input-box">
													<span className="stack-meta-label">{t('LabelRole')}</span>
													<span className="stack-meta-value">{installer?.memberType || '—'}</span>
												</div>
												<div className="stack-meta-input-box">
													<span className="stack-meta-label">{t('Experience')}</span>
													<span className="stack-meta-value">{installer?.memberExperience || '—'}</span>
												</div>
												<div className="stack-meta-input-box">
													<span className="stack-meta-label">{t('Education')}</span>
													<span className="stack-meta-value">{installer?.memberEducation || '—'}</span>
												</div>
											</div>
											<div className="stack-meta-input-row">
												<div className="stack-meta-input-box stack-meta-like-box">
													<span className="stack-meta-label">{t('Likes')}</span>
													<div className="stack-meta-value-row">
														<button
															type="button"
															className="stack-like-btn"
															onClick={(e) => {
																e.preventDefault();
																e.stopPropagation();
																likeMemberHandler(user, installer._id);
															}}
															aria-label={installer?.meLiked?.[0]?.myFavorite ? 'Unlike' : 'Like'}
														>
															{installer?.meLiked?.[0]?.myFavorite ? (
																<FavoriteIcon className="stack-like-icon liked" />
															) : (
																<FavoriteBorderIcon className="stack-like-icon" />
															)}
														</button>
														<span className="stack-meta-value">{installer?.memberLikes ?? 0}</span>
													</div>
												</div>
												<div className="stack-meta-input-box stack-meta-views-box">
													<span className="stack-meta-label">{t('Views')}</span>
													<div className="stack-meta-value-row">
														<VisibilityIcon className="stack-views-icon" />
														<span className="stack-meta-value">{installer?.memberViews ?? 0}</span>
													</div>
												</div>
												<div className="stack-meta-input-box">
													<span className="stack-meta-label">{t('Comments')}</span>
													<span className="stack-meta-value">{installer?.memberComments ?? 0}</span>
												</div>
											</div>
										</div>

										<div className="installer-card-footer-row">
											<Link href={detailHref} className="installer-view-details-btn">
												<RemoveRedEyeIcon sx={{ fontSize: 22 }} />
												{t('ViewDetails')}
											</Link>
											{installerArticleImages[installer._id]?.length > 0 && (
												<div className="stack-location-thumbs-row stack-article-thumbs-row">
													{installerArticleImages[installer._id].slice(0, 3).map((src, idx) => (
														<Link key={idx} href={detailHref} style={{ display: 'block' }}>
															<div className="stack-location-thumb">
																<img src={src} alt={`Article ${idx + 1}`} />
															</div>
														</Link>
													))}
												</div>
											)}
										</div>
									</div>
								</section>
								);
							})}
							{installers.length > 0 && (
								<div className="stack-pagination-row">
									<Pagination
										page={currentPage}
										count={Math.ceil(total / (searchFilter.limit || 10))}
										onChange={paginationChangeHandler}
										shape="circular"
										color="primary"
									/>
									<Typography variant="body2">
										Total {total} installer{total !== 1 ? 's' : ''} available
									</Typography>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

InstallerList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(InstallerList);
