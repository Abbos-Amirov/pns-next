import React, { useState, useEffect } from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SearchIcon from '@mui/icons-material/Search';
import { Property } from '../../types/product/property';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar, useMutation, useApolloClient } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { sweetTopSuccessAlert, sweetErrorHandling } from '../../sweetAlert';

interface PropertyCardType {
	property: Property;
	likePropertyHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const PropertyCard = (props: PropertyCardType) => {
	const { property, likePropertyHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const apolloClient = useApolloClient();
	const [isHovered, setIsHovered] = useState(false);
	
	// Get liked products from localStorage
	const getLikedProducts = (): string[] => {
		if (typeof window !== 'undefined') {
			const liked = localStorage.getItem('likedProducts');
			return liked ? JSON.parse(liked) : [];
		}
		return [];
	};

	// Check if current product is liked
	const checkIfLiked = (): boolean => {
		if (myFavorites) return true;
		if (property?.meLiked && property?.meLiked[0]?.myFavorite) return true;
		if (typeof window !== 'undefined' && property?._id) {
			const likedProducts = getLikedProducts();
			return likedProducts.includes(property._id);
		}
		return false;
	};

	const [isLiked, setIsLiked] = useState(checkIfLiked());
	const [likesCount, setLikesCount] = useState(property?.propertyLikes || 0);

	// Update isLiked state when property changes
	useEffect(() => {
		if (myFavorites) {
			setIsLiked(true);
		} else if (property?.meLiked && property?.meLiked[0]?.myFavorite) {
			setIsLiked(true);
		} else if (typeof window !== 'undefined' && property?._id) {
			const likedProducts = getLikedProducts();
			setIsLiked(likedProducts.includes(property._id));
		} else {
			setIsLiked(false);
		}
		
		// Update likes count when property changes
		if (property?.propertyLikes !== undefined) {
			setLikesCount(property.propertyLikes);
		}
	}, [property?._id, property?.meLiked, property?.propertyLikes, myFavorites]);

	// Like Product Mutation
	const [likeTargetProduct, { loading: likeLoading }] = useMutation(LIKE_TARGET_PRODUCT, {
		onCompleted: (data) => {
			if (data?.likeTargetProduct && property?._id) {
				// Check current liked state from localStorage
				if (typeof window !== 'undefined') {
					const likedProducts = getLikedProducts();
					const currentlyLiked = likedProducts.includes(property._id);
					const newLikedState = !currentlyLiked;
					
					// Update localStorage
					if (newLikedState) {
						// Add to liked products
						if (!likedProducts.includes(property._id)) {
							likedProducts.push(property._id);
							localStorage.setItem('likedProducts', JSON.stringify(likedProducts));
						}
					} else {
						// Remove from liked products
						const updatedLiked = likedProducts.filter((id: string) => id !== property._id);
						localStorage.setItem('likedProducts', JSON.stringify(updatedLiked));
					}
					
					// Update isLiked state
					setIsLiked(newLikedState);
					
					// Update likes count based on mutation response
					// Backend should return the updated productLikes count
					console.log('Mutation response:', data.likeTargetProduct);
					if (data.likeTargetProduct.productLikes !== undefined && data.likeTargetProduct.productLikes !== null) {
						setLikesCount(data.likeTargetProduct.productLikes);
						console.log('Updated productLikes from backend:', data.likeTargetProduct.productLikes);
					} else {
						// Fallback: increment/decrement manually if backend doesn't return the count
						setLikesCount((prev) => {
							const newCount = newLikedState ? prev + 1 : Math.max(0, prev - 1);
							console.log('Manually updated productLikes:', newCount);
							return newCount;
						});
					}
					
					const message = newLikedState ? 'Product liked successfully!' : 'Product unliked successfully!';
					sweetTopSuccessAlert(message, 700).then();
				}
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
		
		if (!user) {
			sweetTopSuccessAlert('Please login to like products', 700).then();
			return;
		}

		if (!property?._id) {
			return;
		}

		if (likePropertyHandler) {
			// Use custom handler if provided
			likePropertyHandler(user, property._id);
			// Update local state if custom handler is used
			if (typeof window !== 'undefined') {
				const likedProducts = getLikedProducts();
				const currentlyLiked = likedProducts.includes(property._id);
				const newState = !currentlyLiked;
				
				// Update localStorage
				if (newState) {
					if (!likedProducts.includes(property._id)) {
						likedProducts.push(property._id);
						localStorage.setItem('likedProducts', JSON.stringify(likedProducts));
					}
				} else {
					const updatedLiked = likedProducts.filter((id: string) => id !== property._id);
					localStorage.setItem('likedProducts', JSON.stringify(updatedLiked));
				}
				
				setIsLiked(newState);
				setLikesCount((current) => newState ? current + 1 : Math.max(0, current - 1));
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
		if (property?.propertyImages && property.propertyImages.length > 0) {
			const imgPath = property.propertyImages[0];
			
			// If image path is empty or just whitespace, skip to default
			if (!imgPath || imgPath.trim() === '') {
				console.log('Product image path is empty, using default');
				const index = property?._id ? parseInt(property._id.slice(-1), 16) % defaultImages.length : 0;
				return defaultImages[index];
			}
			
			// If image path starts with http:// or https://, use it directly (full URL)
			if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
				console.log('Using full URL image:', imgPath);
				return imgPath;
			}
			
			// If image path starts with /img/, use it directly (public folder)
			if (imgPath.startsWith('/img/')) {
				console.log('Using public folder image:', imgPath);
				return imgPath;
			}
			
			// Otherwise, prepend API URL (backend image path)
			const fullPath = `${REACT_APP_API_URL}/${imgPath}`;
			console.log('Using backend image:', fullPath);
			return fullPath;
		}
		
		// Fallback: Use default images only if no product images exist
		console.log('No product images found, using default');
		const index = property?._id ? parseInt(property._id.slice(-1), 16) % defaultImages.length : 0;
		return defaultImages[index];
	};

	const imagePath: string = getImagePath();

	// Sale calculation - check if property has sale (can use propertyRank or other flags)
	// For now, we'll show sale badge for properties with high rank or specific conditions
	const isOnSale = property?.propertyRank && property.propertyRank > 4;
	const salePercent = isOnSale ? 16 : 0; // Default sale percent
	const displayPrice = property?.propertyPrice || 0;


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
					{property?.propertyStatus === 'SOLD' && (
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
								<Typography className={'view-count'}>{property?.propertyViews || 0}</Typography>
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
					{property && property?.propertyRank > 3 && (
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
								<Typography sx={{fontSize:'20px'}}>{property.propertyTitle}</Typography>
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
								<Typography className="old-price">${formatterStr(property?.propertyPrice)}</Typography>
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
