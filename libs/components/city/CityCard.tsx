import React, { useState } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SearchIcon from '@mui/icons-material/Search';
import { Property } from '../../types/property/property';
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
					{/* Sale Badge */}
					
					{/* Save Percent Badge */}
					{isOnSale && salePercent > 0 && (
						<Box style={{background:  "#8B4513"}} component={'div'} className={'save-badge'}>
							<Typography >Save {salePercent}%</Typography>
						</Box>
					)}
					{/* Sold Out Badge - check if city is sold/not available */}
					{city?.propertyStatus === 'SOLD' && (
						<Box component={'div'} className={'sold-out-badge'}>
							<Typography>Sold Out</Typography>
						</Box>
					)}
					{/* Hover Action Icons */}
					{isHovered && (
						<Box component={'div'} className={'hover-actions'}>
							<Box component={'div'} className={'view-action'}>
								<IconButton
									className={'action-btn'}
									onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
										e.preventDefault();
										// View handler - navigate to detail page
										if (city?._id) {
											window.location.href = `/city/detail?id=${city._id}`;
										}
									}}
								>
									<RemoveRedEyeIcon />
								</IconButton>
								<Typography className={'view-count'}>{city?.propertyViews || 0}</Typography>
							</Box>
							<IconButton
								className={'action-btn'}
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
									e.preventDefault();
									if (likeCityHandler && city?._id) {
										likeCityHandler(user, city._id);
									}
								}}
							>
								{myFavorites ? (
									<FavoriteIcon />
								) : city?.meLiked && city?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon />
								) : (
									<FavoriteBorderIcon />
								)}
							</IconButton>
							<IconButton
								className={'action-btn'}
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
									e.preventDefault();
									// Quick view handler - can navigate to detail page
									if (city?._id) {
										window.location.href = `/city/detail?id=${city._id}`;
									}
								}}
							>
								<SearchIcon />
							</IconButton>
						</Box>
					)}
					{city && city?.propertyRank > 3 && (
						<Box  component={'div'} className={'top-badge'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<Typography>TOP</Typography>
						</Box>
					)}
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
						
						</Stack>
					</Stack>
					<Stack className="price-section">
						<Stack className="price-row">
							<Typography className={isOnSale ? 'current-price' : 'price'}>
								${formatterStr(displayPrice)}
							</Typography>
							{isOnSale && (
								<Typography className="old-price">${formatterStr(city?.propertyPrice)}</Typography>
							)}
						</Stack>
					</Stack>
					<Stack className="options">
						
						
						
					</Stack>
					<Stack className="divider"></Stack>
					<Stack className="type-buttons">
						<Stack className="type">
						
							
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default CityCard;

