import React, { useState, useEffect, useRef } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SearchIcon from '@mui/icons-material/Search';
import { Product } from '../../types/product/property';
import Link from 'next/link';
import { formatterStr } from '../../utils';
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
	const pendingLikeRef = useRef<boolean | null>(null);

	// Backend-driven like state (USER ↔ PRODUCT relationship)
	const [isLiked, setIsLiked] = useState<boolean>(() => {
		return myFavorites ? true : !!property?.meLiked?.[0]?.myFavorite;
	  });
	  
	  const [likesCount, setLikesCount] = useState<number>(
		property?.productLikes || 0
	  );
	// Update isLiked state when property changes
	useEffect(() => {
		setIsLiked(myFavorites ? true : !!property?.meLiked?.[0]?.myFavorite);
		setLikesCount(property?.productLikes ?? 0);
	  }, [property?._id]); // ❗ FAQQAT ID
	// Like Product Mutation
	const [likeTargetProduct, { loading: likeLoading }] = useMutation(LIKE_TARGET_PRODUCT, {
		onCompleted: (data) => {
			if (data?.likeTargetProduct) {
				const updated = data.likeTargetProduct;
				const serverLiked = updated?.meLiked?.[0]?.myFavorite;
				const serverLikes = updated?.productLikes;

				// Instagram-like rule:
				// If backend returns a stale liked-state (can happen with race/caching),
				// don't overwrite the user's current UI decision.
				if (typeof serverLiked === 'boolean') {
					if (pendingLikeRef.current === null || serverLiked === pendingLikeRef.current) {
						setIsLiked(serverLiked);
					}
				}

				if (typeof serverLikes === 'number') {
					setLikesCount(serverLikes);
				}

				const newLikedState = pendingLikeRef.current ?? isLiked;
				pendingLikeRef.current = null;
				const message = newLikedState ? 'Product liked successfully!' : 'Product unliked successfully!';
				sweetTopSuccessAlert(message, 700).then();
			}
		},
		onError: (err) => {
			pendingLikeRef.current = null;
			sweetErrorHandling(err).then();
		},
	});

	// Handle like button click
	const handleLikeClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.stopPropagation();
	  
		if (!user?._id) {
		  sweetTopSuccessAlert('Please login first', 700);
		  return;
		}
	  
		// 🔥 OPTIMISTIC UI
		const prevLiked = isLiked;
		const prevLikes = likesCount;
	  
		const nextLiked = !prevLiked;
		pendingLikeRef.current = nextLiked;
	  
		setIsLiked(nextLiked);
		setLikesCount(nextLiked ? prevLikes + 1 : Math.max(0, prevLikes - 1));
	  
		try {
		  await likeTargetProduct({
			variables: { input: property._id },
		  });
		} catch (err) {
		  // ❌ ERROR → ROLLBACK
		  pendingLikeRef.current = null;
		  setIsLiked(prevLiked);
		  setLikesCount(prevLikes);
		  sweetErrorHandling(err);
		}
	  };
	const placeholderImage = 'https://via.placeholder.com/400x300?text=No+Image';

	// Build image URL: /uploads/* proxied to backend via next.config rewrites
	const buildImageUrl = (imgPath: string): string => {
		if (!imgPath || imgPath.trim() === '') return placeholderImage;
		if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
		if (imgPath.startsWith('/img/')) return imgPath;
		const cleanPath = imgPath.replace(/^\/+/, '');
		return cleanPath ? `/${cleanPath}` : placeholderImage;
	};

	const getImagePath = (): string => {
		if (property?.productImages && property.productImages.length > 0) {
			return buildImageUrl(property.productImages[0]);
		}
		return placeholderImage;
	};

	const [imgError, setImgError] = useState(false);
	const imagePath: string = imgError ? placeholderImage : getImagePath();

	useEffect(() => {
		setImgError(false);
	}, [property?._id]);

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
						<img src={imagePath} alt={property?.productTitle || 'Product'} onError={() => setImgError(true)} />
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
