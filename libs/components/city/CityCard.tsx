import React, { useState } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SearchIcon from '@mui/icons-material/Search';
import { Location } from '../../types/location/location';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

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
							onClick={(e: React.MouseEvent<HTMLDivElement>) => {
								e.preventDefault();
								setIsLiked(!isLiked);
								if (likeCityHandler && city?._id) {
									likeCityHandler(user, city._id);
								}
							}}
							sx={{ cursor: 'pointer' }}
						>
							{isLiked ? (
								<FavoriteIcon className={'spec-icon liked'} />
							) : (
								<FavoriteBorderIcon className={'spec-icon'} />
							)}
							<Typography className={'spec-text'}>{city?.locationLikes || 0}</Typography>
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

