import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, Stack, Typography, Tab, Tabs, IconButton, Backdrop, Pagination, CircularProgress } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useReactiveVar, useQuery, useMutation } from '@apollo/client';
import Moment from 'react-moment';
import { userVar } from '../../apollo/store';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatIcon from '@mui/icons-material/Chat';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentUpdate } from '../../libs/types/comment/comment.update';
import dynamic from 'next/dynamic';
import { CommentStatus, CommentGroup } from '../../libs/enums/comment.enum';
import { T } from '../../libs/types/common';
import EditIcon from '@mui/icons-material/Edit';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { GET_BOARD_ARTICLE, GET_COMMENTS } from '../../apollo/user/query';
import { CREATE_COMMENT, UPDATE_COMMENT } from '../../apollo/user/mutation';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { REACT_APP_API_URL } from '../../libs/config';
import { Direction } from '../../libs/enums/common.enum';
const ToastViewerComponent = dynamic(() => import('../../libs/components/community/TViewer'), { ssr: false });

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CommunityDetail: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { query } = router;

	const articleId = query?.id as string;
	const articleCategory = query?.articleCategory as string;

	const [comment, setComment] = useState<string>('');
	const [wordsCnt, setWordsCnt] = useState<number>(0);
	const [updatedCommentWordsCnt, setUpdatedCommentWordsCnt] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const [memberImage, setMemberImage] = useState<string>('/img/community/articleImg.png');
	const [anchorEl, setAnchorEl] = useState<any | null>(null);
	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;
	const [openBackdrop, setOpenBackdrop] = useState<boolean>(false);
	const [updatedComment, setUpdatedComment] = useState<string>('');
	const [updatedCommentId, setUpdatedCommentId] = useState<string>('');
	const [likeLoading, setLikeLoading] = useState<boolean>(false);

	// Comments inquiry
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>({
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {
			commentRefId: articleId || '',
		},
	});

	/** APOLLO REQUESTS **/
	const { data: boardArticleData, loading: boardArticleLoading, error: boardArticleError, refetch } = useQuery(
		GET_BOARD_ARTICLE,
		{
			variables: {
				input: articleId || '',
			},
			skip: !articleId,
			fetchPolicy: 'network-only',
			errorPolicy: 'all',
			onCompleted: (data) => {
				console.log('Board Article Query Response:', data);
				if (data?.getBoardArticle) {
					console.log('Board Article:', data.getBoardArticle);
					// Set member image
					if (data.getBoardArticle.memberData?.memberImage) {
						const memberImg = data.getBoardArticle.memberData.memberImage;
						if (memberImg.startsWith('http://') || memberImg.startsWith('https://')) {
							setMemberImage(memberImg);
						} else if (memberImg.startsWith('/img/')) {
							setMemberImage(memberImg);
						} else {
							setMemberImage(`${REACT_APP_API_URL}/${memberImg}`);
						}
					}
				}
			},
			onError: (err) => {
				console.error('GetBoardArticle Query Error:', err);
				sweetErrorHandling(err).then();
			},
		}
	);

	// Extract board article from query response
	const boardArticle: BoardArticle | undefined = boardArticleData?.getBoardArticle;

	// Get comments query
	const { data: commentsData, loading: commentsLoading, error: commentsError, refetch: refetchComments } = useQuery(
		GET_COMMENTS,
		{
			variables: {
				input: commentInquiry,
			},
			skip: !articleId,
			fetchPolicy: 'network-only',
			errorPolicy: 'all',
			onCompleted: (data) => {
				console.log('Comments Query Response:', data);
				if (data?.getComments) {
					console.log('Comments List:', data.getComments.list);
					console.log('Comments Total:', data.getComments.metaCounter?.[0]?.total);
				}
			},
			onError: (err) => {
				console.error('GetComments Query Error:', err);
				sweetErrorHandling(err).then();
			},
		}
	);

	// Extract comments and total from query response
	const comments: Comment[] = commentsData?.getComments?.list || [];
	const total: number = commentsData?.getComments?.metaCounter?.[0]?.total || 0;

	// Create comment mutation
	const [createComment, { loading: createCommentLoading }] = useMutation(CREATE_COMMENT, {
		onCompleted: (data) => {
			console.log('Create Comment Response:', data);
			if (data?.createComment) {
				sweetTopSmallSuccessAlert('Comment created successfully!', 700).then();
				setComment('');
				setWordsCnt(0);
				// Refetch comments
				refetchComments();
				// Refetch article to update comment count
				refetch();
			}
		},
		onError: (err) => {
			console.error('CreateComment Mutation Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	// Update comment mutation
	const [updateComment, { loading: updateCommentLoading }] = useMutation(UPDATE_COMMENT, {
		onCompleted: (data) => {
			console.log('Update Comment Response:', data);
			if (data?.updateComment) {
				sweetTopSmallSuccessAlert('Comment updated successfully!', 700).then();
				setOpenBackdrop(false);
				setUpdatedComment('');
				setUpdatedCommentWordsCnt(0);
				setUpdatedCommentId('');
				// Refetch comments
				refetchComments();
			}
		},
		onError: (err) => {
			console.error('UpdateComment Mutation Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (articleId) {
			setCommentInquiry({
				...commentInquiry,
				search: {
					commentRefId: articleId,
				},
			});
		}
	}, [articleId]);

	/** HANDLERS **/
	const tabChangeHandler = (event: React.SyntheticEvent, value: string) => {
		router.replace(
			{
				pathname: '/community',
				query: { articleCategory: value },
			},
			'/community',
			{ shallow: true },
		);
	};

	const creteCommentHandler = async () => {
		if (!user?._id) {
			sweetTopSmallSuccessAlert('Please login to leave a comment', 700).then();
			return;
		}

		if (!comment.trim()) {
			sweetTopSmallSuccessAlert('Please enter a comment', 700).then();
			return;
		}

		if (!articleId) {
			sweetTopSmallSuccessAlert('Article ID is missing', 700).then();
			return;
		}

		try {
			await createComment({
				variables: {
					input: {
						commentGroup: CommentGroup.ARTICLE,
						commentContent: comment.trim(),
						commentRefId: articleId,
					},
				},
			});
		} catch (err: any) {
			console.error('Error creating comment:', err);
			// Error handled by onError callback
		}
	};

	const updateButtonHandler = async (commentId: string, commentStatus?: CommentStatus.DELETE) => {
		if (commentStatus === CommentStatus.DELETE) {
			// Delete comment - update with DELETE status
			if (!commentId) {
				sweetTopSmallSuccessAlert('Comment ID is missing', 700).then();
				return;
			}

			try {
				await updateComment({
					variables: {
						input: {
							_id: commentId,
							commentStatus: CommentStatus.DELETE,
						} as CommentUpdate,
					},
				});
			} catch (err: any) {
				console.error('Error deleting comment:', err);
				// Error handled by onError callback
			}
			return;
		}

		// Update comment content
		if (!updatedComment.trim()) {
			sweetTopSmallSuccessAlert('Please enter a comment', 700).then();
			return;
		}

		if (!commentId) {
			sweetTopSmallSuccessAlert('Comment ID is missing', 700).then();
			return;
		}

		try {
			await updateComment({
				variables: {
					input: {
						_id: commentId,
						commentContent: updatedComment.trim(),
					} as CommentUpdate,
				},
			});
		} catch (err: any) {
			console.error('Error updating comment:', err);
			// Error handled by onError callback
		}
	};

	const getCommentMemberImage = (imageUrl: string | undefined) => {
		if (imageUrl) return `${process.env.REACT_APP_API_URL}/${imageUrl}`;
		else return '/img/community/articleImg.png';
	};

	const goMemberPage = (id: any) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	const cancelButtonHandler = () => {
		setOpenBackdrop(false);
		setUpdatedComment('');
		setUpdatedCommentWordsCnt(0);
	};

	const updateCommentInputHandler = (value: string) => {
		if (value.length > 100) return;
		setUpdatedCommentWordsCnt(value.length);
		setUpdatedComment(value);
	};

	const paginationHandler = (e: T, value: number) => {
		setCommentInquiry({ ...commentInquiry, page: value });
	};

	if (device === 'mobile') {
		return <div>COMMUNITY DETAIL PAGE MOBILE</div>;
	} else {
		return (
			<div id="community-detail-page">
				<div className="container">
					<Stack className="main-box">
						<Stack className="left-config">
							<Stack className={'image-info'}>
								<img src={'/img/logo/logoText.svg'} />
								<Stack className={'community-name'}>
									<Typography className={'name'}>Community Board Article</Typography>
								</Stack>
							</Stack>
							<Tabs
								orientation="vertical"
								aria-label="lab API tabs example"
								TabIndicatorProps={{
									style: { display: 'none' },
								}}
								onChange={tabChangeHandler}
								value={articleCategory}
							>
								<Tab
									value={'FREE'}
									label={'Free Board'}
									className={`tab-button ${articleCategory === 'FREE' ? 'active' : ''}`}
								/>
								<Tab
									value={'RECOMMEND'}
									label={'Recommendation'}
									className={`tab-button ${articleCategory === 'RECOMMEND' ? 'active' : ''}`}
								/>
								<Tab
									value={'NEWS'}
									label={'News'}
									className={`tab-button ${articleCategory === 'NEWS' ? 'active' : ''}`}
								/>
								<Tab
									value={'HUMOR'}
									label={'Humor'}
									className={`tab-button ${articleCategory === 'HUMOR' ? 'active' : ''}`}
								/>
							</Tabs>
						</Stack>
						<div className="community-detail-config">
								<Stack className="title-box">
								<Stack className="left">
									<Typography className="title">{(boardArticle?.articleCategory || articleCategory || 'COMMUNITY').toUpperCase()} BOARD</Typography>
									<Typography className="sub-title">
										Express your opinions freely here without content restrictions
									</Typography>
								</Stack>
								<Button
									onClick={() =>
										router.push({
											pathname: '/mypage',
											query: {
												category: 'writeArticle',
											},
										})
									}
									className="right"
								>
									Write
								</Button>
							</Stack>
							<div className="config">
								{boardArticleLoading ? (
									<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
										<CircularProgress sx={{ color: '#8B4513' }} />
										<Typography sx={{ mt: 2, color: '#717171' }}>Loading article...</Typography>
									</Stack>
								) : boardArticleError ? (
									<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
										<Typography color="error">Error loading article: {boardArticleError.message}</Typography>
									</Stack>
								) : !boardArticle ? (
									<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
										<Typography sx={{ color: '#717171' }}>Article not found.</Typography>
									</Stack>
								) : (
									<Stack className="first-box-config">
										<Stack className="content-and-info">
											<Stack className="content">
												<Typography className="content-data">{boardArticle?.articleTitle}</Typography>
												<Stack className="member-info">
													<img
														src={memberImage}
														alt=""
														className="member-img"
														onClick={() => goMemberPage(boardArticle?.memberData?._id)}
													/>
													<Typography className="member-nick" onClick={() => goMemberPage(boardArticle?.memberData?._id)}>
														{boardArticle?.memberData?.memberNick}
													</Typography>
													<Stack className="divider"></Stack>
													<Moment className={'time-added'} format={'DD.MM.YY HH:mm'}>
														{boardArticle?.createdAt}
													</Moment>
												</Stack>
											</Stack>
											<Stack className="info">
												<Stack className="icon-info">
													{boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite ? (
														<ThumbUpAltIcon />
													) : (
														<ThumbUpOffAltIcon />
													)}
													<Typography className="text">{boardArticle?.articleLikes || 0}</Typography>
												</Stack>
												<Stack className="divider"></Stack>
												<Stack className="icon-info">
													<VisibilityIcon />
													<Typography className="text">{boardArticle?.articleViews || 0}</Typography>
												</Stack>
												<Stack className="divider"></Stack>
												<Stack className="icon-info">
													{boardArticle?.articleComments && boardArticle?.articleComments > 0 ? (
														<ChatIcon />
													) : (
														<ChatBubbleOutlineRoundedIcon />
													)}
													<Typography className="text">{boardArticle?.articleComments || 0}</Typography>
												</Stack>
											</Stack>
										</Stack>
										<Stack>
											<ToastViewerComponent markdown={boardArticle?.articleContent} className={'ytb_play'} />
										</Stack>
										<Stack className="like-and-dislike">
											<Stack className="top">
												<Button>
													{boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite ? (
														<ThumbUpAltIcon />
													) : (
														<ThumbUpOffAltIcon />
													)}
													<Typography className="text">{boardArticle?.articleLikes || 0}</Typography>
												</Button>
											</Stack>
										</Stack>
									</Stack>
								)}
								<Stack
									className="second-box-config"
									sx={{ borderBottom: total > 0 ? 'none' : '1px solid #eee', border: '1px solid #eee' }}
								>
									<Typography className="title-text">Comments ({total})</Typography>
									<Stack className="leave-comment">
										<input
											type="text"
											placeholder={user?._id ? "Leave a comment" : "Please login to leave a comment"}
											value={comment}
											onChange={(e) => {
												if (e.target.value.length > 100) return;
												setWordsCnt(e.target.value.length);
												setComment(e.target.value);
											}}
											disabled={!user?._id || createCommentLoading}
										/>
										<Stack className="button-box">
											<Typography>{wordsCnt}/100</Typography>
											<Button 
												onClick={creteCommentHandler}
												disabled={!user?._id || !comment.trim() || createCommentLoading}
											>
												{createCommentLoading ? 'Posting...' : 'comment'}
											</Button>
										</Stack>
									</Stack>
								</Stack>
								{commentsLoading ? (
									<Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
										<CircularProgress sx={{ color: '#8B4513' }} size={24} />
										<Typography sx={{ mt: 1, color: '#717171', fontSize: '14px' }}>Loading comments...</Typography>
									</Stack>
								) : commentsError ? (
									<Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
										<Typography color="error" sx={{ fontSize: '14px' }}>Error loading comments: {commentsError.message}</Typography>
									</Stack>
								) : comments.length === 0 ? (
									<Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
										<Typography sx={{ color: '#717171', fontSize: '14px' }}>No comments yet. Be the first to comment!</Typography>
									</Stack>
								) : (
									<>
										{total > 0 && (
											<Stack className="comments">
												<Typography className="comments-title">Comments</Typography>
											</Stack>
										)}
										{comments?.map((commentData, index) => {
									return (
										<Stack className="comments-box" key={commentData?._id}>
											<Stack className="main-comment">
												<Stack className="member-info">
													<Stack
														className="name-date"
														onClick={() => goMemberPage(commentData?.memberData?._id as string)}
													>
														<img src={getCommentMemberImage(commentData?.memberData?.memberImage)} alt="" />
														<Stack className="name-date-column">
															<Typography className="name">{commentData?.memberData?.memberNick}</Typography>
															<Typography className="date">
																<Moment className={'time-added'} format={'DD.MM.YY HH:mm'}>
																	{commentData?.createdAt}
																</Moment>
															</Typography>
														</Stack>
													</Stack>
													{commentData?.memberId === user?._id && (
														<Stack className="buttons">
															<IconButton
																onClick={() => {
																	setUpdatedCommentId(commentData?._id);
																	updateButtonHandler(commentData?._id, CommentStatus.DELETE);
																}}
															>
																<DeleteForeverIcon sx={{ color: '#757575', cursor: 'pointer' }} />
															</IconButton>
															<IconButton
																onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
																	e.stopPropagation();
																	setUpdatedComment(commentData?.commentContent);
																	setUpdatedCommentWordsCnt(commentData?.commentContent?.length);
																	setUpdatedCommentId(commentData?._id);
																	setOpenBackdrop(true);
																}}
															>
																<EditIcon sx={{ color: '#757575' }} />
															</IconButton>
															<Backdrop
																sx={{
																	top: '40%',
																	right: '25%',
																	left: '25%',
																	width: '1000px',
																	height: 'fit-content',
																	borderRadius: '10px',
																	color: '#ffffff',
																	zIndex: 999,
																}}
																open={openBackdrop}
															>
																<Stack
																	sx={{
																		width: '100%',
																		height: '100%',
																		background: 'white',
																		border: '1px solid #b9b9b9',
																		padding: '15px',
																		gap: '10px',
																		borderRadius: '10px',
																		boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
																	}}
																>
																	<Typography variant="h4" color={'#b9b9b9'}>
																		Update comment
																	</Typography>
																	<Stack gap={'20px'}>
																		<input
																			autoFocus
																			value={updatedComment}
																			onChange={(e) => updateCommentInputHandler(e.target.value)}
																			type="text"
																			style={{
																				border: '1px solid #b9b9b9',
																				outline: 'none',
																				height: '40px',
																				padding: '0px 10px',
																				borderRadius: '5px',
																			}}
																		/>
																		<Stack width={'100%'} flexDirection={'row'} justifyContent={'space-between'}>
																			<Typography variant="subtitle1" color={'#b9b9b9'}>
																				{updatedCommentWordsCnt}/100
																			</Typography>
																			<Stack sx={{ flexDirection: 'row', alignSelf: 'flex-end', gap: '10px' }}>
																				<Button
																					variant="outlined"
																					color="inherit"
																					onClick={() => cancelButtonHandler()}
																				>
																					Cancel
																				</Button>
																				<Button
																					variant="contained"
																					color="inherit"
																					onClick={() => updateButtonHandler(updatedCommentId, undefined)}
																				>
																					Update
																				</Button>
																			</Stack>
																		</Stack>
																	</Stack>
																</Stack>
															</Backdrop>
														</Stack>
													)}
												</Stack>
												<Stack className="content">
													<Typography>{commentData?.commentContent}</Typography>
												</Stack>
											</Stack>
										</Stack>
									);
								})}
									</>
								)}
								{total > 0 && (
									<Stack className="pagination-box">
										<Pagination
											count={Math.ceil(total / commentInquiry.limit) || 1}
											page={commentInquiry.page}
											shape="circular"
											color="primary"
											onChange={paginationHandler}
										/>
									</Stack>
								)}
							</div>
						</div>
					</Stack>
				</div>
			</div>
		);
	}
};
CommunityDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: { commentRefId: '' },
	},
};

export default withLayoutBasic(CommunityDetail);
