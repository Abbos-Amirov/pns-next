import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Property } from '../../types/product/property';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL } from '../../config';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

interface RecentlyVisitedCardType {
	product: Property;
}

const RecentlyVisitedCard = (props: RecentlyVisitedCardType) => {
	const { product } = props;
	const device = useDeviceDetect();

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

	// Get image path - use product image or fallback to hard coded images
	const getImagePath = (): string => {
		if (product?.propertyImages && product.propertyImages.length > 0) {
			const imgPath = product.propertyImages[0];
			// If image path starts with /img/, use it directly (public folder)
			if (imgPath.startsWith('/img/')) {
				return imgPath;
			}
			// Otherwise, prepend API URL
			return `${REACT_APP_API_URL}/${imgPath}`;
		}
		// Use product index or random to select from default images
		const index = product?._id ? parseInt(product._id.slice(-1), 16) % defaultImages.length : 0;
		return defaultImages[index];
	};

	const imagePath: string = getImagePath();
	const displayPrice = product?.propertyPrice || 0;

	if (device === 'mobile') {
		return <div>RECENTLY VISITED CARD MOBILE</div>;
	} else {
		return (
			<Stack className="recently-visited-card">
				<Stack className="top">
					<Link
						href={{
							pathname: '/property/detail',
							query: { id: product?._id },
						}}
					>
						<img src={imagePath} alt={product?.propertyTitle || 'Product'} />
					</Link>
					
					{/* View Count Badge */}
					<Box component={'div'} className={'view-count-badge'}>
						<RemoveRedEyeIcon sx={{ fontSize: 16, mr: 0.5 }} />
						<Typography className={'view-count-text'}>{product?.propertyViews || 0}</Typography>
					</Box>

					{/* TOP Badge */}
					{product && product?.propertyRank > 3 && (
						<Box component={'div'} className={'top-badge'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<Typography>TOP</Typography>
						</Box>
					)}
				</Stack>
				<Stack className="bottom">
					<Stack className="name-section">
						<Link
							href={{
								pathname: '/property/detail',
								query: { id: product?._id },
							}}
						>
							<Typography className="product-title">{product.propertyTitle}</Typography>
						</Link>
					</Stack>
					<Stack className="price-section">
						<Typography className="price">
							${formatterStr(displayPrice)}
						</Typography>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default RecentlyVisitedCard;

