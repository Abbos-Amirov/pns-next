import React, { useState, useEffect, useMemo } from 'react';
import { Stack, Box, Typography, Chip, CircularProgress } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useQuery } from '@apollo/client';
import { GET_CS_NOTICE_LIST } from '../../../apollo/user/query';
import type { Notice as NoticeType } from '../../types/notice/notice';
import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';
import { Direction } from '../../enums/common.enum';
import { sweetErrorHandling } from '../../sweetAlert';
import moment from 'moment';
import { useTranslation } from 'next-i18next';

const Notice = () => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const [noticeList, setNoticeList] = useState<NoticeType[]>([]);
	const [total, setTotal] = useState<number>(0);

	// Create notice inquiry for TERMS and INQUIRY categories
	const noticeInquiry = useMemo(() => {
		return {
			page: 1,
			limit: 100,
			sort: 'createdAt',
			direction: Direction.DESC,
			noticeStatus: NoticeStatus.ACTIVE,
		};
	}, []);

	/** APOLLO REQUESTS **/
	const { data: noticeData, loading: noticeLoading, error: noticeError, refetch } = useQuery(GET_CS_NOTICE_LIST, {
		variables: {
			input: noticeInquiry,
		},
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		onCompleted: (data) => {
			console.log('Notice Query Response:', data);
			if (data?.getCsNoticeList) {
				// Filter by TERMS and INQUIRY categories
				const filteredList = (data.getCsNoticeList.list || []).filter(
					(notice: NoticeType) => notice.noticeCategory === NoticeCategory.TERMS || notice.noticeCategory === NoticeCategory.INQUIRY
				);
				console.log('Filtered Notice List:', filteredList);
				console.log('Notice Total:', filteredList.length);
				setNoticeList(filteredList);
				setTotal(filteredList.length);
			}
		},
		onError: (err) => {
			console.error('GetCsNoticeList Query Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	/** LIFECYCLES **/
	/** HANDLERS **/

	if (device === 'mobile') {
		return <div>{t('CsNoticeMobile')}</div>;
	} else {
		return (
			<Stack className={'notice-content'}>
				<Typography className={'title'} variant="h5">
					{t('CsNoticeTitle')}
				</Typography>
				<Stack className={'main'}>
					{/* Table Header */}
					<Box component={'div'} className={'notice-header'}>
						<Box component={'div'} className={'header-item'}>
							<Typography className={'header-text'}>{t('CsTableNo')}</Typography>
						</Box>
						<Box component={'div'} className={'header-item header-title'}>
							<Typography className={'header-text'}>{t('CsTableTitle')}</Typography>
						</Box>
						<Box component={'div'} className={'header-item'}>
							<Typography className={'header-text'}>{t('CsTableDate')}</Typography>
						</Box>
					</Box>
					{/* Notice Cards */}
					<Stack className={'notice-list'}>
						{noticeLoading ? (
							<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
								<CircularProgress sx={{ color: '#120d53' }} />
								<Typography sx={{ mt: 2, color: '#717171' }}>{t('CsLoadingNotices')}</Typography>
							</Stack>
						) : noticeError ? (
							<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
								<Typography color="error">{t('CsErrorLoadingNotices', { message: noticeError.message })}</Typography>
							</Stack>
						) : noticeList.length === 0 ? (
							<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
								<Typography sx={{ color: '#717171' }}>{t('CsNoNotices')}</Typography>
							</Stack>
						) : (
							noticeList.map((notice: NoticeType, index: number) => (
								<Box
									component={'div'}
									className={`notice-card ${notice.noticeCategory === NoticeCategory.TERMS ? 'event' : ''}`}
									key={notice._id || index}
								>
									<Box component={'div'} className={'notice-number-section'}>
										{notice.noticeCategory === NoticeCategory.TERMS ? (
											<Chip
												icon={<EventIcon />}
												label={t('CsTermsLabel')}
												className={'event-badge'}
												size="small"
											/>
										) : (
											<Typography className={'notice-number'}>{index + 1}</Typography>
										)}
									</Box>
									<Box component={'div'} className={'notice-title-section'}>
										<Typography className={'notice-title'}>{notice.noticeTitle}</Typography>
									</Box>
									<Box component={'div'} className={'notice-date-section'}>
										<Stack direction="row" alignItems="center" spacing={1}>
											<CalendarTodayIcon className={'date-icon'} />
											<Typography className={'notice-date'}>
												{moment(notice.createdAt).format('DD.MM.YYYY')}
											</Typography>
										</Stack>
									</Box>
								</Box>
							))
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Notice;
