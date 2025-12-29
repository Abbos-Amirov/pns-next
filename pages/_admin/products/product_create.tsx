import React, { useRef, useState } from 'react';
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import { ProductInput } from '../../../libs/types/product/product.input';
import {
	ProductType,
	ProductStatus,
	ProductLocation,
	ProductMaterial,
	ProductGlassType,
	ProductOpenType,
	ProductCategory,
	ProductColor,
} from '../../../libs/enums/property.enum';
import { getJwtToken } from '../../../libs/auth';
import { REACT_APP_API_URL, REACT_APP_API_GRAPHQL_URL } from '../../../libs/config';
import axios from 'axios';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../../libs/sweetAlert';
import { useMutation } from '@apollo/client';
import { CREATE_PRODUCT } from '../../../apollo/admin/mutation';

const ProductCreate: NextPage = (props: any) => {
	const router = useRouter();
	const inputRef = useRef<HTMLInputElement>(null);
	const token = getJwtToken();

	const [productData, setProductData] = useState<ProductInput>({
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
		productColor: ProductColor.WHITE,
		productImages: [],
	});

	const [createProduct] = useMutation(CREATE_PRODUCT);

	/** HANDLERS **/
	const handleInputChange = (field: keyof ProductInput, value: any) => {
		setProductData({ ...productData, [field]: value });
	};

	const handleNumberInputChange = (field: keyof ProductInput, value: string) => {
		const numValue = parseFloat(value) || 0;
		setProductData({ ...productData, [field]: numValue });
	};

	async function uploadImages(): Promise<string[] | null> {
		try {
			const formData = new FormData();
			const selectedFiles = inputRef.current?.files;

			if (!selectedFiles || selectedFiles.length === 0) {
				await sweetMixinErrorAlert('Please select at least one image!');
				return null;
			}
			if (selectedFiles.length > 5) {
				throw new Error('Cannot upload more than 5 images!');
			}

			const fileCount = selectedFiles.length;
			const filesArray = Array.from(selectedFiles);

			const variablesFiles = new Array(fileCount).fill(null);
			const map: Record<string, string[]> = {};
			for (let i = 0; i < fileCount; i++) {
				map[String(i)] = [`variables.files.${i}`];
			}

			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) { 
						imagesUploader(files: $files, target: $target)
				  }`,
					variables: {
						files: variablesFiles,
						target: 'product',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify(map),
			);
			filesArray.forEach((file, idx) => formData.append(String(idx), file));

			const graphqlUrl = REACT_APP_API_GRAPHQL_URL || 'http://localhost:3007/graphql';

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

			const responseImagesRaw = response.data.data.imagesUploader;
			const responseImages: string[] = Array.isArray(responseImagesRaw)
				? responseImagesRaw
				: typeof responseImagesRaw === 'string'
					? [responseImagesRaw]
					: [];

			if (!responseImages.length) {
				throw new Error('No images returned from server');
			}

			// Use functional setState to avoid stale closures
			setProductData((prev) => ({ ...prev, productImages: responseImages }));
			await sweetTopSuccessAlert('Images uploaded successfully!');
			return responseImages;
		} catch (err: any) {
			console.error('Image upload error:', err);
			const errorMessage = err.response?.data?.message || err.message || 'Failed to upload images';
			await sweetMixinErrorAlert(errorMessage);
			return null;
		}
	}

	const removeImage = (index: number) => {
		const newImages = productData.productImages.filter((_, i) => i !== index);
		setProductData({ ...productData, productImages: newImages });
	};

	const doDisabledCheck = () => {
		const checks = {
			title: productData.productTitle.trim() === '',
			address: productData.productAddress.trim() === '',
			price: !productData.productPrice || productData.productPrice <= 0,
			height: !productData.productHeight || productData.productHeight <= 0,
			width: !productData.productWidth || productData.productWidth <= 0,
			// Rasimlar majburiy emas, lekin agar yuklangan bo'lsa, ular to'g'ri bo'lishi kerak
		};
		
		const isDisabled = Object.values(checks).some(check => check === true);
		
		// Debug: console'da qaysi shart bajarilmayotganini ko'rsatish
		if (isDisabled) {
			console.log('Form validation failed:', checks);
			console.log('Current productData:', {
				title: productData.productTitle,
				address: productData.productAddress,
				price: productData.productPrice,
				height: productData.productHeight,
				width: productData.productWidth,
				imagesCount: productData.productImages.length,
			});
		}
		
		return isDisabled;
	};

	const handleSubmit = async () => {
		try {
			// If user selected files but didn't click "Upload Images", upload automatically on submit
			let imagesToSave = productData.productImages;
			const hasSelectedFiles = !!inputRef.current?.files && inputRef.current.files.length > 0;
			if (hasSelectedFiles && (!imagesToSave || imagesToSave.length === 0)) {
				const uploaded = await uploadImages();
				if (!uploaded) return;
				imagesToSave = uploaded;
			}

			await createProduct({
				variables: { input: { ...productData, productImages: imagesToSave } },
			});
			await sweetTopSuccessAlert('Product created successfully!');
			router.push('/_admin/products');
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message || 'Failed to create product');
		}
	};

	return (
		<Box component={'div'} className={'content product-create-page'}>
			{/* Header Section */}
			<Card className={'page-header-card'} sx={{ mb: 3 }}>
				<CardContent>
					<Stack direction={'row'} alignItems={'center'} spacing={2}>
						<Button
							startIcon={<ArrowBackIcon />}
							onClick={() => router.push('/_admin/products')}
							className={'back-btn'}
						>
							Back
						</Button>
						<Box className={'product-create-icon-box'}>
							<HomeWorkIcon className={'product-create-icon'} />
						</Box>
						<Box>
							<Typography variant={'h4'} className={'page-title'} sx={{ fontWeight: 700, mb: 0.5 }}>
								Create New Product
							</Typography>
							<Typography variant={'body2'} sx={{ color: '#717171' }}>
								Add a new product to the platform
							</Typography>
						</Box>
					</Stack>
				</CardContent>
			</Card>

			{/* Form Section */}
			<Card className={'form-card'}>
				<CardContent>
					<Grid container spacing={3}>
						{/* Product Type */}
						<Grid item xs={12} md={6}>
							<FormControl fullWidth className={'product-form-control'}>
								<InputLabel>Product Type</InputLabel>
								<Select
									value={productData.productType}
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
									value={productData.productStatus}
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
								value={productData.productTitle}
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
								value={productData.productAddress}
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
									value={productData.productLocation}
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
									value={productData.productCategory}
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
									value={productData.productMaterial}
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
									value={productData.productGlassType}
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
									value={productData.productOpenType}
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

						{/* Product Color */}
						<Grid item xs={12} md={6}>
							<FormControl fullWidth className={'product-form-control'}>
								<InputLabel>Product Color</InputLabel>
								<Select
									value={productData.productColor}
									onChange={(e) => handleInputChange('productColor', e.target.value)}
									label="Product Color"
								>
									{Object.values(ProductColor).map((color) => (
										<MenuItem key={color} value={color}>
											{color}
										</MenuItem>
									))}
								</Select>
							</FormControl>
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
										Select Images
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
								{productData.productImages.length > 0 && (
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
									Create Product
								</Button>
							</Stack>
						</Grid>
					</Grid>
				</CardContent>
			</Card>
		</Box>
	);
};

export default withAdminLayout(ProductCreate);

