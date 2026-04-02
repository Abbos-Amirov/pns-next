// @ts-nocheck — MUI katta sahifada "union too complex" (TS + @mui/material)
import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { 
	Box, 
	Button, 
	InputAdornment, 
	Stack, 
	Card, 
	CardContent, 
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	IconButton,
} from '@mui/material';
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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { FaqArticlesPanelList } from '../../../libs/components/admin/cs/FaqList';
import { useQuery, useMutation } from '@apollo/client';
import { GET_NOTICE_LIST } from '../../../apollo/admin/query';
import { DELETE_NOTICE } from '../../../apollo/admin/mutation';
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
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [noticeToDelete, setNoticeToDelete] = useState<string | null>(null);
	const [deleteNotice] = useMutation(DELETE_NOTICE);

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

	const handleDeleteClick = (id: string) => {
		setNoticeToDelete(id);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!noticeToDelete) return;
		
		try {
			const result = await deleteNotice({
				variables: { input: noticeToDelete },
			});
			
			if (result.data?.deleteNotice) {
				// Avval dialog yopish
				setDeleteDialogOpen(false);
				setNoticeToDelete(null);
				// List'ni yangilash
				await refetchNotices();
				// Keyin alert chiqarish (dialog yopilgandan keyin)
				setTimeout(async () => {
					await sweetTopSuccessAlert('FAQ deleted successfully!');
				}, 300);
			}
		} catch (err: any) {
			console.error('Delete error:', err);
			setDeleteDialogOpen(false);
			setNoticeToDelete(null);
			// Xato alert ham dialog yopilgandan keyin
			setTimeout(() => {
				sweetErrorHandling(err).then();
			}, 300);
		}
	};

	const handleDeleteCancel = () => {
		setDeleteDialogOpen(false);
		setNoticeToDelete(null);
	};

	const removeNoticeHandler = handleDeleteClick;

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
					<>
						{loading && (
							<div className={'faq-table-state-msg'}>
								<Typography variant={'body2'}>Loading FAQs...</Typography>
							</div>
						)}
						{!loading && error && (
							<div className={'faq-table-state-msg'}>
								<Typography variant={'body2'} color={'error'}>
									Error loading FAQs: {error.message}
								</Typography>
							</div>
						)}
						{!loading && !error && (
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
						<div className={'faq-pagination-box'}>
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
						</div>
					</>
				</CardContent>
			</Card>

			{/* Delete Confirmation Dialog */}
			<Dialog
				open={deleteDialogOpen}
				onClose={handleDeleteCancel}
				className={'faq-delete-dialog'}
				PaperProps={{
					sx: {
						borderRadius: '16px',
						minWidth: '400px',
						maxWidth: '500px',
					},
				}}
			>
				<DialogTitle sx={{ pb: 1 }}>
					<Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
						<Stack direction={'row'} alignItems={'center'} spacing={1.5}>
							<Box
								sx={{
									width: 48,
									height: 48,
									borderRadius: '12px',
									background: 'linear-gradient(135deg, rgba(233, 44, 40, 0.1) 0%, rgba(244, 67, 54, 0.1) 100%)',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#E92C28',
								}}
							>
								<WarningAmberIcon sx={{ fontSize: 28 }} />
							</Box>
							<Typography variant={'h6'} sx={{ fontWeight: 700, color: '#181a20', fontFamily: '$font' }}>
								Delete FAQ
							</Typography>
						</Stack>
						<IconButton
							onClick={handleDeleteCancel}
							sx={{
								color: '#9e9e9e',
								'&:hover': {
									backgroundColor: 'rgba(0, 0, 0, 0.04)',
								},
							}}
						>
							<CloseIcon />
						</IconButton>
					</Stack>
				</DialogTitle>
				<DialogContent sx={{ pt: 2 }}>
					<Typography variant={'body1'} sx={{ color: '#616161', lineHeight: 1.8, fontFamily: '$font' }}>
						Are you sure you want to delete this FAQ? This action cannot be undone and the FAQ will be permanently removed from the system.
					</Typography>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
					<Button
						onClick={handleDeleteCancel}
						variant={'outlined'}
						className={'faq-delete-cancel-btn'}
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
						onClick={handleDeleteConfirm}
						variant={'contained'}
						startIcon={<DeleteOutlineIcon />}
						className={'faq-delete-confirm-btn'}
						sx={{
							textTransform: 'none',
							background: 'linear-gradient(135deg, #E92C28 0%, #F44336 100%)',
							color: '#ffffff',
							fontWeight: 600,
							padding: '10px 24px',
							boxShadow: '0px 2px 8px rgba(233, 44, 40, 0.25)',
							'&:hover': {
								background: 'linear-gradient(135deg, #C62828 0%, #E92C28 100%)',
								boxShadow: '0px 4px 16px rgba(233, 44, 40, 0.35)',
								transform: 'translateY(-2px)',
							},
						}}
					>
						Delete FAQ
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export const getStaticProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale || 'en', ['common'])),
	},
});

export default withAdminLayout(FaqArticles);
