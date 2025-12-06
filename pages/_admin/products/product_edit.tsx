import React, { useRef, useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import {
	Box,
	Button,
	Card,
	CardContent,
	Stack,
	TextField,
	Typography,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Grid,
	Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import { ProductUpdate } from '../../../libs/types/product/product.update';
import {
	ProductType,
	ProductStatus,
	ProductLocation,
	ProductMaterial,
	ProductGlassType,
	ProductOpenType,
	ProductCategory,
} from '../../../libs/enums/property.enum';
import { getJwtToken } from '../../../libs/auth';
import { REACT_APP_API_URL, REACT_APP_API_GRAPHQL_URL } from '../../../libs/config';
import axios from 'axios';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../../libs/sweetAlert';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_PRODUCT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { GET_PRODUCTS } from '../../../apollo/admin/query';
import { ProductsInquiry } from '../../../libs/types/product/products.input';
import { Direction } from '../../../libs/enums/common.enum';
import Moment from 'react-moment';

const ProductEdit: NextPage = (props: any) => {
	const router = useRouter();
	const { id } = router.query;
	const inputRef = useRef<HTMLInputElement>(null);
	const token = getJwtToken();

	const [productData, setProductData] = useState<ProductUpdate>({
		_id: '',
		productType: ProductType.DOOR,
		productStatus: ProductStatus.ACTIVE,
		productAddress: '',
		productTitle: '',
		productLocation: ProductLocation.SEOUL,
		productHeight: 0,
		productWidth: 0,
		productPrice: 0,
		productMaterial: ProductMaterial.PVC,
		productGlassType: ProductGlassType.DOUBLE,
		productOpenType: ProductOpenType.SLIDING,
		productCategory: ProductCategory.INTERIOR,
		// productColor backend'da ProductUpdate type'ida yo'q, shuning uchun olib tashlandi
		productImages: [],
	});

	// Product ma'lumotlarini olish
	const productsInquiry: ProductsInquiry = {
		page: 1,
		limit: 1000,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	};

	const { data: productsData, loading: loadingProduct } = useQuery(GET_PRODUCTS, {
		variables: { input: productsInquiry },
		fetchPolicy: 'network-only',
		skip: !id,
	});

	const [updateProduct] = useMutation(UPDATE_PRODUCT_BY_ADMIN);

	// Product ma'lumotlarini yuklash
	useEffect(() => {
		if (id && productsData?.getProducts?.list) {
			const product = productsData.getProducts.list.find((p: any) => p._id === id);
			if (product) {
				setProductData({
					_id: product._id || '',
					productType: product.productType ?? ProductType.DOOR,
					productStatus: product.productStatus ?? ProductStatus.ACTIVE,
					productAddress: product.productAddress ?? '',
					productTitle: product.productTitle ?? '',
					productLocation: product.productLocation ?? ProductLocation.SEOUL,
					productHeight: product.productHeight ?? 0,
					productWidth: product.productWidth ?? 0,
					productPrice: product.productPrice ?? 0,
					productMaterial: product.productMaterial ?? ProductMaterial.PVC,
					productGlassType: product.productGlassType ?? ProductGlassType.DOUBLE,
					productOpenType: product.productOpenType ?? ProductOpenType.SLIDING,
					productCategory: product.productCategory ?? ProductCategory.INTERIOR,
					// productColor backend'da ProductUpdate type'ida yo'q, shuning uchun olib tashlandi
					productImages: product.productImages ?? [],
					productDesc: product.productDesc ?? '',
					// productRent backend'da ProductUpdate type'ida yo'q, shuning uchun olib tashlandi
				});
			}
		}
	}, [id, productsData]);

	/** HANDLERS **/
	const handleInputChange = (field: keyof ProductUpdate, value: any) => {
		setProductData((prev) => ({ ...prev, [field]: value }));
	};

	const handleNumberInputChange = (field: keyof ProductUpdate, value: string) => {
		const numValue = parseFloat(value) || 0;
		setProductData((prev) => ({ ...prev, [field]: numValue }));
	};

	async function uploadImages() {
		try {
			const formData = new FormData();
			const selectedFiles = inputRef.current?.files;

			if (!selectedFiles || selectedFiles.length === 0) {
				await sweetMixinErrorAlert('Please select at least one image!');
				return false;
			}
			if (selectedFiles.length > 5) {
				throw new Error('Cannot upload more than 5 images!');
			}

			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) { 
						imagesUploader(files: $files, target: $target)
				  }`,
					variables: {
						files: [null, null, null, null, null],
						target: 'property',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.files.0'],
					'1': ['variables.files.1'],
					'2': ['variables.files.2'],
					'3': ['variables.files.3'],
					'4': ['variables.files.4'],
				}),
			);
			for (const key in selectedFiles) {
				if (/^\d+$/.test(key)) formData.append(`${key}`, selectedFiles[key]);
			}

			const graphqlUrl = REACT_APP_API_GRAPHQL_URL || 'http://localhost:3007/graphql';
			console.log('Uploading images to:', graphqlUrl);
			
			const response = await axios.post(graphqlUrl, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.data || !response.data.data || !response.data.data.imagesUploader) {
				throw new Error('Invalid response from server');
			}

			const responseImages = response.data.data.imagesUploader;
			// Yangi rasmlarni mavjud rasmlarga qo'shish
			const updatedImages = [...(productData.productImages || []), ...responseImages];
			setProductData({ ...productData, productImages: updatedImages });
			await sweetTopSuccessAlert('Images uploaded successfully!');
			return true;
		} catch (err: any) {
			console.error('Image upload error:', err);
			const errorMessage = err.response?.data?.message || err.message || 'Failed to upload images';
			await sweetMixinErrorAlert(errorMessage);
			return false;
		}
	}

	const removeImage = (index: number) => {
		const newImages = (productData.productImages || []).filter((_, i) => i !== index);
		setProductData({ ...productData, productImages: newImages });
	};

	const doDisabledCheck = () => {
		const hasId = (id && typeof id === 'string') || (productData._id && productData._id.trim() !== '');
		return !hasId;
	};

	const handleSubmit = async () => {
		try {
			const productId = (typeof id === 'string' ? id : productData._id) || '';
			
			if (!productId) {
				await sweetMixinErrorAlert('Product ID is missing');
				return;
			}
			
			// Faqat o'zgartirilgan field'larni yuborish
			const updateInput: ProductUpdate = {
				_id: productId,
			};

			if (productData.productType) updateInput.productType = productData.productType;
			if (productData.productStatus) updateInput.productStatus = productData.productStatus;
			if (productData.productLocation) updateInput.productLocation = productData.productLocation;
			if (productData.productAddress) updateInput.productAddress = productData.productAddress;
			if (productData.productTitle) updateInput.productTitle = productData.productTitle;
			if (productData.productHeight !== undefined && productData.productHeight > 0) updateInput.productHeight = productData.productHeight;
			if (productData.productWidth !== undefined && productData.productWidth > 0) updateInput.productWidth = productData.productWidth;
			if (productData.productPrice !== undefined && productData.productPrice > 0) updateInput.productPrice = productData.productPrice;
			if (productData.productMaterial) updateInput.productMaterial = productData.productMaterial;
			if (productData.productGlassType) updateInput.productGlassType = productData.productGlassType;
			if (productData.productOpenType) updateInput.productOpenType = productData.productOpenType;
			if (productData.productCategory) updateInput.productCategory = productData.productCategory;
			// productColor backend'da ProductUpdate type'ida yo'q, shuning uchun olib tashlandi
			if (productData.productImages && productData.productImages.length > 0) updateInput.productImages = productData.productImages;
			if (productData.productDesc !== undefined) updateInput.productDesc = productData.productDesc;
			// productRent backend'da ProductUpdate type'ida yo'q, shuning uchun olib tashlandi

			await updateProduct({
				variables: { input: updateInput },
			});
			await sweetTopSuccessAlert('Product updated successfully!');
			router.push({
				pathname: '/_admin/products',
				query: { refresh: 'true', timestamp: Date.now() },
			});
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message || 'Failed to update product');
		}
	};

	if (loadingProduct) {
		return (
			<Box component={'div'} className={'content product-edit-page'}>
				<Card>
					<CardContent>
						<Typography>Loading product...</Typography>
					</CardContent>
				</Card>
			</Box>
		);
	}

	const currentProduct = productsData?.getProducts?.list?.find((p: any) => p._id === id);

	return (
		<Box component={'div'} className={'content product-edit-page'}>
			{/* Header Section */}
			<Card className={'page-header-card'} sx={{ mb: 3 }}>
				<CardContent>
					<Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
						<Stack direction={'row'} alignItems={'center'} spacing={2}>
							<Button
								startIcon={<ArrowBackIcon />}
								onClick={() => router.push('/_admin/products')}
								className={'back-btn'}
							>
								Back
							</Button>
							<Box className={'product-edit-icon-box'}>
								<EditIcon className={'product-edit-icon'} />
							</Box>
							<Box>
								<Typography variant={'h4'} className={'page-title'} sx={{ fontWeight: 700, mb: 0.5 }}>
									Edit Product
								</Typography>
								<Typography variant={'body2'} sx={{ color: '#717171' }}>
									Modify existing product information
								</Typography>
							</Box>
						</Stack>
					</Stack>
				</CardContent>
			</Card>

			{/* Main Content - Two Column Layout */}
			<Grid container spacing={3}>
				{/* Left Column - Product Information */}
				<Grid item xs={12} md={4}>
					<Card className={'info-card'}>
						<CardContent>
							<Stack spacing={3}>
								<Box>
									<Stack direction={'row'} alignItems={'center'} spacing={1} sx={{ mb: 2 }}>
										<InfoOutlinedIcon sx={{ color: '#8B4513', fontSize: 20 }} />
										<Typography variant={'h6'} sx={{ fontWeight: 600, color: '#8B4513' }}>
											Product Information
										</Typography>
									</Stack>
									<Box className={'info-item'}>
										<Typography variant={'caption'} sx={{ color: '#9e9e9e', display: 'block', mb: 0.5 }}>
											Product ID
										</Typography>
										<Typography variant={'body2'} sx={{ fontWeight: 500, color: '#181a20' }}>
											{productData._id || 'Loading...'}
										</Typography>
									</Box>
									<Divider sx={{ my: 2 }} />
									<Box className={'info-item'}>
										<Stack direction={'row'} alignItems={'center'} spacing={1} sx={{ mb: 1 }}>
											<CalendarTodayIcon sx={{ color: '#8B4513', fontSize: 16 }} />
											<Typography variant={'caption'} sx={{ color: '#9e9e9e' }}>
												Created At
											</Typography>
										</Stack>
										<Typography variant={'body2'} sx={{ fontWeight: 500, color: '#181a20' }}>
											{currentProduct?.createdAt ? (
												<Moment format="YYYY-MM-DD HH:mm">{currentProduct.createdAt}</Moment>
											) : (
												'N/A'
											)}
										</Typography>
									</Box>
									<Divider sx={{ my: 2 }} />
									<Box className={'info-item'}>
										<Stack direction={'row'} alignItems={'center'} spacing={1} sx={{ mb: 1 }}>
											<UpdateIcon sx={{ color: '#8B4513', fontSize: 16 }} />
											<Typography variant={'caption'} sx={{ color: '#9e9e9e' }}>
												Last Updated
											</Typography>
										</Stack>
										<Typography variant={'body2'} sx={{ fontWeight: 500, color: '#181a20' }}>
											{currentProduct?.updatedAt ? (
												<Moment format="YYYY-MM-DD HH:mm">{currentProduct.updatedAt}</Moment>
											) : (
												'N/A'
											)}
										</Typography>
									</Box>
								</Box>
							</Stack>
						</CardContent>
					</Card>
				</Grid>

				{/* Right Column - Edit Form */}
				<Grid item xs={12} md={8}>
					<Card className={'form-card'}>
						<CardContent>
							<Grid container spacing={3}>
								{/* Product Type */}
								<Grid item xs={12} md={6}>
									<FormControl fullWidth className={'product-form-control'}>
										<InputLabel>Product Type</InputLabel>
										<Select
											value={productData.productType || ProductType.DOOR}
											onChange={(e) => handleInputChange('productType', e.target.value)}
											label="Product Type"
										>
											{Object.values(ProductType).map((type) => (
												<MenuItem key={type} value={type}>
													{type}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>

								{/* Product Status */}
								<Grid item xs={12} md={6}>
									<FormControl fullWidth className={'product-form-control'}>
										<InputLabel>Product Status</InputLabel>
										<Select
											value={productData.productStatus || ProductStatus.ACTIVE}
											onChange={(e) => handleInputChange('productStatus', e.target.value)}
											label="Product Status"
										>
											{Object.values(ProductStatus).map((status) => (
												<MenuItem key={status} value={status}>
													{status.replace('_', ' ')}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>

								{/* Product Title */}
								<Grid item xs={12}>
									<TextField
										fullWidth
										label="Product Title"
										value={productData.productTitle ?? ''}
										onChange={(e) => handleInputChange('productTitle', e.target.value)}
										className={'product-text-field'}
										required
									/>
								</Grid>

								{/* Product Address */}
								<Grid item xs={12}>
									<TextField
										fullWidth
										label="Product Address"
										value={productData.productAddress ?? ''}
										onChange={(e) => handleInputChange('productAddress', e.target.value)}
										className={'product-text-field'}
										required
									/>
								</Grid>

								{/* Product Location */}
								<Grid item xs={12} md={6}>
									<FormControl fullWidth className={'product-form-control'}>
										<InputLabel>Product Location</InputLabel>
										<Select
											value={productData.productLocation || ProductLocation.SEOUL}
											onChange={(e) => handleInputChange('productLocation', e.target.value)}
											label="Product Location"
										>
											{Object.values(ProductLocation).map((location) => (
												<MenuItem key={location} value={location}>
													{location}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>

								{/* Product Category */}
								<Grid item xs={12} md={6}>
									<FormControl fullWidth className={'product-form-control'}>
										<InputLabel>Product Category</InputLabel>
										<Select
											value={productData.productCategory || ProductCategory.INTERIOR}
											onChange={(e) => handleInputChange('productCategory', e.target.value)}
											label="Product Category"
										>
											{Object.values(ProductCategory).map((category) => (
												<MenuItem key={category} value={category}>
													{category}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>

								{/* Product Height */}
								<Grid item xs={12} md={4}>
									<TextField
										fullWidth
										type="number"
										label="Height (mm)"
										value={productData.productHeight || ''}
										onChange={(e) => handleNumberInputChange('productHeight', e.target.value)}
										className={'product-text-field'}
										required
									/>
								</Grid>

								{/* Product Width */}
								<Grid item xs={12} md={4}>
									<TextField
										fullWidth
										type="number"
										label="Width (mm)"
										value={productData.productWidth || ''}
										onChange={(e) => handleNumberInputChange('productWidth', e.target.value)}
										className={'product-text-field'}
										required
									/>
								</Grid>

								{/* Product Price */}
								<Grid item xs={12} md={4}>
									<TextField
										fullWidth
										type="number"
										label="Price (KRW)"
										value={productData.productPrice || ''}
										onChange={(e) => handleNumberInputChange('productPrice', e.target.value)}
										className={'product-text-field'}
										required
									/>
								</Grid>

								{/* Product Material */}
								<Grid item xs={12} md={6}>
									<FormControl fullWidth className={'product-form-control'}>
										<InputLabel>Product Material</InputLabel>
										<Select
											value={productData.productMaterial || ProductMaterial.PVC}
											onChange={(e) => handleInputChange('productMaterial', e.target.value)}
											label="Product Material"
										>
											{Object.values(ProductMaterial).map((material) => (
												<MenuItem key={material} value={material}>
													{material}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>

								{/* Product Glass Type */}
								<Grid item xs={12} md={6}>
									<FormControl fullWidth className={'product-form-control'}>
										<InputLabel>Glass Type</InputLabel>
										<Select
											value={productData.productGlassType || ProductGlassType.DOUBLE}
											onChange={(e) => handleInputChange('productGlassType', e.target.value)}
											label="Glass Type"
										>
											{Object.values(ProductGlassType).map((glassType) => (
												<MenuItem key={glassType} value={glassType}>
													{glassType.replace('_', ' ')}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>

								{/* Product Open Type */}
								<Grid item xs={12} md={6}>
									<FormControl fullWidth className={'product-form-control'}>
										<InputLabel>Open Type</InputLabel>
										<Select
											value={productData.productOpenType || ProductOpenType.SLIDING}
											onChange={(e) => handleInputChange('productOpenType', e.target.value)}
											label="Open Type"
										>
											{Object.values(ProductOpenType).map((openType) => (
												<MenuItem key={openType} value={openType}>
													{openType}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>

								{/* Product Description */}
								<Grid item xs={12}>
									<TextField
										fullWidth
										
										rows={4}
										label="Product Description"
										value={productData.productDesc ?? ''}
										onChange={(e) => handleInputChange('productDesc', e.target.value)}
										className={'product-text-field'}
									/>
								</Grid>

								{/* Image Upload Section */}
								<Grid item xs={12}>
									<Box className={'image-upload-section'}>
										<Typography variant={'h6'} sx={{ mb: 2, fontWeight: 600 }}>
											Product Images
										</Typography>
										<Stack direction={'row'} spacing={2} alignItems={'center'} sx={{ mb: 2 }}>
											<input
												type="file"
												ref={inputRef}
												multiple
												accept="image/*"
												style={{ display: 'none' }}
											/>
											<Button
												variant={'outlined'}
												startIcon={<AddRoundedIcon />}
												onClick={() => inputRef.current?.click()}
												className={'upload-images-btn'}
											>
												Add More Images
											</Button>
											<Button
												variant={'contained'}
												onClick={uploadImages}
												disabled={!inputRef.current?.files || inputRef.current.files.length === 0}
												className={'upload-images-submit-btn'}
											>
												Upload Images
											</Button>
										</Stack>
										{productData.productImages && productData.productImages.length > 0 && (
											<Grid container spacing={2}>
												{productData.productImages.map((image, index) => (
													<Grid item xs={12} sm={6} md={4} key={index}>
														<Box className={'image-preview-box'}>
															<img
																src={`${REACT_APP_API_URL}/${image}`}
																alt={`Product ${index + 1}`}
																className={'image-preview'}
															/>
															<Button
																className={'remove-image-btn'}
																onClick={() => removeImage(index)}
																startIcon={<DeleteRoundedIcon />}
															>
																Remove
															</Button>
														</Box>
													</Grid>
												))}
											</Grid>
										)}
									</Box>
								</Grid>

								{/* Submit Button */}
								<Grid item xs={12}>
									<Stack direction={'row'} spacing={2} justifyContent={'flex-end'}>
										<Button
											variant={'outlined'}
											onClick={() => router.push('/_admin/products')}
											className={'cancel-btn'}
										>
											Cancel
										</Button>
										<Button
											variant={'contained'}
											onClick={handleSubmit}
											disabled={doDisabledCheck()}
											className={'submit-btn'}
										>
											Update Product
										</Button>
									</Stack>
								</Grid>
							</Grid>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default withAdminLayout(ProductEdit);

