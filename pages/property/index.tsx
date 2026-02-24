import React, { ChangeEvent, MouseEvent, useEffect, useState, useMemo, useCallback } from 'react';
import { NextPage } from 'next';
import { Box, Button, Menu, MenuItem, Pagination, Stack, Typography, IconButton } from '@mui/material';
import PropertyCard from '../../libs/components/property/PropertyCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/property/Filter';
import { useRouter } from 'next/router';
import { PropertiesInquiry } from '../../libs/types/product/property.input';
import { ProductsInquiry } from '../../libs/types/product/products.input';
import { Product } from '../../libs/types/product/property';
import { ProductMaterial, ProductStatus } from '../../libs/enums/property.enum';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { Direction } from '../../libs/enums/common.enum';
import { sweetErrorHandling } from '../../libs/sweetAlert';
import { getJwtToken } from '../../libs/auth';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PropertyList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<PropertiesInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [properties, setProperties] = useState<Product[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('Featured');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

	// Convert PropertiesInquiry to ProductsInquiry
	const productsInquiry: ProductsInquiry = useMemo(() => {
		const search: any = {};
		
		// Convert availability to ProductStatus enum
		if ((searchFilter.search?.availability as any) === 'ACTIVE') {
			search.productStatus = ProductStatus.ACTIVE;
		} else if ((searchFilter.search?.availability as any) === 'OUT_OF_STOCK') {
			search.productStatus = ProductStatus.OUT_OF_STOCK;
		}
		
		// Add locationList if exists
		if (searchFilter.search?.locationList && searchFilter.search.locationList.length > 0) {
			search.locationList = searchFilter.search.locationList;
		}
		
		// Add text if exists
		if (searchFilter.search?.text && searchFilter.search.text.trim()) {
			search.text = searchFilter.search.text.trim();
		}
		
		// Add pricesRange if exists
		if (searchFilter.search?.pricesRange) {
			search.pricesRange = searchFilter.search.pricesRange;
		}
		
		// Add productType if exists
		if (searchFilter.search?.typeList && searchFilter.search.typeList.length > 0) {
			search.productType = searchFilter.search.typeList;
		}

		// Add productMaterial if exists (single enum)
		if (searchFilter.search?.productMaterial) {
			search.productMaterial = searchFilter.search.productMaterial as ProductMaterial;
		}
		
		const inquiry = {
			page: searchFilter.page || 1,
			limit: searchFilter.limit || 9,
			sort: searchFilter.sort || 'createdAt',
			direction: searchFilter.direction || Direction.DESC,
			search: search, // Always send search object, even if empty
		};
		
		console.log('=== PRODUCTS INQUIRY ===');
		console.log('SearchFilter:', searchFilter);
		console.log('ProductsInquiry:', JSON.stringify(inquiry, null, 2));
		
		return inquiry;
	}, [searchFilter]);

	/** Fetch products via API route (server-side proxy to backend GraphQL) */
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const fetchProducts = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const token = getJwtToken();
			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (token) headers['Authorization'] = `Bearer ${token}`;

			const res = await fetch('/api/products', {
				method: 'POST',
				headers,
				body: JSON.stringify({ input: productsInquiry }),
			});
			const data = await res.json();

			if (!res.ok) {
				throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
			}

			const list = data?.list || [];
			const metaCounter = data?.metaCounter;
			const totalCount = Array.isArray(metaCounter)
				? (metaCounter[0]?.total || 0)
				: (metaCounter?.total || 0);

			setProperties(list as Product[]);
			setTotal(totalCount);
		} catch (err: any) {
			console.error('Fetch products error:', err);
			setError(err);
			setProperties([]);
			setTotal(0);
			sweetErrorHandling(err).then();
		} finally {
			setLoading(false);
		}
	}, [productsInquiry]);

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.input) {
			try {
				const inputObj = JSON.parse(router?.query?.input as string);
				setSearchFilter(inputObj);
				setCurrentPage(inputObj.page === undefined ? 1 : inputObj.page);
			} catch (err) {
				console.error('Error parsing router query input:', err);
			}
		} else {
			setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
		}
	}, [router]);

	// Fetch products when inquiry changes
	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	/** HANDLERS **/
	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		const nextFilter = { ...searchFilter, page: value };
		setSearchFilter(nextFilter);
		await router.push(
			`/property?input=${JSON.stringify(nextFilter)}`,
			`/property?input=${JSON.stringify(nextFilter)}`,
			{ scroll: false },
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
				setSearchFilter({ ...searchFilter, sort: 'productRank', direction: Direction.DESC });
				setFilterSortName('Featured');
				break;
			case 'best_selling':
				setSearchFilter({ ...searchFilter, sort: 'productViews', direction: Direction.DESC });
				setFilterSortName('Best selling');
				break;
			case 'alphabetical_az':
				setSearchFilter({ ...searchFilter, sort: 'productTitle', direction: Direction.ASC });
				setFilterSortName('Alphabetically, A-Z');
				break;
			case 'alphabetical_za':
				setSearchFilter({ ...searchFilter, sort: 'productTitle', direction: Direction.DESC });
				setFilterSortName('Alphabetically, Z-A');
				break;
			case 'price_low_high':
				setSearchFilter({ ...searchFilter, sort: 'productPrice', direction: Direction.ASC });
				setFilterSortName('Price, low to high');
				break;
			case 'price_high_low':
				setSearchFilter({ ...searchFilter, sort: 'productPrice', direction: Direction.DESC });
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
		return <h1>PROPERTIES MOBILE</h1>;
	} else {
		return (
			<div id="property-list-page" style={{ position: 'relative' }}>
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
					<Stack className={'property-page'}>
						<Stack className={'filter-config'}>
							{/* @ts-ignore */}
							<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
						</Stack>
						<Stack className="main-config" mb={'76px'}>
							<Stack className={`list-config ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
							{loading ? (
								<Box component={'div'} className={'no-data'}>
									<Typography component={'p'}>Loading products...</Typography>
								</Box>
							) : error ? (
								<Box component={'div'} className={'no-data'}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<Typography component={'p'} color={'error'}>Error loading products: {error?.message}</Typography>
								</Box>
							) : properties?.length === 0 ? (
								<Box component={'div'} className={'no-data'}>
									<img src="/img/icons/icoAlert.svg" alt="" />
									<Typography component={'p'}>No Products found!</Typography>
								</Box>
							) : (
								properties.map((property: Product) => {
									return <PropertyCard property={property} key={property?._id} />;
								})
							)}
							</Stack>
							<Stack className="pagination-config">
								{properties.length !== 0 && (
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

								{properties.length !== 0 && (
									<Stack className="total-result">
										<Typography>
											Total {total} propert{total > 1 ? 'ies' : 'y'} available
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

PropertyList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			
		},
	},
};

export default withLayoutBasic(PropertyList);
