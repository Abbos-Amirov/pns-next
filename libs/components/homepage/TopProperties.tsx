import React, { useState, useEffect } from 'react';
import { Stack, Box, CircularProgress, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import TopPropertyCard from './TopPropertyCard';
import { ProductsInquiry } from '../../types/product/products.input';
import { Product } from '../../types/product/property';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { Direction } from '../../enums/common.enum';

interface TopPropertiesProps {
	initialInput: ProductsInquiry;
}

const TopProperties = (props: TopPropertiesProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [topProducts, setTopProducts] = useState<Product[]>([]);

	/** APOLLO REQUESTS **/
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const {
		loading: getProductsLoading,
		data: getProductsData,
		error: getProductsError,
		refetch: getProductsRefetch,
	} = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
	});

	// Update state when data changes
	useEffect(() => {
		if (getProductsData?.getProducts?.list) {
			setTopProducts(getProductsData.getProducts.list);
		}
	}, [getProductsData]);

	/** HANDLERS **/

	// Loading state
	if (getProductsLoading) {
		return (
			<Stack className={'top-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Top products</span>
					</Stack>
					<Stack className={'card-box'}>
						<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', py: 4 }}>
							<CircularProgress sx={{ color: '#8B4513' }} />
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}

	// Error state or no products
	if (getProductsError || !topProducts || topProducts.length === 0) {
		return (
			<Stack className={'top-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Top products</span>
					</Stack>
					<Stack className={'card-box'}>
						<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', py: 4 }}>
							<Typography sx={{ color: '#616161', fontSize: '16px', fontFamily: 'inherit' }}>
								{getProductsError ? 'Error loading products' : 'No top products found'}
							</Typography>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}

	if (device === 'mobile') {
		return (
			<Stack className={'top-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Top products</span>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'top-property-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={15}
							modules={[Autoplay]}
						>
							{topProducts.map((product: Product) => {
								return (
									<SwiperSlide className={'top-property-slide'} key={product?._id}>
										<TopPropertyCard product={product} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'top-properties'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Top products</span>
							<p>Check out our Top Products</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'pagination-box'}>
								<WestIcon className={'swiper-top-prev'} />
								<div className={'swiper-top-pagination'}></div>
								<EastIcon className={'swiper-top-next'} />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'top-property-swiper'}
							slidesPerView={'auto'}
							spaceBetween={15}
							modules={[Autoplay, Navigation, Pagination]}
							navigation={{
								nextEl: '.swiper-top-next',
								prevEl: '.swiper-top-prev',
							}}
							pagination={{
								el: '.swiper-top-pagination',
							}}
						>
							{topProducts.map((product: Product) => {
								return (
									<SwiperSlide className={'top-property-slide'} key={product?._id}>
										<TopPropertyCard product={product} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

TopProperties.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'productRank',
		direction: Direction.DESC,
		search: {},
	},
};

export default TopProperties;
