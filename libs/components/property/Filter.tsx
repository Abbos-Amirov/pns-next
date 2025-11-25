import React, { useCallback, useState } from 'react';
import { Stack, Typography, Box, IconButton, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { PropertyType } from '../../enums/property.enum';
import { PropertiesInquiry } from '../../types/property/property.input';
import { useRouter } from 'next/router';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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

	/** HANDLERS **/
	const propertyTypeSelectHandler = useCallback(
		async (type: string) => {
			try {
				const isSelected = (searchFilter?.search?.typeList || []).includes(type as PropertyType);
				if (isSelected) {
					await router.push(
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								typeList: searchFilter?.search?.typeList?.filter((item: string) => item !== type),
							},
						})}`,
						`/property?input=${JSON.stringify({
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
						`/property?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, typeList: [...(searchFilter?.search?.typeList || []), type] },
						})}`,
						`/property?input=${JSON.stringify({
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
					`/property?input=${JSON.stringify({
						...searchFilter,
						search: { ...searchFilter.search, availability: value },
					})}`,
					`/property?input=${JSON.stringify({
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
				`/property?input=${JSON.stringify(initialInput)}`,
				`/property?input=${JSON.stringify(initialInput)}`,
				{ scroll: false },
			);
			setAvailabilityFilter('all');
		} catch (err: any) {
			console.log('ERROR, refreshHandler:', err);
		}
	};

	// Mock hot deals data - bu keyinchalik backenddan keladi
	const hotDeals = [
		{
			id: '1',
			name: 'windows',
			image: '/img/property/window2.jpg',
			price: 210,
			oldPrice: 250,
			savePercent: 16,
		},
		{
			id: '2',
			name: 'windows',
			image: '/img/property/window1.jpg',
			price: 320,
			oldPrice: 380,
			savePercent: 16,
		},
		{
			id: '3',
			name: 'windows',
			image: '/img/property/window.jpg',
			price: 280,
			oldPrice: 330,
			savePercent: 15,
		},

			
	];

	// Category list - APARTMENT, VILLA, HOUSE
	const categories = ['Aluminum Frame', 'PVC Window', 'Steel / Iron Door','Wooden / Thermowood', 'Aluminum Hybrid'];

	if (device === 'mobile') {
		return <div>PROPERTIES FILTER</div>;
	} else {
		return (
			<Stack className={'filter-main'}>
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
