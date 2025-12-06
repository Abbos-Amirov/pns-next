import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography, Box, Card, CardContent, Grid } from '@mui/material';
import PropertyCard from '../property/PropertyCard';
import { Property } from '../../types/product/property';
import { T } from '../../types/common';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useQuery } from '@apollo/client';
import { GET_FAVORITES } from '../../../apollo/user/query';
import { sweetErrorHandling } from '../../sweetAlert';

interface OrdinaryInquiry {
	page: number;
	limit: number;
}

const MyFavorites: NextPage = () => {
	const device = useDeviceDetect();
	const [myFavorites, setMyFavorites] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFavorites, setSearchFavorites] = useState<OrdinaryInquiry>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/
	const { data: favoritesData, loading, error, refetch } = useQuery(GET_FAVORITES, {
		variables: { 
			input: {
				page: searchFavorites.page,
				limit: searchFavorites.limit,
			}
		},
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		skip: !searchFavorites.page || !searchFavorites.limit,
		onError: (err) => {
			console.error('Favorites Query Error:', err);
			console.error('Query Variables:', { input: { page: searchFavorites.page, limit: searchFavorites.limit } });
			sweetErrorHandling(err).then();
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (favoritesData?.getFavorites) {
			// Convert products to properties format
			const products = favoritesData.getFavorites.list || [];
			const convertedProperties: Property[] = products.map((product: any) => ({
				_id: product._id,
				propertyType: product.productType,
				propertyStatus: product.productStatus,
				propertyLocation: product.productLocation,
				propertyAddress: product.productAddress,
				propertyTitle: product.productTitle,
				propertyPrice: product.productPrice,
				propertySquare: product.productHeight && product.productWidth ? product.productHeight * product.productWidth : 0,
				propertyBeds: product.propertyBeds || 0,
				propertyRooms: product.propertyRooms || 0,
				propertyViews: product.productViews || 0,
				propertyLikes: product.productLikes || 0,
				propertyImages: product.productImages || [],
				propertyDesc: product.productDesc || '',
				propertyBarter: product.productBarter || false,
				propertyRent: product.productRent || false,
				memberId: product.memberId,
				soldAt: product.soldAt,
				deletedAt: product.deletedAt,
				createdAt: product.createdAt,
				updatedAt: product.updatedAt,
			}));
			setMyFavorites(convertedProperties);
			
			const metaCounter = favoritesData.getFavorites.metaCounter;
			const totalCount = Array.isArray(metaCounter) 
				? (metaCounter[0]?.total || 0)
				: (metaCounter?.total || 0);
			setTotal(totalCount);
		}
	}, [favoritesData]);

	useEffect(() => {
		refetch();
	}, [searchFavorites, refetch]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFavorites({ ...searchFavorites, page: value });
	};

	if (device === 'mobile') {
		return <div>PNS DEV MY FAVORITES MOBILE</div>;
	} else {
		return (
			<Box component={'div'} className={'my-favorites-page'}>
				{/* Header Section */}
				<Card className={'favorites-header-card'} sx={{ mb: 3 }}>
					<CardContent>
						<Stack direction={'row'} alignItems={'center'} spacing={2}>
							<Box
								sx={{
									width: 56,
									height: 56,
									borderRadius: '12px',
									backgroundColor: 'rgba(233, 44, 40, 0.1)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#E92C28',
								}}
							>
								<FavoriteIcon sx={{ fontSize: 32 }} />
							</Box>
							<Box>
								<Typography variant={'h4'} className={'page-title'} sx={{ fontWeight: 700, mb: 0.5 }}>
									My Favorites
								</Typography>
								<Typography variant={'body2'} sx={{ color: '#717171' }}>
									Your saved favorite products
								</Typography>
							</Box>
							<Box sx={{ flex: 1 }} />
							<Box
								sx={{
									padding: '8px 16px',
									borderRadius: '12px',
									backgroundColor: 'rgba(233, 44, 40, 0.1)',
									color: '#E92C28',
									fontWeight: 600,
									fontSize: '14px',
								}}
							>
								Total: {total}
							</Box>
						</Stack>
					</CardContent>
				</Card>

				{/* Favorites List */}
				{loading ? (
					<Card>
						<CardContent sx={{ p: 4, textAlign: 'center' }}>
							<Typography variant={'body2'} sx={{ color: '#717171' }}>
								Loading favorites...
							</Typography>
						</CardContent>
					</Card>
				) : error ? (
					<Card>
						<CardContent sx={{ p: 4, textAlign: 'center' }}>
							<Typography variant={'body2'} color={'error'}>
								Error loading favorites: {error.message}
							</Typography>
						</CardContent>
					</Card>
				) : myFavorites?.length > 0 ? (
					<>
						<Grid container spacing={3} sx={{ mb: 3 }}>
							{myFavorites.map((property: Property) => (
								<Grid item xs={12} sm={6} md={4} lg={4} key={property._id}>
									<PropertyCard property={property} myFavorites={true} />
								</Grid>
							))}
						</Grid>

						{/* Pagination */}
						<Card>
							<CardContent>
								<Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
									<Typography variant={'body2'} sx={{ color: '#717171' }}>
										Showing {((searchFavorites.page - 1) * searchFavorites.limit) + 1} to{' '}
										{Math.min(searchFavorites.page * searchFavorites.limit, total)} of {total} favorites
									</Typography>
									<Pagination
										count={Math.ceil(total / searchFavorites.limit)}
										page={searchFavorites.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
										sx={{
											'& .MuiPaginationItem-root.Mui-selected': {
												backgroundColor: '#E92C28',
												color: '#ffffff',
												'&:hover': {
													backgroundColor: '#C62828',
												},
											},
										}}
									/>
								</Stack>
							</CardContent>
						</Card>
					</>
				) : (
					<Card>
						<CardContent sx={{ p: 6, textAlign: 'center' }}>
							<Box
								sx={{
									width: 120,
									height: 120,
									margin: '0 auto 24px',
									borderRadius: '50%',
									backgroundColor: 'rgba(233, 44, 40, 0.1)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<FavoriteIcon sx={{ fontSize: 60, color: '#E92C28' }} />
							</Box>
							<Typography variant={'h6'} sx={{ fontWeight: 600, mb: 1, color: '#181a20' }}>
								No Favorites Found
							</Typography>
							<Typography variant={'body2'} sx={{ color: '#717171' }}>
								You haven't added any products to your favorites yet.
							</Typography>
						</CardContent>
					</Card>
				)}
			</Box>
		);
	}
};

export default MyFavorites;
