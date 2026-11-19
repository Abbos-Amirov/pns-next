import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography } from '@mui/material';
import { BoardArticle } from '../../types/board-article/board-article';
import Moment from 'react-moment';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar, useMutation } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface CommunityCardProps {
	boardArticle: BoardArticle;
	size?: string;
	onLikeUpdate?: (articleId: string, updatedArticle: BoardArticle) => void;
}

const CommunityCard = (props: CommunityCardProps) => {
	const { boardArticle, size = 'normal', onLikeUpdate } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [isLiked, setIsLiked] = useState<boolean>(false);
	const [likesCount, setLikesCount] = useState<number>(boardArticle?.articleLikes || 0);
	const pendingLikeRef = useRef<boolean | null>(null);

	// Initialize like state from boardArticle ONLY when switching to a different article.
	// This prevents stale parent props from resetting the optimistic UI after a re-render.
	useEffect(() => {
		setIsLiked(!!boardArticle?.meLiked?.[0]?.myFavorite);
		setLikesCount(boardArticle?.articleLikes ?? 0);
		pendingLikeRef.current = null;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [boardArticle?._id]);

	/** APOLLO MUTATIONS **/
	const [likeTargetBoardArticle, { loading: likeLoading }] = useMutation(LIKE_TARGET_BOARD_ARTICLE, {
		onCompleted: (data) => {
			if (data?.likeTargetBoardArticle) {
				const updatedArticle = data.likeTargetBoardArticle;
				const serverLiked = !!updatedArticle?.meLiked?.[0]?.myFavorite;
				const serverLikes = updatedArticle?.articleLikes ?? 0;

				// Instagram-like guard:
				// If backend returns stale liked-state, do NOT overwrite user's optimistic UI.
				// We'll keep UI state and still sync count; next query/refetch will reconcile.
				if (pendingLikeRef.current === null || serverLiked === pendingLikeRef.current) {
					setIsLiked(serverLiked);
					pendingLikeRef.current = null;
				}

				setLikesCount(serverLikes);
				
				// Notify parent component if callback provided
				if (onLikeUpdate) {
					onLikeUpdate(boardArticle._id, updatedArticle);
				}
				
				const message = serverLiked ? 'Article liked successfully!' : 'Article unliked successfully!';
				sweetTopSmallSuccessAlert(message, 700).then();
			}
		},
		onError: (err) => {
			console.error('LIKE_TARGET_BOARD_ARTICLE Mutation Error:', err);
			sweetErrorHandling(err).then();
			
			// Revert optimistic update on error
			pendingLikeRef.current = null;
			setIsLiked(!!boardArticle?.meLiked?.[0]?.myFavorite);
			setLikesCount(boardArticle?.articleLikes ?? 0);
		},
	});
	
	// Get image path - handle different formats
	const getImagePath = (): string => {
		if (!boardArticle?.articleImage) {
			return '/img/community/communityImg.png';
		}
		
		const articleImage = boardArticle.articleImage;
		
		// If image path starts with http:// or https://, it's already a full URL
		if (articleImage.startsWith('http://') || articleImage.startsWith('https://')) {
			return articleImage;
		}
		
		// If image path starts with /img/, use it directly (public folder)
		if (articleImage.startsWith('/img/')) {
			return articleImage;
		}
		
		// Otherwise, prepend API URL
		return `${REACT_APP_API_URL}/${articleImage}`;
	};
	
	const imagePath: string = getImagePath();

	/** HANDLERS **/
	const chooseArticleHandler = (e: React.SyntheticEvent, boardArticle: BoardArticle) => {
		router.push(
			{
				pathname: '/community/detail',
				query: { articleCategory: boardArticle?.articleCategory, id: boardArticle?._id },
			},
			undefined,
			{ shallow: true },
		);
	};

	const goMemberPage = (id: string) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	const likeArticleHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		
		if (!user?._id) {
			sweetTopSmallSuccessAlert('Please login to like articles', 700).then();
			return;
		}

		if (!boardArticle?._id) {
			sweetTopSmallSuccessAlert('Article ID is missing', 700).then();
			return;
		}

		// Optimistic update (Instagram-like)
		const prevLiked = isLiked;
		const prevLikes = likesCount;
		const nextLiked = !prevLiked;
		pendingLikeRef.current = nextLiked;
		setIsLiked(nextLiked);
		setLikesCount(nextLiked ? prevLikes + 1 : Math.max(0, prevLikes - 1));

		try {
			await likeTargetBoardArticle({
				variables: {
					input: boardArticle._id,
				},
			});
			// onCompleted callback will handle the response
		} catch (err: any) {
			console.error('Error liking article:', err);
			// Revert optimistic update on error
			pendingLikeRef.current = null;
			setIsLiked(prevLiked);
			setLikesCount(prevLikes);
			sweetErrorHandling(err).then();
		}
	};

	if (device === 'mobile') {
		return (
			<Stack className="mobile-community-card" onClick={(e: any) => chooseArticleHandler(e, boardArticle)}>
				<div className="mobile-community-card-img" style={{ backgroundImage: `url(${imagePath})` }}>
					<span className="mobile-community-card-date">
						<Moment format={'MMM'}>{boardArticle?.createdAt}</Moment>
						<b>
							<Moment format={'DD'}>{boardArticle?.createdAt}</Moment>
						</b>
					</span>
				</div>
				<Stack className="mobile-community-card-body">
					<Typography className="mobile-community-card-title">{boardArticle?.articleTitle}</Typography>
					<Stack className="mobile-community-card-meta" direction="row" alignItems="center">
						<Typography
							className="mobile-community-card-author"
							onClick={(e: any) => {
								e.stopPropagation();
								goMemberPage(boardArticle?.memberData?._id as string);
							}}
						>
							{boardArticle?.memberData?.memberNick}
						</Typography>
						<span className="mobile-community-card-dot" />
						<span className="mobile-community-card-stat">
							<RemoveRedEyeIcon />
							{boardArticle?.articleViews || 0}
						</span>
						<IconButton className="mobile-community-card-like" onClick={likeArticleHandler} disabled={likeLoading}>
							{isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
						</IconButton>
						<span className="mobile-community-card-stat">{likesCount}</span>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack
				sx={{ width: size === 'small' ? '285px' : '317px' }}
				className="community-general-card-config"
				onClick={(e:any) => chooseArticleHandler(e, boardArticle)}
			>
				<Stack className="image-box">
					<img src={imagePath} alt="" className="card-img" />
				</Stack>
				<Stack className="desc-box" sx={{ marginTop: '-20px' }}>
					<Stack>
						<Typography
							className="desc"
							onClick={(e:any) => {
								e.stopPropagation();
								goMemberPage(boardArticle?.memberData?._id as string);
							}}
						>
							{boardArticle?.memberData?.memberNick}
						</Typography>
						<Typography className="title">{boardArticle?.articleTitle}</Typography>
					</Stack>
					<Stack className={'buttons'}>
						<IconButton color={'default'}>
							<RemoveRedEyeIcon />
						</IconButton>
						<Typography className="view-cnt">{boardArticle?.articleViews}</Typography>
						<IconButton 
							color={'default'} 
							onClick={likeArticleHandler}
							disabled={likeLoading}
							sx={{
								'&:hover': {
									backgroundColor: 'rgba(139, 69, 19, 0.1)',
								},
							}}
						>
							{isLiked ? (
								<FavoriteIcon sx={{ color: '#eb6753' }} />
							) : (
								<FavoriteBorderIcon />
							)}
						</IconButton>
						<Typography className="view-cnt">{likesCount}</Typography>
					</Stack>
				</Stack>
				<Stack className="date-box">
					<Moment className="month" format={'MMMM'}>
						{boardArticle?.createdAt}
					</Moment>
					<Typography className="day">
						<Moment format={'DD'}>{boardArticle?.createdAt}</Moment>
					</Typography>
				</Stack>
			</Stack>
		);
	}
};

export default CommunityCard;
