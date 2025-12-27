import React from 'react';
import Link from 'next/link';
import {
	TableCell,
	TableHead,
	TableBody,
	TableRow,
	Table,
	TableContainer,
	Button,
	Menu,
	Fade,
	MenuItem,
	IconButton,
	Tooltip,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { Stack } from '@mui/material';
import { Product } from '../../../types/product/property';
import { REACT_APP_API_URL } from '../../../config';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import { ProductStatus } from '../../../enums/property.enum';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { useRouter } from 'next/router';

interface Data {
	id: string;
	title: string;
	price: string;
	location: string;
	type: string;
	status: string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
	disablePadding: boolean;
	id: keyof Data;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{
		id: 'id',
		numeric: true,
		disablePadding: false,
		label: 'MB ID',
	},
	{
		id: 'title',
		numeric: true,
		disablePadding: false,
		label: 'TITLE',
	},
	{
		id: 'price',
		numeric: false,
		disablePadding: false,
		label: 'PRICE',
	},
	{
		id: 'location',
		numeric: false,
		disablePadding: false,
		label: 'LOCATION',
	},
	{
		id: 'type',
		numeric: false,
		disablePadding: false,
		label: 'TYPE',
	},
	{
		id: 'status',
		numeric: false,
		disablePadding: false,
		label: 'STATUS',
	},
];

interface EnhancedTableProps {
	numSelected: number;
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
	order: Order;
	orderBy: string;
	rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
	const { onSelectAllClick } = props;

	return (
		<TableHead>
			<TableRow>
				{headCells.map((headCell) => (
					<TableCell
						key={headCell.id}
						align={headCell.numeric ? 'left' : 'center'}
						padding={headCell.disablePadding ? 'none' : 'normal'}
					>
						{headCell.label}
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface ProductPanelListType {
	products: Product[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updateProductHandler: any;
	removeProductHandler: any;
	editProductHandler?: (id: string) => void;
}

export const ProductPanelList = (props: ProductPanelListType) => {
	const router = useRouter();
	const {
		products,
		anchorEl,
		menuIconClickHandler,
		menuIconCloseHandler,
		updateProductHandler,
		removeProductHandler,
		editProductHandler,
	} = props;

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
					{/* @ts-ignore */}
					<EnhancedTableHead />
					<TableBody>
						{products.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={7}>
									<span className={'no-data'}>data not found!</span>
								</TableCell>
							</TableRow>
						)}

						{products.length !== 0 &&
							products.map((product: any, index: number) => {
								// Backend may return images in different shapes/fields depending on old/new schemas.
								const imagesRaw =
									product?.productImages ??
									product?.productImages ??
									product?.images ??
									product?.propertyImages ??
									[];
								const images: string[] = Array.isArray(imagesRaw)
									? (imagesRaw as any[]).filter((v) => typeof v === 'string') as string[]
									: typeof imagesRaw === 'string'
										? (() => {
												const trimmed = imagesRaw.trim();
												if (!trimmed) return [];
												// handle JSON-stringified arrays
												if (trimmed.startsWith('[')) {
													try {
														const parsed = JSON.parse(trimmed);
														return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [trimmed];
													} catch {
														return [trimmed];
													}
												}
												return [trimmed];
										  })()
										: [];

								const rawFirstImage = images[0];
								const isAbsolute =
									typeof rawFirstImage === 'string' &&
									(rawFirstImage.startsWith('http://') ||
										rawFirstImage.startsWith('https://') ||
										rawFirstImage.startsWith('/img/'));
								const productImage =
									rawFirstImage && isAbsolute
										? rawFirstImage
										: rawFirstImage
										? `${REACT_APP_API_URL}/${rawFirstImage.replace(/^\/+/, '')}`
										: '/img/property/window.jpg'; // Default image
								
								const productTitle = product?.productTitle || product?.propertyTitle || 'N/A';
								const productPrice = product?.productPrice || product?.propertyPrice || 0;
								const productLocation = product?.productLocation || product?.propertyLocation || 'N/A';
								const productType = product?.productType || product?.propertyType || 'N/A';
								const productStatus = product?.productStatus || product?.propertyStatus;

								return (
									<TableRow hover key={product?._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
										<TableCell align="left">{product._id}</TableCell>
										<TableCell align="left" className={'name'}>
											<Stack direction={'row'}>
												<Link href={`/property/detail?id=${product?._id}`}>
													<div>
														<Avatar alt="Remy Sharp" src={productImage} sx={{ ml: '2px', mr: '10px' }} />
													</div>
												</Link>
												<Link href={`/property/detail?id=${product?._id}`}>
													<div>{productTitle}</div>
												</Link>
											</Stack>
										</TableCell>
										<TableCell align="center">{productPrice}</TableCell>
										<TableCell align="center">{productLocation}</TableCell>
										<TableCell align="center">{productType}</TableCell>
										<TableCell align="center">
											<Stack direction={'row'} spacing={1} alignItems={'center'} justifyContent={'center'}>
												{productStatus === ProductStatus.ACTIVE && (
													<>
														<Button onClick={(e: any) => menuIconClickHandler(e, index)} className={'badge success'}>
															{productStatus}
														</Button>

														<Tooltip title="Edit">
															<IconButton
																onClick={() => {
																	if (editProductHandler) {
																		editProductHandler(product._id);
																	} else {
																		router.push(`/_admin/products/product_edit?id=${product._id}`);
																	}
																}}
																className={'product-edit-btn'}
																size="small"
															>
																<EditRoundedIcon />
															</IconButton>
														</Tooltip>

														<Tooltip title="Delete">
															<IconButton
																onClick={() => removeProductHandler(product._id)}
																className={'product-delete-btn'}
																size="small"
															>
																<DeleteRoundedIcon />
															</IconButton>
														</Tooltip>

														<Menu
															className={'menu-modal'}
															MenuListProps={{
																'aria-labelledby': 'fade-button',
															}}
															anchorEl={anchorEl[index]}
															open={Boolean(anchorEl[index])}
															onClose={menuIconCloseHandler}
															TransitionComponent={Fade}
															sx={{ p: 1 }}
														>
															{Object.values(ProductStatus)
																.filter((ele) => ele !== productStatus)
																.map((status: string) => (
																	<MenuItem
																		onClick={() => updateProductHandler({ _id: product._id, productStatus: status })}
																		key={status}
																	>
																		<Typography variant={'subtitle1'} component={'span'}>
																			{status}
																		</Typography>
																	</MenuItem>
																))}
														</Menu>
													</>
												)}

												{productStatus === ProductStatus.OUT_OF_STOCK && (
													<Button className={'badge warning'}>{productStatus}</Button>
												)}

												{productStatus === ProductStatus.DELETE && (
													<Button
														variant="outlined"
														sx={{ p: '3px', border: 'none', ':hover': { border: '1px solid #000000' } }}
														onClick={() => removeProductHandler(product._id)}
													>
														<DeleteIcon fontSize="small" />
													</Button>
												)}
											</Stack>
										</TableCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};
