import React, { useState, useEffect } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SearchIcon from '@mui/icons-material/Search';
import { Product } from '../../types/product/property';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar, useMutation } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { sweetTopSuccessAlert, sweetErrorHandling } from '../../sweetAlert';

interface PropertyCardType {
	property: Product;
	likePropertyHandler?: (user: any, productId: string) => void | Promise<void>;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const PropertyCard = (props: PropertyCardType) => {
	const { property, likePropertyHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [isHovered, setIsHovered] = useState(false);

	// Backend-driven like state (USER ↔ PRODUCT relationship)
	const [isLiked, setIsLiked] = useState<boolean>(myFavorites ? true : !!property?.meLiked?.[0]?.myFavorite);
	const [likesCount, setLikesCount] = useState<number>(property?.productLikes || 0);

	// Update isLiked state when property changes
	useEffect(() => {
		setIsLiked(myFavorites ? true : !!property?.meLiked?.[0]?.myFavorite);
		setLikesCount(property?.productLikes ?? 0);
	}, [property?._id, property?.meLiked, property?.productLikes, myFavorites]);

	// Like Product Mutation
	const [likeTargetProduct, { loading: likeLoading }] = useMutation(LIKE_TARGET_PRODUCT, {
		onCompleted: (data) => {
			if (data?.likeTargetProduct) {
				const updated = data.likeTargetProduct;
				const newLikedState = !!updated?.meLiked?.[0]?.myFavorite;
				setIsLiked(newLikedState);
				setLikesCount(updated?.productLikes ?? 0);
				const message = newLikedState ? 'Product liked successfully!' : 'Product unliked successfully!';
				sweetTopSuccessAlert(message, 700).then();
			}
		},
		onError: (err) => {
			sweetErrorHandling(err).then();
		},
	});

	// Handle like button click
	const handleLikeClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.stopPropagation();
		
		if (!user?._id) {
			sweetTopSuccessAlert('Please login to like products', 700).then();
			return;
		}

		if (!property?._id) {
			return;
		}

		// optimistic UI
		const prevLiked = isLiked;
		const prevLikes = likesCount;
		const nextLiked = !prevLiked;
		setIsLiked(nextLiked);
		setLikesCount(nextLiked ? prevLikes + 1 : Math.max(0, prevLikes - 1));

		if (likePropertyHandler) {
			// Use custom handler if provided (parent can update list/cache)
			try {
				await likePropertyHandler(user, property._id);
			} catch (err) {
				setIsLiked(prevLiked);
				setLikesCount(prevLikes);
				sweetErrorHandling(err).then();
			}
		} else {
			// Use mutation directly
			try {
				await likeTargetProduct({
					variables: {
						input: property._id,
					},
				});
			} catch (err) {
				console.error('Error liking product:', err);
				setIsLiked(prevLiked);
				setLikesCount(prevLikes);
				sweetErrorHandling(err).then();
			}
		}
	};

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

	// Get image path - use property image or fallback to hard coded images
	const getImagePath = (): string => {
		// First priority: Use product's own images if available
		if (property?.productImages && property.productImages.length > 0) {
			const imgPath = property.productImages[0];
			if (!imgPath || imgPath.trim() === '') {
				const index = property?._id ? parseInt(property._id.slice(-1), 16) % defaultImages.length : 0;
				return defaultImages[index];
			}
			if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
				return imgPath;
			}
			if (imgPath.startsWith('/img/')) {
				return imgPath;
			}
			return `${REACT_APP_API_URL}/${imgPath}`;
		}
		
		// Fallback: Use default images only if no product images exist
		const index = property?._id ? parseInt(property._id.slice(-1), 16) % defaultImages.length : 0;
		return defaultImages[index];
	};

	const imagePath: string = getImagePath();

	// Sale calculation - check if property has sale (can use propertyRank or other flags)
	// For now, we'll show sale badge for properties with high rank or specific conditions
	const isOnSale = property?.productRank && property.productRank > 4;
	const salePercent = isOnSale ? 16 : 0; // Default sale percent
	const displayPrice = property?.productPrice || 0;


	if (device === 'mobile') {
		return <div>PROPERTY CARD</div>;
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
							pathname: '/property/detail',
							query: { id: property?._id },
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
					{/* Sold Out Badge - check if property is sold/not available */}
					{property?.productStatus === 'OUT_OF_STOCK' && (
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
										if (property?._id) {
											window.location.href = `/property/detail?id=${property._id}`;
										}
									}}
								>
									<RemoveRedEyeIcon />
								</IconButton>
								<Typography className={'view-count'}>{property?.productViews || 0}</Typography>
							</Box>
							<Box component={'div'} className={'like-action'}>
								<IconButton
									className={`action-btn ${isLiked ? 'liked' : ''}`}
									onClick={handleLikeClick}
									disabled={likeLoading}
								>
								{isLiked ? (
									<FavoriteIcon className="favorite-icon-filled" sx={{ color: '#eb6753', fill: '#eb6753' }} />
								) : (
									<FavoriteBorderIcon className="favorite-icon-outline" />
								)}
								</IconButton>
								<Typography className={'like-count'}>{likesCount}</Typography>
							</Box>
							<IconButton
								className={'action-btn'}
								onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
									e.preventDefault();
									// Quick view handler - can navigate to detail page
									if (property?._id) {
										window.location.href = `/property/detail?id=${property._id}`;
									}
								}}
							>
								<SearchIcon />
							</IconButton>
						</Box>
					)}
					{property && property?.productRank > 3 && (
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
									pathname: '/property/detail',
									query: { id: property?._id },
								}}
							>
								<Typography sx={{fontSize:'20px'}}>{property.productTitle}</Typography>
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
								<Typography className="old-price">${formatterStr(property?.productPrice)}</Typography>
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

export default PropertyCard;
