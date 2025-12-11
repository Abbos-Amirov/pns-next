import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Menu, MenuItem, Pagination, Stack, Typography, IconButton } from '@mui/material';
import CityCard from '../../libs/components/city/CityCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/city/Filter';
import { useRouter } from 'next/router';
import { LocationsInquiry } from '../../libs/types/location/location.input';
import { Location } from '../../libs/types/location/location';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { Direction } from '../../libs/enums/common.enum';
import { useQuery } from '@apollo/client';
import { GET_LOCATIONS } from '../../apollo/user/query';
import { sweetErrorHandling } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CityList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<LocationsInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [cities, setCities] = useState<Location[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('Featured');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

	/** APOLLO REQUESTS **/
	const { data: locationsData, loading, error, refetch } = useQuery(GET_LOCATIONS, {
		variables: {
			input: {
				page: searchFilter.page || 1,
				limit: searchFilter.limit || 10,
				sort: searchFilter.sort || 'createdAt',
				direction: searchFilter.direction || Direction.DESC,
				search: searchFilter.search || {},
			},
		},
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		onCompleted: (data) => {
			if (data?.getLocations) {
				const locations = data.getLocations.list || [];
				setCities(locations);
				
				const metaCounter = data.getLocations.metaCounter;
				const totalCount = Array.isArray(metaCounter) 
					? (metaCounter[0]?.total || 0)
					: (metaCounter?.total || 0);
				setTotal(totalCount);
			}
		},
		onError: (err) => {
			console.error('GetLocations Query Error:', err);
			sweetErrorHandling(err).then();
		},
	});


	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			const inputObj = JSON.parse(router?.query?.input as string);
			setSearchFilter(inputObj);
		}

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	useEffect(() => {
		// Refetch when searchFilter changes
		if (refetch) {
			refetch({
				input: {
					page: searchFilter.page || 1,
					limit: searchFilter.limit || 10,
					sort: searchFilter.sort || 'createdAt',
					direction: searchFilter.direction || Direction.DESC,
					search: searchFilter.search || {},
				},
			});
		}
	}, [searchFilter, refetch]);

	/** HANDLERS **/
	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(
			`/city?input=${JSON.stringify(searchFilter)}`,
			`/city?input=${JSON.stringify(searchFilter)}`,
			{
				scroll: false,
			},
		);
		setCurrentPage(value);
	};

	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		switch (e.currentTarget.id) {
			case 'featured':
				setSearchFilter({ ...searchFilter, sort: 'locationLikes', direction: Direction.DESC });
				setFilterSortName('Featured');
				break;
			case 'best_selling':
				setSearchFilter({ ...searchFilter, sort: 'locationViews', direction: Direction.DESC });
				setFilterSortName('Best selling');
				break;
			case 'alphabetical_az':
				setSearchFilter({ ...searchFilter, sort: 'locationName', direction: Direction.ASC });
				setFilterSortName('Alphabetically, A-Z');
				break;
			case 'alphabetical_za':
				setSearchFilter({ ...searchFilter, sort: 'locationName', direction: Direction.DESC });
				setFilterSortName('Alphabetically, Z-A');
				break;
			case 'price_low_high':
				setSearchFilter({ ...searchFilter, sort: 'locationLikes', direction: Direction.ASC });
				setFilterSortName('Likes, low to high');
				break;
			case 'price_high_low':
				setSearchFilter({ ...searchFilter, sort: 'locationLikes', direction: Direction.DESC });
				setFilterSortName('Likes, high to low');
				break;
			case 'date_old_new':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: Direction.ASC });
				setFilterSortName('Date, old to new');
				break;
			case 'date_new_old':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: Direction.DESC });
				setFilterSortName('Date, new to old');
				break;
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	if (device === 'mobile') {
		return <h1>CITIES MOBILE</h1>;
	} else {
		return (
			<div id="city-list-page" style={{ position: 'relative' }}>
				<div className="container">
					<Box component={'div'} className={'top-controls'}>
						<Stack className={'view-toggle'}>
							<span>Category</span>
							<Stack className={'toggle-buttons'}>
								<IconButton
									className={viewMode === 'grid' ? 'active' : ''}
									onClick={() => setViewMode('grid')}
								>
									<GridViewIcon />
								</IconButton>
								<IconButton
									className={viewMode === 'list' ? 'active' : ''}
									onClick={() => setViewMode('list')}
								>
									<ViewListIcon />
								</IconButton>
							</Stack>
						</Stack>
						<Box component={'div'} className={'sort-controls'}>
							<span>Sort by</span>
							<div>
								<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
									{filterSortName}
								</Button>
								<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler} sx={{ paddingTop: '5px' }}>
									<MenuItem onClick={sortingHandler} id={'featured'} disableRipple>
										Featured
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'best_selling'} disableRipple>
										Best selling
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'alphabetical_az'} disableRipple>
										Alphabetically, A-Z
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'alphabetical_za'} disableRipple>
										Alphabetically, Z-A
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'price_low_high'} disableRipple>
										Price, low to high
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'price_high_low'} disableRipple>
										Price, high to low
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'date_old_new'} disableRipple>
										Date, old to new
									</MenuItem>
									<MenuItem onClick={sortingHandler} id={'date_new_old'} disableRipple>
										Date, new to old
									</MenuItem>
								</Menu>
							</div>
						</Box>
					</Box>
					<Stack className={'city-page'}>
						<Stack className={'filter-config'}>
							{/* @ts-ignore */}
							<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
						</Stack>
						<Stack className="main-config" mb={'76px'}>
							<Stack className={`list-config ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
							{loading ? (
								<div className={'no-data'}>
									<Typography>Loading locations...</Typography>
								</div>
							) : error ? (
								<div className={'no-data'}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<Typography color={'error'}>Error loading locations: {error.message}</Typography>
								</div>
							) : cities?.length === 0 ? (
								<div className={'no-data'}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<p>No Locations found!</p>
								</div>
							) : (
								cities.map((city: Location) => {
									return <CityCard city={city} key={city?._id} />;
								})
							)}
							</Stack>
							<Stack className="pagination-config">
								{cities.length !== 0 && (
									<Stack className="pagination-box">
										<Pagination
											page={currentPage}
											count={Math.ceil(total / searchFilter.limit)}
											onChange={handlePaginationChange}
											shape="circular"
											color="primary"
										/>
									</Stack>
								)}

								{cities.length !== 0 && (
									<Stack className="total-result">
										<Typography>
											Total {total} cit{total > 1 ? 'ies' : 'y'} available
										</Typography>
									</Stack>
								)}
							</Stack>
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
};

CityList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	},
};

export default withLayoutBasic(CityList);

