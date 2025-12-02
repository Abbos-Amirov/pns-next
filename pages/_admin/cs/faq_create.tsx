import React, { useState } from 'react';
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
	InputLabel,
	Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { CreateNoticeInput } from '../../../libs/types/notice/notice.input';
import {
	NoticeCategory,
	NoticeStatus,
	NoticeCategoryType,
} from '../../../libs/enums/notice.enum';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../../libs/sweetAlert';
import { useMutation } from '@apollo/client';
import { CREATE_NOTICE } from '../../../apollo/admin/mutation';

const FaqCreate: NextPage = (props: any) => {
	const router = useRouter();
	const [faqData, setFaqData] = useState<CreateNoticeInput>({
		noticeCategory: NoticeCategory.INQUIRY,
		noticeStatus: NoticeStatus.ACTIVE,
		noticeCategoryType: NoticeCategoryType.PRODUCT,
		noticeTitle: '',
		noticeContent: '',
	});

	const [createNotice] = useMutation(CREATE_NOTICE);

	/** HANDLERS **/
	const handleInputChange = (field: keyof CreateNoticeInput, value: any) => {
		setFaqData({ ...faqData, [field]: value });
	};

	const doDisabledCheck = () => {
		const checks = {
			title: faqData.noticeTitle.trim() === '',
			content: faqData.noticeContent.trim() === '',
		};
		
		const isDisabled = Object.values(checks).some(check => check === true);
		
		if (isDisabled) {
			console.log('Form validation failed:', checks);
		}
		
		return isDisabled;
	};

	const handleSubmit = async () => {
		try {
			await createNotice({
				variables: { input: faqData },
			});
			await sweetTopSuccessAlert('FAQ created successfully!');
			// FAQ page'ga qaytish va cache'ni yangilash
			router.push({
				pathname: '/_admin/cs/faq',
				query: { refresh: 'true', timestamp: Date.now() },
			});
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message || 'Failed to create FAQ');
		}
	};

	return (
		<Box component={'div'} className={'content faq-create-page'}>
			{/* Header Section */}
			<Card className={'page-header-card'} sx={{ mb: 3 }}>
				<CardContent>
					<Stack direction={'row'} alignItems={'center'} spacing={2}>
						<Button
							startIcon={<ArrowBackIcon />}
							onClick={() => router.push('/_admin/cs/faq')}
							className={'back-btn'}
						>
							Back
						</Button>
						<Box className={'faq-create-icon-box'}>
							<HelpOutlineIcon className={'faq-create-icon'} />
						</Box>
						<Box>
							<Typography variant={'h4'} className={'page-title'} sx={{ fontWeight: 700, mb: 0.5 }}>
								Create New FAQ
							</Typography>
							<Typography variant={'body2'} sx={{ color: '#717171' }}>
								Add a new frequently asked question
							</Typography>
						</Box>
					</Stack>
				</CardContent>
			</Card>

			{/* Form Section */}
			<Card className={'form-card'}>
				<CardContent>
					<Grid container spacing={3}>
						{/* Notice Category */}
						<Grid item xs={12} md={4}>
							<Box className={'faq-select-section'}>
								<Typography variant={'h6'} className={'faq-section-title'} sx={{ mb: 2, fontWeight: 600 }}>
									Notice Category
								</Typography>
								<FormControl fullWidth className={'faq-select-control'}>
									<Select
										value={faqData.noticeCategory}
										onChange={(e) => handleInputChange('noticeCategory', e.target.value)}
										className={'faq-select'}
									>
										{Object.values(NoticeCategory).map((category) => (
											<MenuItem key={category} value={category}>
												{category}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Box>
						</Grid>

						{/* Notice Status */}
						<Grid item xs={12} md={4}>
							<Box className={'faq-select-section'}>
								<Typography variant={'h6'} className={'faq-section-title'} sx={{ mb: 2, fontWeight: 600 }}>
									Notice Status
								</Typography>
								<FormControl fullWidth className={'faq-select-control'}>
									<Select
										value={faqData.noticeStatus}
										onChange={(e) => handleInputChange('noticeStatus', e.target.value)}
										className={'faq-select'}
									>
										{Object.values(NoticeStatus).map((status) => (
											<MenuItem key={status} value={status}>
												{status}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Box>
						</Grid>

						{/* Notice Category Type */}
						<Grid item xs={12} md={4}>
							<Box className={'faq-select-section'}>
								<Typography variant={'h6'} className={'faq-section-title'} sx={{ mb: 2, fontWeight: 600 }}>
									Category Type
								</Typography>
								<FormControl fullWidth className={'faq-select-control'}>
									<Select
										value={faqData.noticeCategoryType}
										onChange={(e) => handleInputChange('noticeCategoryType', e.target.value)}
										className={'faq-select'}
									>
										{Object.values(NoticeCategoryType).map((type) => (
											<MenuItem key={type} value={type}>
												{type}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Box>
						</Grid>

						{/* Notice Title Section */}
						<Grid item xs={12}>
							<Box className={'faq-title-section'}>
								<Typography variant={'h6'} className={'faq-section-title'} sx={{ mb: 2, fontWeight: 600 }}>
									FAQ Title <span style={{ color: '#d32f2f' }}>*</span>
								</Typography>
								<TextField
									fullWidth
									value={faqData.noticeTitle}
									onChange={(e) => handleInputChange('noticeTitle', e.target.value)}
									className={'faq-title-input'}
									placeholder="Enter FAQ title here..."
									variant="outlined"
									sx={{
										'& .MuiOutlinedInput-root': {
											fontSize: '18px',
											fontWeight: 500,
											padding: '12px 16px',
										},
									}}
								/>
							</Box>
						</Grid>

						{/* Notice Content Section */}
						<Grid item xs={12}>
							<Box className={'faq-content-section'}>
								<Typography variant={'h6'} className={'faq-section-title'} sx={{ mb: 2, fontWeight: 600 }}>
									FAQ Content <span style={{ color: '#d32f2f' }}>*</span>
								</Typography>
								<TextField
									fullWidth
								
									value={faqData.noticeContent}
									onChange={(e) => handleInputChange('noticeContent', e.target.value)}
									className={'faq-content-input'}
									placeholder="Enter FAQ content here..."
									variant="outlined"
									sx={{
										'& .MuiOutlinedInput-root': {
											fontSize: '16px',
											lineHeight: 1.6,
											padding: '16px',
										},
										'& .MuiInputBase-input': {
											resize: 'vertical',
										},
									}}
								/>
							</Box>
						</Grid>

						{/* Submit Button */}
						<Grid item xs={12}>
							<Stack direction={'row'} spacing={2} justifyContent={'flex-end'}>
								<Button
									variant={'outlined'}
									onClick={() => router.push('/_admin/cs/faq')}
									className={'cancel-btn'}
								>
									Cancel
								</Button>
								<Button
									variant={'contained'}
									onClick={handleSubmit}
									disabled={doDisabledCheck()}
									className={'submit-btn'}
								>
									Create FAQ
								</Button>
							</Stack>
						</Grid>
					</Grid>
				</CardContent>
			</Card>
		</Box>
	);
};

export default withAdminLayout(FaqCreate);

