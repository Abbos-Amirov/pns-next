import React, { useState } from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Product } from '../../types/product/property';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface TopPropertyCardProps {
	product: Product;
	likeProductHandler : any
}

const TopPropertyCard = (props: TopPropertyCardProps) => {
	const { product,likeProductHandler  } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [imageError, setImageError] = useState(false);
	const [imageLoading, setImageLoading] = useState(true);

	/** HANDLERS **/
	const goProductDetailPage = async (productId?: string) => {
		if (!productId) return;
		await router.push(`/property/detail?id=${productId}`);
	};

	const getImagePath = (): string => {
		if (!product?.productImages || product.productImages.length === 0) {
			return '';
		}
		const imagePath = product.productImages[0];
		if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
			return imagePath;
		}
		return `${REACT_APP_API_URL}/${imagePath}`;
	};

	const imagePath = getImagePath();
	const handleImageError = () => {
		setImageError(true);
		setImageLoading(false);
	};

	const handleImageLoad = () => {
		setImageLoading(false);
	};

	if (device === 'mobile') {
		return (
			<Stack className="top-card-box">
				<Box
					component={'div'}
					className={'card-img'}
					onClick={() => goProductDetailPage(product?._id)}
				>
					{imageError || !imagePath ? (
						<div className="image-placeholder">
							<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.105 20 20 19.105 20 18V6C20 4.895 19.105 4 18 4H6C4.895 4 4 4.895 4 6V18C4 19.105 4.895 20 6 20Z" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
						</div>
					) : (
						<img
							src={imagePath}
							alt={product?.productTitle || 'Product image'}
							onError={handleImageError}
							onLoad={handleImageLoad}
							loading="lazy"
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								display: imageLoading ? 'none' : 'block',
							}}
						/>
					)}
					{imageLoading && !imageError && imagePath && (
						<div className="image-loading">
							<div className="loading-spinner"></div>
						</div>
					)}
					<div className={'price'}>${product?.productPrice?.toLocaleString() || '0'}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'} onClick={() => goProductDetailPage(product?._id)}>
						{product?.productTitle}
					</strong>
					<p className={'desc'}>{product?.productAddress}</p>
					<div className={'options'}>
						<div>
							<img src="/img/icons/bed.svg" alt="" />
							<span>{product?.productBeds} bed</span>
						</div>
						<div>
							<img src="/img/icons/room.svg" alt="" />
							<span>{product?.productRooms} rooms</span>
						</div>
						<div>
							<img src="/img/icons/expand.svg" alt="" />
							<span>{product?.productSquare} m2</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<div className="left-actions">
							<p>
								{product.productRent ? 'Rent' : ''} {product.productRent && product.productBarter && '/'}{' '}
								{product.productBarter ? 'Barter' : ''}
							</p>
							<button
								type="button"
								className="detail-btn"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									goProductDetailPage(product?._id);
								}}
							>
								VIEW MORE →
							</button>
						</div>
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{product?.productViews}</Typography>
							<IconButton color={'default'} onClick={() => likeProductHandler(user, product?._id)}>
								{product?.meLiked && product?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: 'red' }} />
								) : (
									<FavoriteIcon />
								)}
							</IconButton>
							<Typography className="view-cnt">{product?.productLikes}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	} else {
		return (
			<Stack className="top-card-box">
				<Box
					component={'div'}
					className={'card-img'}
					onClick={() => goProductDetailPage(product?._id)}
				>
					{imageError || !imagePath ? (
						<div className="image-placeholder">
							<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.105 20 20 19.105 20 18V6C20 4.895 19.105 4 18 4H6C4.895 4 4 4.895 4 6V18C4 19.105 4.895 20 6 20Z" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
							</svg>
						</div>
					) : (
						<img
							src={imagePath}
							alt={product?.productTitle || 'Product image'}
							onError={handleImageError}
							onLoad={handleImageLoad}
							loading="lazy"
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								display: imageLoading ? 'none' : 'block',
							}}
						/>
					)}
					{imageLoading && !imageError && imagePath && (
						<div className="image-loading">
							<div className="loading-spinner"></div>
						</div>
					)}
					<div className={'price'}>${product?.productPrice?.toLocaleString() || '0'}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'} onClick={() => goProductDetailPage(product?._id)}>
						{product?.productTitle}
					</strong>
					<p className={'desc'}>{product?.productAddress}</p>
					<div className={'options'}>
						
					
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<div className="left-actions">
							<p>
								{product.productRent ? 'Rent' : ''} {product.productRent && product.productBarter && '/'}{' '}
								{product.productBarter ? 'Barter' : ''}
							</p>
							<button
								type="button"
								className="detail-btn"
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									goProductDetailPage(product?._id);
								}}
							>
								VIEW MORE →
							</button>
						</div>
						
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{product?.productViews}</Typography>
							<IconButton color={'default'} onClick={() => likeProductHandler(user, product._id)}>
								{product?.meLiked && product?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: 'red' }} />
								) : (
									<FavoriteIcon />
								)}
							</IconButton>
							<Typography className="view-cnt">{product?.productLikes}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	}
};

export default TopPropertyCard;
