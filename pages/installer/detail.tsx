import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
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
import { Member } from '../../libs/types/member/member';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../libs/sweetAlert';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Direction } from '../../libs/enums/common.enum';
import { REACT_APP_API_URL } from '../../libs/config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GET_MEMBER, GET_COMMENTS } from '../../apollo/user/query';
import { LIKE_TARGET_MEMBER, CREATE_COMMENT } from '../../apollo/user/mutation';
import moment from 'moment';
import ReviewCard from '../../libs/components/agent/ReviewCard';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const InstallerDetail: NextPage = ({ initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [mbId, setMbId] = useState<string | null>(null);
	const [installer, setInstaller] = useState<Member | null>(null);
	const [isLiked, setIsLiked] = useState<boolean>(false);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [installerComments, setInstallerComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.INSTALLER,
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
				setInstaller(member);
				
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
			if (data?.likeTargetMember && installer?._id) {
				const updatedMember = data.likeTargetMember;
				const newLikedState = updatedMember.meLiked && updatedMember.meLiked[0]?.myFavorite;
				
				setIsLiked(newLikedState);
				setInstaller({
					...installer,
					memberLikes: updatedMember.memberLikes || installer.memberLikes,
					meLiked: updatedMember.meLiked || installer.meLiked,
				});
				
				const message = newLikedState ? 'Installer liked successfully!' : 'Installer unliked successfully!';
				sweetTopSuccessAlert(message, 700).then();
			}
		},
		onError: (err) => {
			console.error('LIKE_TARGET_MEMBER Mutation Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	// Get Comments Query
	const { data: commentsData, loading: commentsLoading, refetch: getCommentsRefetch } = useQuery(GET_COMMENTS, {
		variables: {
			input: commentInquiry,
		},
		skip: !commentInquiry.search?.commentRefId,
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		onCompleted: (data) => {
			if (data?.getComments) {
				const comments = data.getComments.list || [];
				setInstallerComments(comments);
				
				const metaCounter = data.getComments.metaCounter;
				const totalCount = Array.isArray(metaCounter) 
					? (metaCounter[0]?.total || 0)
					: (metaCounter?.total || 0);
				setCommentTotal(totalCount);
			}
		},
		onError: (err) => {
			console.error('GetComments Query Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	// Create Comment Mutation
	const [createComment, { loading: createCommentLoading }] = useMutation(CREATE_COMMENT, {
		onCompleted: (data) => {
			if (data?.createComment) {
				setInsertCommentData({
					...insertCommentData,
					commentContent: '',
				});
				sweetTopSuccessAlert('Review submitted successfully!', 700).then();
				
				// Refetch comments
				if (getCommentsRefetch) {
					getCommentsRefetch();
				}
			}
		},
		onError: (err) => {
			console.error('CREATE_COMMENT Mutation Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.installerId) {
			const installerId = router.query.installerId as string;
			setMbId(installerId);
		}
	}, [router.query.installerId]);

	useEffect(() => {
		if (installer?._id) {
			setCommentInquiry({
				page: 1,
				limit: 4,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {
					commentRefId: installer._id,
				},
			});
		}
	}, [installer?._id]);

	useEffect(() => {
		if (commentInquiry.search?.commentRefId && getCommentsRefetch) {
			getCommentsRefetch({
				input: commentInquiry,
			});
		}
	}, [commentInquiry, getCommentsRefetch]);

	/** HANDLERS **/
	const likeInstallerHandler = async () => {
		if (!installer?._id) return;
		if (!user?._id) {
			sweetTopSuccessAlert('Please login to like installers', 700).then();
			return;
		}

		// Optimistic update
		const currentLikedState = isLiked;
		setIsLiked(!currentLikedState);
		setInstaller({
			...installer,
			memberLikes: !currentLikedState 
				? (installer.memberLikes || 0) + 1 
				: Math.max(0, (installer.memberLikes || 0) - 1),
		});

		try {
			await likeTargetMember({
				variables: {
					input: installer._id,
				},
			});
		} catch (err: any) {
			// Revert optimistic update on error
			setIsLiked(currentLikedState);
			setInstaller({
				...installer,
				memberLikes: installer.memberLikes || 0,
			});
			sweetErrorHandling(err).then();
		}
	};

	const submitCommentHandler = async () => {
		if (!insertCommentData.commentContent.trim()) {
			sweetTopSuccessAlert('Please enter a review', 700).then();
			return;
		}

		if (!user?._id) {
			sweetTopSuccessAlert('Please login to submit a review', 700).then();
			return;
		}

		if (!insertCommentData.commentRefId) {
			sweetTopSuccessAlert('Installer ID is missing', 700).then();
			return;
		}

		try {
			await createComment({
				variables: {
					input: insertCommentData,
				},
			});
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		setCommentInquiry({
			...commentInquiry,
			page: value,
		});
	};

	const imagePath: string = installer?.memberImage
		? `${REACT_APP_API_URL}/${installer?.memberImage}`
		: '/img/profile/defaultUser.svg';

	if (device === 'mobile') {
		return <h1>INSTALLER DETAIL PAGE MOBILE</h1>;
	} else {
		return (
			<Stack className={'agent-detail-page'}>
				<Stack className={'container'}>
					{memberLoading ? (
						<Box sx={{ padding: '40px', textAlign: 'center' }}>
							<Typography>Loading installer information...</Typography>
						</Box>
					) : memberError ? (
						<Box sx={{ padding: '40px', textAlign: 'center' }}>
							<Typography color="error">Error loading installer: {memberError.message}</Typography>
						</Box>
					) : !installer ? (
						<Box sx={{ padding: '40px', textAlign: 'center' }}>
							<Typography>Installer not found</Typography>
						</Box>
					) : (
						<>
							{/* Installer Profile Card */}
							<Stack className={'agent-info-section'}>
								<Box className={'agent-profile-card'}>
									<Box className={'agent-image-wrapper'}>
										<img
											src={imagePath}
											alt={installer?.memberFullName || installer?.memberNick || 'Installer'}
											className="agent-profile-image"
											onError={(e) => {
												(e.target as HTMLImageElement).src = '/img/profile/defaultUser.svg';
											}}
										/>
									</Box>
									<Box className={'agent-info-content'}>
										<Box className={'agent-header'}>
											<Typography className={'agent-name'}>
												{installer?.memberFullName || installer?.memberNick || 'Installer'}
											</Typography>
											<Chip 
												label="INSTALLER" 
												sx={{ 
													backgroundColor: '#8B4513',
													color: '#fff',
													fontWeight: 600,
													fontSize: '12px',
													height: '28px'
												}} 
											/>
										</Box>
										
										<Box className={'agent-stats'}>
											<Box className={'stat-item'}>
												<Typography className={'stat-value'}>
													{installer?.memberViews || 0}
												</Typography>
												<Typography className={'stat-label'}>Views</Typography>
											</Box>
											<Box className={'stat-item'}>
												<Typography className={'stat-value'}>
													{installer?.memberLikes || 0}
												</Typography>
												<Typography className={'stat-label'}>Likes</Typography>
											</Box>
											<Box className={'stat-item'}>
												<Typography className={'stat-value'}>
													{installer?.memberFollowers || 0}
												</Typography>
												<Typography className={'stat-label'}>Followers</Typography>
											</Box>
											<Box className={'stat-item'}>
												<Typography className={'stat-value'}>
													{installer?.memberFollowings || 0}
												</Typography>
												<Typography className={'stat-label'}>Followings</Typography>
											</Box>
											<Box className={'stat-item'}>
												<Typography className={'stat-value'}>
													{installer?.memberComments || 0}
												</Typography>
												<Typography className={'stat-label'}>Comments</Typography>
											</Box>
										</Box>

										<Box className={'agent-details'}>
											{installer?.memberPhone && (
												<Box className={'detail-item'}>
													<PhoneIcon sx={{ color: '#8B4513', fontSize: '20px' }} />
													<Typography className={'detail-text'}>{installer.memberPhone}</Typography>
												</Box>
											)}
											{installer?.memberAddress && (
												<Box className={'detail-item'}>
													<LocationOnIcon sx={{ color: '#8B4513', fontSize: '20px' }} />
													<Typography className={'detail-text'}>{installer.memberAddress}</Typography>
												</Box>
											)}
											{installer?.memberDesc && (
												<Box className={'detail-item'}>
													<PersonIcon sx={{ color: '#8B4513', fontSize: '20px' }} />
													<Typography className={'detail-text'}>{installer.memberDesc}</Typography>
												</Box>
											)}
										</Box>

										<Box className={'agent-actions'}>
											<Button
												variant="contained"
												startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
												onClick={likeInstallerHandler}
												disabled={likeLoading}
												sx={{
													backgroundColor: isLiked ? '#eb6753' : '#8B4513',
													color: '#fff',
													borderRadius: '40px',
													padding: '12px 32px',
													fontWeight: 600,
													textTransform: 'none',
													'&:hover': {
														backgroundColor: isLiked ? '#d45542' : '#6B3410',
													},
												}}
											>
												{isLiked ? 'Liked' : 'Like'}
											</Button>
										</Box>
									</Box>
								</Box>
							</Stack>

							{/* Reviews Section */}
							<Stack className={'reviews-section'}>
								<Typography className={'section-title'}>Reviews ({commentTotal})</Typography>
								
								{/* Comment Form */}
								<Box className={'comment-form'}>
									<textarea
										className={'comment-textarea'}
										placeholder={user?._id ? 'Write your review here...' : 'Please login to write a review'}
										value={insertCommentData.commentContent}
										onChange={(e) => {
											setInsertCommentData({
												...insertCommentData,
												commentContent: e.target.value,
											});
										}}
										disabled={!user?._id || createCommentLoading}
									/>
									{!user?._id && (
										<Typography className={'login-prompt'}>
											Please login to submit a review
										</Typography>
									)}
									<Button
										variant="contained"
										onClick={submitCommentHandler}
										disabled={!user?._id || !insertCommentData.commentContent.trim() || createCommentLoading}
										sx={{
											backgroundColor: '#8B4513',
											color: '#fff',
											borderRadius: '40px',
											padding: '12px 32px',
											fontWeight: 600,
											textTransform: 'none',
											marginTop: '16px',
											'&:hover': {
												backgroundColor: '#6B3410',
											},
											'&:disabled': {
												backgroundColor: '#ccc',
											},
										}}
									>
										{createCommentLoading ? 'Submitting...' : 'Submit Review'}
									</Button>
								</Box>

								{/* Comments List */}
								{commentsLoading ? (
									<Box sx={{ padding: '20px', textAlign: 'center' }}>
										<Typography>Loading reviews...</Typography>
									</Box>
								) : installerComments.length === 0 ? (
									<Box sx={{ padding: '40px', textAlign: 'center' }}>
										<Typography sx={{ color: '#717171' }}>No reviews yet. Be the first to review!</Typography>
									</Box>
								) : (
									<>
										<Stack className={'comments-list'}>
											{installerComments.map((comment: Comment) => (
												<ReviewCard key={comment._id} comment={comment} />
											))}
										</Stack>
										
										{commentTotal > commentInquiry.limit && (
											<Box className={'pagination-section'}>
												<Pagination
													page={commentInquiry.page || 1}
													count={Math.ceil(commentTotal / (commentInquiry.limit || 4))}
													onChange={paginationChangeHandler}
													shape="circular"
													color="primary"
													sx={{
														'& .MuiPaginationItem-root': {
															color: '#8B4513',
															'&.Mui-selected': {
																backgroundColor: '#8B4513',
																color: '#fff',
															},
														},
													}}
												/>
											</Box>
										)}
									</>
								)}
							</Stack>
						</>
					)}
				</Stack>
			</Stack>
		);
	}
};

InstallerDetail.defaultProps = {
	initialComment: {
		page: 1,
		limit: 4,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutBasic(InstallerDetail);

