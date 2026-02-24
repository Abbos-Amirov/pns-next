import React, { ChangeEvent, MouseEvent, useEffect, useState, useMemo, useCallback } from 'react';
import { NextPage } from 'next';
import { Button, Menu, MenuItem, Pagination, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/property/Filter';
import Link from 'next/link';
import { useRouter } from 'next/router';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { PropertiesInquiry } from '../../libs/types/product/property.input';
import { ProductsInquiry } from '../../libs/types/product/products.input';
import { Product } from '../../libs/types/product/property';
import { ProductMaterial, ProductStatus } from '../../libs/enums/property.enum';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Direction } from '../../libs/enums/common.enum';
import { sweetErrorHandling } from '../../libs/sweetAlert';
import { getJwtToken } from '../../libs/auth';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const PropertyList: NextPage = ({ initialInput, ...props }: any) => {
	const { t } = useTranslation('common');
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
	const [filterSortName, setFilterSortName] = useState('date_new_old');

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
				const { sort, direction } = inputObj;
				const sortId = sort === 'productRank' && direction === 'DESC' ? 'featured' :
					sort === 'productViews' && direction === 'DESC' ? 'best_selling' :
					sort === 'productTitle' && direction === 'ASC' ? 'alphabetical_az' :
					sort === 'productTitle' && direction === 'DESC' ? 'alphabetical_za' :
					sort === 'productPrice' && direction === 'ASC' ? 'price_low_high' :
					sort === 'productPrice' && direction === 'DESC' ? 'price_high_low' :
					sort === 'createdAt' && direction === 'ASC' ? 'date_old_new' :
					sort === 'createdAt' && direction === 'DESC' ? 'date_new_old' : 'featured';
				setFilterSortName(sortId);
			} catch (err) {}
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

	const sortKeyToLabel: Record<string, string> = {
		featured: 'SortFeatured',
		best_selling: 'SortBestSelling',
		alphabetical_az: 'SortAlphabeticalAZ',
		alphabetical_za: 'SortAlphabeticalZA',
		price_low_high: 'SortPriceLowHigh',
		price_high_low: 'SortPriceHighLow',
		date_old_new: 'SortDateOldNew',
		date_new_old: 'SortDateNewOld',
	};

	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		const id = e.currentTarget.id;
		switch (id) {
			case 'featured':
				setSearchFilter({ ...searchFilter, sort: 'productRank', direction: Direction.DESC });
				break;
			case 'best_selling':
				setSearchFilter({ ...searchFilter, sort: 'productViews', direction: Direction.DESC });
				break;
			case 'alphabetical_az':
				setSearchFilter({ ...searchFilter, sort: 'productTitle', direction: Direction.ASC });
				break;
			case 'alphabetical_za':
				setSearchFilter({ ...searchFilter, sort: 'productTitle', direction: Direction.DESC });
				break;
			case 'price_low_high':
				setSearchFilter({ ...searchFilter, sort: 'productPrice', direction: Direction.ASC });
				break;
			case 'price_high_low':
				setSearchFilter({ ...searchFilter, sort: 'productPrice', direction: Direction.DESC });
				break;
			case 'date_old_new':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: Direction.ASC });
				break;
			case 'date_new_old':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: Direction.DESC });
				break;
		}
		setFilterSortName(id);
		setSortingOpen(false);
		setAnchorEl(null);
	};

	const getImageUrl = (p: Product) => {
		const img = p?.productImages?.[0];
		if (!img) return 'https://via.placeholder.com/600x400?text=No+Image';
		if (img.startsWith('http')) return img;
		return `/${img.replace(/^\/+/, '')}`;
	};

	const hotDealImages = [
		'/img/property/window2.jpg',
		'/img/property/window1.jpg',
		'/img/property/window.jpg',
	];

	if (device === 'mobile') {
		return <div style={{ padding: 20, textAlign: 'center' }}>{t('PropertiesMobile')}</div>;
	}

	return (
		<div id="property-list-page" className="property-scroll-stack property-hstaff-style">
			<div className="container property-stack-container">
				<aside className="filter-config filter-config-stack">
					{/* @ts-ignore */}
					<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
				</aside>
				<div className="property-stack-main">
					{loading ? (
						<div className="stack-loading">{t('PropertyLoading')}</div>
					) : error ? (
						<div className="stack-loading" style={{ color: '#e53935' }}>
							{t('PropertyError')}: {error?.message}
						</div>
					) : properties?.length === 0 ? (
						<div className="stack-loading">{t('PropertyNoProducts')}</div>
					) : (
						<>
							<div className="stack-sort-row">
								<span>{t('SortBy')}</span>
								<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />} className="sort-btn">
									{t(sortKeyToLabel[filterSortName] || 'SortFeatured')}
								</Button>
								<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler}>
									<MenuItem onClick={sortingHandler} id="featured" disableRipple>{t('SortFeatured')}</MenuItem>
									<MenuItem onClick={sortingHandler} id="best_selling" disableRipple>{t('SortBestSelling')}</MenuItem>
									<MenuItem onClick={sortingHandler} id="alphabetical_az" disableRipple>{t('SortAlphabeticalAZ')}</MenuItem>
									<MenuItem onClick={sortingHandler} id="alphabetical_za" disableRipple>{t('SortAlphabeticalZA')}</MenuItem>
									<MenuItem onClick={sortingHandler} id="price_low_high" disableRipple>{t('SortPriceLowHigh')}</MenuItem>
									<MenuItem onClick={sortingHandler} id="price_high_low" disableRipple>{t('SortPriceHighLow')}</MenuItem>
									<MenuItem onClick={sortingHandler} id="date_old_new" disableRipple>{t('SortDateOldNew')}</MenuItem>
									<MenuItem onClick={sortingHandler} id="date_new_old" disableRipple>{t('SortDateNewOld')}</MenuItem>
								</Menu>
							</div>
							{properties.map((p, i) => (
								<section
									key={p._id}
									className="stack-section stack-section-unified"
									style={{ zIndex: i + 1 }}
								>
									<div className="stack-section-info">
										<div className="stack-bg-number">{String(i + 1).padStart(2, '0')}</div>
										<h2 className="stack-h2">{p.productTitle}</h2>
										<p className="stack-desc">{p.productDesc || t('PropertyDescDefault')}</p>
										<div className="stack-meta-cards">
											<div className="stack-meta-row">
												<span className="stack-meta-label">{t('LabelProject')}</span>
												<span className="stack-meta-value">{p.productTitle}</span>
											</div>
											<div className="stack-meta-row">
												<span className="stack-meta-label">{t('LabelCategories')}</span>
												<span className="stack-meta-value">
													{p.productType} / {(p as any).productMaterial || '—'} / {(p as any).productGlassType || '—'}
												</span>
											</div>
											<div className="stack-meta-row">
												<span className="stack-meta-label">{t('LabelStatus')}</span>
												<span className="stack-meta-value">
													{p.productStatus === 'ACTIVE' ? t('StatusReady') : p.productStatus || '—'}
												</span>
											</div>
										</div>
										<button
											className="stack-demo-btn"
											onClick={() => router.push(`/property/detail?id=${p._id}`)}
										>
											<PlayArrowIcon />
											{t('Demo')}
										</button>
										<div className="stack-hot-deals-row">
											{hotDealImages.map((src, idx) => (
												<div key={idx} className="stack-hot-deal-thumb">
													<img src={src} alt={`Deal ${idx + 1}`} />
												</div>
											))}
										</div>
									</div>
									<div className="stack-section-image">
										<Link href={`/property/detail?id=${p._id}`} style={{ display: 'block', height: '100%', cursor: 'pointer' }}>
											<img src={getImageUrl(p)} alt={p.productTitle} />
										</Link>
									</div>
								</section>
							))}
							{properties.length > 0 && (
								<div className="stack-pagination-row">
									<Pagination
										page={currentPage}
										count={Math.ceil(total / searchFilter.limit)}
										onChange={handlePaginationChange}
										shape="circular"
										color="primary"
									/>
									<Typography variant="body2">{t('TotalProducts', { count: total })}</Typography>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
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
