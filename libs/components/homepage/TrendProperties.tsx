import React, { useMemo } from 'react';
import { Stack, Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper';
import { useQuery } from '@apollo/client';
import { GET_LOCATIONS } from '../../../apollo/user/query';
import { LocationsInquiry } from '../../types/location/location.input';
import { REACT_APP_API_URL } from '../../config';
import { Direction } from '../../enums/common.enum';

interface TrendPropertiesProps {
	initialInput?: LocationsInquiry;
}

const TrendProperties = (props: TrendPropertiesProps) => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();

	// Default input for query
	const defaultInput: LocationsInquiry = {
		page: 1,
		limit: 100,
		sort: 'locationViews',
		direction: Direction.DESC,
		search: {},
	};

	const initialInput = props.initialInput || defaultInput;

	// Fetch locations from backend
	const { data, loading, error } = useQuery(GET_LOCATIONS, {
		variables: {
			input: initialInput,
		},
		fetchPolicy: 'network-only',
	});
	console.log(">>>>>>>>>> data",data)

	// Transform backend data to component format and filter by locationViews >= 1
	const locations = useMemo(() => {
		if (!data?.getLocations?.list) {
			console.log('TrendProperties: No data from backend');
			return [];
		}

		console.log('TrendProperties: Raw data from backend', data.getLocations.list);
		console.log('TrendProperties: Total locations before filter', data.getLocations.list.length);

		// Debug: Har bir location'ning views'ini ko'rsatish
		data.getLocations.list.forEach((location: any) => {
			console.log('TrendProperties: Location details', {
				id: location._id,
				name: location.locationName,
				views: location.locationViews,
				viewsType: typeof location.locationViews,
			});
		});

		const allLocations = data.getLocations.list
			.filter((location: any) => {
				// Faqat views'lari 1 yoki undan ko'p bo'lganlar
				const views = location.locationViews ?? 0;
				const hasViews = views >= 1;
				if (!hasViews) {
					console.log('TrendProperties: Filtered out location (views < 1)', {
						id: location._id,
						name: location.locationName,
						views: views,
						originalViews: location.locationViews,
					});
				}
				return hasViews;
			})
			.map((location: any) => {
				// Get first image from images array
				const firstImage = location.images && location.images.length > 0
					? location.images[0] 
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
					id: location._id,
					name: location.locationName || 'Untitled Location',
					image: imageUrl || 'https://via.placeholder.com/400x300?text=No+Image',
					locationViews: location.locationViews || 0,
				};
			});

		console.log('TrendProperties: Filtered locations count', allLocations.length);
		console.log('TrendProperties: Final locations', allLocations);

		return allLocations;
	}, [data]);

	// Cities data - eng ko'p xizmatdan foydalangan shaharlar
	const cities = [
		{ id: 1, name: 'SEOUL', image: '/img/banner/cities/SEOUL.webp' },
		{ id: 2, name: 'INCHEON', image: '/img/banner/cities/INCHEON.webp' },
		{ id: 3, name: 'ULSAN', image: '/img/banner/cities/BUSAN.webp' },
		{ id: 4, name: 'CHEONAN', image: '/img/banner/cities/DAEJON.webp' },
		{ id: 5, name: 'SUWON', image: '/img/banner/cities/SEOUL.webp' },
		{ id: 6, name: 'DAEJEON', image: '/img/banner/cities/DAEJON.webp' },
		{ id: 7, name: 'GYEONGJU', image: '/img/banner/cities/GYEONGJU.webp' },
		{ id: 8, name: 'DAEGU', image: '/img/banner/cities/DAEGU.webp' },
		{ id: 9, name: 'BUSAN', image: '/img/banner/cities/BUSAN.webp' },
	];


		if (device === 'mobile') {
		return (
			<Stack className={'trend-properties'}>
				<Stack className={'container'}>
					<div className={'logo-badge'}>
						<div className={'logo-circle'}>
							<svg width="50" height="100" viewBox="0 0 100 100" fill="none" xmlns="">
								<circle cx="50" cy="50" r="48" fill="none" stroke="#D4A574" strokeWidth="2"/>
								<text x="50" y="38" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="600" letterSpacing="0.5">{t('OUR BEST')}</text>
								<text x="50" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="600" letterSpacing="0.5">{t('WINDOW')}</text>
								<path d="M 50 50 L 62 38 L 50 26 L 38 38 Z" fill="#D4A574"/>
							</svg>
						</div>
					</div>
					<Stack className={'main-content'}>
						<div className={'trusted-badge'}>
							<span>{t('TRUSTED EXPERIENCE')}</span>
						</div>
						<div className={'headline'}>
							<span className={'text-white'}>{t('Every')} </span>
							<span className={'text-accent'}>{t('Windows & Door')}</span>
							<span className={'text-white'}> {t('Holds A Story')}</span>
						</div>
						<p className={'description'}>
							{t('TrendDescription')}
						</p>
						<Button className={'learn-more-btn'}>
							{t('LEARN MORE')} →
						</Button>
					</Stack>
					<div className={'cities-swiper-container'}>
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
									<div className={'city-image'} style={{ backgroundImage: `url(${city.image})` }}>
										<div className={'city-overlay'}>
											<span className={'city-name'}>{city.name}</span>
										</div>
									</div>
								</SwiperSlide>
							))}
						</Swiper>
					</div>
					<Stack className={'statistics'}>
						<div className={'stat-item'}>
							<span className={'stat-number'}>15+</span>
							<span className={'stat-label'}>{t('Years Of Experience')}</span>
						</div>
						<div className={'stat-item'}>
							<span className={'stat-number stat-highlight'}>20k+</span>
							<span className={'stat-label'}>{t('Project completed')}</span>
						</div>
						<div className={'stat-item'}>
							<span className={'stat-number'}>32k+</span>
							<span className={'stat-label'}>{t('Client satisfaction')}</span>
						</div>
					</Stack>
					<div className={'background-text'}>{t('Windows and Door')}</div>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'trend-properties'}>
				<Stack className={'container'}>
					<div className={'logo-badge'}>
						<div className={'logo-circle'}>
							<svg width="100" height="100" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
								<circle cx="80" cy="80" r="78" fill="none" stroke="#D4A574" strokeWidth="2.5"/>
								<text x="80" y="50" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="600" letterSpacing="1">{t('OUR BEST')}</text>
								<text x="80" y="68" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="600" letterSpacing="1">{t('WINDOW')}</text>
								<path d="M 80 80 L 95 65 L 80 50 L 65 65 Z" fill="#D4A574"/>
							</svg>
						</div>
					</div>
					<div className={'content-wrapper'}>
						<div className={'left-image-section'}>
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
										<div className={'city-image'} style={{ backgroundImage: `url(${city.image})` }}>
											<div className={'city-overlay'}>
												<span className={'city-name'}>{city.name}</span>
												<p className={'city-description'}>{t('Top Cities That Trust Our Doors & Windows')}</p>
											</div>
										</div>
									</SwiperSlide>
								))}
							</Swiper>
						</div>
						<Stack className={'main-content'}>
							<div className={'trusted-badge'}>
								<span>{t('TRUSTED EXPERIENCE')}</span>
							</div>
							<div className={'headline'}>
								<span className={'text-white'}>{t('Every')} </span>
								<span className={'text-accent'}>{t('Windows & Door')}</span>
								<span className={'text-white'}> {t('Holds A Story')}</span>
							</div>
							
							<Button className={'learn-more-btn'}>
								{t('LEARN MORE')} →
							</Button>
						</Stack>
						<div className={'window-swiper-wrapper'}>
							{loading ? (
								<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
									<CircularProgress />
								</div>
							) : error || locations.length === 0 ? (
								<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
									<p>{t('No locations found')}</p>
								</div>
							) : (
								<>
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
										loop={locations.length > 3}
									>
										{locations.map((location: any) => (
											<SwiperSlide key={location.id}>
												<div className={'window-card'} style={{ backgroundImage: `url(${location.image})` }}>
													<div className={'window-overlay'}>
														<h3>{location.name}</h3>
													</div>
												</div>
											</SwiperSlide>
										))}
									</Swiper>

									<div className={'arrow-box'}>
										<button className={'prev-btn'}>←</button>
										<button className={'next-btn'}>→</button>
									</div>
								</>
							)}
						</div>

					</div>
					<Stack className={'statistics'}>
						<div className={'stat-item'}>
							<span className={'stat-number'}>20+</span>
							<span className={'stat-label'}>{t('Years Of Experience')}</span>
						</div>
						<div className={'stat-divider'}></div>
						<div className={'stat-item'}>
							<span className={'stat-number stat-highlight'}>500k+</span>
							<span className={'stat-label'}>{t('Project completed')}</span>
						</div>
						<div className={'stat-divider'}></div>
						<div className={'stat-item'}>
							<span className={'stat-number'}>800k+</span>
							<span className={'stat-label'}>{t('Client satisfaction')}</span>
						</div>
					</Stack>
					<div className={'background-text'}>{t('Windows and Door')}</div>
				</Stack>
			</Stack>
		);
	}
};

TrendProperties.defaultProps = {
	initialInput: {
			page: 1,
		limit: 100,
		sort: 'locationViews',
		direction: Direction.DESC,
		search: {},
		}
	};


export default TrendProperties;
