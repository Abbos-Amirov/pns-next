import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Stack, Box, CircularProgress, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useTranslation } from 'next-i18next';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import TopMeasurerCard from './TopMeasurerCard';
import { Member } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import { useQuery } from '@apollo/client';
import { GET_MEASURERS } from '../../../apollo/user/query';
import { Direction } from '../../enums/common.enum';

interface TopMeasurersProps {
	initialInput: AgentsInquiry;
}

const TopMeasurers = (props: TopMeasurersProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const [topMeasurers, setTopMeasurers] = useState<Member[]>([]);

	/** APOLLO REQUESTS **/
	const { loading, data, error } = useQuery(GET_MEASURERS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		if (data?.getMeasurers?.list) {
			setTopMeasurers(data.getMeasurers.list);
		}
	}, [data]);

	/** UI **/
	const renderBody = () => {
		if (loading) {
			return (
				<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '260px' }}>
					<CircularProgress sx={{ color: '#8B4513' }} />
				</Stack>
			);
		}

		if (error || topMeasurers.length === 0) {
			return (
				<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '260px' }}>
					<Typography sx={{ color: '#616161', fontSize: '14px' }}>
						{error ? t('Error loading measurers') : t('No measurers found')}
					</Typography>
				</Stack>
			);
		}

		if (device === 'mobile') {
			return (
				<Stack className={'wrapper'}>
					<Swiper
						className={'top-agents-swiper'}
						slidesPerView={'auto'}
						centeredSlides={true}
						spaceBetween={29}
						modules={[Autoplay]}
					>
						{topMeasurers.map((measurer: Member) => (
							<SwiperSlide className={'top-agents-slide'} key={measurer?._id}>
								<TopMeasurerCard measurer={measurer} key={measurer?.memberNick} />
							</SwiperSlide>
						))}
					</Swiper>
				</Stack>
			);
		}

		return (
			<Stack className={'wrapper'}>
				<Box component={'div'} className={'switch-btn swiper-agents-prev'}>
					<ArrowBackIosNewIcon />
				</Box>
				<Box component={'div'} className={'card-wrapper'}>
					<Swiper
						className={'top-agents-swiper'}
						slidesPerView={'auto'}
						spaceBetween={29}
						modules={[Autoplay, Navigation, Pagination]}
						navigation={{
							nextEl: '.swiper-agents-next',
							prevEl: '.swiper-agents-prev',
						}}
					>
						{topMeasurers.map((measurer: Member) => (
							<SwiperSlide className={'top-agents-slide'} key={measurer?._id}>
								<TopMeasurerCard measurer={measurer} key={measurer?.memberNick} />
							</SwiperSlide>
						))}
					</Swiper>
				</Box>
				<Box component={'div'} className={'switch-btn swiper-agents-next'}>
					<ArrowBackIosNewIcon />
				</Box>
			</Stack>
		);
	};

	if (device === 'mobile') {
		return (
			<Stack className={'top-agents'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>{t('Top Measurers')}</span>
					</Stack>
					{renderBody()}
				</Stack>
			</Stack>
		);
	}

	return (
		<Stack className={'top-agents'}>
			<Stack className={'container'}>
				<Stack className={'info-box'}>
					<Box component={'div'} className={'left'}>
						<h2 className={'main-heading'}>
							{t('Accurate')} <br /> <span className={'highlight'}>{t('Measurement Professionals')}</span>
						</h2>
					</Box>
					<Box component={'div'} className={'right'}>
						<div
							className={'more-box measurers-more'}
							role="button"
							tabIndex={0}
							onClick={() => {
								router.push({
									pathname: '/agent',
									query: {
										input: JSON.stringify({
											page: 1,
											limit: 10,
											sort: 'memberRank',
											direction: 'DESC',
											search: {},
										}),
									},
								});
							}}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									router.push({
										pathname: '/agent',
										query: {
											input: JSON.stringify({
												page: 1,
												limit: 10,
												sort: 'memberRank',
												direction: 'DESC',
												search: {},
											}),
										},
									});
								}
							}}
						>
							<span>{t('See All Measurers')}</span>
							<img src="/img/icons/rightup.svg" alt="" />
						</div>
					</Box>
				</Stack>
				{renderBody()}
			</Stack>
		</Stack>
	);
};

TopMeasurers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'memberRank',
		direction: Direction.DESC,
		search: {},
	},
};

export default TopMeasurers;


