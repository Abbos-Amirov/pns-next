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
	Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { CreateNoticeInput } from '../../../libs/types/notice/notice.input';
import {
	NoticeCategory,
	NoticeStatus,
	NoticeCategoryType,
} from '../../../libs/enums/notice.enum';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../../libs/sweetAlert';
import { useMutation } from '@apollo/client';
import { CREATE_CS_NOTICE } from '../../../apollo/admin/mutation';

const NoticeCreate: NextPage = (props: any) => {
	const router = useRouter();
	const [noticeData, setNoticeData] = useState<CreateNoticeInput>({
		noticeCategory: NoticeCategory.TERMS,
		noticeStatus: NoticeStatus.ACTIVE,
		noticeCategoryType: NoticeCategoryType.PRODUCT,
		noticeTitle: '',
		noticeContent: '',
	});

	const [createCsNotice] = useMutation(CREATE_CS_NOTICE);

	/** HANDLERS **/
	const handleInputChange = (field: keyof CreateNoticeInput, value: any) => {
		setNoticeData({ ...noticeData, [field]: value });
	};

	const doDisabledCheck = () => {
		const checks = {
			title: noticeData.noticeTitle.trim() === '',
			content: noticeData.noticeContent.trim() === '',
		};
		
		const isDisabled = Object.values(checks).some(check => check === true);
		
		if (isDisabled) {
			console.log('Form validation failed:', checks);
		}
		
		return isDisabled;
	};

	const handleSubmit = async () => {
		try {
			await createCsNotice({
				variables: { input: noticeData },
			});
			await sweetTopSuccessAlert('Notice created successfully!');
			// Notice page'ga qaytish va cache'ni yangilash
			router.push({
				pathname: '/_admin/cs/notice',
				query: { refresh: 'true', timestamp: Date.now() },
			});
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message || 'Failed to create notice');
		}
	};

	return (
		<Box component={'div'} className={'content notice-create-page'}>
			{/* Header Section */}
			<Card className={'page-header-card'} sx={{ mb: 3 }}>
				<CardContent>
					<Stack direction={'row'} alignItems={'center'} spacing={2}>
						<Button
							startIcon={<ArrowBackIcon />}
							onClick={() => router.push('/_admin/cs/notice')}
							className={'back-btn'}
						>
							Back
						</Button>
						<Box className={'notice-create-icon-box'}>
							<NotificationsActiveIcon className={'notice-create-icon'} />
						</Box>
						<Box>
							<Typography variant={'h4'} className={'page-title'} sx={{ fontWeight: 700, mb: 0.5 }}>
								Create New Notice
							</Typography>
							<Typography variant={'body2'} sx={{ color: '#717171' }}>
								Add a new notice or announcement
							</Typography>
						</Box>
					</Stack>
				</CardContent>
			</Card>

			{/* Form Section */}
			<Card className={'form-card'}>
				<CardContent>
					<Grid container spacing={3}>
						{/* Notice Title Section */}
						<Grid item xs={12}>
							<Box className={'notice-title-section'}>
								<Typography variant={'h6'} className={'notice-section-title'} sx={{ mb: 2, fontWeight: 600 }}>
									Notice Title <span style={{ color: '#d32f2f' }}>*</span>
								</Typography>
								<TextField
									fullWidth
									label="Enter notice title..."
									value={noticeData.noticeTitle}
									onChange={(e) => handleInputChange('noticeTitle', e.target.value)}
									className={'notice-title-input'}
									required
								/>
							</Box>
						</Grid>

						{/* Notice Content Section */}
						<Grid item xs={12}>
							<Box className={'notice-content-section'}>
								<Typography variant={'h6'} className={'notice-section-title'} sx={{ mb: 2, fontWeight: 600 }}>
									Notice Content <span style={{ color: '#d32f2f' }}>*</span>
								</Typography>
								<TextField
									fullWidth
									multiline
									rows={12}
									label="Enter notice content..."
									value={noticeData.noticeContent}
									onChange={(e) => handleInputChange('noticeContent', e.target.value)}
									className={'notice-content-input'}
									required
								/>
							</Box>
						</Grid>

						{/* Notice Category */}
						<Grid item xs={12} md={4}>
							<Box className={'notice-select-section'}>
								<Typography variant={'h6'} className={'notice-section-title'} sx={{ mb: 2, fontWeight: 600 }}>
									Notice Category
								</Typography>
								<FormControl fullWidth className={'notice-select-control'}>
									<Select
										value={noticeData.noticeCategory}
										onChange={(e) => handleInputChange('noticeCategory', e.target.value)}
										className={'notice-select'}
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
							<Box className={'notice-select-section'}>
								<Typography variant={'h6'} className={'notice-section-title'} sx={{ mb: 2, fontWeight: 600 }}>
									Notice Status
								</Typography>
								<FormControl fullWidth className={'notice-select-control'}>
									<Select
										value={noticeData.noticeStatus}
										onChange={(e) => handleInputChange('noticeStatus', e.target.value)}
										className={'notice-select'}
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
							<Box className={'notice-select-section'}>
								<Typography variant={'h6'} className={'notice-section-title'} sx={{ mb: 2, fontWeight: 600 }}>
									Category Type
								</Typography>
								<FormControl fullWidth className={'notice-select-control'}>
									<Select
										value={noticeData.noticeCategoryType}
										onChange={(e) => handleInputChange('noticeCategoryType', e.target.value)}
										className={'notice-select'}
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

						{/* Submit Buttons */}
						<Grid item xs={12}>
							<Stack direction={'row'} spacing={2} justifyContent={'flex-end'} sx={{ mt: 3 }}>
								<Button
									variant={'outlined'}
									onClick={() => router.push('/_admin/cs/notice')}
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
									Create Notice
								</Button>
							</Stack>
						</Grid>
					</Grid>
				</CardContent>
			</Card>
		</Box>
	);
};

export default withAdminLayout(NoticeCreate);

