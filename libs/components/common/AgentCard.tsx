import React, { useState, useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Box, Typography } from '@mui/material';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface AgentCardProps {
	agent: any;
	likeMemberHandler?: (user: any, id: string) => void;
}

const AgentCard = (props: AgentCardProps) => {
	const { agent, likeMemberHandler } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [isLiked, setIsLiked] = useState<boolean>(false);
	const [likesCount, setLikesCount] = useState<number>(agent?.memberLikes || 0);
	
	const imagePath: string = agent?.memberImage
		? `${REACT_APP_API_URL}/${agent?.memberImage}`
		: '/img/profile/defaultUser.svg';

	// Check if agent is liked
	useEffect(() => {
		const liked = agent?.meLiked && agent?.meLiked[0]?.myFavorite;
		setIsLiked(liked || false);
		
		if (agent?.memberLikes !== undefined) {
			setLikesCount(agent.memberLikes);
		}
	}, [agent?._id, agent?.meLiked, agent?.memberLikes]);

	if (device === 'mobile') {
		return <div>AGENT CARD</div>;
	} else {
		return (
			<Stack className="agent-general-card">
				<Link
					href={{
						pathname: '/agent/detail',
						query: { agentId: agent?._id },
					}}
				>
					<Box
						component={'div'}
						className={'agent-img'}
						style={{
							backgroundImage: `url(${imagePath})`,
							backgroundSize: 'cover',
							backgroundPosition: 'center',
							backgroundRepeat: 'no-repeat',
						}}
					>
						<div>{agent?.memberProperties} properties</div>
					</Box>
				</Link>

				<Stack className={'agent-desc'}>
					<Box component={'div'} className={'agent-info'}>
						<Link
							href={{
								pathname: '/agent/detail',
								query: { agentId: 'id' },
							}}
						>
							<strong>{agent?.memberFullName ?? agent?.memberNick}</strong>
						</Link>
						<span>Agent</span>
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
						<Typography className="view-cnt">{agent?.memberViews || 0}</Typography>
						<IconButton 
							color={'default'} 
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								e.stopPropagation();
								
								if (!user?._id) {
									return;
								}
								
								if (!agent?._id) {
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
									likeMemberHandler(user, agent._id);
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

export default AgentCard;
