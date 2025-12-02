import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import {
	Box,
	Button,
	Card,
	CardContent,
	Stack,
	TextField,
	Typography,
	Select,
	MenuItem,
	FormControl,
	Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UpdateIcon from '@mui/icons-material/Update';
import { UpdateNoticeInput } from '../../../libs/types/notice/notice.update';
import {
	NoticeCategory,
	NoticeStatus,
	NoticeCategoryType,
} from '../../../libs/enums/notice.enum';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../../libs/sweetAlert';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_NOTICE } from '../../../apollo/admin/mutation';
import { GET_NOTICE_LIST } from '../../../apollo/admin/query';
import { NoticeInquiry } from '../../../libs/types/notice/notice.inquiry';
import { Direction } from '../../../libs/enums/common.enum';

const FaqEdit: NextPage = (props: any) => {
	const router = useRouter();
	const { id } = router.query;
	
	const [faqData, setFaqData] = useState<UpdateNoticeInput>({
		_id: '',
		noticeCategory: NoticeCategory.INQUIRY,
		noticeStatus: NoticeStatus.ACTIVE,
		noticeCategoryType: NoticeCategoryType.PRODUCT,
		noticeTitle: '',
		noticeContent: '',
	});

	// FAQ ma'lumotlarini olish - barcha notice'larni olish va ID bo'yicha filter qilish
	const noticeInquiry: NoticeInquiry = {
		page: 1,
		limit: 1000, // Katta limit - barcha notice'larni olish uchun
		sort: 'createdAt',
		direction: Direction.DESC,
	};

	const { data: noticeListData, loading: loadingNotice } = useQuery(GET_NOTICE_LIST, {
		variables: { input: noticeInquiry },
		fetchPolicy: 'network-only',
		skip: !id,
	});

	const [updateNotice] = useMutation(UPDATE_NOTICE);

	// FAQ ma'lumotlarini yuklash
	useEffect(() => {
		if (id && noticeListData?.getNoticeList?.list) {
			const notice = noticeListData.getNoticeList.list.find((n: any) => n._id === id);
			if (notice) {
				setFaqData({
					_id: notice._id,
					noticeCategory: notice.noticeCategory || NoticeCategory.INQUIRY,
					noticeStatus: notice.noticeStatus || NoticeStatus.ACTIVE,
					noticeCategoryType: notice.noticeCategoryType || NoticeCategoryType.PRODUCT,
					noticeTitle: notice.noticeTitle || '',
					noticeContent: notice.noticeContent || '',
				});
			}
		}
	}, [id, noticeListData]);

	/** HANDLERS **/
	const handleInputChange = (field: keyof UpdateNoticeInput, value: any) => {
		setFaqData({ ...faqData, [field]: value });
	};

	const doDisabledCheck = () => {
		// ID query parametri yoki _id bo'lsa, button enabled bo'ladi
		const hasId = (id && typeof id === 'string') || (faqData._id && faqData._id.trim() !== '');
		const isDisabled = !hasId;
		
		if (isDisabled) {
			console.log('Form validation failed: Missing _id or id query param');
			console.log('Current id query:', id);
			console.log('Current faqData._id:', faqData._id);
		}
		
		return isDisabled;
	};

	const handleSubmit = async () => {
		try {
			// ID ni query parametridan yoki faqData._id dan olish
			const noticeId = (typeof id === 'string' ? id : faqData._id) || '';
			
			if (!noticeId) {
				await sweetMixinErrorAlert('Notice ID is missing');
				return;
			}
			
			// Faqat o'zgartirilgan field'larni yuborish
			const updateInput: UpdateNoticeInput = {
				_id: noticeId,
			};

			if (faqData.noticeCategory) updateInput.noticeCategory = faqData.noticeCategory;
			if (faqData.noticeStatus) updateInput.noticeStatus = faqData.noticeStatus;
			if (faqData.noticeCategoryType) updateInput.noticeCategoryType = faqData.noticeCategoryType;
			if (faqData.noticeTitle) updateInput.noticeTitle = faqData.noticeTitle;
			if (faqData.noticeContent) updateInput.noticeContent = faqData.noticeContent;

			await updateNotice({
				variables: { input: updateInput },
			});
			await sweetTopSuccessAlert('FAQ updated successfully!');
			// FAQ page'ga qaytish va cache'ni yangilash
			router.push({
				pathname: '/_admin/cs/faq',
				query: { refresh: 'true', timestamp: Date.now() },
			});
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message || 'Failed to update FAQ');
		}
	};

	if (loadingNotice) {
		return (
			<Box component={'div'} className={'content faq-edit-page'}>
				<Card>
					<CardContent>
						<Typography>Loading FAQ...</Typography>
					</CardContent>
				</Card>
			</Box>
		);
	}

	return (
		<Box component={'div'} className={'content faq-edit-page'}>
			{/* Header Section */}
			<Card className={'page-header-card'} sx={{ mb: 3 }}>
				<CardContent>
					<Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
						<Stack direction={'row'} alignItems={'center'} spacing={2}>
							<Button
								startIcon={<ArrowBackIcon />}
								onClick={() => router.push('/_admin/cs/faq')}
								className={'back-btn'}
							>
								Back
							</Button>
							<Box className={'faq-edit-icon-box'}>
								<EditIcon className={'faq-edit-icon'} />
							</Box>
							<Box>
								<Typography variant={'h4'} className={'page-title'} sx={{ fontWeight: 700, mb: 0.5 }}>
									Edit FAQ
								</Typography>
								<Typography variant={'body2'} sx={{ color: '#717171' }}>
									Modify existing frequently asked question
								</Typography>
							</Box>
						</Stack>
					</Stack>
				</CardContent>
			</Card>

			{/* Main Content - Two Column Layout */}
			<Grid container spacing={3}>
				{/* Left Column - FAQ Information */}
				<Grid item xs={12} md={4}>
					<Card className={'info-card'}>
						<CardContent>
							<Stack spacing={3}>
								<Box>
									<Stack direction={'row'} alignItems={'center'} spacing={1} sx={{ mb: 2 }}>
										<InfoOutlinedIcon sx={{ color: '#8B4513', fontSize: 20 }} />
										<Typography variant={'h6'} sx={{ fontWeight: 600, color: '#8B4513' }}>
											FAQ Information
										</Typography>
									</Stack>
									<Box className={'info-item'}>
										<Typography variant={'caption'} sx={{ color: '#9e9e9e', display: 'block', mb: 0.5 }}>
											FAQ ID
										</Typography>
										<Typography variant={'body2'} sx={{ fontWeight: 500, color: '#181a20' }}>
											{faqData._id || 'Loading...'}
										</Typography>
									</Box>
								</Box>

								<Box>
									<Stack direction={'row'} alignItems={'center'} spacing={1} sx={{ mb: 2 }}>
										<CalendarTodayIcon sx={{ color: '#8B4513', fontSize: 20 }} />
										<Typography variant={'h6'} sx={{ fontWeight: 600, color: '#8B4513' }}>
											Timeline
										</Typography>
									</Stack>
									<Box className={'info-item'}>
										<Typography variant={'caption'} sx={{ color: '#9e9e9e', display: 'block', mb: 0.5 }}>
											Created At
										</Typography>
										<Typography variant={'body2'} sx={{ fontWeight: 500, color: '#181a20' }}>
											{noticeListData?.getNoticeList?.list?.find((n: any) => n._id === id)?.createdAt 
												? new Date(noticeListData.getNoticeList.list.find((n: any) => n._id === id).createdAt).toLocaleString()
												: 'N/A'}
										</Typography>
									</Box>
									<Box className={'info-item'} sx={{ mt: 2 }}>
										<Typography variant={'caption'} sx={{ color: '#9e9e9e', display: 'block', mb: 0.5 }}>
											Last Updated
										</Typography>
										<Typography variant={'body2'} sx={{ fontWeight: 500, color: '#181a20' }}>
											{noticeListData?.getNoticeList?.list?.find((n: any) => n._id === id)?.updatedAt 
												? new Date(noticeListData.getNoticeList.list.find((n: any) => n._id === id).updatedAt).toLocaleString()
												: 'N/A'}
										</Typography>
									</Box>
								</Box>
							</Stack>
						</CardContent>
					</Card>
				</Grid>

				{/* Right Column - Edit Form */}
				<Grid item xs={12} md={8}>
					<Card className={'form-card'}>
						<CardContent>
							<Stack spacing={3}>
								{/* Title Field */}
								<Box>
									<Typography variant={'subtitle1'} sx={{ fontWeight: 600, mb: 1.5, color: '#181a20' }}>
										FAQ Title <span style={{ color: '#d32f2f' }}>*</span>
									</Typography>
									<TextField
										fullWidth
										value={faqData.noticeTitle || ''}
										onChange={(e) => handleInputChange('noticeTitle', e.target.value)}
										placeholder="Enter FAQ title..."
										variant="outlined"
										className={'faq-edit-input'}
									/>
								</Box>

								{/* Content Field */}
								<Box>
									<Typography variant={'subtitle1'} sx={{ fontWeight: 600, mb: 1.5, color: '#181a20' }}>
										FAQ Content <span style={{ color: '#d32f2f' }}>*</span>
									</Typography>
									<TextField
										fullWidth
										
										rows={10}
										value={faqData.noticeContent || ''}
										onChange={(e) => handleInputChange('noticeContent', e.target.value)}
										placeholder="Enter FAQ content..."
										variant="outlined"
										className={'faq-edit-textarea'}
									/>
								</Box>

								{/* Settings Row */}
								<Grid container spacing={2}>
									<Grid item xs={12} sm={4}>
										<Typography variant={'subtitle2'} sx={{ fontWeight: 600, mb: 1, color: '#181a20' }}>
											Category
										</Typography>
										<FormControl fullWidth>
											<Select
												value={faqData.noticeCategory || NoticeCategory.INQUIRY}
												onChange={(e) => handleInputChange('noticeCategory', e.target.value)}
												className={'faq-edit-select'}
											>
												{Object.values(NoticeCategory).map((category) => (
													<MenuItem key={category} value={category}>
														{category}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</Grid>

									<Grid item xs={12} sm={4}>
										<Typography variant={'subtitle2'} sx={{ fontWeight: 600, mb: 1, color: '#181a20' }}>
											Status
										</Typography>
										<FormControl fullWidth>
											<Select
												value={faqData.noticeStatus || NoticeStatus.ACTIVE}
												onChange={(e) => handleInputChange('noticeStatus', e.target.value)}
												className={'faq-edit-select'}
											>
												{Object.values(NoticeStatus).map((status) => (
													<MenuItem key={status} value={status}>
														{status}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</Grid>

									<Grid item xs={12} sm={4}>
										<Typography variant={'subtitle2'} sx={{ fontWeight: 600, mb: 1, color: '#181a20' }}>
											Category Type
										</Typography>
										<FormControl fullWidth>
											<Select
												value={faqData.noticeCategoryType || NoticeCategoryType.PRODUCT}
												onChange={(e) => handleInputChange('noticeCategoryType', e.target.value)}
												className={'faq-edit-select'}
											>
												{Object.values(NoticeCategoryType).map((type) => (
													<MenuItem key={type} value={type}>
														{type}
													</MenuItem>
												))}
											</Select>
										</FormControl>
									</Grid>
								</Grid>

								{/* Action Buttons */}
								<Stack direction={'row'} spacing={2} justifyContent={'flex-end'} sx={{ mt: 2 }}>
									<Button
										variant={'outlined'}
										onClick={() => router.push('/_admin/cs/faq')}
										className={'cancel-btn'}
									>
										Cancel
									</Button>
									<Button
										variant={'contained'}
										startIcon={<UpdateIcon />}
										onClick={handleSubmit}
										disabled={doDisabledCheck()}
										className={'submit-btn'}
									>
										Update FAQ
									</Button>
								</Stack>
							</Stack>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default withAdminLayout(FaqEdit);

