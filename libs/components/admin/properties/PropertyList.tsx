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
import { Property } from '../../../types/product/property';
import { REACT_APP_API_URL } from '../../../config';
import DeleteIcon from '@mui/icons-material/Delete';
import Typography from '@mui/material/Typography';
import { PropertyStatus } from '../../../enums/property.enum';
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

interface PropertyPanelListType {
	properties: Property[];
	anchorEl: any;
	menuIconClickHandler: any;
	menuIconCloseHandler: any;
	updatePropertyHandler: any;
	removePropertyHandler: any;
	editPropertyHandler?: (id: string) => void;
}

export const PropertyPanelList = (props: PropertyPanelListType) => {
	const router = useRouter();
	const {
		properties,
		anchorEl,
		menuIconClickHandler,
		menuIconCloseHandler,
		updatePropertyHandler,
		removePropertyHandler,
		editPropertyHandler,
	} = props;

	return (
		<Stack>
			<TableContainer>
				<Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
					{/*@ts-ignore*/}
					<EnhancedTableHead />
					<TableBody>
						{properties.length === 0 && (
							<TableRow>
								<TableCell align="center" colSpan={7}>
									<span className={'no-data'}>data not found!</span>
								</TableCell>
							</TableRow>
						)}

						{properties.length !== 0 &&
							properties.map((property: any, index: number) => {
								// Backend'dan productImages keladi, lekin Property type'ida propertyImages bor
								const images = (property?.productImages || property?.propertyImages) || [];
								const propertyImage = images.length > 0 
									? `${REACT_APP_API_URL}/${images[0]}` 
									: '/img/property/window.jpg'; // Default image
								
								// Backend'dan product field'lari keladi, lekin Property type'ida property field'lari bor
								const productTitle = property?.productTitle || property?.propertyTitle || 'N/A';
								const productPrice = property?.productPrice || property?.propertyPrice || 0;
								const productLocation = property?.productLocation || property?.propertyLocation || 'N/A';
								const productType = property?.productType || property?.propertyType || 'N/A';
								const productStatus = property?.productStatus || property?.propertyStatus;

								return (
									<TableRow hover key={property?._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
										<TableCell align="left">{property._id}</TableCell>
										<TableCell align="left" className={'name'}>
											<Stack direction={'row'}>
												<Link href={`/property/detail?id=${property?._id}`}>
													<div>
														<Avatar alt="Remy Sharp" src={propertyImage} sx={{ ml: '2px', mr: '10px' }} />
													</div>
												</Link>
												<Link href={`/property/detail?id=${property?._id}`}>
													<div>{productTitle}</div>
												</Link>
											</Stack>
										</TableCell>
										<TableCell align="center">{productPrice}</TableCell>
										<TableCell align="center">{productLocation}</TableCell>
										<TableCell align="center">{productType}</TableCell>
										<TableCell align="center">
											<Stack direction={'row'} spacing={1} alignItems={'center'} justifyContent={'center'}>
												{productStatus === PropertyStatus.ACTIVE && (
													<>
														<Button onClick={(e: any) => menuIconClickHandler(e, index)} className={'badge success'}>
															{productStatus}
														</Button>

														<Tooltip title="Edit">
															<IconButton
																onClick={() => {
																	if (editPropertyHandler) {
																		editPropertyHandler(property._id);
																	} else {
																		router.push(`/_admin/products/product_edit?id=${property._id}`);
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
																onClick={() => removePropertyHandler(property._id)}
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
															{Object.values(PropertyStatus)
																.filter((ele) => ele !== productStatus)
																.map((status: string) => (
																	<MenuItem
																		onClick={() => updatePropertyHandler({ _id: property._id, propertyStatus: status })}
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

												{productStatus === PropertyStatus.SOLD && (
													<Button className={'badge warning'}>{productStatus}</Button>
												)}

												{productStatus === PropertyStatus.DELETE && (
													<Button
														variant="outlined"
														sx={{ p: '3px', border: 'none', ':hover': { border: '1px solid #000000' } }}
														onClick={() => removePropertyHandler(property._id)}
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
