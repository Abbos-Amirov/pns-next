import React, { useState, useEffect, useMemo } from 'react';
import { Stack, Box, Button, CircularProgress } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import type { Swiper as SwiperType } from 'swiper';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { ProductsInquiry } from '../../types/product/products.input';
import { REACT_APP_API_URL } from '../../config';
import { Direction } from '../../enums/common.enum';
import { ProductStatus } from '../../enums/property.enum';

interface PopularProductsProps {
	initialInput?: ProductsInquiry;
}

const PopularProducts = (props: PopularProductsProps) => {
	const device = useDeviceDetect();
	const [activeIndex, setActiveIndex] = useState<number>(2); // Dastlabki markazdagi slide (2-chi, 1-based = 2)

	// Default input for query
	const defaultInput: ProductsInquiry = {
		page: 1,
		limit: 100,
		sort: 'productLikes',
		direction: Direction.DESC,
		search: {},
	};

	const initialInput = props.initialInput || defaultInput;

	// Fetch products from backend
	const { data, loading, error } = useQuery(GET_PRODUCTS, {
		variables: {
			input: initialInput,
		},
		fetchPolicy: 'network-only',
	});

	// Transform backend data to component format and filter by productLikes >= 1 and ACTIVE status
	const products = useMemo(() => {
		if (!data?.getProducts?.list) {
			console.log('PopularProducts: No data from backend');
			return [];
		}

		console.log('PopularProducts: Raw data from backend', data.getProducts.list);
		console.log('PopularProducts: Total products before filter', data.getProducts.list.length);

		const allProducts = data.getProducts.list
			.filter((product: any) => {
				// Faqat ACTIVE status'li va like'lari 1 yoki undan ko'p bo'lganlar
				const isActive = product.productStatus === ProductStatus.ACTIVE;
				const hasLikes = product.productLikes >= 1;
				const shouldInclude = isActive && hasLikes;
				
				if (!shouldInclude) {
					console.log('PopularProducts: Filtered out product', {
						id: product._id,
						title: product.productTitle,
						status: product.productStatus,
						likes: product.productLikes,
						reason: !isActive ? 'Not ACTIVE' : 'Likes < 1'
					});
				}
				
				return shouldInclude;
			})
			.map((product: any) => {
				// Get first image from productImages array
				const firstImage = product.productImages && product.productImages.length > 0 
					? product.productImages[0] 
					: null;
				
				// Construct image URL
				let imageUrl = '';
				if (firstImage) {
					if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
						imageUrl = firstImage;
					} else if (firstImage.startsWith('/')) {
						imageUrl = `${REACT_APP_API_URL}${firstImage}`;
					} else {
						imageUrl = `${REACT_APP_API_URL}/${firstImage}`;
					}
				}

				return {
					id: product._id,
					title: product.productTitle || 'Untitled Product',
					description: product.productDesc || 'Creative ipsum dolor sit amet consec creativity and functionality to.',
					image: imageUrl || 'https://via.placeholder.com/400x300?text=No+Image',
					productLikes: product.productLikes || 1,
				};
			});

		console.log('PopularProducts: Filtered products count', allProducts.length);
		console.log('PopularProducts: Final products', allProducts);

		return allProducts;
	}, [data]);


	// Loading state
	if (loading) {
		return (
			<Stack className={'popular-products'}>
				<Stack className={'container'}>
					<Stack className={'heading-section'}>
						<h2 className={'main-heading'}>
							Unique Design <span className={'highlight'}>Windows & Door</span>
						</h2>
					</Stack>
					<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
						<CircularProgress />
					</Stack>
				</Stack>
			</Stack>
		);
	}

	// Error state or no products
	if (error || products.length === 0) {
		return (
			<Stack className={'popular-products'}>
				<Stack className={'container'}>
					<Stack className={'heading-section'}>
						<h2 className={'main-heading'}>
							Unique Design <span className={'highlight'}>Windows & Door</span>
						</h2>
					</Stack>
					<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
						<p>No popular products found</p>
					</Stack>
				</Stack>
			</Stack>
		);
	}

	if (device === 'mobile') {
		return (
			<Stack className={'popular-products'}>
				<Stack className={'container'}>
					{/* Main Heading */}
					<Stack className={'heading-section'}>
						<h2 className={'main-heading'}>
							Unique Design <span className={'highlight'}>Windows</span>
						</h2>
					</Stack>

					{/* Products Cards */}
					<Stack className={'products-container'}>
						<WestIcon className={'nav-arrow nav-prev'} />
						<Stack className={'products-cards'}>
							{products.map((product: any) => (
								<Box key={product.id} component={'div'} className={`product-card ${product.featured ? 'featured' : ''}`}>
									<Box component={'div'} className={'card-image'} style={{ backgroundImage: `url(${product.image})` }}></Box>
									<Box component={'div'} className={'card-content'}>
										<h3 className={'card-title'}>{product.title}</h3>
										<p className={'card-description'}>{product.description}</p>
										{product.featured && (
											<Button className={'view-more-btn'}>VIEW MORE →</Button>
										)}
									</Box>
								</Box>
							))}
						</Stack>
						<EastIcon className={'nav-arrow nav-next'} />
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'popular-products'}>
				<Stack className={'container'}>
					{/* Main Heading */}
					<Stack className={'heading-section'}>
						<h2 className={'main-heading'}>
							Unique Design <span className={'highlight'}>Windows & Door</span>
						</h2>
					</Stack>

					{/* Products Cards */}
					<Stack className={'products-container'}>
						<WestIcon className={'nav-arrow nav-prev swiper-products-prev'} />
						<Swiper
							className={'products-swiper'}
							slidesPerView={3}
							spaceBetween={30}
							modules={[Navigation]}
							navigation={{
								nextEl: '.swiper-products-next',
								prevEl: '.swiper-products-prev',
							}}
							loop={products.length > 3}
							centeredSlides={true}
							onSlideChange={(swiper: SwiperType) => {
								// Markazdagi slide index'ini aniqlash
								// slidesPerView=3 bo'lsa, markazdagi slide har doim activeIndex + 1 (chunki 3 ta ko'rinadi, markazdagi 2-chi)
								// realIndex loop bo'lsa to'g'ri index'ni beradi
								const realIdx = swiper.realIndex !== undefined ? swiper.realIndex : swiper.activeIndex;
								// slidesPerView=3 bo'lsa, markazdagi slide har doim activeIndex + 1 (1-based)
								// activeIndex 0-based, demak markazdagi slide = activeIndex + 1 (1-based)
								// Lekin biz markazdagi slide'ni aniqlashimiz kerak, demak activeIndex + 1
								const centerIndex = realIdx + 2;
								setActiveIndex(centerIndex);
							}}
							onInit={(swiper: SwiperType) => {
								// Dastlabki markazdagi slide
								const realIdx = swiper.realIndex !== undefined ? swiper.realIndex : swiper.activeIndex;
								// Dastlabki holatda activeIndex = 0, demak markazdagi slide = 1 (1-based)
								const centerIndex = realIdx + 2;
								setActiveIndex(centerIndex);
							}}
						>
							{products.map((product: any, index: number) => {
								// Markazdagi slide'ni aniqlash (1-based index)
								const productIndex = index + 2;
								// activeIndex null bo'lsa, dastlabki holatda markazdagi slide'ni aniqlash
								// activeIndex 1-based, productIndex ham 1-based
								const isCenter = activeIndex !== null && activeIndex === productIndex;
								return (
									<SwiperSlide key={product.id}>
										<Box component={'div'} className={`product-card ${isCenter ? 'featured' : ''}`}>
											<Box component={'div'} className={'card-image'} style={{ backgroundImage: `url(${product.image})` }}></Box>
											<Box component={'div'} className={'card-content'}>
												<h3 className={'card-title'}>{product.title}</h3>
												<p className={'card-description'}>{product.description}</p>
												{isCenter && (
													<Button className={'view-more-btn'}>VIEW MORE →</Button>
												)}
											</Box>
										</Box>
									</SwiperSlide>
								);
							})}
						</Swiper>
						<EastIcon className={'nav-arrow nav-next swiper-products-next'} />
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default PopularProducts;

