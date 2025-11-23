import React, { useState } from 'react';
import { Stack, Box, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import type { Swiper as SwiperType } from 'swiper';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';

interface PopularProductsProps {}

const PopularProducts = (props: PopularProductsProps) => {
	const device = useDeviceDetect();
	const [activeIndex, setActiveIndex] = useState<number>(2); // Dastlabki markazdagi slide (2-chi, 1-based = 2)

	// Mock data for products - only 3 products
	const products = [
		{
			id: 1,
			title: 'Glass Window',
			description: 'Creative ipsum dolor sit amet consec creativity and functionality to.',
			image: 'https://www.eurolinesteelwindows.com/wp-content/uploads/2023/09/Euroline-Steel-Windows-Doors-Steel-Window-and-Door-Manufacturer-Yorba-Linda-Tips-for-Maintaining-Your-Steel-Windows-and-Doors.jpg',
		},
		{
			id: 2,
			title: 'Digital Doors',
			description: 'Creative ipsum dolor sit amet consec creativity and functionality to.',
			image: 'https://image.made-in-china.com/202f0j00vCwhIMsPSfqK/Modern-Style-Window-with-Grill-Design-for-Steel-Windows-Windows-and-Doors.webp',
			featured: true,
		},
		{
			id: 3,
			title: 'Wooden Doors',
			description: 'Creative ipsum dolor sit amet consec creativity and functionality to.',
			image: 'https://windowanddoorspecialties.com/wp-content/uploads/elementor/thumbs/front-door-3-ogmk7oo6gucg5tke7k1s3eouzxmky573loid49j4n4.jpg',
		},
		{
            id: 4,
            title: 'Modern Windows',
            description: 'Creative ipsum dolor sit amet consec creativity and functionality to.',
            image: 'https://www.ssmglass.com/wp-content/uploads/2021/04/UPVC-WINDOWDOOR-SYSTEM-01.jpg',
        },
        {
            id: 5,
            title: 'Door',
            description: 'Creative ipsum dolor sit amet consec creativity and functionality to.',
            image: 'https://i.pinimg.com/1200x/8b/37/4c/8b374c8a69933ab0dcdc257b05c69abf.jpg',
        },
		{
			id: 1,
			title: 'Glass Window',
			description: 'Creative ipsum dolor sit amet consec creativity and functionality to.',
			image: 'https://i.pinimg.com/1200x/57/25/0d/57250dac8bcc691e9f4838c382ed45da.jpg',
		},

		
	];


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
							{products.map((product) => (
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
							{products.map((product, index) => {
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

