import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
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
		onCompleted: (data: any) => {
			setTopProducts(data?.getProducts?.list || []);
		},
	});

	console.log(">>>>>>>>>>> top Product",getProductsData)

	// Update state when data changes
	React.useEffect(() => {
		if (getProductsData?.getProducts?.list) {
			setTopProducts(getProductsData.getProducts.list);
		}
	}, [getProductsData]);
	/** HANDLERS **/

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
							{(topProducts || []).map((product: Product) => {
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
							{(topProducts || []).map((product: Product) => {
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
		limit: 4,
		sort: 'productRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopProperties;
