import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, Stack, Card, CardContent, Chip, Button } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import FilterListIcon from '@mui/icons-material/FilterList';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useRouter } from 'next/router';
import { PropertyPanelList } from '../../../libs/components/admin/properties/PropertyList';
import { ProductsInquiry } from '../../../libs/types/property/products.input';
import { Property } from '../../../libs/types/property/property';
import { ProductLocation, ProductStatus } from '../../../libs/enums/property.enum';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../../libs/sweetAlert';
import { PropertyUpdate } from '../../../libs/types/property/property.update';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_PROPERTIES_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_PROPERTY_BY_ADMIN, REMOVE_PROPERTY_BY_ADMIN } from '../../../apollo/admin/mutation';

const AdminProperties: NextPage = ({ initialInquiry, ...props }: any) => {
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [productsInquiry, setProductsInquiry] = useState<ProductsInquiry>(initialInquiry);
	const [products, setProducts] = useState<Property[]>([]);
	const [productsTotal, setProductsTotal] = useState<number>(0);
	const [value, setValue] = useState(
		productsInquiry?.search?.productStatus ? productsInquiry?.search?.productStatus : 'ALL',
	);
	const [searchType, setSearchType] = useState('ALL');

	/** APOLLO REQUESTS **/
	const { data: productsData, refetch: refetchProducts } = useQuery(GET_ALL_PROPERTIES_BY_ADMIN, {
		variables: { input: productsInquiry },
		fetchPolicy: 'network-only',
	});

	const [updatePropertyByAdmin] = useMutation(UPDATE_PROPERTY_BY_ADMIN);
	const [removePropertyByAdmin] = useMutation(REMOVE_PROPERTY_BY_ADMIN);

	/** LIFECYCLES **/
	useEffect(() => {
		if (productsData?.getAllProductsByAdmin) {
			setProducts(productsData.getAllProductsByAdmin.list);
			setProductsTotal(productsData.getAllProductsByAdmin.metaCounter.total);
		}
	}, [productsData]);

	useEffect(() => {
		refetchProducts();
	}, [productsInquiry, refetchProducts]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		productsInquiry.page = newPage + 1;
		setProductsInquiry({ ...productsInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		productsInquiry.limit = parseInt(event.target.value, 10);
		productsInquiry.page = 1;
		setProductsInquiry({ ...productsInquiry });
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => {
		setAnchorEl([]);
	};

	const tabChangeHandler = async (event: any, newValue: string) => {
		setValue(newValue);

		setProductsInquiry({ ...productsInquiry, page: 1, sort: 'createdAt' });

		switch (newValue) {
			case 'ACTIVE':
				setProductsInquiry({ ...productsInquiry, search: { productStatus: ProductStatus.ACTIVE } });
				break;
			case 'SOLD':
				setProductsInquiry({ ...productsInquiry, search: { productStatus: ProductStatus.OUT_OF_STOCK } });
				break;
			case 'DELETE':
				setProductsInquiry({ ...productsInquiry, search: { productStatus: ProductStatus.DELETE } });
				break;
			default:
				delete productsInquiry?.search?.productStatus;
				setProductsInquiry({ ...productsInquiry });
				break;
		}
	};

	const removeProductHandler = async (id: string) => {
		try {
			await removePropertyByAdmin({
				variables: { input: id },
			});
			await sweetTopSuccessAlert('Product removed successfully!');
			menuIconCloseHandler();
			await refetchProducts();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				setProductsInquiry({
					...productsInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						...productsInquiry.search,
						productLocationList: [newValue as ProductLocation],
					},
				});
			} else {
				delete productsInquiry?.search?.productLocationList;
				setProductsInquiry({ ...productsInquiry });
			}
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

	const updateProductHandler = async (updateData: PropertyUpdate) => {
		try {
			await updatePropertyByAdmin({
				variables: { input: updateData },
			});
			await sweetTopSuccessAlert('Product updated successfully!');
			menuIconCloseHandler();
			await refetchProducts();
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content products-page'}>
			{/* Header Section */}
			<Card className={'page-header-card'} sx={{ mb: 3 }}>
				<CardContent>
					<Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
						<Stack direction={'row'} alignItems={'center'} spacing={2}>
							<Box
								sx={{
									width: 56,
									height: 56,
									borderRadius: '12px',
									backgroundColor: 'rgba(22, 70, 193, 0.1)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#1646C1',
								}}
							>
								<HomeWorkIcon sx={{ fontSize: 32 }} />
							</Box>
							<Box>
								<Typography variant={'h4'} className={'page-title'} sx={{ fontWeight: 700, mb: 0.5 }}>
									Product Management
								</Typography>
								<Typography variant={'body2'} sx={{ color: '#717171' }}>
									Manage and monitor all products in the platform
								</Typography>
							</Box>
						</Stack>
						<Stack direction={'row'} spacing={2} alignItems={'center'}>
							<Chip label={`Total: ${productsTotal}`} className={'products-total-chip'} />
							<Button
								variant={'contained'}
								startIcon={<AddRoundedIcon />}
								onClick={() => router.push('/_admin/properties/product_create')}
								className={'products-add-btn'}
							>
								Add Product
							</Button>
						</Stack>
					</Stack>
				</CardContent>
			</Card>

			{/* Filters and Search Section */}
			<Card className={'filters-card'} sx={{ mb: 3 }}>
				<CardContent>
					<Box component={'div'} sx={{ width: '100%', typography: 'body1' }}>
						<TabContext value={value}>
							{/* Status Tabs */}
							<Box component={'div'} sx={{ mb: 3 }}>
								<Stack direction={'row'} spacing={1} className={'status-tabs'}>
									<Button
										variant={value === 'ALL' ? 'contained' : 'outlined'}
										onClick={(e: any) => tabChangeHandler(e, 'ALL')}
										className={value === 'ALL' ? 'tab-btn active' : 'tab-btn'}
										sx={{
											textTransform: 'none',
											borderRadius: '8px',
											px: 3,
											py: 1,
											fontWeight: 600,
											...(value === 'ALL'
												? {
														backgroundColor: '#1646C1',
														color: '#fff',
														'&:hover': { backgroundColor: '#0f3490' },
												  }
												: {
														borderColor: '#e0e0e0',
														color: '#424242',
														'&:hover': { borderColor: '#1646C1', backgroundColor: 'rgba(22, 70, 193, 0.05)' },
												  }),
										}}
									>
										All
									</Button>
									<Button
										variant={value === 'ACTIVE' ? 'contained' : 'outlined'}
										onClick={(e: any) => tabChangeHandler(e, 'ACTIVE')}
										className={value === 'ACTIVE' ? 'tab-btn active' : 'tab-btn'}
										sx={{
											textTransform: 'none',
											borderRadius: '8px',
											px: 3,
											py: 1,
											fontWeight: 600,
											...(value === 'ACTIVE'
												? {
														backgroundColor: '#229a16',
														color: '#fff',
														'&:hover': { backgroundColor: '#1a7a11' },
												  }
												: {
														borderColor: '#e0e0e0',
														color: '#424242',
														'&:hover': { borderColor: '#229a16', backgroundColor: 'rgba(34, 154, 22, 0.05)' },
												  }),
										}}
									>
										Active
									</Button>
									<Button
										variant={value === 'SOLD' ? 'contained' : 'outlined'}
										onClick={(e: any) => tabChangeHandler(e, 'SOLD')}
										className={value === 'SOLD' ? 'tab-btn active' : 'tab-btn'}
										sx={{
											textTransform: 'none',
											borderRadius: '8px',
											px: 3,
											py: 1,
											fontWeight: 600,
											...(value === 'SOLD'
												? {
														backgroundColor: '#FF9800',
														color: '#fff',
														'&:hover': { backgroundColor: '#f57c00' },
												  }
												: {
														borderColor: '#e0e0e0',
														color: '#424242',
														'&:hover': { borderColor: '#FF9800', backgroundColor: 'rgba(255, 152, 0, 0.05)' },
												  }),
										}}
									>
										Sold
									</Button>
									<Button
										variant={value === 'DELETE' ? 'contained' : 'outlined'}
										onClick={(e: any) => tabChangeHandler(e, 'DELETE')}
										className={value === 'DELETE' ? 'tab-btn active' : 'tab-btn'}
										sx={{
											textTransform: 'none',
											borderRadius: '8px',
											px: 3,
											py: 1,
											fontWeight: 600,
											...(value === 'DELETE'
												? {
														backgroundColor: '#757575',
														color: '#fff',
														'&:hover': { backgroundColor: '#5a5a5a' },
												  }
												: {
														borderColor: '#e0e0e0',
														color: '#424242',
														'&:hover': { borderColor: '#757575', backgroundColor: 'rgba(117, 117, 117, 0.05)' },
												  }),
										}}
									>
										Deleted
									</Button>
								</Stack>
							</Box>

							<Divider sx={{ mb: 3 }} />

							{/* Filter */}
							<Stack direction={'row'} spacing={2} className={'search-filter-area'}>
								<Select
									value={searchType}
									sx={{
										minWidth: '200px',
										borderRadius: '8px',
										'& .MuiOutlinedInput-notchedOutline': {
											borderColor: '#e0e0e0',
										},
										'&:hover .MuiOutlinedInput-notchedOutline': {
											borderColor: '#1646C1',
										},
										'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
											borderColor: '#1646C1',
										},
									}}
									startAdornment={
										<Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
											<FilterListIcon sx={{ color: '#1646C1', fontSize: 20 }} />
										</Box>
									}
								>
									<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
										All Locations
									</MenuItem>
									{Object.values(ProductLocation).map((location: string) => (
										<MenuItem value={location} onClick={() => searchTypeHandler(location)} key={location}>
											{location}
										</MenuItem>
									))}
								</Select>
							</Stack>
						</TabContext>
					</Box>
				</CardContent>
			</Card>

			{/* Table Section */}
			<Card className={'table-card'}>
				<CardContent sx={{ p: 0 }}>
					<PropertyPanelList
						properties={products}
						anchorEl={anchorEl}
						menuIconClickHandler={menuIconClickHandler}
						menuIconCloseHandler={menuIconCloseHandler}
						updatePropertyHandler={updateProductHandler}
						removePropertyHandler={removeProductHandler}
					/>

					<Box sx={{ px: 3, pb: 2 }}>
						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={productsTotal}
							rowsPerPage={productsInquiry?.limit}
							page={productsInquiry?.page - 1}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
							sx={{
								'& .MuiTablePagination-toolbar': {
									paddingLeft: 0,
								},
								'& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
									fontWeight: 500,
								},
							}}
						/>
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
};

AdminProperties.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withAdminLayout(AdminProperties);
