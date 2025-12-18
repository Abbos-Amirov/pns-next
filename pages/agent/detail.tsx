import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import PropertyBigCard from '../../libs/components/common/PropertyBigCard';
import ReviewCard from '../../libs/components/agent/ReviewCard';
import { Box, Button, Pagination, Stack, Typography, Chip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import { useReactiveVar, useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { Product } from '../../libs/types/product/property';
import { Member } from '../../libs/types/member/member';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../libs/sweetAlert';
import { userVar } from '../../apollo/store';
import { PropertiesInquiry } from '../../libs/types/product/property.input';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Direction } from '../../libs/enums/common.enum';
import { REACT_APP_API_URL } from '../../libs/config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GET_MEMBER, GET_COMMENTS } from '../../apollo/user/query';
import { LIKE_TARGET_MEMBER, CREATE_COMMENT } from '../../apollo/user/mutation';
import moment from 'moment';
import Link from 'next/link';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AgentDetail: NextPage = ({ initialInput, initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [mbId, setMbId] = useState<string | null>(null);
	const [agent, setAgent] = useState<Member | null>(null);
	const [isLiked, setIsLiked] = useState<boolean>(false);
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(initialInput);
	const [agentProperties, setAgentProperties] = useState<Product[]>([]);
	const [propertyTotal, setPropertyTotal] = useState<number>(0);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [agentComments, setAgentComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.MEASURER,
		commentContent: '',
		commentRefId: '',
	});

	/** APOLLO REQUESTS **/
	const { data: memberData, loading: memberLoading, error: memberError } = useQuery(GET_MEMBER, {
		variables: {
			input: mbId || '',
		},
		skip: !mbId,
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		onCompleted: (data) => {
			if (data?.getMember) {
				const member = data.getMember;
				setAgent(member);
				
				// Update isLiked state
				const liked = member.meLiked && member.meLiked[0]?.myFavorite;
				setIsLiked(liked || false);
				
				// Update comment inquiry
				setInsertCommentData({
					...insertCommentData,
					commentRefId: member._id,
				});
			}
		},
		onError: (err) => {
			console.error('GetMember Query Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	// Like Member Mutation
	const [likeTargetMember, { loading: likeLoading }] = useMutation(LIKE_TARGET_MEMBER, {
		onCompleted: (data) => {
			if (data?.likeTargetMember && agent?._id) {
				const updatedMember = data.likeTargetMember;
				const newLikedState = updatedMember.meLiked && updatedMember.meLiked[0]?.myFavorite;
				
				setIsLiked(newLikedState);
				setAgent({
					...agent,
					memberLikes: updatedMember.memberLikes || agent.memberLikes,
					meLiked: updatedMember.meLiked || agent.meLiked,
				});
				
				const message = newLikedState ? 'Member liked successfully!' : 'Member unliked successfully!';
				sweetTopSuccessAlert(message, 700).then();
			}
		},
		onError: (err) => {
			sweetErrorHandling(err).then();
		},
	});

	// Get Comments Query
	const { data: commentsData, loading: commentsLoading, refetch: refetchComments } = useQuery(GET_COMMENTS, {
		variables: {
			input: commentInquiry,
		},
		skip: !agent?._id,
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		onCompleted: (data) => {
			if (data?.getComments) {
				setAgentComments(data.getComments.list || []);
				const metaCounter = data.getComments.metaCounter;
				const totalCount = Array.isArray(metaCounter) 
					? (metaCounter[0]?.total || 0)
					: (metaCounter?.total || 0);
				setCommentTotal(totalCount);
			}
		},
		onError: (err) => {
			console.error('GetComments Query Error:', err);
		},
	});

	// Create Comment Mutation
	const [createComment, { loading: createCommentLoading }] = useMutation(CREATE_COMMENT, {
		onCompleted: (data) => {
			if (data?.createComment) {
				// Clear comment input
				setInsertCommentData({
					commentGroup: CommentGroup.MEASURER,
					commentContent: '',
					commentRefId: agent?._id || '',
				});
				
				// Refetch comments to show new comment
				if (refetchComments) {
					refetchComments();
				}
				
				sweetTopSuccessAlert('Review submitted successfully!', 700).then();
			}
		},
		onError: (err) => {
			console.error('CreateComment Mutation Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.agentId) {
			setMbId(router.query.agentId as string);
		}
	}, [router]);

	// Update comment inquiry when agent is loaded
	useEffect(() => {
		if (agent?._id) {
			setCommentInquiry({
				page: 1,
				limit: 4,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {
					commentRefId: agent._id,
				},
			});
			
			setInsertCommentData({
				commentGroup: CommentGroup.MEMBER,
				commentContent: '',
				commentRefId: agent._id,
			});
		}
	}, [agent?._id]);

	// Refetch comments when commentInquiry page changes (for pagination)
	useEffect(() => {
		if (agent?._id && commentInquiry.search?.commentRefId && refetchComments) {
			refetchComments({
				variables: {
					input: commentInquiry,
				},
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [commentInquiry.page, commentInquiry.limit]);

	/** HANDLERS **/
	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const likeMemberHandler = async () => {
		if (!user?._id) {
			sweetTopSuccessAlert('Please login to like members', 700).then();
			return;
		}

		if (!agent?._id) {
			return;
		}

		// Optimistically update UI
		const currentLikedState = isLiked;
		const newLikedState = !currentLikedState;
		setIsLiked(newLikedState);

		try {
			await likeTargetMember({
				variables: {
					input: agent._id,
				},
			});
		} catch (err) {
			console.error('Error liking member:', err);
			// Revert on error
			setIsLiked(currentLikedState);
		}
	};

	const propertyPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		setSearchFilter({ ...searchFilter });
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
	};

	const createCommentHandler = async () => {
		if (!user?._id) {
			sweetTopSuccessAlert('Please login to leave a review', 700).then();
			return;
		}

		if (!insertCommentData.commentContent.trim()) {
			sweetTopSuccessAlert('Please enter a review', 700).then();
			return;
		}

		if (!agent?._id) {
			sweetTopSuccessAlert('Agent not found', 700).then();
			return;
		}

		try {
			await createComment({
				variables: {
					input: {
						commentGroup: CommentGroup.MEMBER,
						commentContent: insertCommentData.commentContent.trim(),
						commentRefId: agent._id,
					},
				},
			});
		} catch (err: any) {
			console.error('Error creating comment:', err);
			sweetErrorHandling(err).then();
		}
	};

	if (device === 'mobile') {
		return <div>AGENT DETAIL PAGE MOBILE</div>;
	} else {
		// Show loading state
		if (memberLoading) {
			return (
				<Stack className={'agent-detail-page'}>
					<Stack className={'container'}>
						<Stack sx={{ py: 5, alignItems: 'center' }}>
							<Typography>Loading agent...</Typography>
						</Stack>
					</Stack>
				</Stack>
			);
		}

		// Show error state
		if (memberError || !agent) {
			return (
				<Stack className={'agent-detail-page'}>
					<Stack className={'container'}>
						<Stack sx={{ py: 5, alignItems: 'center' }}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<Typography color={'error'}>Error loading agent or agent not found!</Typography>
						</Stack>
					</Stack>
				</Stack>
			);
		}

		const imagePath = agent?.memberImage 
			? `${REACT_APP_API_URL}/${agent.memberImage}` 
			: '/img/profile/defaultUser.svg';

		return (
			<Stack className={'agent-detail-page'}>
				<Stack className={'container'}>
					{/* Agent Info Section */}
					<Stack className={'agent-info-section'}>
						<Box component={'div'} className={'agent-profile-card'}>
							<Box component={'div'} className={'agent-image-wrapper'}>
								<img
									src={imagePath}
									alt={agent?.memberFullName || agent?.memberNick || 'Agent'}
									className="agent-profile-image"
									onError={(e) => {
										(e.target as HTMLImageElement).src = '/img/profile/defaultUser.svg';
									}}
								/>
								{agent?.memberProperties && (
									<Chip 
										label={`${agent.memberProperties} Products`}
										className="agent-badge-chip"
										sx={{
											position: 'absolute',
											top: '12px',
											left: '12px',
											background: 'rgba(235, 103, 83, 0.95)',
											color: '#fff',
											fontWeight: 600,
											fontSize: '12px',
										}}
									/>
								)}
							</Box>
							
							<Stack className={'agent-info-content'}>
								<Stack className={'agent-header'}>
									<Typography className={'agent-name'}>
										{agent?.memberFullName || agent?.memberNick}
									</Typography>
									<Chip 
										label={agent?.memberType || 'MEASURER'}
										className="agent-type-chip"
										sx={{
											background: '#8B4513',
											color: '#fff',
											fontWeight: 600,
											fontSize: '12px',
										}}
									/>
								</Stack>

								<Stack className={'agent-stats'}>
									<Box component={'div'} className={'stat-item'}>
										<RemoveRedEyeIcon sx={{ color: '#8B4513', fontSize: '20px' }} />
										<Typography className={'stat-value'}>{agent?.memberViews || 0}</Typography>
										<Typography className={'stat-label'}>Views</Typography>
									</Box>
									<Box component={'div'} className={'stat-item'}>
										{isLiked ? (
											<FavoriteIcon sx={{ color: '#eb6753', fontSize: '20px' }} />
										) : (
											<FavoriteBorderIcon sx={{ color: '#8B4513', fontSize: '20px' }} />
										)}
										<Typography className={'stat-value'}>{agent?.memberLikes || 0}</Typography>
										<Typography className={'stat-label'}>Likes</Typography>
									</Box>
									<Box component={'div'} className={'stat-item'}>
										<PersonIcon sx={{ color: '#8B4513', fontSize: '20px' }} />
										<Typography className={'stat-value'}>{agent?.memberFollowers || 0}</Typography>
										<Typography className={'stat-label'}>Followers</Typography>
									</Box>
									<Box component={'div'} className={'stat-item'}>
										<PersonIcon sx={{ color: '#8B4513', fontSize: '20px' }} />
										<Typography className={'stat-value'}>{agent?.memberFollowings || 0}</Typography>
										<Typography className={'stat-label'}>Following</Typography>
									</Box>
								</Stack>

								<Stack className={'agent-details'}>
									{agent?.memberPhone && (
										<Box component={'div'} className={'detail-item'}>
											<PhoneIcon sx={{ color: '#8B4513', fontSize: '18px' }} />
											<Typography className={'detail-text'}>{agent.memberPhone}</Typography>
										</Box>
									)}
									{agent?.memberAddress && (
										<Box component={'div'} className={'detail-item'}>
											<LocationOnIcon sx={{ color: '#8B4513', fontSize: '18px' }} />
											<Typography className={'detail-text'}>{agent.memberAddress}</Typography>
										</Box>
									)}
									{agent?.createdAt && (
										<Box component={'div'} className={'detail-item'}>
											<Typography className={'detail-label'}>Member since:</Typography>
											<Typography className={'detail-text'}>
												{moment(agent.createdAt).format('MMMM YYYY')}
											</Typography>
										</Box>
									)}
								</Stack>

								{agent?.memberDesc && (
									<Box component={'div'} className={'agent-description'}>
										<Typography className={'description-title'}>About</Typography>
										<Typography className={'description-text'}>{agent.memberDesc}</Typography>
									</Box>
								)}

								<Stack className={'agent-actions'}>
								<Button
										className={'like-button'}
										variant={isLiked ? 'contained' : 'outlined'}
										onClick={likeMemberHandler}
										disabled={likeLoading}
										startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
										sx={{
											background: isLiked ? '#eb6753' : 'transparent',
											color: isLiked ? '#fff' : '#8B4513',
											borderColor: '#8B4513',
											'&:hover': {
												background: isLiked ? '#d45542' : 'rgba(139, 69, 19, 0.1)',
												borderColor: '#8B4513',
											},
										}}
									>
										{isLiked ? 'Liked' : 'Like'}
									</Button>
									<Button
										className={'view-profile-button'}
										variant="contained"
										onClick={() => redirectToMemberPageHandler(agent._id)}
										sx={{
											background: '#8B4513',
											color: '#fff',
											'&:hover': {
												background: '#6B3410',
											},
										}}
									>
										View Full Profile
									</Button>
								</Stack>
							</Stack>
						</Box>
					</Stack>

					{/* Agent Properties Section */}
					<Stack className={'agent-properties-section'}>
						<Typography className={'section-title'}>working city</Typography>
						<Stack className={'card-wrap'}>
							{agentProperties.length > 0 ? (
								agentProperties.map((property: Product) => {
									return (
										<div className={'wrap-main'} key={property?._id}>
											<PropertyBigCard property={property} key={property?._id} />
										</div>
									);
								})
							) : (
								<div className={'no-data'}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<p>No properties found!</p>
								</div>
							)}
						</Stack>
						{propertyTotal > 0 && (
							<Stack className={'pagination'}>
								<Stack className="pagination-box">
									<Pagination
										page={searchFilter.page}
										count={Math.ceil(propertyTotal / searchFilter.limit) || 1}
										onChange={propertyPaginationChangeHandler}
										shape="circular"
										color="primary"
									/>
								</Stack>
								<span>
									Total {propertyTotal} propert{propertyTotal > 1 ? 'ies' : 'y'} available
								</span>
							</Stack>
						)}
					</Stack>

					{/* Reviews Section */}
					<Stack className={'review-section'}>
						<Stack className={'review-header'}>
							<Typography className={'section-title'}>Reviews</Typography>
							<Typography className={'section-subtitle'}>We are glad to see you again</Typography>
						</Stack>
						
						{commentsLoading ? (
							<Stack sx={{ py: 3, alignItems: 'center' }}>
								<Typography sx={{ color: '#717171' }}>Loading reviews...</Typography>
							</Stack>
						) : commentTotal > 0 ? (
							<Stack className={'review-wrap'}>
								<Box component={'div'} className={'review-title-box'}>
									<StarIcon sx={{ color: '#FFD700', fontSize: '24px' }} />
									<Typography className={'review-count'}>
										{commentTotal} review{commentTotal > 1 ? 's' : ''}
									</Typography>
								</Box>
								{agentComments?.map((comment: Comment) => {
									return <ReviewCard comment={comment} key={comment?._id} />;
								})}
								{Math.ceil(commentTotal / commentInquiry.limit) > 1 && (
									<Box component={'div'} className={'pagination-box'}>
										<Pagination
											page={commentInquiry.page}
											count={Math.ceil(commentTotal / commentInquiry.limit)}
											onChange={commentPaginationChangeHandler}
											shape="circular"
											color="primary"
										/>
									</Box>
								)}
							</Stack>
						) : (
							<Stack sx={{ py: 3, alignItems: 'center' }}>
								<Typography sx={{ color: '#717171' }}>No reviews yet. Be the first to leave a review!</Typography>
							</Stack>
						)}

						

						{user?._id && (
							<Stack className={'leave-review-config'}>
								<Typography className={'main-title'}>Leave A Review</Typography>
								<Typography className={'review-title'}>Review</Typography>
								<textarea
									onChange={({ target: { value } }: any) => {
										setInsertCommentData({ ...insertCommentData, commentContent: value });
									}}
									value={insertCommentData.commentContent}
									placeholder="Write your review here..."
								></textarea>
								<Box className={'submit-btn'} component={'div'}>
									<Button
										className={'submit-review'}
										disabled={insertCommentData.commentContent === '' || !user?._id}
										onClick={createCommentHandler}
										sx={{
											background: '#8B4513',
											color: '#fff',
											'&:hover': {
												background: '#6B3410',
											},
											'&:disabled': {
												background: '#ccc',
											},
										}}
									>
										<Typography className={'title'}>Submit Review</Typography>
										<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
											<g clipPath="url(#clip0_6975_3642)">
												<path
													d="M16.1571 0.5H6.37936C6.1337 0.5 5.93491 0.698792 5.93491 0.944458C5.93491 1.19012 6.1337 1.38892 6.37936 1.38892H15.0842L0.731781 15.7413C0.558156 15.915 0.558156 16.1962 0.731781 16.3698C0.818573 16.4566 0.932323 16.5 1.04603 16.5C1.15974 16.5 1.27345 16.4566 1.36028 16.3698L15.7127 2.01737V10.7222C15.7127 10.9679 15.9115 11.1667 16.1572 11.1667C16.4028 11.1667 16.6016 10.9679 16.6016 10.7222V0.944458C16.6016 0.698792 16.4028 0.5 16.1571 0.5Z"
													fill="white"
												/>
											</g>
											<defs>
												<clipPath id="clip0_6975_3642">
													<rect width="16" height="16" fill="white" transform="translate(0.601562 0.5)" />
												</clipPath>
											</defs>
										</svg>
									</Button>
								</Box>
							</Stack>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

AgentDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		search: {
			memberId: '',
		},
	},
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutBasic(AgentDetail);
