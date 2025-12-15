import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography, Box, Card, CardContent } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useReactiveVar, useQuery } from '@apollo/client';
import { Location, Locations } from '../../types/location/location';
import { LocationsInquiry } from '../../types/location/location.input';
import { T } from '../../types/common';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { GET_LOCATIONS } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../config';
import Moment from 'react-moment';
import { LocationType } from '../../enums/location.enum';
import { sweetMixinErrorAlert } from '../../sweetAlert';

const MyLocations: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const [searchFilter, setSearchFilter] = useState<LocationsInquiry>(initialInput);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/
	const { data, loading, error, refetch } = useQuery<{ getLocations: Locations }>(GET_LOCATIONS, {
		variables: {
			input: {
				page: searchFilter.page,
				limit: searchFilter.limit,
				sort: searchFilter.sort || 'createdAt',
				direction: searchFilter.direction || 'DESC',
				search: {},
			},
		},
		skip: !user?._id,
		fetchPolicy: 'network-only',
	});

	useEffect(() => {
		if (user?._id) {
			refetch({
				input: {
					page: searchFilter.page,
					limit: searchFilter.limit,
					sort: searchFilter.sort || 'createdAt',
					direction: searchFilter.direction || 'DESC',
					search: {},
				},
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchFilter, user?._id]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	if (user?.memberType !== 'MEASURER') {
		router.back();
		return null;
	}

	if (error) {
		sweetMixinErrorAlert(error.message || 'Failed to load locations').then();
	}

	// Filter locations by memberId on frontend since backend doesn't support it in search
	const allLocations = data?.getLocations?.list || [];
	const locations = allLocations.filter((location: Location) => location.memberId === user?._id);
	const total = locations.length;

	// Debug: log locations to see images
	if (process.env.NODE_ENV === 'development' && locations.length > 0) {
		console.log('All locations with images:', locations.map(loc => ({
			name: loc.locationName,
			images: loc.images,
			imageCount: loc.images?.length || 0
		})));
		console.log('REACT_APP_API_URL:', REACT_APP_API_URL);
	}

	if (device === 'mobile') {
		return <div>MY LOCATIONS MOBILE</div>;
	} else {
		return (
			<div id="my-locations-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Locations</Typography>
						<Typography className="sub-title">Manage your created locations</Typography>
					</Stack>
				</Stack>
				<Stack className="locations-list-box">
					<Stack className="list-box">
						{loading ? (
							<Box className={'loading-box'}>
								<Typography>Loading...</Typography>
							</Box>
						) : locations?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No locations found!</p>
							</div>
						) : (
							<>
								<Stack className="listing-title-box">
									<Typography className="title-text">Location Name</Typography>
									<Typography className="title-text">Address</Typography>
									<Typography className="title-text">Type</Typography>
									<Typography className="title-text">Date Created</Typography>
									<Typography className="title-text">Views</Typography>
									<Typography className="title-text">Likes</Typography>
								</Stack>
								{locations.map((location: Location) => {
									return <LocationCard key={location._id} location={location} />;
								})}
							</>
						)}

						{locations.length !== 0 && (
							<Stack className="pagination-config">
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography>{total} location{total !== 1 ? 's' : ''} available</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

interface LocationCardProps {
	location: Location;
}

const LocationCard = ({ location }: LocationCardProps) => {
	// Get first image from location images array
	const images = location?.images;
	
	// Debug: log images to see what we're getting
	if (process.env.NODE_ENV === 'development') {
		console.log('Location images:', images, 'Location:', location.locationName);
	}
	
	const firstImage = images && Array.isArray(images) && images.length > 0 && images[0] 
		? images[0] 
		: null;
	
	// Construct image path - same format as AddLocation component
	let imagePath = null;
	if (firstImage) {
		// Remove leading slash if present to avoid double slashes
		const cleanImagePath = firstImage.startsWith('/') ? firstImage.substring(1) : firstImage;
		imagePath = `${REACT_APP_API_URL}/${cleanImagePath}`;
	}

	const hasImage = !!imagePath && !!firstImage;

	return (
		<Stack className="location-card-box">
			<Stack className={`image-box ${!hasImage ? 'no-image' : ''}`}>
				{hasImage && imagePath ? (
					<>
						<img 
							src={imagePath} 
							alt={location.locationName || 'Location image'}
							loading="lazy"
							onError={(e) => {
								const target = e.target as HTMLImageElement;
								target.style.display = 'none';
								const parent = target.parentElement;
								if (parent) {
									parent.classList.add('no-image');
									// Show placeholder if image fails to load
									const existingPlaceholder = parent.querySelector('.placeholder-icon');
									if (!existingPlaceholder) {
										const placeholder = document.createElement('div');
										placeholder.className = 'placeholder-icon';
										placeholder.innerHTML = `
											<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#8B4513" opacity="0.3"/>
											</svg>
										`;
										parent.appendChild(placeholder);
									}
								}
							}}
							onLoad={(e) => {
								// Remove no-image class when image loads successfully
								const target = e.target as HTMLImageElement;
								const parent = target.parentElement;
								if (parent) {
									parent.classList.remove('no-image');
									const placeholder = parent.querySelector('.placeholder-icon');
									if (placeholder) {
										placeholder.remove();
									}
								}
							}}
						/>
						{/* Fallback placeholder that shows while image is loading */}
						<div className="placeholder-icon" style={{ display: 'none' }}>
							<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#8B4513" opacity="0.3"/>
							</svg>
						</div>
					</>
				) : (
					<div className="placeholder-icon">
						<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#8B4513" opacity="0.3"/>
						</svg>
					</div>
				)}
			</Stack>
			<Stack className="information-box">
				<Typography className="name">{location.locationName || 'Untitled Location'}</Typography>
				<Typography className="address">{location.address || 'No address provided'}</Typography>
			</Stack>
			<Stack className="type-box">
				<Stack className="coloured-box">
					<Typography className="type">
						{location.locationType || LocationType.OTHER}
					</Typography>
				</Stack>
			</Stack>
			<Stack className="date-box">
				<Typography className="date">
					<Moment format="DD MMMM, YYYY">{location.createdAt}</Moment>
				</Typography>
			</Stack>
			<Stack className="views-box">
				<Typography className="views">{location.locationViews?.toLocaleString() || '0'}</Typography>
			</Stack>
			<Stack className="likes-box">
				<Typography className="likes">{location.locationLikes?.toLocaleString() || '0'}</Typography>
			</Stack>
		</Stack>
	);
};

MyLocations.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MyLocations;

