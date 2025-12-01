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
import FilterListIcon from '@mui/icons-material/FilterList';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { FaqArticlesPanelList } from '../../../libs/components/admin/cs/FaqList';

const FaqArticles: NextPage = (props: any) => {
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [value, setValue] = useState('ALL');
	const [searchText, setSearchText] = useState('');
	const [searchCategory, setSearchCategory] = useState('mb_nick');
	const [faqTotal, setFaqTotal] = useState(0);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	/** APOLLO REQUESTS **/
	// TODO: Add GraphQL queries when available

	/** LIFECYCLES **/
	useEffect(() => {
		// TODO: Fetch FAQ articles
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
		router.push('/_admin/cs/faq_create');
	};

	const changePageHandler = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const changeRowsPerPageHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	return (
		<Box component={'div'} className={'content faq-page'}>
			{/* Header Section */}
			<Card className={'page-header-card'} sx={{ mb: 3 }}>
				<CardContent>
					<Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
					<Stack direction={'row'} alignItems={'center'} spacing={2}>
						<Box className={'faq-icon-box'}>
							<HelpOutlineIcon className={'faq-icon'} />
						</Box>
							<Box>
								<Typography variant={'h4'} className={'page-title'} sx={{ fontWeight: 700, mb: 0.5 }}>
									FAQ Management
								</Typography>
								<Typography variant={'body2'} sx={{ color: '#717171' }}>
									Manage frequently asked questions and help articles
								</Typography>
							</Box>
						</Stack>
						<Stack direction={'row'} spacing={2} alignItems={'center'}>
							<Chip label={`Total: ${faqTotal}`} className={'faq-total-chip'} />
							<Button
								variant={'contained'}
								startIcon={<AddRoundedIcon />}
								onClick={handleAddClick}
								className={'faq-add-btn'}
							>
								Add FAQ
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
										className={`tab-btn faq-tab ${value === 'ALL' ? 'active' : ''}`}
									>
										All
									</Button>
									<Button
										variant={value === 'ACTIVE' ? 'contained' : 'outlined'}
										onClick={() => handleTabChange('ACTIVE')}
										className={`tab-btn faq-tab ${value === 'ACTIVE' ? 'active' : ''}`}
									>
										Active
									</Button>
									<Button
										variant={value === 'BLOCKED' ? 'contained' : 'outlined'}
										onClick={() => handleTabChange('BLOCKED')}
										className={`tab-btn faq-tab ${value === 'BLOCKED' ? 'active' : ''}`}
									>
										Blocked
									</Button>
									<Button
										variant={value === 'DELETED' ? 'contained' : 'outlined'}
										onClick={() => handleTabChange('DELETED')}
										className={`tab-btn faq-tab ${value === 'DELETED' ? 'active' : ''}`}
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
									className={'faq-filter-select'}
								>
									<MenuItem value={'mb_nick'}>Nick Name</MenuItem>
									<MenuItem value={'mb_id'}>FAQ ID</MenuItem>
									<MenuItem value={'title'}>Title</MenuItem>
									<MenuItem value={'category'}>Category</MenuItem>
								</Select>
								<OutlinedInput
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									className={'search-input faq-search-input'}
									placeholder="Search FAQ articles..."
									onKeyDown={(event) => {
										if (event.key == 'Enter') handleSearch();
									}}
									startAdornment={
										<InputAdornment position="start">
											<SearchIcon className={'faq-search-icon'} />
										</InputAdornment>
									}
									endAdornment={
										<>
											{searchText && (
												<InputAdornment position="end">
													<CancelRoundedIcon
														className={'faq-cancel-icon'}
														onClick={() => setSearchText('')}
													/>
												</InputAdornment>
											)}
										</>
									}
								/>
								<Button variant={'outlined'} onClick={handleSearch} className={'faq-search-btn'}>
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
					<FaqArticlesPanelList
						anchorEl={anchorEl}
						// TODO: Add props when GraphQL is implemented
					/>

					<Box className={'faq-pagination-box'}>
						<TablePagination
							rowsPerPageOptions={[10, 20, 40, 60]}
							component="div"
							count={faqTotal}
							rowsPerPage={rowsPerPage}
							page={page}
							onPageChange={changePageHandler}
							onRowsPerPageChange={changeRowsPerPageHandler}
							className={'faq-pagination'}
						/>
					</Box>
				</CardContent>
			</Card>
		</Box>
	);
};

export default withAdminLayout(FaqArticles);
