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
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { InquiryList } from '../../../libs/components/admin/cs/InquiryList';

const InquiryArticles: NextPage = (props: any) => {
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [value, setValue] = useState('ALL');
	const [searchText, setSearchText] = useState('');
	const [searchCategory, setSearchCategory] = useState('title');
	const [inquiryTotal, setInquiryTotal] = useState(0);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	/** APOLLO REQUESTS **/
	// TODO: Add GraphQL queries when available

	/** LIFECYCLES **/
	useEffect(() => {
		// TODO: Fetch Inquiry articles
	}, []);

	/** HANDLERS **/
	const handleTabChange = (newValue: string) => {
		setValue(newValue);
		setPage(0);
	};

	const handleSearch = () => {
		// TODO: Implement search
	};

	const changePageHandler = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const changeRowsPerPageHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	return (
		<Box component={'div'} className={'content inquiry-page'}>
			{/* Header Section */}
			<Card className={'page-header-card'} sx={{ mb: 3 }}>
				<CardContent>
					<Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
						<Stack direction={'row'} alignItems={'center'} spacing={2}>
							<Box className={'inquiry-icon-box'}>
								<QuestionAnswerIcon className={'inquiry-icon'} />
							</Box>
							<Box>
								<Typography variant={'h4'} className={'page-title'} sx={{ fontWeight: 700, mb: 0.5 }}>
									1:1 Inquiry Management
								</Typography>
								<Typography variant={'body2'} sx={{ color: '#717171' }}>
									Manage customer inquiries and support requests
								</Typography>
							</Box>
						</Stack>
						<Stack direction={'row'} spacing={2} alignItems={'center'}>
							<Chip label={`Total: ${inquiryTotal}`} className={'inquiry-total-chip'} />
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
										className={`tab-btn inquiry-tab ${value === 'ALL' ? 'active' : ''}`}
									>
										All
									</Button>
									<Button
										variant={value === 'ACTIVE' ? 'contained' : 'outlined'}
										onClick={() => handleTabChange('ACTIVE')}
										className={`tab-btn inquiry-tab ${value === 'ACTIVE' ? 'active' : ''}`}
									>
										Active
									</Button>
									<Button
										variant={value === 'PENDING' ? 'contained' : 'outlined'}
										onClick={() => handleTabChange('PENDING')}
										className={`tab-btn inquiry-tab ${value === 'PENDING' ? 'active' : ''}`}
									>
										Pending
									</Button>
									<Button
										variant={value === 'RESOLVED' ? 'contained' : 'outlined'}
										onClick={() => handleTabChange('RESOLVED')}
										className={`tab-btn inquiry-tab ${value === 'RESOLVED' ? 'active' : ''}`}
									>
										Resolved
									</Button>
								</Stack>
							</Box>

							<Divider sx={{ mb: 3 }} />

							{/* Search and Filter */}
							<Stack direction={'row'} spacing={2} className={'search-filter-area'}>
								<Select
									value={searchCategory}
									onChange={(e) => setSearchCategory(e.target.value)}
									className={'inquiry-filter-select'}
								>
									<MenuItem value={'title'}>Title</MenuItem>
									<MenuItem value={'id'}>Inquiry ID</MenuItem>
									<MenuItem value={'writer'}>Writer</MenuItem>
									<MenuItem value={'category'}>Category</MenuItem>
								</Select>
								<OutlinedInput
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									className={'search-input inquiry-search-input'}
									placeholder="Search inquiry articles..."
									onKeyDown={(event) => {
										if (event.key == 'Enter') handleSearch();
									}}
									startAdornment={
										<InputAdornment position="start">
											<SearchIcon className={'inquiry-search-icon'} />
										</InputAdornment>
									}
									endAdornment={
										<>
											{searchText && (
												<InputAdornment position="end">
													<CancelRoundedIcon
														className={'inquiry-cancel-icon'}
														onClick={() => setSearchText('')}
													/>
												</InputAdornment>
											)}
										</>
									}
								/>
								<Button variant={'outlined'} onClick={handleSearch} className={'inquiry-search-btn'}>
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
					<InquiryList
						anchorEl={anchorEl}
						// TODO: Add props when GraphQL is implemented
					/>

					<Box className={'inquiry-pagination-box'}>
						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={inquiryTotal}
							rowsPerPage={rowsPerPage}
							page={page}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
							className={'inquiry-pagination'}
						/>
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
};

export default withAdminLayout(InquiryArticles);
