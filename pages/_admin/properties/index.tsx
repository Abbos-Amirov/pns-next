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
import { PropertyPanelList } from '../../../libs/components/admin/properties/PropertyList';
import { AllPropertiesInquiry } from '../../../libs/types/property/property.input';
import { Property } from '../../../libs/types/property/property';
import { PropertyLocation, PropertyStatus } from '../../../libs/enums/property.enum';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../../libs/sweetAlert';
import { PropertyUpdate } from '../../../libs/types/property/property.update';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_PROPERTIES_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_PROPERTY_BY_ADMIN, REMOVE_PROPERTY_BY_ADMIN } from '../../../apollo/admin/mutation';

const AdminProperties: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [propertiesInquiry, setPropertiesInquiry] = useState<AllPropertiesInquiry>(initialInquiry);
	const [properties, setProperties] = useState<Property[]>([]);
	const [propertiesTotal, setPropertiesTotal] = useState<number>(0);
	const [value, setValue] = useState(
		propertiesInquiry?.search?.propertyStatus ? propertiesInquiry?.search?.propertyStatus : 'ALL',
	);
	const [searchType, setSearchType] = useState('ALL');

	/** APOLLO REQUESTS **/
	const { data: propertiesData, refetch: refetchProperties } = useQuery(GET_ALL_PROPERTIES_BY_ADMIN, {
		variables: { input: propertiesInquiry },
		fetchPolicy: 'network-only',
	});

	const [updatePropertyByAdmin] = useMutation(UPDATE_PROPERTY_BY_ADMIN);
	const [removePropertyByAdmin] = useMutation(REMOVE_PROPERTY_BY_ADMIN);

	/** LIFECYCLES **/
	useEffect(() => {
		if (propertiesData?.getAllPropertiesByAdmin) {
			setProperties(propertiesData.getAllPropertiesByAdmin.list);
			setPropertiesTotal(propertiesData.getAllPropertiesByAdmin.metaCounter.total);
		}
	}, [propertiesData]);

	useEffect(() => {
		refetchProperties();
	}, [propertiesInquiry, refetchProperties]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		propertiesInquiry.page = newPage + 1;
		setPropertiesInquiry({ ...propertiesInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		propertiesInquiry.limit = parseInt(event.target.value, 10);
		propertiesInquiry.page = 1;
		setPropertiesInquiry({ ...propertiesInquiry });
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

		setPropertiesInquiry({ ...propertiesInquiry, page: 1, sort: 'createdAt' });

		switch (newValue) {
			case 'ACTIVE':
				setPropertiesInquiry({ ...propertiesInquiry, search: { propertyStatus: PropertyStatus.ACTIVE } });
				break;
			case 'SOLD':
				setPropertiesInquiry({ ...propertiesInquiry, search: { propertyStatus: PropertyStatus.SOLD } });
				break;
			case 'DELETE':
				setPropertiesInquiry({ ...propertiesInquiry, search: { propertyStatus: PropertyStatus.DELETE } });
				break;
			default:
				delete propertiesInquiry?.search?.propertyStatus;
				setPropertiesInquiry({ ...propertiesInquiry });
				break;
		}
	};

	const removePropertyHandler = async (id: string) => {
		try {
			await removePropertyByAdmin({
				variables: { input: id },
			});
			await sweetTopSuccessAlert('Product removed successfully!');
			menuIconCloseHandler();
			await refetchProperties();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				setPropertiesInquiry({
					...propertiesInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						...propertiesInquiry.search,
						propertyLocationList: [newValue as PropertyLocation],
					},
				});
			} else {
				delete propertiesInquiry?.search?.propertyLocationList;
				setPropertiesInquiry({ ...propertiesInquiry });
			}
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

	const updatePropertyHandler = async (updateData: PropertyUpdate) => {
		try {
			await updatePropertyByAdmin({
				variables: { input: updateData },
			});
			await sweetTopSuccessAlert('Product updated successfully!');
			menuIconCloseHandler();
			await refetchProperties();
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
						<Chip
							label={`Total: ${propertiesTotal}`}
							sx={{
								backgroundColor: 'rgba(22, 70, 193, 0.1)',
								color: '#1646C1',
								fontWeight: 600,
								fontSize: '14px',
								height: '36px',
							}}
						/>
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
										onClick={(e) => tabChangeHandler(e, 'ALL')}
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
										onClick={(e) => tabChangeHandler(e, 'ACTIVE')}
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
										onClick={(e) => tabChangeHandler(e, 'SOLD')}
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
										onClick={(e) => tabChangeHandler(e, 'DELETE')}
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
									{Object.values(PropertyLocation).map((location: string) => (
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
						properties={properties}
						anchorEl={anchorEl}
						menuIconClickHandler={menuIconClickHandler}
						menuIconCloseHandler={menuIconCloseHandler}
						updatePropertyHandler={updatePropertyHandler}
						removePropertyHandler={removePropertyHandler}
					/>

					<Box sx={{ px: 3, pb: 2 }}>
						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={propertiesTotal}
							rowsPerPage={propertiesInquiry?.limit}
							page={propertiesInquiry?.page - 1}
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
