import React, { useCallback, useState, ChangeEvent, useEffect, useRef } from 'react';
import { Stack, Typography, Box, RadioGroup, FormControlLabel, Radio, TextField, InputAdornment, Button, Menu, MenuItem } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ProductMaterial, PropertyType } from '../../enums/property.enum';
import { PropertiesInquiry } from '../../types/product/property.input';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

interface FilterType {
	searchFilter: PropertiesInquiry;
	setSearchFilter: any;
	initialInput: PropertiesInquiry;
	/** Sort by - left sidebar (parallel to Search) */
	anchorEl?: HTMLElement | null;
	sortingOpen?: boolean;
	filterSortName?: string;
	sortKeyToLabel?: Record<string, string>;
	onSortClick?: (e: React.MouseEvent<HTMLElement>) => void;
	onSortClose?: () => void;
	onSortSelect?: (e: React.MouseEvent<HTMLLIElement>) => void;
}

const Filter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput, anchorEl, sortingOpen, filterSortName, sortKeyToLabel, onSortClick, onSortClose, onSortSelect } = props;
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const router = useRouter();
	const [propertyType] = useState<PropertyType[]>(Object.values(PropertyType));
	const [productMaterials] = useState<ProductMaterial[]>(Object.values(ProductMaterial));
	const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
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
						`${router.pathname}?input=${JSON.stringify({
							...searchFilter,
							search: {
								...searchFilter.search,
								typeList: searchFilter?.search?.typeList?.filter((item: string) => item !== type),
							},
						})}`,
						`${router.pathname}?input=${JSON.stringify({
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
						`${router.pathname}?input=${JSON.stringify({
							...searchFilter,
							search: { ...searchFilter.search, typeList: [...(searchFilter?.search?.typeList || []), type] },
						})}`,
						`${router.pathname}?input=${JSON.stringify({
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
					`${router.pathname}?input=${JSON.stringify({
						...searchFilter,
						search: { ...searchFilter.search, availability: value },
					})}`,
					`${router.pathname}?input=${JSON.stringify({
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

	// Product material filter (ALUMINUM/PVC/WOOD/STEEL/GLASS)
	const productMaterialSelectHandler = useCallback(
		async (material: ProductMaterial) => {
			try {
				const current = searchFilter?.search?.productMaterial;
				const next = current === material ? undefined : material;

				await router.push(
					`${router.pathname}?input=${JSON.stringify({
						...searchFilter,
						search: { ...searchFilter.search, productMaterial: next },
					})}`,
					`${router.pathname}?input=${JSON.stringify({
						...searchFilter,
						search: { ...searchFilter.search, productMaterial: next },
					})}`,
					{ scroll: false },
				);
			} catch (err: any) {
				console.log('ERROR, productMaterialSelectHandler:', err);
			}
		},
		[searchFilter, router],
	);

	const clearProductMaterialHandler = useCallback(async () => {
		try {
			await router.push(
				`${router.pathname}?input=${JSON.stringify({
					...searchFilter,
					search: { ...searchFilter.search, productMaterial: undefined },
				})}`,
				`${router.pathname}?input=${JSON.stringify({
					...searchFilter,
					search: { ...searchFilter.search, productMaterial: undefined },
				})}`,
				{ scroll: false },
			);
		} catch (err: any) {
			console.log('ERROR, clearProductMaterialHandler:', err);
		}
	}, [searchFilter, router]);

	const refreshHandler = async () => {
		try {
			await router.push(
				`${router.pathname}?input=${JSON.stringify(initialInput)}`,
				`${router.pathname}?input=${JSON.stringify(initialInput)}`,
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
					`${router.pathname}?input=${JSON.stringify({
						...searchFilter,
						search: { ...searchFilter.search, text },
					})}`,
					`${router.pathname}?input=${JSON.stringify({
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
					`${router.pathname}?input=${JSON.stringify({
						...searchFilter,
						search: {
							...searchFilter.search,
							pricesRange: { start: minNum, end: maxNum },
						},
					})}`,
					`${router.pathname}?input=${JSON.stringify({
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

	// Material list - ProductMaterial enum
	const materials: ProductMaterial[] = productMaterials;

	if (device === 'mobile') {
		return <div>PROPERTIES FILTER</div>;
	} else {
		return (
			<Stack className={'filter-main'}>
				{/* Sort by + Search - parallel row */}
				<Stack className={'filter-section filter-sort-search-row'} mb={'24px'}>
					<Stack direction={'row'} alignItems={'center'} gap={'12px'} flexWrap={'wrap'}>
						{onSortClick && sortKeyToLabel && (
							<Stack direction={'row'} alignItems={'center'} gap={'10px'} className={'filter-sort-block'}>
								
							</Stack>
						)}
					</Stack>
				</Stack>

				<Stack className={'filter-section'} mb={'24px'}>
					<Box component={'div'} className={'section-header'}>
						<Typography className={'section-header__title'} style={{marginLeft:'10px'}} component={'span'}>
							Search
						</Typography>
					</Box>
					<Stack className={'search-content'}>
						<TextField
							fullWidth
							placeholder="Search products..."
							value={searchText}
							onChange={handleSearchChange}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								),
							}}
							className={'search-input'}
						/>
					</Stack>
				</Stack>

				<Stack className={'filter-section'} mb={'24px'}>
					<Box component={'div'} className={'section-header'}>
						<Typography className={'section-header__title'} style={{marginLeft:'10px'}} component={'span'}>
							Price Range
						</Typography>
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
				<Stack className={'filter-section'} mb={'24px'}>
					<Box component={'div'} className={'section-header'}>
						<Typography className={'section-header__title'} style={{marginLeft:'10px'}} component={'span'}>
							Material
						</Typography>
					</Box>
					<Stack className={'category-list'}>
						{/* All materials (clear filter) */}
						<Stack
							className={`category-item ${!searchFilter?.search?.productMaterial ? 'selected' : ''}`}
							key={'ALL_MATERIALS'}
							onClick={clearProductMaterialHandler}
						>
							<Typography>ALL</Typography>
						</Stack>
						{materials.map((material: ProductMaterial) => {
							const isSelected = searchFilter?.search?.productMaterial === material;
							return (
								<Stack
									className={`category-item ${isSelected ? 'selected' : ''}`}
									key={material}
										onClick={() => {
										productMaterialSelectHandler(material);
									}}
								>
									<Typography>{material}</Typography>
								</Stack>
							);
						})}
					</Stack>
				</Stack>

				<Stack className={'filter-section filter-section--availability'} mb={'24px'}>
					<Box component={'div'} className={'section-header'}>
						<Typography className={'section-header__title'} style={{marginLeft:'10px'}} component={'span'}>
							Availability
						</Typography>
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
