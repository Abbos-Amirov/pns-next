import React from 'react';
import { Stack, Box, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper';

interface TrendPropertiesProps {
	initialInput?: any;
}

const TrendProperties = (props: TrendPropertiesProps) => {
	const device = useDeviceDetect();

	// Cities data - eng ko'p xizmatdan foydalangan shaharlar
	const cities = [
		{
			id: 1,
			name: 'SEOUL',
			image: '/img/banner/cities/SEOUL.webp',
		},
		{
			id: 2,
			name: 'BUSAN',
			image: '/img/banner/cities/BUSAN.webp',
		},
		{
			id: 3,
			name: 'INCHEON',
			image: '/img/banner/cities/INCHEON.webp',
		},
		{
			id: 3,
			name: 'ULSAN',
			image: '/img/banner/cities/INCHEON.webp',
		},
		{
			id: 3,
			name: 'CHONAN',
			image: '/img/banner/cities/INCHEON.webp',
		},
	];

	const products = [
		{ id: 1, image: 'https://artfasad.com/wp-content/uploads/2024/07/front-door-with-window-design-4-1.jpg', name: 'Glass Window', },
		{ id: 2, image: 'https://artfasad.com/wp-content/uploads/2024/07/front-door-with-window-design-3-1.jpg', name: 'Steel Window', },
		{ id: 3, image: 'https://www.homestars.com/images/sp/original/3eeacf04-80d7-41af-a87c-03d7db1a75f5.jpg', name: 'Digital Doors', },
		{ id: 4, image: 'https://vinyllight.ca/assets/cache_image/assets/template/img/blog/best-front-doors-with-side-window-4_730xx410_586.jpg', name: 'GOOD DOOR ', },
		{ id: 5, image: 'https://builderssupplyco.com/wp-content/uploads/2019/11/service_windows-doors.jpg', name: 'Digital Doors', },
	   ];
	   

	if (device === 'mobile') {
		return (
			<Stack className={'trend-properties'}>
				<Stack className={'container'}>
					<Box className={'logo-badge'}>
						<Box className={'logo-circle'}>
							<svg width="50" height="100" viewBox="0 0 100 100" fill="none" xmlns="">
								<circle cx="50" cy="50" r="48" fill="none" stroke="#D4A574" strokeWidth="2"/>
								<text x="50" y="38" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="600" letterSpacing="0.5">OUR BEST</text>
								<text x="50" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="600" letterSpacing="0.5">WINDOW</text>
								<path d="M 50 50 L 62 38 L 50 26 L 38 38 Z" fill="#D4A574"/>
							</svg>
						</Box>
					</Box>
					<Stack className={'main-content'}>
						<Box className={'trusted-badge'}>
							<span>TRUSTED EXPERIENCE</span>
						</Box>
						<Box className={'headline'}>
							<span className={'text-white'}>Every </span>
							<span className={'text-accent'}>Window & Door</span>
							<span className={'text-white'}> Holds A Story</span>
						</Box>
						<p className={'description'}>
							Lorem ipsum dolor sit amet, consectetur adipisc your vision, goals, and audience.helps us.
						</p>
						<Button className={'learn-more-btn'}>
							LEARN MORE →
						</Button>
					</Stack>
					<Box className={'cities-swiper-container'}>
						<Swiper
							className={'cities-swiper'}
							slidesPerView={1}
							spaceBetween={0}
							modules={[Autoplay]}
							autoplay={{
								delay: 3000,
								disableOnInteraction: false,
							}}
							loop={true}
						>
							{cities.map((city) => (
								<SwiperSlide key={city.id}>
									<Box className={'city-image'} style={{ backgroundImage: `url(${city.image})` }}>
										<Box className={'city-overlay'}>
											<span className={'city-name'}>{city.name}</span>
										</Box>
									</Box>
								</SwiperSlide>
							))}
						</Swiper>
					</Box>
					<Stack className={'statistics'}>
						<Box className={'stat-item'}>
							<span className={'stat-number'}>15+</span>
							<span className={'stat-label'}>Years Of Experience</span>
						</Box>
						<Box className={'stat-item'}>
							<span className={'stat-number stat-highlight'}>20k+</span>
							<span className={'stat-label'}>Project completed</span>
						</Box>
						<Box className={'stat-item'}>
							<span className={'stat-number'}>32k+</span>
							<span className={'stat-label'}>Client satisfaction</span>
						</Box>
					</Stack>
					<Box className={'background-text'}>windows and Door</Box>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'trend-properties'}>
				<Stack className={'container'}>
					<Box className={'logo-badge'}>
						<Box className={'logo-circle'}>
							<svg width="100" height="100" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
								<circle cx="80" cy="80" r="78" fill="none" stroke="#D4A574" strokeWidth="2.5"/>
								<text x="80" y="50" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="600" letterSpacing="1">OUR BEST</text>
								<text x="80" y="68" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="600" letterSpacing="1">WINDOW</text>
								<path d="M 80 80 L 95 65 L 80 50 L 65 65 Z" fill="#D4A574"/>
							</svg>
						</Box>
					</Box>
					<Box className={'content-wrapper'}>
						<Box className={'left-image-section'}>
							<Swiper
								className={'cities-swiper'}
								slidesPerView={1}
								spaceBetween={0}
								modules={[Autoplay]}
								autoplay={{
									delay: 3000,
									disableOnInteraction: false,
								}}
								loop={true}
								direction="vertical"
							>
								{cities.map((city) => (
									<SwiperSlide key={city.id}>
										<Box className={'city-image'} style={{ backgroundImage: `url(${city.image})` }}>
											<Box className={'city-overlay'}>
												<span className={'city-name'}>{city.name}</span>
												<p className={'city-description'}>Top Cities That Trust Our Doors & Windows</p>
											</Box>
										</Box>
									</SwiperSlide>
								))}
							</Swiper>
						</Box>
						<Stack className={'main-content'}>
							<Box className={'trusted-badge'}>
								<span>TRUSTED EXPERIENCE</span>
							</Box>
							<Box className={'headline'}>
								<span className={'text-white'}>Every </span>
								<span className={'text-accent'}>Window & Door</span>
								<span className={'text-white'}> Holds A Story</span>
							</Box>
							
							<Button className={'learn-more-btn'}>
								LEARN MORE →
							</Button>
						</Stack>
						<Box className={'window-swiper-wrapper'}>
      <Swiper
        className={'window-swiper'}
        slidesPerView={3}
        spaceBetween={30}
        centeredSlides={true}
        grabCursor={true}
        modules={[Navigation]}
        navigation={{
          nextEl: '.next-btn',
          prevEl: '.prev-btn',
        }}
        loop={true}
      >
        {products.map((p) => (
          <SwiperSlide key={p.id}>
            <Box className={'window-card'} style={{ backgroundImage: `url(${p.image})` }}>
              <Box className={'window-overlay'}>
                <h3>{p.name}</h3>
              </Box>
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ARROWS */}
      <Box className={'arrow-box'}>
        <button className={'prev-btn'}>←</button>
        <button className={'next-btn'}>→</button>
      </Box>
    </Box>

					</Box>
					<Stack className={'statistics'}>
						<Box className={'stat-item'}>
							<span className={'stat-number'}>20+</span>
							<span className={'stat-label'}>Years Of Experience</span>
						</Box>
						<Box className={'stat-divider'}></Box>
						<Box className={'stat-item'}>
							<span className={'stat-number stat-highlight'}>500k+</span>
							<span className={'stat-label'}>Project completed</span>
						</Box>
						<Box className={'stat-divider'}></Box>
						<Box className={'stat-item'}>
							<span className={'stat-number'}>800k+</span>
							<span className={'stat-label'}>Client satisfaction</span>
						</Box>
					</Stack>
					<Box className={'background-text'}>windows and Door</Box>
				</Stack>
			</Stack>
		);
	}
};

TrendProperties.defaultProps = {
	initialInput: {},
};

export default TrendProperties;
