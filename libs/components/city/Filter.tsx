import React, { useCallback, useState, ChangeEvent, useEffect, useRef } from 'react';
import { Stack, Typography, Box, IconButton, RadioGroup, FormControlLabel, Radio, TextField, InputAdornment } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PropertyType } from '../../enums/property.enum';
import { PropertiesInquiry } from '../../types/property/property.input';
import { useRouter } from 'next/router';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SearchIcon from '@mui/icons-material/Search';

interface FilterType {
	searchFilter: PropertiesInquiry;
	setSearchFilter: any;
	initialInput: PropertiesInquiry;
}

const Filter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const [propertyType] = useState<PropertyType[]>(Object.values(PropertyType));
	const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
	const [hotDealsIndex, setHotDealsIndex] = useState<number>(0);
	const [searchText, setSearchText] = useState<string>(searchFilter?.search?.text || '');
	const [minPrice, setMinPrice] = useState<string>(searchFilter?.search?.pricesRange?.start?.toString() || '');
	const [maxPrice, setMaxPrice] = useState<string>(searchFilter?.search?.pricesRange?.end?.toString() || '');
	const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const priceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	/** HANDLERS **/
	const propertyTypeSelectHandler = useCallback(
		async (type: string) => {
			try {
				const isSelected = (searchFilter?.search?.typeList || []).includes(type as PropertyType);
				if (isSelected) {
					await router.push(
						`/city?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								typeList: searchFilter?.search?.typeList?.filter((item: string) => item !== type),
							},
						})}`,
						`/city?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								typeList: searchFilter?.search?.typeList?.filter((item: string) => item !== type),
							},
						})}`,
						{ scroll: false },
					);
				} else {
					await router.push(
						`/city?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, typeList: [...(searchFilter?.search?.typeList || []), type] },
						})}`,
						`/city?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, typeList: [...(searchFilter?.search?.typeList || []), type] },
						})}`,
						{ scroll: false },
					);
				}
			} catch (err: any) {
				console.log('ERROR, propertyTypeSelectHandler:', err);
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
			setMinPrice('');
			setMaxPrice('');
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
		if (searchFilter?.search?.text !== undefined) {
			setSearchText(searchFilter.search.text || '');
		}
		if (searchFilter?.search?.pricesRange) {
			const start = searchFilter.search.pricesRange.start;
			const end = searchFilter.search.pricesRange.end;
			setMinPrice(start !== undefined && start !== 0 ? start.toString() : '');
			setMaxPrice(end !== undefined && end !== 2000000 ? end.toString() : '');
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
			if (priceTimeoutRef.current) {
				clearTimeout(priceTimeoutRef.current);
			}
		};
	}, []);

	const priceRangeHandler = useCallback(
		async (min: string, max: string) => {
			try {
				const minNum = min === '' ? 0 : parseInt(min) || 0;
				const maxNum = max === '' ? 2000000 : parseInt(max) || 2000000;
				
				await router.push(
					`/city?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							pricesRange: { start: minNum, end: maxNum },
						},
					})}`,
					`/city?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							pricesRange: { start: minNum, end: maxNum },
						},
					})}`,
					{ scroll: false },
				);
			} catch (err: any) {
				console.log('ERROR, priceRangeHandler:', err);
			}
		},
		[searchFilter, router],
	);

	const handleMinPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setMinPrice(value);
		
		// Clear previous timeout
		if (priceTimeoutRef.current) {
			clearTimeout(priceTimeoutRef.current);
		}
		
		// Set new timeout for debounce
		priceTimeoutRef.current = setTimeout(() => {
			priceRangeHandler(value, maxPrice);
		}, 500);
	};

	const handleMaxPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setMaxPrice(value);
		
		// Clear previous timeout
		if (priceTimeoutRef.current) {
			clearTimeout(priceTimeoutRef.current);
		}
		
		// Set new timeout for debounce
		priceTimeoutRef.current = setTimeout(() => {
			priceRangeHandler(minPrice, value);
		}, 500);
	};

	// Mock hot deals data - bu keyinchalik backenddan keladi
	const hotDeals = [
		{
			id: '1',
			name: 'cities',
			image: '/img/property/window2.jpg',
			price: 210,
			oldPrice: 250,
			savePercent: 16,
		},
		{
			id: '2',
			name: 'cities',
			image: '/img/property/window1.jpg',
			price: 320,
			oldPrice: 380,
			savePercent: 16,
		},
		{
			id: '3',
			name: 'cities',
			image: '/img/property/window.jpg',
			price: 280,
			oldPrice: 330,
			savePercent: 15,
		},

			
	];

	// Category list - APARTMENT, VILLA, HOUSE
	const categories = ['Aluminum Frame', 'PVC Window', 'Steel / Iron Door','Wooden / Thermowood', 'Aluminum Hybrid'];

	if (device === 'mobile') {
		return <div>CITIES FILTER</div>;
	} else {
		return (
			<Stack className={'filter-main'}>

<Stack className={'filter-section'} mb={'30px'}>

	{/* Search Section */}
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



					{/* Price Range Section */}
				</Stack>

				<Stack className={'filter-section'} mb={'30px'}>
					<Box component={'div'} className={'section-header'}>
						<Typography style={{color: "#ffffff"}}>Price Range</Typography>
					</Box>
					<Stack className={'price-range-content'}>
						<Stack className={'price-inputs'} direction={'row'} gap={'12px'}>
							<TextField
								type="number"
								placeholder="Min Price"
								value={minPrice}
								onChange={handleMinPriceChange}
								InputProps={{
									startAdornment: <InputAdornment position="start">$</InputAdornment>,
								}}
								className={'price-input'}
								inputProps={{
									min: 0,
									step: 1,
								}}
							/>
							<TextField
								type="number"
								placeholder="Max Price"
								value={maxPrice}
								onChange={handleMaxPriceChange}
								InputProps={{
									startAdornment: <InputAdornment position="start">$</InputAdornment>,
								}}
								className={'price-input'}
								inputProps={{
									min: 0,
									step: 1,
								}}
							/>
						</Stack>
					</Stack>
				</Stack>
				{/* Category Section */}
				<Stack className={'filter-section'} mb={'30px'}>
					<Box component={'div'} className={'section-header'}>
						<Typography style={{color: "#ffffff"}}>Category</Typography>
					</Box>
					<Stack className={'category-list'}>
						{categories.map((category: string) => {
							const isSelected = (searchFilter?.search?.typeList || []).some(
								(type: string) => type.toUpperCase() === category,
							);
							return (
								<Stack
									className={`category-item ${isSelected ? 'selected' : ''}`}
									key={category}
										onClick={() => {
										// Find matching PropertyType
										const matchingType = propertyType.find((t) => t.toUpperCase() === category);
										if (matchingType) {
											propertyTypeSelectHandler(matchingType);
										}
									}}
								>
									<Typography>{category}</Typography>
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
									<Box component={'div'} className={'sale-badge-small'}>
										<Typography>Sale</Typography>
									</Box>
									<Box component={'div'} className={'save-badge-small'}>
										<Typography>Save {hotDeals[hotDealsIndex]?.savePercent}%</Typography>
									</Box>
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

				{/* Search Section */}
				
				{/* Price Range Section */}
				

				{/* Availability Filter */}
				<Stack className={'filter-section'}>
					<Box component={'div'} className={'section-header'}>
						<Typography style={{color: "#ffffff"}}>Availability</Typography>
					</Box>
					<Stack className={'availability-content'}>
						<RadioGroup
							value={availabilityFilter}
							onChange={(e) => availabilityHandler(e.target.value)}
							className={'availability-radio-group'}
						>
							<FormControlLabel value="all" control={<Radio />} label="All" />
							<FormControlLabel value="in_stock" control={<Radio />} label="In stock (5)" />
							<FormControlLabel value="out_of_stock" control={<Radio />} label="Out of stock (1)" />
						</RadioGroup>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Filter;

