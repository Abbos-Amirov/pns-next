import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { Box, Button, InputAdornment, Stack, Card, CardContent, Chip } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TabContext } from '@mui/lab';
import OutlinedInput from '@mui/material/OutlinedInput';
import TablePagination from '@mui/material/TablePagination';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { NoticeList } from '../../../libs/components/admin/cs/NoticeList';

const AdminNotice: NextPage = (props: any) => {
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [value, setValue] = useState('ALL');
	const [searchText, setSearchText] = useState('');
	const [searchCategory, setSearchCategory] = useState('title');
	const [noticeTotal, setNoticeTotal] = useState(0);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	/** APOLLO REQUESTS **/
	// TODO: Add GraphQL queries when available

	/** LIFECYCLES **/
	useEffect(() => {
		// TODO: Fetch Notice articles
	}, []);

	/** HANDLERS **/
	const handleTabChange = (newValue: string) => {
		setValue(newValue);
		setPage(0);
	};

	const handleSearch = () => {
		// TODO: Implement search
	};

	const handleAddClick = () => {
		router.push('/_admin/cs/notice_create');
	};

	const changePageHandler = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const changeRowsPerPageHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	return (
		<Box component={'div'} className={'content notice-page'}>
			{/* Header Section */}
			<Card className={'page-header-card'} sx={{ mb: 3 }}>
				<CardContent>
					<Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
						<Stack direction={'row'} alignItems={'center'} spacing={2}>
							<Box className={'notice-icon-box'}>
								<NotificationsActiveIcon className={'notice-icon'} />
							</Box>
							<Box>
								<Typography variant={'h4'} className={'page-title'} sx={{ fontWeight: 700, mb: 0.5 }}>
									Notice Management
								</Typography>
								<Typography variant={'body2'} sx={{ color: '#717171' }}>
									Manage important notices and announcements
								</Typography>
							</Box>
						</Stack>
						<Stack direction={'row'} spacing={2} alignItems={'center'}>
							<Chip label={`Total: ${noticeTotal}`} className={'notice-total-chip'} />
							<Button
								variant={'contained'}
								startIcon={<AddRoundedIcon />}
								onClick={handleAddClick}
								className={'notice-add-btn'}
							>
								Add Notice
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
										onClick={() => handleTabChange('ALL')}
										className={`tab-btn notice-tab ${value === 'ALL' ? 'active' : ''}`}
									>
										All
									</Button>
									<Button
										variant={value === 'ACTIVE' ? 'contained' : 'outlined'}
										onClick={() => handleTabChange('ACTIVE')}
										className={`tab-btn notice-tab ${value === 'ACTIVE' ? 'active' : ''}`}
									>
										Active
									</Button>
									<Button
										variant={value === 'BLOCKED' ? 'contained' : 'outlined'}
										onClick={() => handleTabChange('BLOCKED')}
										className={`tab-btn notice-tab ${value === 'BLOCKED' ? 'active' : ''}`}
									>
										Blocked
									</Button>
									<Button
										variant={value === 'DELETED' ? 'contained' : 'outlined'}
										onClick={() => handleTabChange('DELETED')}
										className={`tab-btn notice-tab ${value === 'DELETED' ? 'active' : ''}`}
									>
										Deleted
									</Button>
								</Stack>
							</Box>

							<Divider sx={{ mb: 3 }} />

							{/* Search and Filter */}
							<Stack direction={'row'} spacing={2} className={'search-filter-area'}>
								<Select
									value={searchCategory}
									onChange={(e) => setSearchCategory(e.target.value)}
									className={'notice-filter-select'}
								>
									<MenuItem value={'title'}>Title</MenuItem>
									<MenuItem value={'id'}>Notice ID</MenuItem>
									<MenuItem value={'writer'}>Writer</MenuItem>
									<MenuItem value={'category'}>Category</MenuItem>
								</Select>
								<OutlinedInput
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									className={'search-input notice-search-input'}
									placeholder="Search notice articles..."
									onKeyDown={(event) => {
										if (event.key == 'Enter') handleSearch();
									}}
									startAdornment={
										<InputAdornment position="start">
											<SearchIcon className={'notice-search-icon'} />
										</InputAdornment>
									}
									endAdornment={
										<>
											{searchText && (
												<InputAdornment position="end">
													<CancelRoundedIcon
														className={'notice-cancel-icon'}
														onClick={() => setSearchText('')}
													/>
												</InputAdornment>
											)}
										</>
									}
								/>
								<Button variant={'outlined'} onClick={handleSearch} className={'notice-search-btn'}>
									Search
								</Button>
							</Stack>
						</TabContext>
					</Box>
				</CardContent>
			</Card>

			{/* Table Section */}
			<Card className={'table-card'}>
				<CardContent sx={{ p: 0 }}>
					<NoticeList
						anchorEl={anchorEl}
						// TODO: Add props when GraphQL is implemented
					/>

					<Box className={'notice-pagination-box'}>
						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={noticeTotal}
							rowsPerPage={rowsPerPage}
							page={page}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
							className={'notice-pagination'}
						/>
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
};

export default withAdminLayout(AdminNotice);
