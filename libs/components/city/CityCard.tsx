import React, { useState, useEffect, useRef } from 'react';
import { Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Location } from '../../types/location/location';
import Link from 'next/link';
import { REACT_APP_API_URL } from '../../config';
import { useReactiveVar, useMutation } from '@apollo/client';
import { isLocationLikedByUser, setLocationLikedForUser, likedLocationsVar, userVar } from '../../../apollo/store';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { LIKE_TARGET_LOCATION } from '../../../apollo/user/mutation';
import { sweetTopSuccessAlert, sweetErrorHandling } from '../../sweetAlert';
import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'next-i18next';

interface CityCardType {
	city: Location;
	likeCityHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const CityCard = (props: CityCardType) => {
	const { city, likeCityHandler, myFavorites, recentlyVisited } = props;
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const likedLocationsByUser = useReactiveVar(likedLocationsVar);
	const [isHovered, setIsHovered] = useState(false);
	const pendingLikeRef = useRef<boolean | null>(null);

	// Backend-driven like state (USER ↔ LOCATION relationship)
	// NOTE: When backend reliably returns Location.meLiked (non-null), we can read it here
	const [isLiked, setIsLiked] = useState<boolean>(() => {
		if (myFavorites) return true;
		return isLocationLikedByUser(user?._id, city?._id);
	});

	const [likesCount, setLikesCount] = useState<number>(city?.locationLikes || 0);

	// Update isLiked state when city changes
	useEffect(() => {
		// Sync with persisted likes only when there's no pending optimistic action
		if (pendingLikeRef.current === null) {
			const persisted = myFavorites ? true : isLocationLikedByUser(user?._id, city?._id);
			setIsLiked(persisted);
		}
		setLikesCount(city?.locationLikes ?? 0);
		// IMPORTANT: only re-init on new city (avoid overriding optimistic updates on re-render)
	}, [city?._id, user?._id, myFavorites, likedLocationsByUser]);

	// Like Location Mutation
	const [likeTargetLocation, { loading: likeLoading }] = useMutation(LIKE_TARGET_LOCATION, {
		onCompleted: (data) => {
			if (data?.likeTargetLocation) {
				const updated = data.likeTargetLocation;
				// Optional: if backend later returns meLiked for location, we can use it here
				const serverLiked = updated?.meLiked?.[0]?.myFavorite;
				const serverLikes = updated?.locationLikes;

				// Instagram-like rule:
				// If backend returns a stale liked-state, don't overwrite the user's UI decision.
				if (typeof serverLiked === 'boolean') {
					if (pendingLikeRef.current === null || serverLiked === pendingLikeRef.current) {
						setIsLiked(serverLiked);
					}
				}

				if (typeof serverLikes === 'number') {
					setLikesCount(serverLikes);
				}

				const newLikedState = pendingLikeRef.current ?? isLiked;
				pendingLikeRef.current = null;
				const message = newLikedState ? 'Location liked successfully!' : 'Location unliked successfully!';
				sweetTopSuccessAlert(message, 700).then();
			}
		},
		onError: (err) => {
			console.error('LIKE_TARGET_LOCATION Mutation Error:', err);
			pendingLikeRef.current = null;
			sweetErrorHandling(err).then();
		},
	});

	// Handle like button click (same structure as PropertyCard)
	const handleLikeClick = async (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
		e.stopPropagation();

		if (!user?._id) {
			sweetTopSuccessAlert('Please login first', 700);
			return;
		}

		if (!city?._id) return;

		// 🔥 OPTIMISTIC UI
		const prevLiked = isLiked;
		const prevLikes = likesCount;
		const nextLiked = !prevLiked;

		pendingLikeRef.current = nextLiked;

		setIsLiked(nextLiked);
		setLikesCount(nextLiked ? prevLikes + 1 : Math.max(0, prevLikes - 1));
		setLocationLikedForUser(user._id, city._id, nextLiked);

		try {
			await likeTargetLocation({ variables: { input: city._id } });
		} catch (err) {
			// ❌ ERROR → ROLLBACK
			pendingLikeRef.current = null;
			setIsLiked(prevLiked);
			setLikesCount(prevLikes);
			setLocationLikedForUser(user._id, city._id, prevLiked);
			sweetErrorHandling(err);
		}
	};

	// Get image path - use location images or fallback
	const getImagePath = (): string => {
		if (city?.images && city.images.length > 0) {
			const imgPath = city.images[0];
			// If image path starts with http:// or https://, it's already a full URL
			if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
				return imgPath;
			}
			// If image path starts with /img/, use it directly (public folder)
			if (imgPath.startsWith('/img/')) {
				return imgPath;
			}
			// Otherwise, prepend API URL
			return `${REACT_APP_API_URL}/${imgPath}`;
		}
		// Fallback to default image
		return '/img/property/window.jpg';
	};

	const imagePath: string = getImagePath();
	const detailHref = {
		pathname: '/city/detail',
		query: { id: city?._id },
	};


	if (device === 'mobile') {
		return <div>CITY CARD</div>;
	} else {
		return (
			<Stack
				className="card-config"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<Stack className="top">
					<Link href={detailHref}>
						<img src={imagePath} alt="" />
					</Link>
					<div className={`hover-actions ${isHovered ? 'active' : ''}`}>
						<Link href={detailHref} className="view-action" aria-label={t('ViewDetails')}>
							<span className="action-btn">
								<RemoveRedEyeIcon />
							</span>
							<span className="view-count">{t('ViewDetails')}</span>
						</Link>
					</div>
				</Stack>
				<Stack className="bottom">
					<Stack className="name-address">
						<Stack className="name">
							<Link href={detailHref}>
								<Typography>{city.locationName}</Typography>
							</Link>
						</Stack>
						<Stack className="address">
							<Typography>{city?.address || 'Location'}</Typography>
						</Stack>
					</Stack>
					<Stack className="specifications">
						<Stack className="spec-item like-item" sx={{ cursor: 'pointer' }}>
							<IconButton
								color={'default'}
								onClick={handleLikeClick}
								disabled={likeLoading}
								sx={{ padding: 0 }}
							>
								{isLiked ? (
									<FavoriteIcon className={'spec-icon liked'} />
								) : (
									<FavoriteBorderIcon className={'spec-icon'} />
								)}
							</IconButton>
							<Typography className={'spec-text'}>{likesCount}</Typography>
						</Stack>
						<Stack className="spec-item">
							<RemoveRedEyeIcon className={'spec-icon'} />
							<Typography className={'spec-text'}>{city?.locationViews || 0}</Typography>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default CityCard;

