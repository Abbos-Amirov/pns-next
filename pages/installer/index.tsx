import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box, Button, Pagination, Typography } from '@mui/material';
import { Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import InstallerCard from '../../libs/components/common/InstallerCard';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Member } from '../../libs/types/member/member';
import { useQuery, useMutation } from '@apollo/client';
import { GET_INSTALLERS } from '../../apollo/user/query';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { sweetErrorHandling, sweetTopSmallSuccessAlert, sweetErrorAlert } from '../../libs/sweetAlert';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const InstallerList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [filterSortName, setFilterSortName] = useState('Recent');
	const [sortingOpen, setSortingOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [searchFilter, setSearchFilter] = useState<any>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [installers, setInstallers] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const { data: installersData, loading, error, refetch: getInstallersRefetch } = useQuery(GET_INSTALLERS, {
		variables: {
			input: {
				page: searchFilter.page || 1,
				limit: searchFilter.limit || 5,
				sort: searchFilter.sort || 'createdAt',
				direction: searchFilter.direction || 'DESC',
				search: searchFilter.search || {},
			},
		},
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		onCompleted: (data) => {
			if (data?.getInstallers) {
				const installers = data.getInstallers.list || [];
				setInstallers(installers);
				
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
		// Refetch when searchFilter changes
		if (getInstallersRefetch) {
			getInstallersRefetch({
				input: {
					page: searchFilter.page || 1,
					limit: searchFilter.limit || 5,
					sort: searchFilter.sort || 'createdAt',
					direction: searchFilter.direction || 'DESC',
					search: searchFilter.search || {},
				},
			});
		}
	}, [searchFilter, getInstallersRefetch]);

	const [likeTargetMember, { loading: likeLoading }] = useMutation(LIKE_TARGET_MEMBER, {
		onCompleted: (data) => {
			if (data?.likeTargetMember) {
				const updatedMember = data.likeTargetMember;
				const memberId = updatedMember._id;
				
				// Update installers list with backend response
				setInstallers((prevInstallers) => {
					return prevInstallers.map((installer) => {
						if (installer._id === memberId) {
							return {
								...installer,
								memberLikes: updatedMember.memberLikes !== undefined && updatedMember.memberLikes !== null 
									? updatedMember.memberLikes 
									: installer.memberLikes,
								meLiked: updatedMember.meLiked || installer.meLiked,
							};
						}
						return installer;
					});
				});
				
				// Show success message
				const isLiked = updatedMember.meLiked && updatedMember.meLiked[0]?.myFavorite;
				const message = isLiked ? 'Installer liked successfully!' : 'Installer unliked successfully!';
				sweetTopSmallSuccessAlert(message, 700).then();
			}
		},
		onError: (err) => {
			console.error('LIKE_TARGET_MEMBER Mutation Error:', err);
			sweetErrorHandling(err).then();
			
			// Refetch to get correct state on error
			if (getInstallersRefetch) {
				getInstallersRefetch({
					input: {
						page: searchFilter.page || 1,
						limit: searchFilter.limit || 5,
						sort: searchFilter.sort || 'createdAt',
						direction: searchFilter.direction || 'DESC',
						search: searchFilter.search || {},
					},
				});
			}
		},
	});

	const user = useReactiveVar(userVar);

	/** HANDLERS **/
	const likeMemberHandler = async (user: any, id: string) => {
		if (!id) return;
		if (!user?._id) {
			sweetTopSmallSuccessAlert('Please login to like installers', 700).then();
			return;
		}

		// Find the installer to get current state
		const currentInstaller = installers.find((installer) => installer._id === id);
		if (!currentInstaller) return;

		const currentLiked = currentInstaller.meLiked && currentInstaller.meLiked[0]?.myFavorite;
		const newLikedState = !currentLiked;

		// Optimistically update the installer in the list immediately
		setInstallers((prevInstallers) => {
			return prevInstallers.map((installer) => {
				if (installer._id === id) {
					return {
						...installer,
						memberLikes: newLikedState 
							? (installer.memberLikes || 0) + 1 
							: Math.max(0, (installer.memberLikes || 0) - 1),
						meLiked: newLikedState 
							? [{ memberId: user._id, likeRefId: id, myFavorite: true }]
							: [],
					};
				}
				return installer;
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
			setInstallers((prevInstallers) => {
				return prevInstallers.map((installer) => {
					if (installer._id === id) {
						// Revert to original state
						return currentInstaller;
					}
					return installer;
				});
			});

			// Refetch to get correct state from backend
			if (getInstallersRefetch) {
				await getInstallersRefetch({
					input: {
						page: searchFilter.page || 1,
						limit: searchFilter.limit || 5,
						sort: searchFilter.sort || 'createdAt',
						direction: searchFilter.direction || 'DESC',
						search: searchFilter.search || {},
					},
				});
			}

			sweetErrorAlert(err?.message || 'Failed to like installer').then();
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
		await router.push(`/installer?input=${JSON.stringify(searchFilter)}`, `/installer?input=${JSON.stringify(searchFilter)}`, {
			scroll: false,
		});
		setCurrentPage(value);
	};

	if (device === 'mobile') {
		return <h1>INSTALLERS PAGE MOBILE</h1>;
	} else {
		return (
			<Stack className={'agent-list-page'}>
				<Stack className={'container'}>
					<Stack className={'filter'}>
						<Box component={'div'} className={'left'}>
							<input
								type="text"
								placeholder={'Search for an installer'}
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
								<Typography>Loading installers...</Typography>
							</div>
						) : error ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>Error loading installers: {error.message}</p>
							</div>
						) : installers?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No Installers found!</p>
							</div>
						) : (
							installers.map((installer: Member) => {
								return <InstallerCard installer={installer} key={installer._id} likeMemberHandler={likeMemberHandler} />;
							})
						)}
					</Stack>
					<Stack className={'pagination'}>
						<Stack className="pagination-box">
							{installers.length !== 0 && Math.ceil(total / searchFilter.limit) > 1 && (
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

						{installers.length !== 0 && (
							<span>
								Total {total} installer{total > 1 ? 's' : ''} available
							</span>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

InstallerList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(InstallerList);

