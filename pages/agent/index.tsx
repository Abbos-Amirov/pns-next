import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, Pagination, Typography } from '@mui/material';
import { Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { Member } from '../../libs/types/member/member';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { GET_MEASURERS, GET_LOCATIONS } from '../../apollo/user/query';
import { sweetErrorAlert, sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { REACT_APP_API_URL } from '../../libs/config';
import { Direction } from '../../libs/enums/common.enum';
import { LocationsInquiry } from '../../libs/types/location/location.input';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AgentList: NextPage = ({ initialInput, ...props }: any) => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const [filterSortName, setFilterSortName] = useState('SortRecent');
	const [sortingOpen, setSortingOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [searchFilter, setSearchFilter] = useState<any>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [agents, setAgents] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>('');

	// Fetch locations (Working Locations) - same data as agent detail page
	const { data: locationsData } = useQuery(GET_LOCATIONS, {
		variables: {
			input: {
				page: 1,
				limit: 200,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {},
			} as LocationsInquiry,
		},
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
	});

	const allLocations = locationsData?.getLocations?.list || [];
	const agentLocationImages = React.useMemo(() => {
		const result: Record<string, string[]> = {};
		agents.forEach((agent) => {
			const memberLocations = allLocations.filter((l: any) => l.memberId === agent._id);
			const images = memberLocations
				.map((loc: any) => loc?.images?.[0])
				.filter(Boolean)
				.slice(0, 3)
				.map((img: string) =>
					img.startsWith('http') ? img : `${REACT_APP_API_URL}/${img.replace(/^\/+/, '')}`,
				);
			result[agent._id] = images;
		});
		return result;
	}, [agents, allLocations]);

	const { loading, error, refetch: getMeasurersRefetch } = useQuery(GET_MEASURERS, {
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
			if (data?.getMeasurers) {
				const measurers = data.getMeasurers.list || [];
				setAgents(measurers);
				const metaCounter = data.getMeasurers.metaCounter;
				const totalCount = Array.isArray(metaCounter)
					? (metaCounter[0]?.total || 0)
					: (metaCounter?.total || 0);
				setTotal(totalCount);
			}
		},
		onError: (err) => {
			console.error('GetMeasurers Query Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER, {
		onCompleted: (data) => {
			if (data?.likeTargetMember) {
				const updatedMember = data.likeTargetMember;
				const memberId = updatedMember._id;
				setAgents((prev) =>
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
				sweetTopSmallSuccessAlert(isLiked ? 'Member liked!' : 'Member unliked!', 700).then();
			}
		},
		onError: (err) => {
			sweetErrorHandling(err).then();
			getMeasurersRefetch?.({ input: searchFilter });
		},
	});

	useEffect(() => {
		if (router.query.input) {
			const input_obj = JSON.parse(router?.query?.input as string);
			setSearchFilter(input_obj);
		} else {
			router.replace(`/agent?input=${JSON.stringify(searchFilter)}`, undefined, { shallow: true });
		}
		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router.query.input]);

	useEffect(() => {
		getMeasurersRefetch?.({
			input: {
				page: searchFilter.page || 1,
				limit: searchFilter.limit || 10,
				sort: searchFilter.sort || 'createdAt',
				direction: searchFilter.direction || 'DESC',
				search: searchFilter.search || {},
			},
		});
	}, [searchFilter, getMeasurersRefetch]);

	const likeMemberHandler = async (user: any, id: string) => {
		if (!user?._id) {
			sweetTopSmallSuccessAlert('Please login to like members', 700).then();
			return;
		}
		const currentAgent = agents.find((a) => a._id === id);
		if (!currentAgent) return;
		const prevLiked = currentAgent.meLiked?.[0]?.myFavorite;
		setAgents((prev) =>
			prev.map((a) =>
				a._id === id
					? {
							...a,
							memberLikes: prevLiked ? (a.memberLikes || 0) - 1 : (a.memberLikes || 0) + 1,
							meLiked: prevLiked ? [] : [{ memberId: user._id, likeRefId: id, myFavorite: true }],
					  }
					: a,
			),
		);
		try {
			await likeTargetMember({ variables: { input: id } });
		} catch (err: any) {
			setAgents((prev) =>
				prev.map((a) => (a._id === id ? currentAgent : a)),
			);
			sweetErrorAlert(err?.message || 'Failed to like').then();
		}
	};

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		const id = e.currentTarget.id;
		switch (id) {
			case 'recent':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'DESC' });
				setFilterSortName('SortRecent');
				break;
			case 'old':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'ASC' });
				setFilterSortName('SortOldest');
				break;
			case 'likes':
				setSearchFilter({ ...searchFilter, sort: 'memberLikes', direction: 'DESC' });
				setFilterSortName('Likes');
				break;
			case 'views':
				setSearchFilter({ ...searchFilter, sort: 'memberViews', direction: 'DESC' });
				setFilterSortName('Views');
				break;
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		const next = { ...searchFilter, page: value };
		setSearchFilter(next);
		await router.push(`/agent?input=${JSON.stringify(next)}`, undefined, { scroll: false });
		setCurrentPage(value);
	};

	const getAgentImageUrl = (agent: Member) => {
		if (!agent?.memberImage) return '/img/profile/defaultUser.svg';
		const img = agent.memberImage;
		return img.startsWith('http') ? img : `${REACT_APP_API_URL}/${img.replace(/^\/+/, '')}`;
	};

	if (device === 'mobile') {
		return <h1>AGENTS PAGE MOBILE</h1>;
	}

	return (
		<div id="agent-list-page" className="agent-scroll-stack">
			<div className="container agent-stack-container">
				<div className="agent-filter-top">
					<div className="agent-filter-left">
						<input
							type="text"
							placeholder={t('SearchMeasurer')}
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
					<div className="agent-filter-right">
						<span>{t('SortBy')}</span>
						<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />} className="sort-btn">
							{t(filterSortName)}
						</Button>
						<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler}>
							<MenuItem onClick={sortingHandler} id="recent" disableRipple>{t('SortRecent')}</MenuItem>
							<MenuItem onClick={sortingHandler} id="old" disableRipple>{t('SortOldest')}</MenuItem>
							<MenuItem onClick={sortingHandler} id="likes" disableRipple>{t('Likes')}</MenuItem>
							<MenuItem onClick={sortingHandler} id="views" disableRipple>{t('Views')}</MenuItem>
						</Menu>
					</div>
				</div>
				<div className="agent-stack-main">
					{loading ? (
						<div className="stack-loading">{t('PropertyLoading') || 'Loading...'}</div>
					) : error ? (
						<div className="stack-loading" style={{ color: '#e53935' }}>
							{t('PropertyError')}: {error?.message}
						</div>
					) : agents?.length === 0 ? (
						<div className="stack-loading">{t('PropertyNoProducts') || 'No agents found'}</div>
					) : (
						<>
							{agents.map((agent, i) => (
								<section
									key={agent._id}
									className="stack-section stack-section-unified agent-stack-section"
									style={{ zIndex: i + 1 }}
								>
									<div className="stack-section-info">
										<h2 className="stack-h2">{agent?.memberFullName || agent?.memberNick || 'Measurer'}</h2>
										<div className="stack-desc-input-box">
											<span className="stack-meta-label">{t('Description')}</span>
											<span className="stack-meta-value stack-desc-value">{agent?.memberDesc || t('MeasurerDescDefault')}</span>
										</div>
										<div className="stack-meta-cards stack-meta-horizontal">
											<div className="stack-meta-input-row">
												<div className="stack-meta-input-box">
													<span className="stack-meta-label">{t('LabelRole')}</span>
													<span className="stack-meta-value">{agent?.memberType || '—'}</span>
												</div>
												<div className="stack-meta-input-box">
													<span className="stack-meta-label">{t('Experience')}</span>
													<span className="stack-meta-value">{(agent as any)?.memberExperience || '—'}</span>
												</div>
												<div className="stack-meta-input-box">
													<span className="stack-meta-label">{t('Education')}</span>
													<span className="stack-meta-value">{(agent as any)?.memberEducation || '—'}</span>
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
																likeMemberHandler(user, agent._id);
															}}
															aria-label={agent?.meLiked?.[0]?.myFavorite ? 'Unlike' : 'Like'}
														>
															{agent?.meLiked?.[0]?.myFavorite ? (
																<FavoriteIcon className="stack-like-icon liked" />
															) : (
																<FavoriteBorderIcon className="stack-like-icon" />
															)}
														</button>
														<span className="stack-meta-value">{agent?.memberLikes ?? 0}</span>
													</div>
												</div>
												<div className="stack-meta-input-box stack-meta-views-box">
													<span className="stack-meta-label">{t('Views')}</span>
													<div className="stack-meta-value-row">
														<VisibilityIcon className="stack-views-icon" />
														<span className="stack-meta-value">{agent?.memberViews ?? 0}</span>
													</div>
												</div>
												<div className="stack-meta-input-box">
													<span className="stack-meta-label">{t('Comments')}</span>
													<span className="stack-meta-value">{agent?.memberComments ?? 0}</span>
												</div>
											</div>
										</div>
										<div className="stack-demo-products-row">
											<button
												className="stack-demo-btn"
												onClick={() => router.push(`/agent/detail?agentId=${agent._id}`)}
											>
												<PlayArrowIcon />
												{t('Demo')}
											</button>
											{agentLocationImages[agent._id]?.length > 0 && (
												<div className="stack-location-thumbs-row">
													{agentLocationImages[agent._id].slice(0, 3).map((src, idx) => (
														<Link
															key={idx}
															href={`/agent/detail?agentId=${agent._id}`}
															style={{ display: 'block' }}
														>
															<div className="stack-location-thumb">
																<img src={src} alt={`Location ${idx + 1}`} />
															</div>
														</Link>
													))}
												</div>
											)}
										</div>
									</div>
									<div className="stack-section-image">
										<Link href={`/agent/detail?agentId=${agent._id}`} className="stack-main-image-link">
											<img src={getAgentImageUrl(agent)} alt={agent?.memberNick || 'Agent'} />
										</Link>
										<div className="stack-image-actions">
											<button
												type="button"
												className="stack-like-btn"
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													likeMemberHandler(user, agent._id);
												}}
												aria-label={agent?.meLiked?.[0]?.myFavorite ? 'Unlike' : 'Like'}
											>
												{agent?.meLiked?.[0]?.myFavorite ? (
													<FavoriteIcon className="stack-like-icon liked" />
												) : (
													<FavoriteBorderIcon className="stack-like-icon" />
												)}
											</button>
											<span className="stack-action-count">{agent?.memberLikes ?? 0}</span>
											<VisibilityIcon className="stack-views-icon" />
											<span className="stack-action-count">{agent?.memberViews ?? 0}</span>
										</div>
									</div>
								</section>
							))}
							{agents.length > 0 && (
								<div className="stack-pagination-row">
									<Pagination
										page={currentPage}
										count={Math.ceil(total / (searchFilter.limit || 10))}
										onChange={paginationChangeHandler}
										shape="circular"
										color="primary"
									/>
									<Typography variant="body2">
										Total {total} agent{total !== 1 ? 's' : ''} available
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

AgentList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(AgentList);
