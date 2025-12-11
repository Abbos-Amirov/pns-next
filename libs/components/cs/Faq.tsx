import React, { SyntheticEvent, useState, useEffect, useMemo } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import { AccordionDetails, Box, Stack, Typography, CircularProgress } from '@mui/material';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { useRouter } from 'next/router';
import { styled } from '@mui/material/styles';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useQuery } from '@apollo/client';
import { GET_NOTICE_LIST } from '../../../apollo/user/query';
import { NoticeInquiry } from '../../types/notice/notice.inquiry';
import { Notice } from '../../types/notice/notice';
import { NoticeCategory, NoticeCategoryType, NoticeStatus } from '../../enums/notice.enum';
import { Direction } from '../../enums/common.enum';
import { sweetErrorHandling } from '../../sweetAlert';

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
	({ theme }) => ({
		border: `1px solid ${theme.palette.divider}`,
		'&:not(:last-child)': {
			borderBottom: 0,
		},
		'&:before': {
			display: 'none',
		},
	}),
);
const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary expandIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: '1.4rem' }} />} {...props} />
))(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : '#fff',
	'& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
		transform: 'rotate(180deg)',
	},
	'& .MuiAccordionSummary-content': {
		marginLeft: theme.spacing(1),
	},
}));

const Faq = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [category, setCategory] = useState<string>('product');
	const [expanded, setExpanded] = useState<string | false>(false);
	const [faqList, setFaqList] = useState<Notice[]>([]);
	const [total, setTotal] = useState<number>(0);

	// Map category to NoticeCategoryType
	const categoryToTypeMap: Record<string, NoticeCategoryType> = {
		product: NoticeCategoryType.PRODUCT,
		location: NoticeCategoryType.LOCATION,
		measurer: NoticeCategoryType.MEASURER,
		installer: NoticeCategoryType.INSTALLER,
		members: NoticeCategoryType.MEMBERS,
		system: NoticeCategoryType.SYSTEM,
		community: NoticeCategoryType.COMMUNITY,
		other: NoticeCategoryType.OTHER,
	};

	// Create notice inquiry based on category - matching backend NoticeInquiry class structure
	const noticeInquiry = useMemo(() => {
		const categoryType = categoryToTypeMap[category] || NoticeCategoryType.PRODUCT;
		
		// Backend NoticeInquiry structure:
		// - noticeCategoryType, noticeStatus are direct fields (not in search)
		// - search is an optional string field (can be omitted if not needed)
		const inquiry = {
			page: 1,
			limit: 100,
			sort: 'createdAt',
			direction: Direction.DESC,
			noticeCategoryType: categoryType,
			noticeStatus: NoticeStatus.ACTIVE,
		};
		
		// Debug log
		console.log('FAQ NoticeInquiry:', JSON.stringify(inquiry, null, 2));
		
		return inquiry;
	}, [category]);

	/** APOLLO REQUESTS **/
	const { data: noticeData, loading: noticeLoading, error: noticeError, refetch } = useQuery(GET_NOTICE_LIST, {
		variables: {
			input: noticeInquiry,
		},
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		onCompleted: (data) => {
			console.log('FAQ Query Response:', data);
			if (data?.getNoticeList) {
				console.log('FAQ List:', data.getNoticeList.list);
				console.log('FAQ Total:', data.getNoticeList.total);
				setFaqList(data.getNoticeList.list || []);
				setTotal(data.getNoticeList.total || 0);
			}
		},
		onError: (err) => {
			console.error('GetNoticeList Query Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		// Reset expanded when category changes
		setExpanded(false);
		// Query will automatically refetch when noticeInquiry changes (from useMemo)
		// No need to manually refetch here
	}, [category]);

	/** HANDLERS **/
	const changeCategoryHandler = (category: string) => {
		setCategory(category);
	};

	const handleChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};


	if (device === 'mobile') {
		return <div>FAQ MOBILE</div>;
	} else {
		return (
			<Stack className={'faq-content'}>
				<Box className={'categories'} component={'div'}>
					<div
						className={category === 'product' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('product');
						}}
					>
						PRODUCT
					</div>
					<div
						className={category === 'location' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('location');
						}}
					>
						LOCATION
					</div>
					<div
						className={category === 'measurer' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('measurer');
						}}
					>
						MEASURER
					</div>
					<div
						className={category === 'installer' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('installer');
						}}
					>
						INSTALLER
					</div>
					<div
						className={category === 'members' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('members');
						}}
					>
						MEMBERS
					</div>
					<div
						className={category === 'system' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('system');
						}}
					>
						SYSTEM
					</div>

					<div
						className={category === 'community' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('community');
						}}
					>
					 Community
					</div>
					<div
						className={category === 'other' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('other');
						}}
					>
						OTHER
					</div>
				</Box>
				<Box className={'wrap'} component={'div'}>
					{noticeLoading ? (
						<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
							<CircularProgress sx={{ color: '#8B4513' }} />
							<Typography sx={{ mt: 2, color: '#717171' }}>Loading FAQs...</Typography>
						</Stack>
					) : noticeError ? (
						<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
							<Typography color="error">Error loading FAQs: {noticeError.message}</Typography>
						</Stack>
					) : faqList.length === 0 ? (
						<Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
							<Typography sx={{ color: '#717171' }}>No FAQs found for this category.</Typography>
						</Stack>
					) : (
						faqList.map((notice: Notice) => (
							<Accordion
								expanded={expanded === notice._id}
								onChange={handleChange(notice._id)}
								key={notice._id}
							>
								<AccordionSummary id="panel1d-header" className="question" aria-controls="panel1d-content">
									<Typography className="badge" variant={'h4'}>
										Q
									</Typography>
									<Typography>{notice.noticeTitle}</Typography>
								</AccordionSummary>
								<AccordionDetails>
									<Stack className={'answer flex-box'}>
										<Typography className="badge" variant={'h4'} color={'primary'}>
											A
										</Typography>
										<Typography>{notice.noticeContent}</Typography>
									</Stack>
								</AccordionDetails>
							</Accordion>
						))
					)}
				</Box>
			</Stack>
		);
	}
};

export default Faq;
