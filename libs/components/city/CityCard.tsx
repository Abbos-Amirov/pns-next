import React, { useState, useEffect } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Location } from '../../types/location/location';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar, useMutation } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { LIKE_TARGET_LOCATION } from '../../../apollo/user/mutation';
import { sweetTopSuccessAlert, sweetErrorHandling } from '../../sweetAlert';

interface CityCardType {
	city: Location;
	likeCityHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const CityCard = (props: CityCardType) => {
	const { city, likeCityHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [isHovered, setIsHovered] = useState(false);
	const [isLiked, setIsLiked] = useState(false);
	const [likesCount, setLikesCount] = useState(city?.locationLikes || 0);

	// Initialize isLiked and likesCount from city prop
	useEffect(() => {
		if (myFavorites) {
			setIsLiked(true);
		}
		if (city?.locationLikes !== undefined) {
			setLikesCount(city.locationLikes);
		}
	}, [city?._id, city?.locationLikes, myFavorites]);

	// Like Location Mutation
	const [likeTargetLocation, { loading: likeLoading }] = useMutation(LIKE_TARGET_LOCATION, {
		onCompleted: (data) => {
			if (data?.likeTargetLocation && city?._id) {
				const updatedLocation = data.likeTargetLocation;
				
				// Update likes count from backend response
				if (updatedLocation.locationLikes !== undefined && updatedLocation.locationLikes !== null) {
					setLikesCount(updatedLocation.locationLikes);
				} else {
					// Fallback: increment/decrement manually
					setLikesCount((prev) => {
						const newCount = isLiked ? Math.max(0, prev - 1) : prev + 1;
						return newCount;
					});
				}
				
				const message = !isLiked ? 'Location liked successfully!' : 'Location unliked successfully!';
				sweetTopSuccessAlert(message, 700).then();
			}
		},
		onError: (err) => {
			console.error('LIKE_TARGET_LOCATION Mutation Error:', err);
			sweetErrorHandling(err).then();
			// Revert optimistic update on error
			setIsLiked((prev) => !prev);
			setLikesCount((prev) => (isLiked ? prev + 1 : Math.max(0, prev - 1)));
		},
	});

	// Get image path - use location images or fallback
	const getImagePath = (): string => {
		if (city?.images && city.images.length > 0) {
			const imgPath = city.images[0];
			// If image path starts with http:// or https://, it's already a full URL
			if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
				return imgPath;
			}
			// If image path starts with /img/, use it directly (public folder)
			if (imgPath.startsWith('/img/')) {
				return imgPath;
			}
			// Otherwise, prepend API URL
			return `${REACT_APP_API_URL}/${imgPath}`;
		}
		// Fallback to default image
		return '/img/property/window.jpg';
	};

	const imagePath: string = getImagePath();


	if (device === 'mobile') {
		return <div>CITY CARD</div>;
	} else {
		return (
			<Stack
				className="card-config"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<Stack className="top">
					<Link
						href={{
							pathname: '/city/detail',
							query: { id: city?._id },
						}}
					>
						<img src={imagePath} alt="" />
					</Link>
				</Stack>
				<Stack className="bottom">
					<Stack className="name-address">
						<Stack className="name">
							<Link
								href={{
									pathname: '/city/detail',
									query: { id: city?._id },
								}}
							>
								<Typography>{city.locationName}</Typography>
							</Link>
						</Stack>
						<Stack className="address">
							<Typography>{city?.address || 'Location'}</Typography>
						</Stack>
					</Stack>
					<Stack className="specifications">
						<Stack 
							className="spec-item like-item"
							onClick={async (e: React.MouseEvent<HTMLDivElement>) => {
								e.preventDefault();
								e.stopPropagation();
								
								if (!user?._id) {
									sweetTopSuccessAlert('Please login to like locations', 700).then();
									return;
								}

								if (!city?._id) {
									return;
								}

								// Optimistic update
								const currentLikedState = isLiked;
								setIsLiked(!currentLikedState);
								setLikesCount((prev) => {
									return !currentLikedState ? prev + 1 : Math.max(0, prev - 1);
								});

								try {
									await likeTargetLocation({
										variables: {
											input: city._id,
										},
									});
								} catch (err) {
									// Error handled by onError callback
								}
							}}
							sx={{ cursor: 'pointer' }}
						>
							{isLiked ? (
								<FavoriteIcon className={'spec-icon liked'} />
							) : (
								<FavoriteBorderIcon className={'spec-icon'} />
							)}
							<Typography className={'spec-text'}>{likesCount}</Typography>
						</Stack>
						<Stack className="spec-item">
							<RemoveRedEyeIcon className={'spec-icon'} />
							<Typography className={'spec-text'}>{city?.locationViews || 0}</Typography>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default CityCard;

