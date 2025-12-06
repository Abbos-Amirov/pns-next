import React, { useCallback, useEffect, useState, useRef } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { MemberPanelList } from '../../../libs/components/admin/users/MemberList';
import {
	Box,
	InputAdornment,
	Stack,
	Card,
	CardContent,
	Chip,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	FormControl,
	InputLabel,
	Grid,
	IconButton,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import OutlinedInput from '@mui/material/OutlinedInput';
import TablePagination from '@mui/material/TablePagination';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PeopleIcon from '@mui/icons-material/People';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { REACT_APP_API_URL, REACT_APP_API_GRAPHQL_URL } from '../../../libs/config';
import { getJwtToken } from '../../../libs/auth';
import axios from 'axios';
import { MembersInquiry } from '../../../libs/types/member/member.input';
import { Member } from '../../../libs/types/member/member';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { sweetErrorHandling, sweetTopSuccessAlert, sweetMixinErrorAlert } from '../../../libs/sweetAlert';
import { MemberUpdate } from '../../../libs/types/member/member.update';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_MEMBER_BY_ADMIN, UPDATE_MEMBERS_BY_ADMIN } from '../../../apollo/admin/mutation';

const AdminUsers: NextPage = ({ initialInquiry, ...props }: any) => {
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [membersInquiry, setMembersInquiry] = useState<MembersInquiry>(initialInquiry);
	const [members, setMembers] = useState<Member[]>([]);
	const [membersTotal, setMembersTotal] = useState<number>(0);
	const [value, setValue] = useState(
		membersInquiry?.search?.memberStatus ? membersInquiry?.search?.memberStatus : 'ALL',
	);
	const [searchText, setSearchText] = useState('');
	const [searchType, setSearchType] = useState('ALL');
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [selectedMember, setSelectedMember] = useState<Member | null>(null);
	const [memberUpdateData, setMemberUpdateData] = useState<MemberUpdate>({
		_id: '',
		memberType: MemberType.USER,
		memberStatus: MemberStatus.ACTIVE,
		memberPhone: '',
		memberNick: '',
		memberPassword: '',
		memberFullName: '',
		memberImage: '',
		memberAddress: '',
		memberDesc: '',
	});
	const inputRef = useRef<HTMLInputElement>(null);
	const token = getJwtToken();

	/** APOLLO REQUESTS **/
	// Search object'ni tozalash - bo'sh field'larni olib tashlash
	const cleanSearch = membersInquiry.search 
		? Object.fromEntries(
			Object.entries(membersInquiry.search).filter(([_, value]) => value !== undefined && value !== null && value !== '')
		)
		: {};
	
	const cleanMembersInquiry = {
		page: membersInquiry.page,
		limit: membersInquiry.limit,
		sort: membersInquiry.sort,
		direction: membersInquiry.direction,
		search: Object.keys(cleanSearch).length > 0 ? cleanSearch : {},
	};

	const { data: membersData, loading, error, refetch: refetchMembers } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		variables: { input: cleanMembersInquiry },
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		onError: (err) => {
			console.error('Members Query Error:', err);
			sweetErrorHandling(err).then();
		},
		onCompleted: (data) => {
			console.log('Query completed with data:', data);
		},
	});

	const [updateMemberByAdmin] = useMutation(UPDATE_MEMBER_BY_ADMIN);
	const [updateMembersByAdmin] = useMutation(UPDATE_MEMBERS_BY_ADMIN);

	/** LIFECYCLES **/
	useEffect(() => {
		if (membersData?.getAllMembersByAdmin) {
			setMembers(membersData.getAllMembersByAdmin.list || []);
			// metaCounter array ko'rinishida keladi: [{ total: 4 }]
			const metaCounter = membersData.getAllMembersByAdmin.metaCounter;
			const total = Array.isArray(metaCounter) 
				? (metaCounter[0]?.total || 0)
				: (metaCounter?.total || 0);
			setMembersTotal(total);
		}
	}, [membersData]);

	useEffect(() => {
		refetchMembers();
	}, [membersInquiry, refetchMembers]);

	/** HANDLERS **/
	const changePageHandler = async (event: unknown, newPage: number) => {
		membersInquiry.page = newPage + 1;
		setMembersInquiry({ ...membersInquiry });
	};

	const changeRowsPerPageHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		membersInquiry.limit = parseInt(event.target.value, 10);
		membersInquiry.page = 1;
		setMembersInquiry({ ...membersInquiry });
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
		setSearchText('');

		setMembersInquiry({ ...membersInquiry, page: 1, sort: 'createdAt' });

		switch (newValue) {
			case 'ACTIVE':
				setMembersInquiry({ ...membersInquiry, search: { memberStatus: MemberStatus.ACTIVE } });
				break;
			case 'BLOCK':
				setMembersInquiry({ ...membersInquiry, search: { memberStatus: MemberStatus.BLOCK } });
				break;
			case 'DELETE':
				setMembersInquiry({ ...membersInquiry, search: { memberStatus: MemberStatus.DELETE } });
				break;
			default:
				delete membersInquiry?.search?.memberStatus;
				setMembersInquiry({ ...membersInquiry });
				break;
		}
	};

	const updateMemberHandler = async (updateData: MemberUpdate) => {
		try {
			await updateMemberByAdmin({
				variables: { input: updateData },
			});
			await sweetTopSuccessAlert('Member updated successfully!');
			menuIconCloseHandler();
			await refetchMembers();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const textHandler = useCallback((value: string) => {
		try {
			setSearchText(value);
		} catch (err: any) {
			console.log('textHandler: ', err.message);
		}
	}, []);

	const searchTextHandler = () => {
		try {
			setMembersInquiry({
				...membersInquiry,
				search: {
					...membersInquiry.search,
					text: searchText,
				},
			});
		} catch (err: any) {
			console.log('searchTextHandler: ', err.message);
		}
	};

	const searchTypeHandler = async (newValue: string) => {
		try {
			setSearchType(newValue);

			if (newValue !== 'ALL') {
				setMembersInquiry({
					...membersInquiry,
					page: 1,
					sort: 'createdAt',
					search: {
						...membersInquiry.search,
						memberType: newValue as MemberType,
					},
				});
			} else {
				delete membersInquiry?.search?.memberType;
				setMembersInquiry({ ...membersInquiry });
			}
		} catch (err: any) {
			console.log('searchTypeHandler: ', err.message);
		}
	};

	const handleEditClick = (member: Member) => {
		setSelectedMember(member);
		setMemberUpdateData({
			_id: member._id,
			memberType: member.memberType || MemberType.USER,
			memberStatus: member.memberStatus || MemberStatus.ACTIVE,
			memberPhone: member.memberPhone || '',
			memberNick: member.memberNick || '',
			memberPassword: '',
			memberFullName: member.memberFullName || '',
			memberImage: member.memberImage || '',
			memberAddress: member.memberAddress || '',
			memberDesc: member.memberDesc || '',
		});
		setEditDialogOpen(true);
	};

	const handleEditClose = () => {
		setEditDialogOpen(false);
		setSelectedMember(null);
		setMemberUpdateData({
			_id: '',
			memberType: MemberType.USER,
			memberStatus: MemberStatus.ACTIVE,
			memberPhone: '',
			memberNick: '',
			memberPassword: '',
			memberFullName: '',
			memberImage: '',
			memberAddress: '',
			memberDesc: '',
		});
	};

	const handleInputChange = (field: keyof MemberUpdate, value: any) => {
		setMemberUpdateData((prev) => ({ ...prev, [field]: value }));
	};

	const uploadImage = async () => {
		try {
			const formData = new FormData();
			const selectedFile = inputRef.current?.files?.[0];

			if (!selectedFile) {
				await sweetMixinErrorAlert('Please select an image!');
				return false;
			}

			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) { 
						imagesUploader(files: $files, target: $target)
				  }`,
					variables: {
						files: [null],
						target: 'member',
					},
				}),
			);
			formData.append('map', JSON.stringify({ '0': ['variables.files.0'] }));
			formData.append('0', selectedFile);

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

			const responseImages = response.data.data.imagesUploader;
			if (responseImages && responseImages.length > 0) {
				setMemberUpdateData({ ...memberUpdateData, memberImage: responseImages[0] });
				await sweetTopSuccessAlert('Image uploaded successfully!');
				return true;
			}
			return false;
		} catch (err: any) {
			console.error('Image upload error:', err);
			const errorMessage = err.response?.data?.message || err.message || 'Failed to upload image';
			await sweetMixinErrorAlert(errorMessage);
			return false;
		}
	};

	const removeImage = () => {
		setMemberUpdateData({ ...memberUpdateData, memberImage: '' });
		if (inputRef.current) {
			inputRef.current.value = '';
		}
	};

	const handleUpdateMember = async () => {
		try {
			if (!memberUpdateData._id) {
				await sweetMixinErrorAlert('Member ID is missing');
				return;
			}

			const updateInput: MemberUpdate = {
				_id: memberUpdateData._id,
			};

			if (memberUpdateData.memberType) updateInput.memberType = memberUpdateData.memberType;
			if (memberUpdateData.memberStatus) updateInput.memberStatus = memberUpdateData.memberStatus;
			if (memberUpdateData.memberPhone) updateInput.memberPhone = memberUpdateData.memberPhone;
			if (memberUpdateData.memberNick) updateInput.memberNick = memberUpdateData.memberNick;
			if (memberUpdateData.memberPassword) updateInput.memberPassword = memberUpdateData.memberPassword;
			if (memberUpdateData.memberFullName) updateInput.memberFullName = memberUpdateData.memberFullName;
			if (memberUpdateData.memberImage) updateInput.memberImage = memberUpdateData.memberImage;
			if (memberUpdateData.memberAddress) updateInput.memberAddress = memberUpdateData.memberAddress;
			if (memberUpdateData.memberDesc) updateInput.memberDesc = memberUpdateData.memberDesc;

			await updateMembersByAdmin({
				variables: { input: updateInput },
			});
			await sweetTopSuccessAlert('Member updated successfully!');
			handleEditClose();
			await refetchMembers();
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message || 'Failed to update member');
		}
	};

	return (
		<Box component={'div'} className={'content users-page'}>
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
									backgroundColor: 'rgba(139, 69, 19, 0.1)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#8B4513',
								}}
							>
								<PeopleIcon sx={{ fontSize: 32 }} />
							</Box>
							<Box>
								<Typography variant={'h4'} className={'page-title'} sx={{ fontWeight: 700, mb: 0.5 }}>
									User Management
								</Typography>
								<Typography variant={'body2'} sx={{ color: '#717171' }}>
									Manage and monitor all users in the platform
								</Typography>
							</Box>
						</Stack>
						<Chip
							label={`Total: ${membersTotal}`}
							sx={{
								backgroundColor: 'rgba(139, 69, 19, 0.1)',
								color: '#8B4513',
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
										onClick={(e:any) => tabChangeHandler(e, 'ALL')}
										className={value === 'ALL' ? 'tab-btn active' : 'tab-btn'}
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
										onClick={(e:any) => tabChangeHandler(e, 'ACTIVE')}
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
										variant={value === 'BLOCK' ? 'contained' : 'outlined'}
										onClick={(e) => tabChangeHandler(e, 'BLOCK')}
										className={value === 'BLOCK' ? 'tab-btn active' : 'tab-btn'}
										sx={{
											textTransform: 'none',
											borderRadius: '8px',
											px: 3,
											py: 1,
											fontWeight: 600,
											...(value === 'BLOCK'
												? {
														backgroundColor: '#B72136',
														color: '#fff',
														'&:hover': { backgroundColor: '#8f1a2a' },
												  }
												: {
														borderColor: '#e0e0e0',
														color: '#424242',
														'&:hover': { borderColor: '#B72136', backgroundColor: 'rgba(183, 33, 54, 0.05)' },
												  }),
										}}
									>
										Blocked
									</Button>
									<Button
										variant={value === 'DELETE' ? 'contained' : 'outlined'}
										onClick={(e:any) => tabChangeHandler(e, 'DELETE')}
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

							{/* Search and Filter */}
							<Stack direction={'row'} spacing={2} className={'search-filter-area'}>
								<OutlinedInput
									value={searchText}
									onChange={(e: any) => textHandler(e.target.value)}
									sx={{
										flex: 1,
										borderRadius: '8px',
										'& .MuiOutlinedInput-notchedOutline': {
											borderColor: '#e0e0e0',
										},
										'&:hover .MuiOutlinedInput-notchedOutline': {
											borderColor: '#8B4513',
										},
										'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
											borderColor: '#8B4513',
											borderWidth: '2px',
										},
									}}
									className={'search-input'}
									placeholder="Search by user name, phone, or ID..."
									onKeyDown={(event) => {
										if (event.key == 'Enter') searchTextHandler();
									}}
									startAdornment={
										<InputAdornment position="start">
											<SearchIcon sx={{ color: '#8B4513' }} />
										</InputAdornment>
									}
									endAdornment={
										<>
											{searchText && (
												<InputAdornment position="end">
													<CancelRoundedIcon
														sx={{ cursor: 'pointer', color: '#9e9e9e', '&:hover': { color: '#424242' } }}
														onClick={async () => {
															setSearchText('');
															setMembersInquiry({
																...membersInquiry,
																search: {
																	...membersInquiry.search,
																	text: '',
																},
															});
														}}
													/>
												</InputAdornment>
											)}
										</>
									}
								/>
								<Button
									variant={'outlined'}
									onClick={() => searchTextHandler()}
									sx={{
										borderRadius: '8px',
										px: 3,
										textTransform: 'none',
										borderColor: '#8B4513',
										color: '#8B4513',
										fontWeight: 600,
										'&:hover': {
											borderColor: '#6B3410',
											backgroundColor: 'rgba(139, 69, 19, 0.05)',
										},
									}}
								>
									Search
								</Button>
								<Select
									value={searchType}
									sx={{
										minWidth: '160px',
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
										<InputAdornment position="start" sx={{ mr: 1 }}>
											<FilterListIcon sx={{ color: '#8B4513', fontSize: 20 }} />
										</InputAdornment>
									}
								>
									<MenuItem value={'ALL'} onClick={() => searchTypeHandler('ALL')}>
										All Types
									</MenuItem>
									{Object.values(MemberType).map((type) => (
										<MenuItem key={type} value={type} onClick={() => searchTypeHandler(type)}>
											{type}
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
							<Typography variant={'body2'}>Loading members...</Typography>
						</Box>
					) : error ? (
						<Box sx={{ p: 4, textAlign: 'center' }}>
							<Typography variant={'body2'} color={'error'}>
								Error loading members: {error.message}
							</Typography>
						</Box>
					) : (
						<MemberPanelList
							members={members}
							anchorEl={anchorEl}
							menuIconClickHandler={menuIconClickHandler}
							menuIconCloseHandler={menuIconCloseHandler}
							updateMemberHandler={updateMemberHandler}
							onEditClick={handleEditClick}
						/>
					)}

					<Box sx={{ px: 3, pb: 2 }}>
						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={membersTotal}
							rowsPerPage={membersInquiry?.limit}
							page={membersInquiry?.page - 1}
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

			{/* Edit Member Dialog */}
			<Dialog
				open={editDialogOpen}
				onClose={handleEditClose}
				maxWidth="md"
				fullWidth
				PaperProps={{
					sx: {
						borderRadius: '20px',
						boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.2)',
						overflow: 'hidden',
					},
				}}
			>
				<DialogTitle
					sx={{
						background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #CD853F 100%)',
						padding: '24px 32px',
						pb: 2,
						position: 'relative',
						'&::after': {
							content: '""',
							position: 'absolute',
							bottom: 0,
							left: 0,
							right: 0,
							height: '1px',
							background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
						},
					}}
				>
					<Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
						<Stack direction={'row'} alignItems={'center'} spacing={2}>
							<Box
								sx={{
									width: 56,
									height: 56,
									borderRadius: '14px',
									background: 'rgba(255, 255, 255, 0.2)',
									backdropFilter: 'blur(10px)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#ffffff',
									border: '2px solid rgba(255, 255, 255, 0.3)',
									boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
								}}
							>
								<EditIcon sx={{ fontSize: 30 }} />
							</Box>
							<Box>
								<Typography
									variant={'h5'}
									sx={{
										fontWeight: 700,
										color: '#ffffff',
										fontFamily: '$font',
										textShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
										mb: 0.5,
									}}
								>
									Edit Member
								</Typography>
								<Typography
									variant={'body2'}
									sx={{
										color: 'rgba(255, 255, 255, 0.9)',
										fontSize: '13px',
										fontWeight: 500,
									}}
								>
									Update member information and settings
								</Typography>
							</Box>
						</Stack>
						<IconButton
							onClick={handleEditClose}
							sx={{
								color: '#ffffff',
								backgroundColor: 'rgba(255, 255, 255, 0.15)',
								backdropFilter: 'blur(10px)',
								width: 40,
								height: 40,
								'&:hover': {
									backgroundColor: 'rgba(255, 255, 255, 0.25)',
									transform: 'rotate(90deg)',
									transition: 'all 0.3s ease',
								},
								transition: 'all 0.3s ease',
							}}
						>
							<CloseIcon />
						</IconButton>
					</Stack>
				</DialogTitle>
				<DialogContent sx={{ pt: 5, px: 3, pb: 2 }}>
					<Grid container spacing={3}>
						{/* Member Type */}
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
								<InputLabel 
									sx={{ 
										backgroundColor: '#ffffff',
										px: 1,
										fontWeight: 600,
										fontSize: '14px',
										'&.Mui-focused': {
											color: '#8B4513',
										},
									}}
								>
									Member Type
								</InputLabel>
								<Select
									value={memberUpdateData.memberType || MemberType.USER}
									onChange={(e) => handleInputChange('memberType', e.target.value)}
									label="Member Type"
									sx={{
										'& .MuiOutlinedInput-notchedOutline': {
											borderColor: '#e0e0e0',
											borderWidth: '2px',
										},
										'&:hover .MuiOutlinedInput-notchedOutline': {
											borderColor: '#8B4513',
										},
										'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
											borderColor: '#8B4513',
											borderWidth: '2px',
										},
										'& .MuiSelect-icon': {
											color: '#8B4513',
										},
									}}
								>
									{Object.values(MemberType).map((type) => (
										<MenuItem key={type} value={type}>
											{type}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						{/* Member Status */}
						<Grid item xs={12} sm={6}>
							<FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
								<InputLabel 
									sx={{ 
										backgroundColor: '#ffffff',
										px: 1,
										fontWeight: 600,
										fontSize: '14px',
										'&.Mui-focused': {
											color: '#8B4513',
										},
									}}
								>
									Member Status
								</InputLabel>
								<Select
									value={memberUpdateData.memberStatus || MemberStatus.ACTIVE}
									onChange={(e) => handleInputChange('memberStatus', e.target.value)}
									label="Member Status"
									sx={{
										'& .MuiOutlinedInput-notchedOutline': {
											borderColor: '#e0e0e0',
											borderWidth: '2px',
										},
										'&:hover .MuiOutlinedInput-notchedOutline': {
											borderColor: '#8B4513',
										},
										'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
											borderColor: '#8B4513',
											borderWidth: '2px',
										},
										'& .MuiSelect-icon': {
											color: '#8B4513',
										},
									}}
								>
									{Object.values(MemberStatus).map((status) => (
										<MenuItem key={status} value={status}>
											{status}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						{/* Member Phone */}
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								label="Phone"
								value={memberUpdateData.memberPhone || ''}
								onChange={(e) => handleInputChange('memberPhone', e.target.value)}
								variant="outlined"
							/>
						</Grid>

						{/* Member Nick */}
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								label="Nick Name"
								value={memberUpdateData.memberNick || ''}
								onChange={(e) => handleInputChange('memberNick', e.target.value)}
								variant="outlined"
							/>
						</Grid>

						{/* Member Password */}
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								type="password"
								label="Password (optional)"
								value={memberUpdateData.memberPassword || ''}
								onChange={(e) => handleInputChange('memberPassword', e.target.value)}
								variant="outlined"
								helperText="Leave empty to keep current password"
							/>
						</Grid>

						{/* Member Full Name */}
						<Grid item xs={12} sm={6}>
							<TextField
								fullWidth
								label="Full Name"
								value={memberUpdateData.memberFullName || ''}
								onChange={(e) => handleInputChange('memberFullName', e.target.value)}
								variant="outlined"
							/>
						</Grid>

						{/* Member Address */}
						<Grid item xs={12}>
							<TextField
								fullWidth
								label="Address"
								value={memberUpdateData.memberAddress || ''}
								onChange={(e) => handleInputChange('memberAddress', e.target.value)}
								variant="outlined"
								sx={{
									'& .MuiOutlinedInput-root': {
										'& fieldset': {
											borderColor: '#e0e0e0',
											borderWidth: '2px',
										},
										'&:hover fieldset': {
											borderColor: '#8B4513',
										},
										'&.Mui-focused fieldset': {
											borderColor: '#8B4513',
											borderWidth: '2px',
										},
									},
									'& .MuiInputLabel-root.Mui-focused': {
										color: '#8B4513',
									},
								}}
							/>
						</Grid>

						{/* Member Description */}
						<Grid item xs={12}>
							<TextField
								fullWidth
								multiline
								rows={4}
								label="Description"
								value={memberUpdateData.memberDesc || ''}
								onChange={(e) => handleInputChange('memberDesc', e.target.value)}
								variant="outlined"
								sx={{
									'& .MuiOutlinedInput-root': {
										'& fieldset': {
											borderColor: '#e0e0e0',
											borderWidth: '2px',
										},
										'&:hover fieldset': {
											borderColor: '#8B4513',
										},
										'&.Mui-focused fieldset': {
											borderColor: '#8B4513',
											borderWidth: '2px',
										},
									},
									'& .MuiInputLabel-root.Mui-focused': {
										color: '#8B4513',
									},
								}}
							/>
						</Grid>

						{/* Image Upload Section */}
						<Grid item xs={12}>
							<Box
								sx={{
									padding: '24px',
									borderRadius: '12px',
									backgroundColor: '#fafafa',
									border: '2px dashed #e0e0e0',
								}}
							>
								<Typography variant={'h6'} sx={{ mb: 2, fontWeight: 600, color: '#8B4513' }}>
									Member Image
								</Typography>
								<Stack direction={'row'} spacing={2} alignItems={'center'} sx={{ mb: 2 }}>
									<input
										type="file"
										ref={inputRef}
										accept="image/*"
										style={{ display: 'none' }}
									/>
									<Button
										variant={'outlined'}
										startIcon={<AddRoundedIcon />}
										onClick={() => inputRef.current?.click()}
										sx={{
											textTransform: 'none',
											borderColor: '#8B4513',
											color: '#8B4513',
											fontWeight: 600,
											'&:hover': {
												borderColor: '#6B3410',
												backgroundColor: 'rgba(139, 69, 19, 0.05)',
											},
										}}
									>
										Select Image
									</Button>
									<Button
										variant={'contained'}
										onClick={uploadImage}
										disabled={!inputRef.current?.files || inputRef.current.files.length === 0}
										sx={{
											textTransform: 'none',
											background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
											color: '#ffffff',
											fontWeight: 600,
											boxShadow: '0px 2px 8px rgba(139, 69, 19, 0.25)',
											'&:hover': {
												background: 'linear-gradient(135deg, #6B3410 0%, #8B4513 100%)',
												boxShadow: '0px 4px 16px rgba(139, 69, 19, 0.35)',
											},
											'&:disabled': {
												background: '#e0e0e0',
												color: '#9e9e9e',
												boxShadow: 'none',
											},
										}}
									>
										Upload Image
									</Button>
								</Stack>
								{memberUpdateData.memberImage && (
									<Box
										sx={{
											position: 'relative',
											borderRadius: '12px',
											overflow: 'hidden',
											boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
											maxWidth: '300px',
										}}
									>
										<img
											src={`${REACT_APP_API_URL}/${memberUpdateData.memberImage}`}
											alt="Member"
											style={{
												width: '100%',
												height: '200px',
												objectFit: 'cover',
												display: 'block',
											}}
										/>
										<Button
											onClick={removeImage}
											startIcon={<DeleteRoundedIcon />}
											sx={{
												position: 'absolute',
												bottom: '8px',
												right: '8px',
												backgroundColor: 'rgba(233, 44, 40, 0.9)',
												color: '#ffffff',
												textTransform: 'none',
												fontWeight: 600,
												minWidth: 'auto',
												padding: '6px 12px',
												'&:hover': {
													backgroundColor: 'rgba(233, 44, 40, 1)',
												},
											}}
										>
											Remove
										</Button>
									</Box>
								)}
							</Box>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
					<Button
						onClick={handleEditClose}
						variant={'outlined'}
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
						onClick={handleUpdateMember}
						variant={'contained'}
						startIcon={<EditIcon />}
						sx={{
							textTransform: 'none',
							background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
							color: '#ffffff',
							fontWeight: 600,
							padding: '10px 24px',
							boxShadow: '0px 2px 8px rgba(139, 69, 19, 0.25)',
							'&:hover': {
								background: 'linear-gradient(135deg, #6B3410 0%, #8B4513 100%)',
								boxShadow: '0px 4px 16px rgba(139, 69, 19, 0.35)',
								transform: 'translateY(-2px)',
							},
						}}
					>
						Update Member
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

AdminUsers.defaultProps = {
	initialInquiry: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		search: {},
	},
};

export default withAdminLayout(AdminUsers);
