import React, { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { MemberPanelList } from '../../../libs/components/admin/users/MemberList';
import { Box, InputAdornment, Stack, Card, CardContent, Chip, Button } from '@mui/material';
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
import { MembersInquiry } from '../../../libs/types/member/member.input';
import { Member } from '../../../libs/types/member/member';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../../libs/sweetAlert';
import { MemberUpdate } from '../../../libs/types/member/member.update';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';

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

	/** APOLLO REQUESTS **/
	const { data: membersData, refetch: refetchMembers } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		variables: { input: membersInquiry },
		fetchPolicy: 'network-only',
	});

	const [updateMemberByAdmin] = useMutation(UPDATE_MEMBER_BY_ADMIN);

	/** LIFECYCLES **/
	useEffect(() => {
		if (membersData?.getAllMembersByAdmin) {
			setMembers(membersData.getAllMembersByAdmin.list);
			setMembersTotal(membersData.getAllMembersByAdmin.metaCounter.total);
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
									<MenuItem value={'USER'} onClick={() => searchTypeHandler('USER')}>
										User
									</MenuItem>
									<MenuItem value={'AGENT'} onClick={() => searchTypeHandler('AGENT')}>
										Agent
									</MenuItem>
									<MenuItem value={'ADMIN'} onClick={() => searchTypeHandler('ADMIN')}>
										Admin
									</MenuItem>
								</Select>
							</Stack>
						</TabContext>
					</Box>
				</CardContent>
			</Card>

			{/* Table Section */}
			<Card className={'table-card'}>
				<CardContent sx={{ p: 0 }}>
					<MemberPanelList
						members={members}
						anchorEl={anchorEl}
						menuIconClickHandler={menuIconClickHandler}
						menuIconCloseHandler={menuIconCloseHandler}
						updateMemberHandler={updateMemberHandler}
					/>

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
