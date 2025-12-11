import React, { useCallback, useState, ChangeEvent, useEffect, useRef } from 'react';
import { Stack, Typography, Box, IconButton, RadioGroup, FormControlLabel, Radio, TextField, InputAdornment } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PropertyType } from '../../enums/property.enum';
import { LocationsInquiry } from '../../types/location/location.input';
import { useRouter } from 'next/router';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SearchIcon from '@mui/icons-material/Search';

interface FilterType {
	searchFilter: LocationsInquiry;
	setSearchFilter: any;
	initialInput: LocationsInquiry;
}

const Filter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
	const [hotDealsIndex, setHotDealsIndex] = useState<number>(0);
	const [searchText, setSearchText] = useState<string>('');
	const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	/** HANDLERS **/
	const categorySelectHandler = useCallback(
		async (category: PropertyType) => {
			try {
				const currentTypeList = (searchFilter?.search as any)?.typeList || [];
				const isSelected = currentTypeList.includes(category);
				
				const newTypeList = isSelected
					? currentTypeList.filter((item: PropertyType) => item !== category)
					: [...currentTypeList, category];
				
				await router.push(
					`/city?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							typeList: newTypeList,
						},
					})}`,
					`/city?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							typeList: newTypeList,
						},
					})}`,
					{ scroll: false },
				);
			} catch (err: any) {
				console.log('ERROR, categorySelectHandler:', err);
			}
		},
		[searchFilter, router],
	);

	const availabilityHandler = useCallback(
		async (value: string) => {
			try {
				setAvailabilityFilter(value);
				await router.push(
					`/city?input=${JSON.stringify({
						...searchFilter,
						search: { ...searchFilter.search, availability: value },
					})}`,
					`/city?input=${JSON.stringify({
						...searchFilter,
						search: { ...searchFilter.search, availability: value },
					})}`,
					{ scroll: false },
				);
			} catch (err: any) {
				console.log('ERROR, availabilityHandler:', err);
			}
		},
		[searchFilter, router],
	);

	const refreshHandler = async () => {
		try {
			await router.push(
				`/city?input=${JSON.stringify(initialInput)}`,
				`/city?input=${JSON.stringify(initialInput)}`,
				{ scroll: false },
			);
			setAvailabilityFilter('all');
			setSearchText('');
		} catch (err: any) {
			console.log('ERROR, refreshHandler:', err);
		}
	};

	const searchHandler = useCallback(
		async (text: string) => {
			try {
				await router.push(
					`/city?input=${JSON.stringify({
						...searchFilter,
						search: { ...searchFilter.search, text },
					})}`,
					`/city?input=${JSON.stringify({
						...searchFilter,
						search: { ...searchFilter.search, text },
					})}`,
					{ scroll: false },
				);
			} catch (err: any) {
				console.log('ERROR, searchHandler:', err);
			}
		},
		[searchFilter, router],
	);

	const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchText(value);
		
		// Clear previous timeout
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}
		
		// Set new timeout for debounce
		searchTimeoutRef.current = setTimeout(() => {
			searchHandler(value);
		}, 500);
	};

	// Update state when searchFilter changes
	useEffect(() => {
		if ((searchFilter?.search as any)?.text !== undefined) {
			setSearchText((searchFilter.search as any).text || '');
		}
		if ((searchFilter?.search as any)?.availability) {
			setAvailabilityFilter((searchFilter.search as any).availability);
		}
	}, [searchFilter]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, []);


	// Mock hot deals data - bu keyinchalik backenddan keladi
	const hotDeals = [
		{
			id: '1',
			name: 'locations',
			image: '/img/property/window2.jpg',
			price: 210,
			oldPrice: 250,
			savePercent: 16,
		},
		{
			id: '2',
			name: 'locations',
			image: '/img/property/window1.jpg',
			price: 320,
			oldPrice: 380,
			savePercent: 16,
		},
		{
			id: '3',
			name: 'locations',
			image: '/img/property/window.jpg',
			price: 280,
			oldPrice: 330,
			savePercent: 15,
		},

			
	];

	// Category list - using PropertyType enum values for locations
	const categories: PropertyType[] = [
		PropertyType.HOUSE,
		PropertyType.APARTMENT,
		PropertyType.OFFICE,
		PropertyType.STORE,
		PropertyType.FACTORY,
	];

	// Category display names mapping
	const categoryDisplayNames: Record<PropertyType, string> = {
		[PropertyType.HOUSE]: 'House',
		[PropertyType.APARTMENT]: 'Apartment',
		[PropertyType.VILLA]: 'Villa',
		[PropertyType.OFFICE]: 'Office',
		[PropertyType.STORE]: 'Store',
		[PropertyType.FACTORY]: 'Factory',
	};

	if (device === 'mobile') {
		return <div>CITIES FILTER</div>;
	} else {
		return (
			<Stack className={'filter-main'}>
				{/* Search Section */}
				<Stack className={'filter-section'} mb={'30px'}>
					<Box component={'div'} className={'section-header'}>
						<Typography style={{color: "#ffffff"}}>Search</Typography>
					</Box>
					<Stack className={'search-content'}>
						<TextField
							fullWidth
							placeholder="Search city..."
							value={searchText}
							onChange={handleSearchChange}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon style={{ color: '#8B4513' }} />
									</InputAdornment>
								),
							}}
							className={'search-input'}
						/>
					</Stack>
				</Stack>

				{/* Category Section */}
				<Stack className={'filter-section'} mb={'30px'}>
					<Box component={'div'} className={'section-header'}>
						<Typography style={{color: "#ffffff"}}>Category</Typography>
					</Box>
					<Stack className={'category-list'}>
						{categories.map((category: PropertyType) => {
							const currentTypeList = (searchFilter?.search as any)?.typeList || [];
							const isSelected = currentTypeList.includes(category);
							return (
								<Stack
									className={`category-item ${isSelected ? 'selected' : ''}`}
									key={category}
									onClick={() => categorySelectHandler(category)}
									sx={{ cursor: 'pointer' }}
								>
									<Typography>{categoryDisplayNames[category] || category}</Typography>
								</Stack>
							);
						})}
					</Stack>
				</Stack>

				{/* Hot Deals Section */}
				<Stack className={'filter-section'} mb={'30px'}>
					<Box component={'div'} className={'section-header'}>
						<Typography style={{color: "#ffffff"}}>Hot Deals</Typography>
					</Box>
					{hotDeals.length > 0 && (
						<Stack className={'hot-deals-wrapper'}>
							<Stack className={'hot-deal-card'}>
								<Box component={'div'} className={'hot-deal-image'}>
									<img src={hotDeals[hotDealsIndex]?.image || '/img/banner/header1.svg'} alt={hotDeals[hotDealsIndex]?.name} />
								
								</Box>
								<Stack className={'hot-deal-info'}>
									<Typography className={'hot-deal-name'}>{hotDeals[hotDealsIndex]?.name}</Typography>
									<Stack className={'hot-deal-price'}>
										<Typography className={'current-price'}>${hotDeals[hotDealsIndex]?.price}</Typography>
										<Typography className={'old-price'}>${hotDeals[hotDealsIndex]?.oldPrice}</Typography>
									</Stack>
								</Stack>
							</Stack>
							{hotDeals.length > 1 && (
								<Stack className={'hot-deals-nav'}>
									<IconButton
										className={'nav-btn'}
										onClick={() => setHotDealsIndex((prev) => (prev - 1 + hotDeals.length) % hotDeals.length)}
									>
										<ArrowBackIosNewIcon />
									</IconButton>
									<IconButton
										className={'nav-btn'}
										onClick={() => setHotDealsIndex((prev) => (prev + 1) % hotDeals.length)}
									>
										<ArrowForwardIosIcon />
									</IconButton>
								</Stack>
							)}
						</Stack>
					)}
				</Stack>
			</Stack>
		);
	}
};

export default Filter;

