import React, { useState, useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar, useMutation } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { LIKE_TARGET_MEMBER } from '../../../apollo/user/mutation';
import { sweetTopSuccessAlert, sweetErrorHandling } from '../../sweetAlert';

interface InstallerCardProps {
	installer: any;
	likeMemberHandler?: (user: any, id: string) => void;
}

const InstallerCard = (props: InstallerCardProps) => {
	const { installer, likeMemberHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [isLiked, setIsLiked] = useState<boolean>(false);
	const [likesCount, setLikesCount] = useState<number>(installer?.memberLikes || 0);
	
	const imagePath: string = installer?.memberImage
		? `${REACT_APP_API_URL}/${installer?.memberImage}`
		: '/img/profile/defaultUser.svg';

	// Check if installer is liked
	useEffect(() => {
		const liked = installer?.meLiked && installer?.meLiked[0]?.myFavorite;
		setIsLiked(liked || false);
		
		if (installer?.memberLikes !== undefined) {
			setLikesCount(installer.memberLikes);
		}
	}, [installer?._id, installer?.meLiked, installer?.memberLikes]);

	if (device === 'mobile') {
		return <div>INSTALLER CARD</div>;
	} else {
		return (
			<Stack className="agent-general-card">
				<Link
					href={{
						pathname: '/installer/detail',
						query: { installerId: installer?._id },
					}}
				>
					<Box
						component={'div'}
						className={'agent-img'}
					>
						<img 
							src={imagePath} 
							alt={installer?.memberFullName || installer?.memberNick || 'Installer'} 
							className="agent-image"
							onError={(e) => {
								(e.target as HTMLImageElement).src = '/img/profile/defaultUser.svg';
							}}
						/>
						{installer?.memberProducts && (
							<Box component={'div'} className={'agent-badge'}>
								<Typography>{installer.memberProducts} INSTALLER</Typography>
							</Box>
						)}
						<Box component={'div'} className={'agent-overlay'}></Box>
					</Box>
				</Link>

				<Stack className={'agent-desc'}>
					<Box component={'div'} className={'agent-info'}>
						<Link
							href={{
								pathname: '/installer/detail',
								query: { installerId: installer?._id },
							}}
						>
							<strong>{installer?.memberFullName ?? installer?.memberNick}</strong>
						</Link>
						<span>INSTALLER</span>
					</Box>
					<Box component={'div'} className={'buttons'}>
						<IconButton 
							color={'default'}
							sx={{ 
								'&:hover': { 
									backgroundColor: 'transparent' 
								},
								padding: '4px'
							}}
						>
							<RemoveRedEyeIcon 
								sx={{ 
									color: '#8B4513',
									fontSize: '20px'
								}} 
							/>
						</IconButton>
						<Typography className="view-cnt">{installer?.memberViews || 0}</Typography>
						<IconButton 
							color={'default'} 
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								e.stopPropagation();
								
								if (!user?._id) {
									return;
								}
								
								if (!installer?._id) {
									return;
								}

								// Optimistically update UI immediately
								const currentLikedState = isLiked;
								const newLikedState = !currentLikedState;
								
								// Update state immediately for instant UI feedback
								setIsLiked(newLikedState);
								
								// Update likes count optimistically
								setLikesCount((prev) => {
									return newLikedState ? prev + 1 : Math.max(0, prev - 1);
								});

								// Call the handler (it will handle backend update)
								if (likeMemberHandler) {
									likeMemberHandler(user, installer._id);
								}
							}}
							sx={{ 
								'&:hover': { 
									backgroundColor: 'transparent' 
								},
								padding: '4px'
							}}
						>
							{isLiked ? (
								<FavoriteIcon 
									sx={{ 
										color: '#eb6753',
										fill: '#eb6753',
										fontSize: '20px'
									}} 
									className="favorite-icon-filled"
								/>
							) : (
								<FavoriteBorderIcon 
									sx={{ 
										color: '#8B4513',
										fontSize: '20px'
									}}
									className="favorite-icon-outline"
								/>
							)}
						</IconButton>
						<Typography className="view-cnt">{likesCount}</Typography>
					</Box>
				</Stack>
			</Stack>
		);
	}
};

export default InstallerCard;
