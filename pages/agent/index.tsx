import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box, Button, Pagination } from '@mui/material';
import { Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import AgentCard from '../../libs/components/common/AgentCard';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Member } from '../../libs/types/member/member';
import { useMutation, useQuery } from '@apollo/client';
import { GET_MEASURERS } from '../../apollo/user/query';
import { sweetErrorAlert, sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AgentList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [filterSortName, setFilterSortName] = useState('Recent');
	const [sortingOpen, setSortingOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [searchFilter, setSearchFilter] = useState<any>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [agents, setAgents] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/

	const { data: 
		measurersData,
		 loading,
		  error,
		   refetch: getMeasurersRefetch
		 } = useQuery(GET_MEASURERS, {
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

	const [likeTargetMember, { loading: likeLoading }] = useMutation(LIKE_TARGET_MEMBER, {
		onCompleted: (data) => {
			if (data?.likeTargetMember) {
				const updatedMember = data.likeTargetMember;
				const memberId = updatedMember._id;
				
				// Update agents list with backend response (database'dan kelgan to'g'ri qiymat)
				setAgents((prevAgents) => {
					return prevAgents.map((agent) => {
						if (agent._id === memberId) {
							return {
								...agent,
								memberLikes: updatedMember.memberLikes !== undefined && updatedMember.memberLikes !== null 
									? updatedMember.memberLikes 
									: agent.memberLikes,
								meLiked: updatedMember.meLiked || agent.meLiked,
							};
						}
						return agent;
					});
				});
				
				// Show success message
				const isLiked = updatedMember.meLiked && updatedMember.meLiked[0]?.myFavorite;
				const message = isLiked ? 'Member liked successfully!' : 'Member unliked successfully!';
				sweetTopSmallSuccessAlert(message, 700).then();
			}
		},
		onError: (err) => {
			console.error('LIKE_TARGET_MEMBER Mutation Error:', err);
			sweetErrorHandling(err).then();
			
			// Refetch to get correct state on error
			if (getMeasurersRefetch) {
				getMeasurersRefetch({
					input: {
						page: searchFilter.page || 1,
						limit: searchFilter.limit || 3,
						sort: searchFilter.sort || 'createdAt',
						direction: searchFilter.direction || 'DESC',
						search: searchFilter.search || {},
					},
				});
			}
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			const input_obj = JSON.parse(router?.query?.input as string);
			setSearchFilter(input_obj);
		} else
			router.replace(`/agent?input=${JSON.stringify(searchFilter)}`, `/agent?input=${JSON.stringify(searchFilter)}`);

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	useEffect(() => {
		// Refetch when searchFilter changes
		if (getMeasurersRefetch) {
			getMeasurersRefetch({
				input: {
					page: searchFilter.page || 1,
					limit: searchFilter.limit || 3,
					sort: searchFilter.sort || 'createdAt',
					direction: searchFilter.direction || 'DESC',
					search: searchFilter.search || {},
				},
			});
		}
	}, [searchFilter, getMeasurersRefetch]);

	const likeMemberHandler = async (user: any, id: string) => {
		if (!id) return;
		if (!user?._id) {
			sweetTopSmallSuccessAlert('Please login to like members', 700).then();
			return;
		}

		// Find the agent to get current state
		const currentAgent = agents.find((agent) => agent._id === id);
		if (!currentAgent) return;

		const currentLiked = currentAgent.meLiked && currentAgent.meLiked[0]?.myFavorite;
		const newLikedState = !currentLiked;

		// Optimistically update the agent in the list immediately
		setAgents((prevAgents) => {
			return prevAgents.map((agent) => {
				if (agent._id === id) {
					return {
						...agent,
						memberLikes: newLikedState 
							? (agent.memberLikes || 0) + 1 
							: Math.max(0, (agent.memberLikes || 0) - 1),
						meLiked: newLikedState 
							? [{ memberId: user._id, likeRefId: id, myFavorite: true }]
							: [],
					};
				}
				return agent;
			});
		});

		// Call backend mutation - onCompleted callback will handle the response
		try {
			await likeTargetMember({
				variables: {
					input: id,
				},
			});
			// onCompleted callback will update the state with backend response
		} catch (err: any) {
			console.error('ERROR likeMemberHandler:', err);
			
			// Revert optimistic update on error
			setAgents((prevAgents) => {
				return prevAgents.map((agent) => {
					if (agent._id === id) {
						// Revert to original state
						return currentAgent;
					}
					return agent;
				});
			});

			// Refetch to get correct state from backend
			if (getMeasurersRefetch) {
				await getMeasurersRefetch({
					input: {
						page: searchFilter.page || 1,
						limit: searchFilter.limit || 3,
						sort: searchFilter.sort || 'createdAt',
						direction: searchFilter.direction || 'DESC',
						search: searchFilter.search || {},
					},
				});
			}

			sweetErrorAlert(err?.message || 'Failed to like member').then();
		}
	};

	/** HANDLERS **/
	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		switch (e.currentTarget.id) {
			case 'recent':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'DESC' });
				setFilterSortName('Recent');
				break;
			case 'old':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'ASC' });
				setFilterSortName('Oldest order');
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
		setAnchorEl2(null);
	};

	const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(`/agent?input=${JSON.stringify(searchFilter)}`, `/agent?input=${JSON.stringify(searchFilter)}`, {
			scroll: false,
		});
		setCurrentPage(value);
	};

	if (device === 'mobile') {
		return <h1>AGENTS PAGE MOBILE</h1>;
	} else {
		return (
			<Stack className={'agent-list-page'}>
				<Stack className={'container'}>
					<Stack className={'filter'}>
						<Box component={'div'} className={'left'}>
							<input
								type="text"
								placeholder={'Search for an agent'}
								value={searchText}
								onChange={(e: any) => setSearchText(e.target.value)}
								onKeyDown={(event: any) => {
									if (event.key == 'Enter') {
										setSearchFilter({
											...searchFilter,
											search: { ...searchFilter.search, text: searchText },
										});
									}
								}}
							/>
						</Box>
						<Box component={'div'} className={'right'}>
							<span>Sort by</span>
							<div>
								<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
									{filterSortName}
								</Button>
								<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler} sx={{ paddingTop: '5px' }}>
									<MenuItem onClick={sortingHandler} id={'recent'} disableRipple>
										Recent
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'old'} disableRipple>
										Oldest
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'likes'} disableRipple>
										Likes
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'views'} disableRipple>
										Views
									</MenuItem>
								</Menu>
							</div>
						</Box>
					</Stack>
					<Stack className={'card-wrap'}>
						{loading ? (
							<div className={'no-data'}>
								<p>Loading agents...</p>
							</div>
						) : error ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>Error loading agents: {error.message}</p>
							</div>
						) : agents?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No Agents found!</p>
							</div>
						) : (
							agents.map((agent: Member) => {
								return <AgentCard agent={agent} key={agent._id} likeMemberHandler = {likeMemberHandler} />;
							})
						)}
					</Stack>
					<Stack className={'pagination'}>
						<Stack className="pagination-box">
							{agents.length !== 0 && Math.ceil(total / searchFilter.limit) > 1 && (
								<Stack className="pagination-box">
									<Pagination
										page={currentPage}
										count={Math.ceil(total / searchFilter.limit)}
										onChange={paginationChangeHandler}
										shape="circular"
										color="primary"
									/>
								</Stack>
							)}
						</Stack>

						{agents.length !== 0 && (
							<span>
								Total {total} agent{total > 1 ? 's' : ''} available
							</span>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
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
