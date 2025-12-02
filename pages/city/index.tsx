import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Menu, MenuItem, Pagination, Stack, Typography, IconButton } from '@mui/material';
import CityCard from '../../libs/components/city/CityCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/city/Filter';
import { useRouter } from 'next/router';
import { PropertiesInquiry } from '../../libs/types/product/property.input';
import { Property } from '../../libs/types/product/property';
import { PropertyType, PropertyLocation, PropertyStatus } from '../../libs/enums/property.enum';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { Direction } from '../../libs/enums/common.enum';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CityList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [cities, setCities] = useState<Property[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('Featured');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

	// Test data for cities (hard coded)
	const testCities: Property[] = [
		{
			_id: '1',
			propertyTitle: 'Seoul City',
			propertyType: PropertyType.APARTMENT,
			propertyLocation: PropertyLocation.SEOUL,
			propertyAddress: '123 Main Street',
			propertyPrice: 320,
			propertySquare: 25,
			propertyBeds: 2,
			propertyRooms: 3,
			propertyViews: 150,
			propertyLikes: 45,
			propertyRank: 5,
			propertyImages: ['/img/property/window.jpg'],
			propertyDesc: 'Modern city with triple glazing',
			propertyBarter: false,
			propertyRent: true,
			propertyStatus: PropertyStatus.ACTIVE,
			memberId: 'member1',
			createdAt: new Date(),
			updatedAt: new Date(),
		} as Property,
		{
			_id: '2',
			propertyTitle: 'Busan City',
			propertyType: PropertyType.VILLA,
			propertyLocation: PropertyLocation.BUSAN,
			propertyAddress: '456 Ocean Road',
			propertyPrice: 280,
			propertySquare: 30,
			propertyBeds: 3,
			propertyRooms: 4,
			propertyViews: 200,
			propertyLikes: 60,
			propertyRank: 4,
			propertyImages: ['/img/property/window1.jpg'],
			propertyDesc: 'Energy efficient city system',
			propertyBarter: true,
			propertyRent: false,
			propertyStatus: PropertyStatus.ACTIVE,
			memberId: 'member2',
			createdAt: new Date(),
			updatedAt: new Date(),
		} as Property,
		{
			_id: '3',
			propertyTitle: 'Incheon City',
			propertyType: PropertyType.HOUSE,
			propertyLocation: PropertyLocation.INCHEON,
			propertyAddress: '789 Harbor Avenue',
			propertyPrice: 450,
			propertySquare: 20,
			propertyBeds: 1,
			propertyRooms: 2,
			propertyViews: 180,
			propertyLikes: 55,
			propertyRank: 5,
			propertyImages: ['/img/property/window2.jpg'],
			propertyDesc: 'Durable city with security features',
			propertyBarter: false,
			propertyRent: true,
			propertyStatus: PropertyStatus.ACTIVE,
			memberId: 'member3',
			createdAt: new Date(),
			updatedAt: new Date(),
		} as Property,
		{
			_id: '4',
			propertyTitle: 'Daegu City',
			propertyType: PropertyType.APARTMENT,
			propertyLocation: PropertyLocation.DAEGU,
			propertyAddress: '321 Mountain View',
			propertyPrice: 380,
			propertySquare: 28,
			propertyBeds: 2,
			propertyRooms: 3,
			propertyViews: 120,
			propertyLikes: 40,
			propertyRank: 3,
			propertyImages: ['/img/property/window3.jpg'],
			propertyDesc: 'Eco-friendly city',
			propertyBarter: true,
			propertyRent: true,
			propertyStatus: PropertyStatus.ACTIVE,
			memberId: 'member4',
			createdAt: new Date(),
			updatedAt: new Date(),
		} as Property,
		{
			_id: '5',
			propertyTitle: 'Gwangju City',
			propertyType: PropertyType.VILLA,
			propertyLocation: PropertyLocation.GWANGJU,
			propertyAddress: '654 Tech Park',
			propertyPrice: 420,
			propertySquare: 35,
			propertyBeds: 4,
			propertyRooms: 5,
			propertyViews: 250,
			propertyLikes: 75,
			propertyRank: 5,
			propertyImages: ['/img/property/window4.jpg'],
			propertyDesc: 'Advanced city system',
			propertyBarter: false,
			propertyRent: false,
			propertyStatus: PropertyStatus.ACTIVE,
			memberId: 'member5',
			createdAt: new Date(),
			updatedAt: new Date(),
		} as Property,
		{
			_id: '6',
			propertyTitle: 'Ulsan City',
			propertyType: PropertyType.HOUSE,
			propertyLocation: PropertyLocation.SEOUL,
			propertyAddress: '987 Luxury Lane',
			propertyPrice: 550,
			propertySquare: 40,
			propertyBeds: 5,
			propertyRooms: 6,
			propertyViews: 300,
			propertyLikes: 90,
			propertyRank: 5,
			propertyImages: ['/img/property/window.jpg'],
			propertyDesc: 'Premium city with advanced features',
			propertyBarter: true,
			propertyRent: true,
			propertyStatus: PropertyStatus.ACTIVE,
			memberId: 'member6',
			createdAt: new Date(),
			updatedAt: new Date(),
		} as Property,
		{
			_id: '7',
			propertyTitle: 'Daejeon City',
			propertyType: PropertyType.APARTMENT,
			propertyLocation: PropertyLocation.BUSAN,
			propertyAddress: '111 Coastal Drive',
			propertyPrice: 390,
			propertySquare: 32,
			propertyBeds: 3,
			propertyRooms: 4,
			propertyViews: 175,
			propertyLikes: 52,
			propertyRank: 4,
			propertyImages: ['/img/property/window1.jpg'],
			propertyDesc: 'Modern city with energy efficient design',
			propertyBarter: true,
			propertyRent: true,
			propertyStatus: PropertyStatus.ACTIVE,
			memberId: 'member7',
			createdAt: new Date(),
			updatedAt: new Date(),
		} as Property,
		{
			_id: '8',
			propertyTitle: 'Gyeongju City',
			propertyType: PropertyType.VILLA,
			propertyLocation: PropertyLocation.INCHEON,
			propertyAddress: '222 Heritage Street',
			propertyPrice: 480,
			propertySquare: 22,
			propertyBeds: 2,
			propertyRooms: 3,
			propertyViews: 210,
			propertyLikes: 65,
			propertyRank: 5,
			propertyImages: ['/img/property/window2.jpg'],
			propertyDesc: 'Classic city with traditional craftsmanship',
			propertyBarter: false,
			propertyRent: true,
			propertyStatus: PropertyStatus.ACTIVE,
			memberId: 'member8',
			createdAt: new Date(),
			updatedAt: new Date(),
		} as Property,
		{
			_id: '9',
			propertyTitle: 'Jeonju City',
			propertyType: PropertyType.HOUSE,
			propertyLocation: PropertyLocation.DAEGU,
			propertyAddress: '333 Innovation Road',
			propertyPrice: 520,
			propertySquare: 38,
			propertyBeds: 4,
			propertyRooms: 5,
			propertyViews: 280,
			propertyLikes: 85,
			propertyRank: 5,
			propertyImages: ['/img/property/window3.jpg'],
			propertyDesc: 'Smart city with automated features',
			propertyBarter: true,
			propertyRent: false,
			propertyStatus: PropertyStatus.ACTIVE,
			memberId: 'member9',
			createdAt: new Date(),
			updatedAt: new Date(),
		} as Property,
	];

	/** APOLLO REQUESTS **/
	// TODO: Add Apollo query here when backend is ready
	// const { data, loading, error } = useQuery(GET_CITIES, {
	//   variables: { input: searchFilter }
	// });

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			const inputObj = JSON.parse(router?.query?.input as string);
			setSearchFilter(inputObj);
		}

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	useEffect(() => {
		// Set test data for now (remove when backend is connected)
		setCities(testCities);
		setTotal(testCities.length);

		// TODO: When backend is ready, uncomment this:
		// if (data?.getCities) {
		//   setCities(data.getCities.list);
		//   setTotal(data.getCities.metaCounter.total);
		// }
	}, [searchFilter]);

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
				setSearchFilter({ ...searchFilter, sort: 'propertyRank', direction: Direction.DESC });
				setFilterSortName('Featured');
				break;
			case 'best_selling':
				setSearchFilter({ ...searchFilter, sort: 'propertyViews', direction: Direction.DESC });
				setFilterSortName('Best selling');
				break;
			case 'alphabetical_az':
				setSearchFilter({ ...searchFilter, sort: 'propertyTitle', direction: Direction.ASC });
				setFilterSortName('Alphabetically, A-Z');
				break;
			case 'alphabetical_za':
				setSearchFilter({ ...searchFilter, sort: 'propertyTitle', direction: Direction.DESC });
				setFilterSortName('Alphabetically, Z-A');
				break;
			case 'price_low_high':
				setSearchFilter({ ...searchFilter, sort: 'propertyPrice', direction: Direction.ASC });
				setFilterSortName('Price, low to high');
				break;
			case 'price_high_low':
				setSearchFilter({ ...searchFilter, sort: 'propertyPrice', direction: Direction.DESC });
				setFilterSortName('Price, high to low');
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
							{cities?.length === 0 ? (
								<div className={'no-data'}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<p>No Cities found!</p>
								</div>
							) : (
								cities
									.slice((currentPage - 1) * searchFilter.limit, currentPage * searchFilter.limit)
									.map((city: Property) => {
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
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			squaresRange: {
				start: 0,
				end: 500,
			},
			pricesRange: {
				start: 0,
				end: 2000000,
			},
		},
	},
};

export default withLayoutBasic(CityList);

