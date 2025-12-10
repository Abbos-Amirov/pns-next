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
		commentGroup: CommentGroup.MEMBER,
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
					commentGroup: CommentGroup.MEMBER,
					commentContent: '',
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
	const { data: commentsData, loading: commentsLoading, refetch: refetchComments } = useQuery(GET_COMMENTS, {
		variables: {
			input: commentInquiry,
		},
		skip: !installer?._id,
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		onCompleted: (data) => {
			if (data?.getComments) {
				setInstallerComments(data.getComments.list || []);
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
					commentGroup: CommentGroup.MEMBER,
					commentContent: '',
					commentRefId: installer?._id || '',
				});
				
				// Refetch comments to show new comment
				if (refetchComments) {
					refetchComments();
				}
				
				sweetTopSuccessAlert('Review submitted successfully!', 700).then();
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

	// Update comment inquiry when installer is loaded
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
			
			setInsertCommentData({
				commentGroup: CommentGroup.MEMBER,
				commentContent: '',
				commentRefId: installer._id,
			});
		}
	}, [installer?._id]);

	// Refetch comments when commentInquiry page changes (for pagination)
	useEffect(() => {
		if (installer?._id && commentInquiry.search?.commentRefId && refetchComments) {
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
		if (!user?._id) {
			sweetTopSuccessAlert('Please login to leave a review', 700).then();
			return;
		}

		if (!insertCommentData.commentContent.trim()) {
			sweetTopSuccessAlert('Please enter a review', 700).then();
			return;
		}

		if (!installer?._id) {
			sweetTopSuccessAlert('Installer not found', 700).then();
			return;
		}

		try {
			await createComment({
				variables: {
					input: {
						commentGroup: CommentGroup.MEMBER,
						commentContent: insertCommentData.commentContent.trim(),
						commentRefId: installer._id,
					},
				},
			});
		} catch (err: any) {
			console.error('Error creating comment:', err);
			sweetErrorHandling(err).then();
		}
	};

	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
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

										<Stack className={'agent-actions'}>
											<Button
												className={'like-button'}
												variant={isLiked ? 'contained' : 'outlined'}
												onClick={likeInstallerHandler}
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
												onClick={() => redirectToMemberPageHandler(installer._id)}
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
									</Box>
								</Box>
							</Stack>

							{/* Reviews Section */}
							<Stack className={'review-section'}>
								<Stack className={'review-header'}>
									<Typography className={'section-title'}>Reviews</Typography>
									<Typography className={'section-subtitle'}>Share your experience with this installer</Typography>
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
										{installerComments?.map((comment: Comment) => {
											return <ReviewCard comment={comment} key={comment?._id} />;
										})}
										{Math.ceil(commentTotal / (commentInquiry.limit || 4)) > 1 && (
											<Box component={'div'} className={'pagination-box'}>
												<Pagination
													page={commentInquiry.page || 1}
													count={Math.ceil(commentTotal / (commentInquiry.limit || 4))}
													onChange={commentPaginationChangeHandler}
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
									</Stack>
								) : (
									<Stack sx={{ py: 3, alignItems: 'center' }}>
										<Typography sx={{ color: '#717171' }}>No reviews yet. Be the first to leave a review!</Typography>
									</Stack>
								)}

								{/* Comment Form */}
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
											disabled={createCommentLoading}
										></textarea>
										<Box className={'submit-btn'} component={'div'}>
											<Button
												className={'submit-review'}
												disabled={insertCommentData.commentContent === '' || !user?._id || createCommentLoading}
												onClick={submitCommentHandler}
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
												<Typography className={'title'}>
													{createCommentLoading ? 'Submitting...' : 'Submit Review'}
												</Typography>
												{!createCommentLoading && (
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
												)}
											</Button>
										</Box>
									</Stack>
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

