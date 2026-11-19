import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography, Box, Card, CardContent, Grid } from '@mui/material';
import PropertyCard from '../property/PropertyCard';
import { Product } from '../../types/product/property';
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
	const [myFavorites, setMyFavorites] = useState<Product[]>([]);
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
			const products: Product[] = favoritesData.getFavorites.list || [];
			setMyFavorites(products);
			
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
		return (
			<Stack className={'mobile-myfavorites-page'}>
				<Stack className={'mobile-mypage-tab-header'}>
					<Typography className={'mobile-mypage-tab-title'}>My Favorites</Typography>
					{total > 0 && <Typography className={'mobile-mypage-tab-count'}>{total}</Typography>}
				</Stack>
				{loading ? (
					<Stack className={'mobile-empty-state'}>
						<Typography>Loading favorites...</Typography>
					</Stack>
				) : error ? (
					<Stack className={'mobile-empty-state'}>
						<Typography>Error loading favorites</Typography>
					</Stack>
				) : myFavorites?.length > 0 ? (
					<>
						<Stack className={'mobile-product-list'}>
							{myFavorites.map((product: Product) => {
								const imagePath = product.productImages?.[0]
									? `${process.env.REACT_APP_API_URL}/${product.productImages[0]}`
									: '/img/property/window.jpg';
								return (
									<div className={'mobile-product-card'} key={product._id}>
										<div className={'mobile-product-card-img'} style={{ backgroundImage: `url(${imagePath})` }}>
											<FavoriteIcon className={'mobile-product-card-fav'} />
										</div>
										<div className={'mobile-product-card-body'}>
											<Typography className={'mobile-product-card-title'}>{product.productTitle}</Typography>
											<Typography className={'mobile-product-card-address'}>{product.productAddress}</Typography>
											<Typography className={'mobile-product-card-price'}>${product.productPrice?.toLocaleString()}</Typography>
										</div>
									</div>
								);
							})}
						</Stack>
						<Stack className={'mobile-pagination'}>
							<Pagination
								count={Math.ceil(total / searchFavorites.limit)}
								page={searchFavorites.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
					</>
				) : (
					<Stack className={'mobile-empty-state'}>
						<FavoriteIcon />
						<Typography>No Favorites Found</Typography>
						<Typography className={'mobile-empty-hint'}>You haven't added any products to your favorites yet.</Typography>
					</Stack>
				)}
			</Stack>
		);
	} else {
		return (
			<Box component={'div'} className={'my-favorites-page'}>
				{/* Header Section */}
				<Card className={'favorites-header-card'} sx={{ mb: 3 }}>
					<CardContent>
						<Stack direction={'row'} alignItems={'center'} spacing={2}>
							<div
								style={{
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
							</div>
							<div>
								<Typography variant={'h4'} className={'page-title'} sx={{ fontWeight: 700, mb: 0.5 }}>
									My Favorites
								</Typography>
								<Typography variant={'body2'} sx={{ color: '#717171' }}>
									Your saved favorite products
								</Typography>
							</div>
							<div style={{ flex: 1 }} />
							<div
								style={{
									padding: '8px 16px',
									borderRadius: '12px',
									backgroundColor: 'rgba(233, 44, 40, 0.1)',
									color: '#E92C28',
									fontWeight: 600,
									fontSize: '14px',
								}}
							>
								Total: {total}
							</div>
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
							{myFavorites.map((product: Product) => (
								<Grid item xs={12} sm={6} md={4} lg={4} key={product._id}>
									<PropertyCard property={product} myFavorites={true} />
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
							<div
								style={{
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
							</div>
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
