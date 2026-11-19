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
import { LocationCity } from '../../libs/enums/location-city.enum';

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
	const [filterSortName, setFilterSortName] = useState('All Cities');
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
			const inputObj = JSON.parse(router.query.input as string);
			setSearchFilter(inputObj);
			setCurrentPage(inputObj?.page === undefined ? 1 : inputObj.page);
		} else {
			setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.query.input]);

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
		// City filter via backend text search (LocationsSearch supports only `text`)
		const id = e.currentTarget.id;

		if (id === 'all_cities') {
			const nextFilter = {
				...searchFilter,
				page: 1,
				search: { ...(searchFilter.search || {}), text: '' },
			};
			setSearchFilter(nextFilter);
			setFilterSortName('All Cities');
			router.push(`/city?input=${JSON.stringify(nextFilter)}`, `/city?input=${JSON.stringify(nextFilter)}`, { scroll: false });
		} else {
			const city = id as LocationCity;
			const nextFilter = {
				...searchFilter,
				page: 1,
				search: { ...(searchFilter.search || {}), text: city },
			};
			setSearchFilter(nextFilter);
			setFilterSortName(city);
			router.push(`/city?input=${JSON.stringify(nextFilter)}`, `/city?input=${JSON.stringify(nextFilter)}`, { scroll: false });
		}

		setSortingOpen(false);
		setAnchorEl(null);
	};

	if (device === 'mobile') {
		return (
			<Stack className="mobile-city-page">
				<Stack className="mobile-section-head">
					<span className="mobile-eyebrow">Explore PNSWINDOW</span>
					<h2 className="mobile-title">Our City Locations</h2>
					<p className="mobile-subtitle">Find a PNSWINDOW showroom or service point near you</p>
				</Stack>

				<Stack className="mobile-city-filterbar" direction="row">
					<Button
						className="mobile-city-filter-btn"
						onClick={sortingClickHandler}
						endIcon={<KeyboardArrowDownRoundedIcon />}
					>
						{filterSortName}
					</Button>
					<Menu
						anchorEl={anchorEl}
						open={sortingOpen}
						onClose={sortingCloseHandler}
						className="mobile-city-menu"
					>
						<MenuItem onClick={sortingHandler} id={'all_cities'} disableRipple>
							All Cities
						</MenuItem>
						{Object.values(LocationCity).map((city) => (
							<MenuItem key={city} onClick={sortingHandler} id={city} disableRipple>
								{city}
							</MenuItem>
						))}
					</Menu>
				</Stack>

				<Stack className="mobile-city-list">
					{loading ? (
						<Stack className="mobile-city-empty">
							<Typography>Loading locations...</Typography>
						</Stack>
					) : error ? (
						<Stack className="mobile-city-empty">
							<img src="/img/icons/icoAlert.svg" alt="" />
							<Typography>Error loading locations: {error.message}</Typography>
						</Stack>
					) : cities?.length === 0 ? (
						<Stack className="mobile-city-empty">
							<img src="/img/icons/icoAlert.svg" alt="" />
							<Typography>No locations found!</Typography>
						</Stack>
					) : (
						cities.map((city: Location) => <CityCard city={city} key={city?._id} />)
					)}
				</Stack>

				{cities.length !== 0 && (
					<Stack className="mobile-city-pagination">
						<Pagination
							page={currentPage}
							count={Math.ceil(total / searchFilter.limit)}
							onChange={handlePaginationChange}
							shape="circular"
							color="primary"
						/>
						<Typography className="mobile-city-total">
							Total {total} cit{total > 1 ? 'ies' : 'y'} available
						</Typography>
					</Stack>
				)}
			</Stack>
		);
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
							<span>City</span>
							<div>
								<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
									{filterSortName}
								</Button>
								<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler} sx={{ paddingTop: '5px' }}>
									<MenuItem onClick={sortingHandler} id={'all_cities'} disableRipple>
										All Cities
									</MenuItem>
									{Object.values(LocationCity).map((city) => (
										<MenuItem key={city} onClick={sortingHandler} id={city} disableRipple>
											{city}
										</MenuItem>
									))}
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

