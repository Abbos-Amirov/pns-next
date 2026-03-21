import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { 
	Box, 
	Stack, 
	Card, 
	CardContent, 
	Chip, 
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import TablePagination from '@mui/material/TablePagination';
import FilterListIcon from '@mui/icons-material/FilterList';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useRouter } from 'next/router';
import { ProductPanelList } from '../../../libs/components/admin/properties/PropertyList';
import { ProductsInquiry } from '../../../libs/types/product/products.input';
import { Property } from '../../../libs/types/product/property';
import { ProductLocation, ProductStatus } from '../../../libs/enums/property.enum';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../../libs/sweetAlert';
import { PropertyUpdate } from '../../../libs/types/product/property.update';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PRODUCTS } from '../../../apollo/admin/query';
import { UPDATE_PROPERTY_BY_ADMIN, REMOVE_PROPERTY_BY_ADMIN, REMOVE_PRODUCT_BY_ADMIN } from '../../../apollo/admin/mutation';

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
	// Search object'ni tozalash - bo'sh field'larni olib tashlash
	const cleanSearch = productsInquiry.search 
		? Object.fromEntries(
			Object.entries(productsInquiry.search).filter(([_, value]) => 
				value !== undefined && value !== null && value !== '' && 
				!(Array.isArray(value) && value.length === 0)
			)
		)
		: {};

	const cleanProductsInquiry: ProductsInquiry = {
		page: productsInquiry.page,
		limit: productsInquiry.limit,
		sort: productsInquiry.sort,
		direction: productsInquiry.direction,
		search: Object.keys(cleanSearch).length > 0 ? cleanSearch : {},
	};

	const { data: productsData, loading, error, refetch: refetchProducts } = useQuery(GET_PRODUCTS, {
		variables: { input: cleanProductsInquiry },
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
	});

	const [updatePropertyByAdmin] = useMutation(UPDATE_PROPERTY_BY_ADMIN);
	const [removePropertyByAdmin] = useMutation(REMOVE_PROPERTY_BY_ADMIN);
	const [removeProductByAdmin] = useMutation(REMOVE_PRODUCT_BY_ADMIN);
	
	// Delete dialog state
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [productToDelete, setProductToDelete] = useState<string | null>(null);

	/** LIFECYCLES **/
	useEffect(() => {
		if (productsData?.getProducts) {
			const productsList = productsData.getProducts.list || [];
			setProducts(Array.isArray(productsList) ? productsList : []);
			
			// metaCounter array ko'rinishida keladi: [{ total: 4 }]
			const metaCounter = productsData.getProducts.metaCounter;
			const total = Array.isArray(metaCounter) 
				? (metaCounter[0]?.total || 0)
				: (metaCounter?.total || 0);
			setProductsTotal(total);
			
			console.log('Products data:', {
				list: productsList,
				listLength: productsList.length,
				metaCounter: metaCounter,
				total: total
			});
		}
	}, [productsData]);

	useEffect(() => {
		refetchProducts();
	}, [productsInquiry, refetchProducts]);

	// Refresh when coming from edit page
	useEffect(() => {
		if (router.query.refresh === 'true') {
			refetchProducts();
			router.replace('/_admin/products', undefined, { shallow: true });
		}
	}, [router.query.refresh, refetchProducts, router]);

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
		// Delete dialog'ni ochish
		setProductToDelete(id);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!productToDelete) return;
		
		try {
			const result = await removeProductByAdmin({
				variables: { input: productToDelete },
			});
			
			if (result.data?.removeProductByAdmin) {
				// Avval dialog yopish
				setDeleteDialogOpen(false);
				setProductToDelete(null);
				// List'ni yangilash
				await refetchProducts();
				// Keyin alert chiqarish (dialog yopilgandan keyin)
				setTimeout(async () => {
					await sweetTopSuccessAlert('Product deleted successfully!');
				}, 300);
			}
		} catch (err: any) {
			console.error('Delete error:', err);
			sweetErrorHandling(err).then();
			setDeleteDialogOpen(false);
			setProductToDelete(null);
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
		setProductToDelete(null);
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
						locationList: [newValue as ProductLocation], // Backend'da locationList deb nomlangan
					},
				});
			} else {
				delete productsInquiry?.search?.locationList;
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
								className={'products-icon-box'}
								sx={{
									width: 56,
									height: 56,
									borderRadius: '12px',
									backgroundColor: 'rgba(139, 69, 19, 0.1)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#8B4513',
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
							<Chip 
								label={`Total: ${productsTotal}`} 
								className={'products-total-chip'}
								sx={{
									backgroundColor: 'rgba(139, 69, 19, 0.1)',
									color: '#8B4513',
									fontWeight: 600,
									fontSize: '14px',
									height: '36px',
									fontFamily: '$font',
								}}
							/>
							<Button
								variant={'contained'}
								startIcon={<AddRoundedIcon />}
								onClick={() => router.push('/_admin/products/product_create')}
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
										className={value === 'ALL' ? 'tab-btn active products-tab' : 'tab-btn products-tab'}
										sx={{
											textTransform: 'none',
											borderRadius: '8px',
											px: 3,
											py: 1,
											fontWeight: 600,
											...(value === 'ALL'
												? {
														backgroundColor: '#8B4513',
														color: '#fff',
														'&:hover': { backgroundColor: '#6B3410' },
												  }
												: {
														borderColor: '#e0e0e0',
														color: '#424242',
														'&:hover': { borderColor: '#8B4513', backgroundColor: 'rgba(139, 69, 19, 0.05)' },
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
									className={'products-location-select'}
									sx={{
										minWidth: '200px',
										borderRadius: '8px',
										'& .MuiOutlinedInput-notchedOutline': {
											borderColor: '#e0e0e0',
										},
										'&:hover .MuiOutlinedInput-notchedOutline': {
											borderColor: '#8B4513',
										},
										'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
											borderColor: '#8B4513',
										},
									}}
									startAdornment={
										<Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
											<FilterListIcon sx={{ color: '#8B4513', fontSize: 20 }} />
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
					{loading ? (
						<Box sx={{ p: 4, textAlign: 'center' }}>
							<Typography variant={'body2'}>Loading products...</Typography>
						</Box>
					) : error ? (
						<Box sx={{ p: 4, textAlign: 'center' }}>
							<Typography variant={'body2'} color={'error'}>
								Error loading products: {error.message}
							</Typography>
						</Box>
					) : (
						<>
							<ProductPanelList
								products={products}
								anchorEl={anchorEl}
								menuIconClickHandler={menuIconClickHandler}
								menuIconCloseHandler={menuIconCloseHandler}
								updateProductHandler={updateProductHandler}
								removeProductHandler={removeProductHandler}
							/>

							<Box className={'products-pagination-box'}>
								<TablePagination
									rowsPerPageOptions={[10, 20, 40, 60]}
									component="div"
									count={productsTotal}
									rowsPerPage={productsInquiry?.limit || 10}
									page={(productsInquiry?.page || 1) - 1}
									onPageChange={changePageHandler}
									onRowsPerPageChange={changeRowsPerPageHandler}
									className={'products-pagination'}
								/>
							</Box>
						</>
					)}
				</CardContent>
			</Card>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteCancel}
				className={'faq-delete-dialog'}
				PaperProps={{
					sx: {
						borderRadius: '16px',
						minWidth: '400px',
						maxWidth: '500px',
					},
				}}
			>
				<DialogTitle sx={{ pb: 1 }}>
					<Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
						<Stack direction={'row'} alignItems={'center'} spacing={1.5}>
							<Box
								sx={{
									width: 48,
									height: 48,
									borderRadius: '12px',
									background: 'linear-gradient(135deg, rgba(233, 44, 40, 0.1) 0%, rgba(244, 67, 54, 0.1) 100%)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#E92C28',
								}}
							>
								<WarningAmberIcon sx={{ fontSize: 28 }} />
							</Box>
							<Typography variant={'h6'} sx={{ fontWeight: 700, color: '#181a20', fontFamily: '$font' }}>
								Delete Product
							</Typography>
						</Stack>
						<IconButton
							onClick={handleDeleteCancel}
							sx={{
								color: '#9e9e9e',
								'&:hover': {
									backgroundColor: 'rgba(0, 0, 0, 0.04)',
								},
							}}
						>
							<CloseIcon />
						</IconButton>
					</Stack>
				</DialogTitle>
				<DialogContent sx={{ pt: 2 }}>
					<Typography variant={'body1'} sx={{ color: '#616161', lineHeight: 1.8, fontFamily: '$font' }}>
						Are you sure you want to delete this product? This action cannot be undone and the product will be permanently removed from the system.
					</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
					<Button
						onClick={handleDeleteCancel}
						variant={'outlined'}
						className={'faq-delete-cancel-btn'}
						sx={{
							textTransform: 'none',
							borderColor: '#e0e0e0',
							color: '#616161',
							fontWeight: 600,
							padding: '10px 24px',
							'&:hover': {
								borderColor: '#bdbdbd',
								background: 'rgba(0, 0, 0, 0.04)',
							},
						}}
					>
						Cancel
					</Button>
					<Button
						onClick={handleDeleteConfirm}
						variant={'contained'}
						startIcon={<DeleteOutlineIcon />}
						className={'faq-delete-confirm-btn'}
						sx={{
							textTransform: 'none',
							background: 'linear-gradient(135deg, #E92C28 0%, #F44336 100%)',
							color: '#ffffff',
							fontWeight: 600,
							padding: '10px 24px',
							boxShadow: '0px 2px 8px rgba(233, 44, 40, 0.25)',
							'&:hover': {
								background: 'linear-gradient(135deg, #C62828 0%, #E92C28 100%)',
								boxShadow: '0px 4px 16px rgba(233, 44, 40, 0.35)',
								transform: 'translateY(-2px)',
							},
						}}
					>
						Delete Product
					</Button>
				</DialogActions>
			</Dialog>
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

export const getStaticProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale || 'en', ['common'])),
		initialInquiry: {
			page: 1,
			limit: 10,
			sort: 'createdAt',
			direction: 'DESC',
			search: {},
		},
	},
});

export default withAdminLayout(AdminProperties);
