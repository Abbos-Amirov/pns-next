import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { FollowInquiry } from '../../types/follow/follow.input';
import { useReactiveVar, useQuery, useMutation } from '@apollo/client';
import { Following } from '../../types/follow/follow';
import { REACT_APP_API_URL } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { userVar } from '../../../apollo/store';
import { GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../sweetAlert';

interface MemberFollowingsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	redirectToMemberPageHandler: any;
}

const MemberFollowings = (props: MemberFollowingsProps) => {
	const { initialInput, subscribeHandler, unsubscribeHandler, redirectToMemberPageHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [total, setTotal] = useState<number>(0);
	const category: any = router.query?.category ?? 'properties';
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);
	const [memberFollowings, setMemberFollowings] = useState<Following[]>([]);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const { data: followingsData, loading, error, refetch } = useQuery(GET_MEMBER_FOLLOWINGS, {
		variables: {
			input: {
				page: followInquiry.page,
				limit: followInquiry.limit,
				search: followInquiry.search,
			},
		},
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		skip: !followInquiry.search?.followerId || !followInquiry.page || !followInquiry.limit,
		onError: (err) => {
			console.error('Followings Query Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	const [subscribeMutation, { loading: subscribing }] = useMutation(SUBSCRIBE);
	const [unsubscribeMutation, { loading: unsubscribing }] = useMutation(UNSUBSCRIBE);

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.memberId) {
			setFollowInquiry({ ...followInquiry, search: { followerId: router.query.memberId as string } });
		} else {
			setFollowInquiry({ ...followInquiry, search: { followerId: user?._id } });
		}
	}, [router, user?._id]);

	useEffect(() => {
		if (followingsData?.getMemberFollowings) {
			const followings = followingsData.getMemberFollowings.list || [];
			setMemberFollowings(followings);
			
			const metaCounter = followingsData.getMemberFollowings.metaCounter;
			const totalCount = Array.isArray(metaCounter) 
				? (metaCounter[0]?.total || 0)
				: (metaCounter?.total || 0);
			setTotal(totalCount);
		}
	}, [followingsData]);

	useEffect(() => {
		if (followInquiry.search?.followerId) {
			refetch();
		}
	}, [followInquiry, refetch]);

	/** HANDLERS **/
	const paginationHandler = async (event: ChangeEvent<unknown>, value: number) => {
		followInquiry.page = value;
		setFollowInquiry({ ...followInquiry });
	};

	const handleSubscribe = async (memberId: string) => {
		try {
			await subscribeMutation({
				variables: {
					input: memberId,
				},
			});
			await sweetTopSuccessAlert('Successfully followed!', 700);
			await refetch();
		} catch (err: any) {
			console.error('Subscribe Error:', err);
			await sweetErrorHandling(err);
		}
	};

	const handleUnsubscribe = async (memberId: string) => {
		try {
			await unsubscribeMutation({
				variables: {
					input: memberId,
				},
			});
			await sweetTopSuccessAlert('Successfully unfollowed!', 700);
			await refetch();
		} catch (err: any) {
			console.error('Unsubscribe Error:', err);
			await sweetErrorHandling(err);
		}
	};

	if (device === 'mobile') {
		return (
			<Stack className={'mobile-follows-page'}>
				<Stack className={'mobile-follows-header'}>
					<Typography className={'mobile-follows-title'}>Followings</Typography>
					{total > 0 && <Typography className={'mobile-follows-count'}>{total}</Typography>}
				</Stack>
				{loading ? (
					<Stack className={'mobile-empty-state'}>
						<Typography>Loading followings...</Typography>
					</Stack>
				) : error ? (
					<Stack className={'mobile-empty-state'}>
						<img src="/img/icons/icoAlert.svg" alt="" />
						<Typography>Error loading followings</Typography>
					</Stack>
				) : memberFollowings?.length === 0 ? (
					<Stack className={'mobile-empty-state'}>
						<img src="/img/icons/icoAlert.svg" alt="" />
						<Typography>No Followings yet!</Typography>
					</Stack>
				) : (
					<Stack className={'mobile-follows-list'}>
						{memberFollowings.map((follower: Following) => {
							const imagePath: string = follower?.followingData?.memberImage
								? `${REACT_APP_API_URL}/${follower?.followingData?.memberImage}`
								: '/img/profile/defaultUser.svg';
							const isMe = user?._id === follower?.followingId;
							const following = follower.meFollowed && follower.meFollowed[0]?.myFollowing;
							return (
								<Stack className={'mobile-follow-card'} key={follower._id}>
									<Stack
										className={'mobile-follow-info'}
										onClick={() => redirectToMemberPageHandler(follower?.followingData?._id)}
									>
										<Box component={'div'} className={'mobile-follow-avatar'}>
											<img src={imagePath} alt="" />
										</Box>
										<Stack className={'mobile-follow-text'}>
											<Typography className={'mobile-follow-name'}>{follower?.followingData?.memberNick}</Typography>
											<Stack className={'mobile-follow-stats'} direction={'row'}>
												<span className={'mobile-follow-stat'}>{follower?.followingData?.memberFollowers} followers</span>
												<span className={'mobile-follow-stat'}>{follower?.followingData?.memberFollowings} following</span>
											</Stack>
										</Stack>
									</Stack>
									{!isMe && follower?.followingData?._id && (
										<Button
											disableRipple
											className={`mobile-follow-action ${following ? 'following' : ''}`}
											disabled={unsubscribing || subscribing}
											onClick={() =>
												following
													? handleUnsubscribe(follower.followingData!._id)
													: handleSubscribe(follower.followingData!._id)
											}
										>
											{following ? 'Unfollow' : 'Follow'}
										</Button>
									)}
								</Stack>
							);
						})}
					</Stack>
				)}
				{memberFollowings.length !== 0 && (
					<Stack className={'mobile-pagination'}>
						<Pagination
							page={followInquiry.page}
							count={Math.ceil(total / followInquiry.limit)}
							onChange={paginationHandler}
							shape="circular"
							color="primary"
						/>
					</Stack>
				)}
			</Stack>
		);
	} else {
		return (
			<div id="member-follows-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">{category === 'followers' ? 'Followers' : 'Followings'}</Typography>
					</Stack>
				</Stack>
				<Stack className="follows-list-box">
					<Stack className="listing-title-box">
						<Typography className="title-text">Name</Typography>
						<Typography className="title-text">Details</Typography>
						<Typography className="title-text">Subscription</Typography>
					</Stack>
					{loading ? (
						<div className={'no-data'}>
							<Typography>Loading followings...</Typography>
						</div>
					) : error ? (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<Typography color={'error'}>Error loading followings: {error.message}</Typography>
						</div>
					) : memberFollowings?.length === 0 ? (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No Followings yet!</p>
						</div>
					) : null}
					{memberFollowings.map((follower: Following) => {
						const imagePath: string = follower?.followingData?.memberImage
							? `${REACT_APP_API_URL}/${follower?.followingData?.memberImage}`
							: '/img/profile/defaultUser.svg';
						return (
							<Stack className="follows-card-box" key={follower._id}>
								<Stack className={'info'} onClick={() => redirectToMemberPageHandler(follower?.followingData?._id)}>
									<Stack className="image-box">
										<img src={imagePath} alt="" />
									</Stack>
									<Stack className="information-box">
										<Typography className="name">{follower?.followingData?.memberNick}</Typography>
									</Stack>
								</Stack>
								<Stack className={'details-box'}>
									<Box className={'info-box'} component={'div'}>
										<p>Followers</p>
										<span>({follower?.followingData?.memberFollowers})</span>
									</Box>
									<Box className={'info-box'} component={'div'}>
										<p>Followings</p>
										<span>({follower?.followingData?.memberFollowings})</span>
									</Box>
									<Box className={'info-box'} component={'div'}>
										{follower?.meLiked && follower?.meLiked[0]?.myFavorite ? (
											<FavoriteIcon color="primary" />
										) : (
											<FavoriteBorderIcon />
										)}
										<span>({follower?.followingData?.memberLikes})</span>
									</Box>
								</Stack>
								{user?._id !== follower?.followingId && follower?.followingData?._id && (
									<Stack className="action-box">
										{follower.meFollowed && follower.meFollowed[0]?.myFollowing ? (
											<>
												<Typography>Following</Typography>
												<Button
													variant="outlined"
													sx={{ background: '#f78181', ':hover': { background: '#f06363' } }}
													onClick={() => handleUnsubscribe(follower.followingData!._id)}
													disabled={unsubscribing}
												>
													{unsubscribing ? 'Unfollowing...' : 'Unfollow'}
												</Button>
											</>
										) : (
											<Button
												variant="contained"
												sx={{ background: '#60eb60d4', ':hover': { background: '#60eb60d4' } }}
												onClick={() => handleSubscribe(follower.followingData!._id)}
												disabled={subscribing}
											>
												{subscribing ? 'Following...' : 'Follow'}
											</Button>
										)}
									</Stack>
								)}
							</Stack>
						);
					})}
				</Stack>
				{memberFollowings.length !== 0 && (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								page={followInquiry.page}
								count={Math.ceil(total / followInquiry.limit)}
								onChange={paginationHandler}
								shape="circular"
								color="primary"
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>{total} followings</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		);
	}
};

MemberFollowings.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		search: {
			followerId: '',
		},
	},
};

export default MemberFollowings;
