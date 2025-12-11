import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Button, Stack, Typography, Chip, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShareIcon from '@mui/icons-material/Share';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useReactiveVar, useQuery, useMutation } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { Location } from '../../libs/types/location/location';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../libs/sweetAlert';
import { GET_LOCATION } from '../../apollo/user/query';
import { LIKE_TARGET_LOCATION } from '../../apollo/user/mutation';
import { REACT_APP_API_URL } from '../../libs/config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import moment from 'moment';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

SwiperCore.use([Autoplay, Navigation, Pagination]);

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const LocationDetail: NextPage = ({ ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [locationId, setLocationId] = useState<string | null>(null);
	const [location, setLocation] = useState<Location | null>(null);
	const [isLiked, setIsLiked] = useState<boolean>(false);
	const [likesCount, setLikesCount] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const { data: locationData, loading: locationLoading, error: locationError } = useQuery(GET_LOCATION, {
		variables: {
			input: locationId || '',
		},
		skip: !locationId,
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		onCompleted: (data) => {
			if (data?.getLocation) {
				const loc = data.getLocation;
				setLocation(loc);
				setLikesCount(loc.locationLikes || 0);
				// Check if location is liked (if meLiked field exists in future)
				setIsLiked(false); // Will be updated when backend adds meLiked field
			}
		},
		onError: (err) => {
			console.error('GetLocation Query Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	// Like Location Mutation
	const [likeTargetLocation, { loading: likeLoading }] = useMutation(LIKE_TARGET_LOCATION, {
		onCompleted: (data) => {
			if (data?.likeTargetLocation && location?._id) {
				const updatedLocation = data.likeTargetLocation;
				const newLikedState = updatedLocation.meLiked && updatedLocation.meLiked[0]?.myFavorite;
				
				setIsLiked(newLikedState || !isLiked);
				setLikesCount(updatedLocation.locationLikes || 0);
				
				const message = newLikedState ? 'Location liked successfully!' : 'Location unliked successfully!';
				sweetTopSuccessAlert(message, 700).then();
			}
		},
		onError: (err) => {
			console.error('LIKE_TARGET_LOCATION Mutation Error:', err);
			sweetErrorHandling(err).then();
			// Revert optimistic update on error
			setIsLiked((prev) => !prev);
			setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.id) {
			setLocationId(router.query.id as string);
		}
	}, [router]);

	/** HANDLERS **/
	const likeLocationHandler = async () => {
		if (!user?._id) {
			sweetTopSuccessAlert('Please login to like locations', 700).then();
			return;
		}

		if (!location?._id) {
			return;
		}

		// Optimistic update
		setIsLiked((prev) => !prev);
		setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

		try {
			await likeTargetLocation({
				variables: {
					input: location._id,
				},
			});
		} catch (err) {
			// Error handled by onError callback
		}
	};

	const shareLocationHandler = () => {
		if (navigator.share && location) {
			navigator.share({
				title: location.locationName,
				text: location.description || location.locationName,
				url: window.location.href,
			}).catch((err) => {
				console.error('Error sharing:', err);
			});
		} else {
			// Fallback: copy to clipboard
			navigator.clipboard.writeText(window.location.href).then(() => {
				sweetTopSuccessAlert('Link copied to clipboard!', 700).then();
			});
		}
	};

	const goBackHandler = () => {
		router.back();
	};

	// Get image path helper
	const getImagePath = (imgPath: string): string => {
		if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
			return imgPath;
		}
		if (imgPath.startsWith('/img/')) {
			return imgPath;
		}
		return `${REACT_APP_API_URL}/${imgPath}`;
	};

	if (device === 'mobile') {
		return <h1>LOCATION DETAIL MOBILE</h1>;
	} else {
		return (
			<div id="location-detail-page">
				<div className="container">
					{locationLoading ? (
						<Box className="loading-container">
							<Typography>Loading location...</Typography>
						</Box>
					) : locationError ? (
						<Box className="error-container">
							<Typography color="error">Error loading location: {locationError.message}</Typography>
						</Box>
					) : !location ? (
						<Box className="no-data-container">
							<Typography>Location not found</Typography>
						</Box>
					) : (
						<>
							{/* Header with back button */}
							<Stack className="detail-header" direction="row" alignItems="center" spacing={2}>
								<IconButton onClick={goBackHandler} className="back-button">
									<ArrowBackIcon />
								</IconButton>
								<Typography variant="h5" className="header-title">
									Location Details
								</Typography>
							</Stack>

							{/* Main Content */}
							<Stack className="detail-content" spacing={4}>
								{/* Image Gallery */}
								<Box className="image-gallery">
									{location.images && location.images.length > 0 ? (
										<Swiper
											spaceBetween={10}
											slidesPerView={1}
											navigation
											pagination={{ clickable: true }}
											autoplay={{
												delay: 3000,
												disableOnInteraction: false,
											}}
											className="location-swiper"
										>
											{location.images.map((image, index) => (
												<SwiperSlide key={index}>
													<img src={getImagePath(image)} alt={`${location.locationName} - Image ${index + 1}`} />
												</SwiperSlide>
											))}
										</Swiper>
									) : (
										<Box className="no-image">
											<img src="/img/property/window.jpg" alt={location.locationName} />
										</Box>
									)}
								</Box>

								{/* Location Info */}
								<Stack className="location-info" spacing={3}>
									{/* Title and Actions */}
									<Stack direction="row" justifyContent="space-between" alignItems="flex-start">
										<Stack spacing={1} flex={1}>
											<Typography variant="h3" className="location-title">
												{location.locationName}
											</Typography>
											<Stack direction="row" alignItems="center" spacing={1}>
												<LocationOnIcon className="location-icon" />
												<Typography className="location-address">{location.address}</Typography>
											</Stack>
										</Stack>
										<Stack direction="row" spacing={2}>
											<Button
												variant="outlined"
												startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
												onClick={likeLocationHandler}
												disabled={likeLoading}
												className={`like-button ${isLiked ? 'liked' : ''}`}
											>
												{likesCount}
											</Button>
											<Button
												variant="outlined"
												startIcon={<ShareIcon />}
												onClick={shareLocationHandler}
												className="share-button"
											>
												Share
											</Button>
										</Stack>
									</Stack>

									{/* Stats */}
									<Stack direction="row" spacing={3} className="location-stats">
										<Stack direction="row" alignItems="center" spacing={1} className="stat-item">
											<RemoveRedEyeIcon className="stat-icon" />
											<Typography className="stat-text">{location.locationViews || 0} views</Typography>
										</Stack>
										<Stack direction="row" alignItems="center" spacing={1} className="stat-item">
											<FavoriteIcon className="stat-icon" />
											<Typography className="stat-text">{likesCount} likes</Typography>
										</Stack>
										{location.locationType && (
											<Chip label={location.locationType} className="location-type-chip" />
										)}
									</Stack>

									{/* Description */}
									{location.description && (
										<Box className="description-section">
											<Typography variant="h6" className="section-title">
												Description
											</Typography>
											<Typography className="description-text">{location.description}</Typography>
										</Box>
									)}

									{/* Location Details */}
									<Box className="details-section">
										<Typography variant="h6" className="section-title">
											Location Details
										</Typography>
										<Stack spacing={2} className="details-list">
											{location.latitude && location.longitude && (
												<Stack direction="row" spacing={2}>
													<Typography className="detail-label">Coordinates:</Typography>
													<Typography className="detail-value">
														{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
													</Typography>
												</Stack>
											)}
											<Stack direction="row" spacing={2}>
												<Typography className="detail-label">Created:</Typography>
												<Typography className="detail-value">
													{moment(location.createdAt).format('MMMM DD, YYYY')}
												</Typography>
											</Stack>
											{location.updatedAt && (
												<Stack direction="row" spacing={2}>
													<Typography className="detail-label">Last Updated:</Typography>
													<Typography className="detail-value">
														{moment(location.updatedAt).format('MMMM DD, YYYY')}
													</Typography>
												</Stack>
											)}
										</Stack>
									</Box>
								</Stack>
							</Stack>
						</>
					)}
				</div>
			</div>
		);
	}
};

export default withLayoutBasic(LocationDetail);

