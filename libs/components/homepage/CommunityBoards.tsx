import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography, CircularProgress } from '@mui/material';
import CommunityCard from './CommunityCard';
import { BoardArticle } from '../../types/board-article/board-article';
import { useQuery } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { sweetErrorHandling } from '../../sweetAlert';

const CommunityBoards = () => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const [newsArticles, setNewsArticles] = useState<BoardArticle[]>([]);
	const [freeArticles, setFreeArticles] = useState<BoardArticle[]>([]);

	const newsInput = useMemo(
		() => ({
			page: 1,
			limit: 6,
			sort: 'articleViews',
			direction: 'DESC',
			search: { articleCategory: 'NEWS' },
		}),
		[],
	);

	const freeInput = useMemo(
		() => ({
			page: 1,
			limit: 6,
			sort: 'articleViews',
			direction: 'DESC',
			search: { articleCategory: 'FREE' },
		}),
		[],
	);

	/** APOLLO REQUESTS **/
	const {
		data: newsData,
		loading: newsLoading,
		error: newsError,
	} = useQuery(GET_BOARD_ARTICLES, {
		variables: { input: newsInput },
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
		onError: (err) => {
			sweetErrorHandling(err).then();
		},
	});

	const {
		data: freeData,
		loading: freeLoading,
		error: freeError,
	} = useQuery(GET_BOARD_ARTICLES, {
		variables: { input: freeInput },
		fetchPolicy: 'cache-and-network',
		notifyOnNetworkStatusChange: true,
		onError: (err) => {
			sweetErrorHandling(err).then();
		},
	});

	useEffect(() => {
		if (newsData?.getBoardArticles?.list) {
			setNewsArticles(newsData.getBoardArticles.list);
		}
	}, [newsData]);

	useEffect(() => {
		if (freeData?.getBoardArticles?.list) {
			setFreeArticles(freeData.getBoardArticles.list);
		}
	}, [freeData]);

	if (device === 'mobile') {
		return <div>COMMUNITY BOARDS (MOBILE)</div>;
	} else {
		const isLoading = newsLoading || freeLoading;
		const hasError = Boolean(newsError || freeError);

		return (
			<Stack className={'community-board'}>
				<Stack className={'container'}>
					<Stack sx={{ alignItems: 'center', textAlign: 'center' }}>
						<Typography
							className={'community-board-heading'}
							sx={{
								color: '#181a20',
								fontSize: '42px',
								fontWeight: 600,
								letterSpacing: '-0.5px',
								lineHeight: 1.2,
							}}
						>
							{t('Community')} <span className={'community-board-highlight'} style={{ color: '#8B4513' }}>{t('Highlights')}</span>
						</Typography>
						<Typography className={'community-board-subtitle'} sx={{ mt: 1, color: '#616161', fontSize: '14px' }}>
							{t('CommunityHighlightsSubtitle')}
						</Typography>
					</Stack>
					<Stack className="community-main">
						<Stack className={'community-left'}>
							<Stack className={'content-top'}>
								<Link href={'/community?articleCategory=NEWS'}>
									<span>{t('News')}</span>
								</Link>
								<img src="/img/icons/arrowBig.svg" alt="" />
							</Stack>
							<Stack className={'card-wrap'}>
								{isLoading ? (
									<Stack sx={{ width: '100%', alignItems: 'center', py: 3 }}>
										<CircularProgress sx={{ color: '#8B4513' }} />
									</Stack>
								) : hasError || newsArticles.length === 0 ? (
									<Stack className={'no-data'} sx={{ width: '100%', alignItems: 'center', py: 3 }}>
										<img src="/img/icons/icoAlert.svg" alt="" />
										<p style={{ color: '#717171', marginTop: '10px' }}>{t('No news articles found')}</p>
									</Stack>
								) : (
									newsArticles.map((article, index) => {
										return <CommunityCard vertical={true} article={article} index={index} key={article?._id} />;
									})
								)}
							</Stack>
						</Stack>
						<Stack className={'community-right'}>
							<Stack className={'content-top'}>
								<Link href={'/community?articleCategory=FREE'}>
									<span>{t('Free')}</span>
								</Link>
								<img src="/img/icons/arrowBig.svg" alt="" />
							</Stack>
							<Stack className={'card-wrap vertical'}>
								{isLoading ? (
									<Stack sx={{ width: '100%', alignItems: 'center', py: 3 }}>
										<CircularProgress sx={{ color: '#8B4513' }} />
									</Stack>
								) : hasError || freeArticles.length === 0 ? (
									<Stack className={'no-data'} sx={{ width: '100%', alignItems: 'center', py: 3 }}>
										<img src="/img/icons/icoAlert.svg" alt="" />
										<p style={{ color: '#717171', marginTop: '10px' }}>{t('No free articles found')}</p>
									</Stack>
								) : (
									freeArticles.map((article, index) => {
										return <CommunityCard vertical={false} article={article} index={index} key={article?._id} />;
									})
								)}
							</Stack>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default CommunityBoards;
