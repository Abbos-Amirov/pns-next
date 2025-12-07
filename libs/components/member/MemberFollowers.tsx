import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { FollowInquiry } from '../../types/follow/follow.input';
import { useReactiveVar, useQuery, useMutation } from '@apollo/client';
import { Follower } from '../../types/follow/follow';
import { REACT_APP_API_URL } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';
import { GET_MEMBER_FOLLOWERS } from '../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../sweetAlert';

interface MemberFollowsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	redirectToMemberPageHandler: any;
}

const MemberFollowers = (props: MemberFollowsProps) => {
	const { initialInput, subscribeHandler, unsubscribeHandler, redirectToMemberPageHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [total, setTotal] = useState<number>(0);
	const category: any = router.query?.category ?? 'properties';
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);
	const [memberFollowers, setMemberFollowers] = useState<Follower[]>([]);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	const { data: followersData, loading, error, refetch } = useQuery(GET_MEMBER_FOLLOWERS, {
		variables: {
			input: {
				page: followInquiry.page,
				limit: followInquiry.limit,
				search: followInquiry.search,
			},
		},
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		skip: !followInquiry.search?.followingId || !followInquiry.page || !followInquiry.limit,
		onError: (err) => {
			console.error('Followers Query Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	const [subscribeMutation, { loading: subscribing }] = useMutation(SUBSCRIBE);
	const [unsubscribeMutation, { loading: unsubscribing }] = useMutation(UNSUBSCRIBE);

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.memberId) {
			setFollowInquiry({ ...followInquiry, search: { followingId: router.query.memberId as string } });
		} else {
			setFollowInquiry({ ...followInquiry, search: { followingId: user?._id } });
		}
	}, [router, user?._id]);

	useEffect(() => {
		if (followersData?.getMemberFollowers) {
			const followers = followersData.getMemberFollowers.list || [];
			setMemberFollowers(followers);
			
			const metaCounter = followersData.getMemberFollowers.metaCounter;
			const totalCount = Array.isArray(metaCounter) 
				? (metaCounter[0]?.total || 0)
				: (metaCounter?.total || 0);
			setTotal(totalCount);
		}
	}, [followersData]);

	useEffect(() => {
		if (followInquiry.search?.followingId) {
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
		return <div>NESTAR FOLLOWS MOBILE</div>;
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
							<Typography>Loading followers...</Typography>
						</div>
					) : error ? (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<Typography color={'error'}>Error loading followers: {error.message}</Typography>
						</div>
					) : memberFollowers?.length === 0 ? (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No Followers yet!</p>
						</div>
					) : null}
					{memberFollowers.map((follower: Follower) => {
						const imagePath: string = follower?.followerData?.memberImage
							? `${REACT_APP_API_URL}/${follower?.followerData?.memberImage}`
							: '/img/profile/defaultUser.svg';
						return (
							<Stack className="follows-card-box" key={follower._id}>
								<Stack className={'info'} onClick={() => redirectToMemberPageHandler(follower?.followerData?._id)}>
									<Stack className="image-box">
										<img src={imagePath} alt="" />
									</Stack>
									<Stack className="information-box">
										<Typography className="name">{follower?.followerData?.memberNick}</Typography>
									</Stack>
								</Stack>
								<Stack className={'details-box'}>
									<Box className={'info-box'} component={'div'}>
										<p>Followers</p>
										<span>({follower?.followerData?.memberFollowers})</span>
									</Box>
									<Box className={'info-box'} component={'div'}>
										<p>Followings</p>
										<span>({follower?.followerData?.memberFollowings})</span>
									</Box>
									<Box className={'info-box'} component={'div'}>
										{follower?.meLiked && follower?.meLiked[0]?.myFavorite ? (
											<FavoriteIcon color="primary" />
										) : (
											<FavoriteBorderIcon />
										)}
										<span>({follower?.followerData?.memberLikes})</span>
									</Box>
								</Stack>
								{user?._id !== follower?.followerId && follower?.followerData?._id && (
									<Stack className="action-box">
										{follower.meFollowed && follower.meFollowed[0]?.myFollowing ? (
											<>
												<Typography>Following</Typography>
												<Button
													variant="outlined"
													sx={{ background: '#ed5858', ':hover': { background: '#ee7171' } }}
													onClick={() => handleUnsubscribe(follower.followerData!._id)}
													disabled={unsubscribing}
												>
													{unsubscribing ? 'Unfollowing...' : 'Unfollow'}
												</Button>
											</>
										) : (
											<Button
												variant="contained"
												sx={{ background: '#60eb60d4', ':hover': { background: '#60eb60d4' } }}
												onClick={() => handleSubscribe(follower.followerData!._id)}
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
				{memberFollowers.length !== 0 && (
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
							<Typography>{total} followers</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		);
	}
};

MemberFollowers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		search: {
			followingId: '',
		},
	},
};

export default MemberFollowers;
