import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography, Box, Card, CardContent, Grid } from '@mui/material';
import PropertyCard from '../property/PropertyCard';
import { Product } from '../../types/product/property';
import { T } from '../../types/common';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useQuery } from '@apollo/client';
import { GET_VISITED } from '../../../apollo/user/query';
import { sweetErrorHandling } from '../../sweetAlert';

interface OrdinaryInquiry {
	page: number;
	limit: number;
}

const RecentlyVisited: NextPage = () => {
	const device = useDeviceDetect();
	const [recentlyVisited, setRecentlyVisited] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchVisited, setSearchVisited] = useState<OrdinaryInquiry>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/
	const { data: visitedData, loading, error, refetch } = useQuery(GET_VISITED, {
		variables: { 
			input: {
				page: searchVisited.page,
				limit: searchVisited.limit,
			}
		},
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		skip: !searchVisited.page || !searchVisited.limit,
		onError: (err) => {
			console.error('Visited Query Error:', err);
			console.error('Query Variables:', { input: { page: searchVisited.page, limit: searchVisited.limit } });
			sweetErrorHandling(err).then();
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (visitedData?.getVisited) {
			const products: Product[] = visitedData.getVisited.list || [];
			setRecentlyVisited(products);
			
			const metaCounter = visitedData.getVisited.metaCounter;
			const totalCount = Array.isArray(metaCounter) 
				? (metaCounter[0]?.total || 0)
				: (metaCounter?.total || 0);
			setTotal(totalCount);
		}
	}, [visitedData]);

	useEffect(() => {
		refetch();
	}, [searchVisited, refetch]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchVisited({ ...searchVisited, page: value });
	};

	if (device === 'mobile') {
		return <div>RECENTLY VISITED MOBILE</div>;
	} else {
		return (
			<Box component={'div'} className={'recently-visited-page'}>
				{/* Header Section */}
				<Card className={'visited-header-card'} sx={{ mb: 3 }}>
					<CardContent>
						<Stack direction={'row'} alignItems={'center'} spacing={2}>
							<Box
								sx={{
									width: 56,
									height: 56,
									borderRadius: '12px',
									backgroundColor: 'rgba(139, 69, 19, 0.1)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#8B4513',
								}}
							>
								<VisibilityIcon sx={{ fontSize: 32 }} />
							</Box>
							<Box>
								<Typography variant={'h4'} className={'page-title'} sx={{ fontWeight: 700, mb: 0.5 }}>
									Recently Visited
								</Typography>
								<Typography variant={'body2'} sx={{ color: '#717171' }}>
									We are glad to see you again!
								</Typography>
							</Box>
							<Box sx={{ flex: 1 }} />
							<Box
								sx={{
									padding: '8px 16px',
									borderRadius: '12px',
									backgroundColor: 'rgba(139, 69, 19, 0.1)',
									color: '#8B4513',
									fontWeight: 600,
									fontSize: '14px',
								}}
							>
								Total: {total}
							</Box>
						</Stack>
					</CardContent>
				</Card>

				{/* Visited List */}
				{loading ? (
					<Card>
						<CardContent sx={{ p: 4, textAlign: 'center' }}>
							<Typography variant={'body2'} sx={{ color: '#717171' }}>
								Loading recently visited...
							</Typography>
						</CardContent>
					</Card>
				) : error ? (
					<Card>
						<CardContent sx={{ p: 4, textAlign: 'center' }}>
							<Typography variant={'body2'} color={'error'}>
								Error loading recently visited: {error.message}
							</Typography>
						</CardContent>
					</Card>
				) : recentlyVisited?.length > 0 ? (
					<>
						<Grid container spacing={3} sx={{ mb: 3 }}>
							{recentlyVisited.map((product: Product) => (
								<Grid item xs={12} sm={6} md={4} lg={4} key={product._id}>
									<PropertyCard property={product} recentlyVisited={true} />
								</Grid>
							))}
						</Grid>

						{/* Pagination */}
						<Card>
							<CardContent>
								<Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
									<Typography variant={'body2'} sx={{ color: '#717171' }}>
										Showing {((searchVisited.page - 1) * searchVisited.limit) + 1} to{' '}
										{Math.min(searchVisited.page * searchVisited.limit, total)} of {total} recently visited
									</Typography>
									<Pagination
										count={Math.ceil(total / searchVisited.limit)}
										page={searchVisited.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
										sx={{
											'& .MuiPaginationItem-root.Mui-selected': {
												backgroundColor: '#8B4513',
												color: '#ffffff',
												'&:hover': {
													backgroundColor: '#6B3410',
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
									backgroundColor: 'rgba(139, 69, 19, 0.1)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<VisibilityIcon sx={{ fontSize: 60, color: '#8B4513' }} />
							</Box>
							<Typography variant={'h6'} sx={{ fontWeight: 600, mb: 1, color: '#181a20' }}>
								No Recently Visited Found
							</Typography>
							<Typography variant={'body2'} sx={{ color: '#717171' }}>
								You haven't visited any products yet.
							</Typography>
						</CardContent>
					</Card>
				)}
			</Box>
		);
	}
};

export default RecentlyVisited;
