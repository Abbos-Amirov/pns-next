import React, { useState } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SearchIcon from '@mui/icons-material/Search';
import { Property } from '../../types/product/property';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

interface CityCardType {
	city: Property;
	likeCityHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const CityCard = (props: CityCardType) => {
	const { city, likeCityHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [isHovered, setIsHovered] = useState(false);
	const [isLiked, setIsLiked] = useState(
		myFavorites || (city?.meLiked && city?.meLiked[0]?.myFavorite) || false
	);

	// Hard coded images array for fallback
	const defaultImages = [
		'/img/property/window.jpg',
		'/img/property/window1.jpg',
		'/img/property/window2.jpg',
		'/img/property/windows5.jpg',
		'/img/property/window2.jpg',
		'/img/property/window4.jpg',
		'/img/property/window5.jpg',
		'/img/property/window2.jpg',
		'/img/property/window1.jpg',
		'/img/property/window2.jpg',
	];

	// Get image path - use city image or fallback to hard coded images
	const getImagePath = (): string => {
		if (city?.propertyImages && city.propertyImages.length > 0) {
			const imgPath = city.propertyImages[0];
			// If image path starts with /img/, use it directly (public folder)
			if (imgPath.startsWith('/img/')) {
				return imgPath;
			}
			// Otherwise, prepend API URL
			return `${REACT_APP_API_URL}/${imgPath}`;
		}
		// Use city index or random to select from default images
		const index = city?._id ? parseInt(city._id.slice(-1), 16) % defaultImages.length : 0;
		return defaultImages[index];
	};

	const imagePath: string = getImagePath();

	// Sale calculation - check if city has sale (can use propertyRank or other flags)
	// For now, we'll show sale badge for cities with high rank or specific conditions
	const isOnSale = city?.propertyRank && city.propertyRank > 4;
	const salePercent = isOnSale ? 16 : 0; // Default sale percent
	const displayPrice = city?.propertyPrice || 0;


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
					{/* Price Badge - Yellow circular badge */}
					<Box component={'div'} className={'price-badge'}>
						<Typography component={'span'} className={'price-amount'}>{formatterStr(displayPrice)}</Typography>
						<Typography component={'span'} className={'price-period'}>WORKS</Typography>
					</Box>
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
								<Typography>{city.propertyTitle}</Typography>
							</Link>
						</Stack>
						<Stack className="address">
							<Typography>{city?.propertyLocation || city?.propertyAddress || 'Location'}</Typography>
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
							<Typography className={'spec-text'}>{city?.propertyLikes || 0}</Typography>
						</Stack>
						<Stack className="spec-item">
							<RemoveRedEyeIcon className={'spec-icon'} />
							<Typography className={'spec-text'}>{city?.propertyViews || 0}</Typography>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default CityCard;

