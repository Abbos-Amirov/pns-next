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
import { useQuery } from '@apollo/client';
import { GET_NOTICE_LIST } from '../../../apollo/admin/query';
import { NoticeInquiry } from '../../../libs/types/notice/notice.inquiry';
import { Notice } from '../../../libs/types/notice/notice';
import { NoticeCategory, NoticeCategoryType, NoticeStatus } from '../../../libs/enums/notice.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../../libs/sweetAlert';

const FaqArticles: NextPage = (props: any) => {
	const router = useRouter();
	const [anchorEl, setAnchorEl] = useState<[] | HTMLElement[]>([]);
	const [value, setValue] = useState('ALL');
	const [searchText, setSearchText] = useState('');
	const [searchCategory, setSearchCategory] = useState('title');
	const [faqTotal, setFaqTotal] = useState(0);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [notices, setNotices] = useState<Notice[]>([]);
	const [noticeInquiry, setNoticeInquiry] = useState<NoticeInquiry>({
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {
			// Bo'sh search object - backend to'g'ri ishlashi uchun
		},
	});

	/** APOLLO REQUESTS **/
	// Search object'ni tozalash - bo'sh field'larni olib tashlash
	const cleanSearch = noticeInquiry.search 
		? Object.fromEntries(
			Object.entries(noticeInquiry.search).filter(([_, value]) => value !== undefined && value !== null && value !== '')
		)
		: {};
	
	const cleanNoticeInquiry = {
		page: noticeInquiry.page,
		limit: noticeInquiry.limit,
		sort: noticeInquiry.sort,
		direction: noticeInquiry.direction,
		search: Object.keys(cleanSearch).length > 0 ? cleanSearch : undefined,
	};

	const { data: noticeData, loading, error, refetch: refetchNotices } = useQuery(GET_NOTICE_LIST, {
		variables: { input: cleanNoticeInquiry },
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		skip: false,
		onError: (err) => {
			console.error('FAQ Query Error:', err);
			console.error('Error details:', JSON.stringify(err, null, 2));
			console.error('Sent inquiry:', cleanNoticeInquiry);
			sweetErrorHandling(err).then();
		},
		onCompleted: (data) => {
			console.log('Query completed with data:', data);
		},
	});

	// Router query'dan refresh parametrini tekshirish - FAQ yaratilgandan keyin yangilash
	useEffect(() => {
		if (router.query.refresh === 'true') {
			console.log('Refreshing notices after FAQ creation...');
			refetchNotices();
			// Query parametrini tozalash
			router.replace('/_admin/cs/faq', undefined, { shallow: true });
		}
	}, [router.query.refresh, refetchNotices, router]);

	/** LIFECYCLES **/
	useEffect(() => {
		console.log('Notice Data:', noticeData);
		console.log('Notice Inquiry:', noticeInquiry);
		
		if (noticeData?.getNoticeList) {
			console.log('Notice List:', noticeData.getNoticeList.list);
			console.log('Notice Total:', noticeData.getNoticeList.total);
			setNotices(noticeData.getNoticeList.list || []);
			setFaqTotal(noticeData.getNoticeList.total || 0);
		} else if (noticeData) {
			console.log('Notice Data exists but getNoticeList is missing:', noticeData);
		}
	}, [noticeData, noticeInquiry]);

	useEffect(() => {
		refetchNotices();
	}, [noticeInquiry, refetchNotices]);

	/** HANDLERS **/
	const handleTabChange = (newValue: string) => {
		setValue(newValue);
		setPage(0);
		
		const newSearch: any = { ...noticeInquiry.search };
		
		switch (newValue) {
			case 'ACTIVE':
				newSearch.noticeStatus = NoticeStatus.ACTIVE;
				break;
			case 'BLOCKED':
				newSearch.noticeStatus = NoticeStatus.HOLD;
				break;
			case 'DELETED':
				newSearch.noticeStatus = NoticeStatus.DELETE;
				break;
			default:
				delete newSearch.noticeStatus;
				break;
		}
		
		setNoticeInquiry({
			...noticeInquiry,
			page: 1,
			search: newSearch,
		});
	};

	const handleSearch = () => {
		const newSearch: any = { ...noticeInquiry.search };
		
		if (searchText.trim()) {
			if (searchCategory === 'title') {
				newSearch.text = searchText.trim();
			} else if (searchCategory === 'category') {
				// Category bo'yicha qidirish
				const category = Object.values(NoticeCategory).find(cat => 
					cat.toLowerCase().includes(searchText.toLowerCase())
				);
				if (category) {
					newSearch.noticeCategory = category;
				}
			}
		} else {
			delete newSearch.text;
			delete newSearch.noticeCategory;
		}
		
		setNoticeInquiry({
			...noticeInquiry,
			page: 1,
			search: newSearch,
		});
	};

	const handleAddClick = () => {
		router.push('/_admin/cs/faq_create');
	};

	const changePageHandler = (event: unknown, newPage: number) => {
		setPage(newPage);
		setNoticeInquiry({
			...noticeInquiry,
			page: newPage + 1,
		});
	};

	const changeRowsPerPageHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newRowsPerPage = parseInt(event.target.value, 10);
		setRowsPerPage(newRowsPerPage);
		setPage(0);
		setNoticeInquiry({
			...noticeInquiry,
			page: 1,
			limit: newRowsPerPage,
		});
	};

	const menuIconClickHandler = (e: any, index: number) => {
		const tempAnchor = anchorEl.slice();
		tempAnchor[index] = e.currentTarget;
		setAnchorEl(tempAnchor);
	};

	const menuIconCloseHandler = () => {
		setAnchorEl([]);
	};

	const updateNoticeHandler = async (updateData: { _id: string; status?: string; action?: string }) => {
		try {
			if (updateData.action === 'edit') {
				// Edit - FAQ edit page'ga yuborish
				router.push(`/_admin/cs/faq_edit?id=${updateData._id}`);
			} else if (updateData.status) {
				// Status o'zgartirish - TODO: Add update mutation when available
				await sweetTopSuccessAlert('Notice status updated successfully!');
				menuIconCloseHandler();
				await refetchNotices();
			}
		} catch (err: any) {
			menuIconCloseHandler();
			sweetErrorHandling(err).then();
		}
	};

	const removeNoticeHandler = async (id: string) => {
		try {
			// TODO: Add remove mutation when available
			await sweetTopSuccessAlert('FAQ deleted successfully!');
			await refetchNotices();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
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
					{loading ? (
						<Box sx={{ p: 4, textAlign: 'center' }}>
							<Typography variant={'body2'}>Loading notices...</Typography>
						</Box>
					) : error ? (
						<Box sx={{ p: 4, textAlign: 'center' }}>
							<Typography variant={'body2'} color={'error'}>
								Error loading notices: {error.message}
							</Typography>
						</Box>
					) : (
						<FaqArticlesPanelList
							faqArticles={notices.map((notice) => ({
								_id: notice._id,
								category: notice.noticeCategory,
								title: notice.noticeTitle,
								content: notice.noticeContent,
								status: notice.noticeStatus,
								createdAt: notice.createdAt,
								date: notice.createdAt,
							}))}
							anchorEl={anchorEl}
							handleMenuIconClick={menuIconClickHandler}
							handleMenuIconClose={menuIconCloseHandler}
							updateArticleHandler={updateNoticeHandler}
							removeArticleHandler={removeNoticeHandler}
						/>
					)}

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
