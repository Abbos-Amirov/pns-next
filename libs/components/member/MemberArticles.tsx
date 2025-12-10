import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import CommunityCard from '../common/CommunityCard';
import { T } from '../../types/common';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticlesInquiry } from '../../types/board-article/board-article.input';
import { useQuery } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { sweetErrorHandling } from '../../sweetAlert';

const MemberArticles: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [total, setTotal] = useState<number>(0);
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<BoardArticlesInquiry>(initialInput);
	const [memberBoArticles, setMemberBoArticles] = useState<BoardArticle[]>([]);

	/** APOLLO REQUESTS **/
	const { data: articlesData, loading, error, refetch } = useQuery(GET_BOARD_ARTICLES, {
		variables: {
			input: {
				page: searchFilter.page || 1,
				limit: searchFilter.limit || 6,
				sort: searchFilter.sort || 'createdAt',
				direction: searchFilter.direction || 'DESC',
				search: searchFilter.search || {},
			},
		},
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		skip: !searchFilter.search?.memberId,
		onCompleted: (data) => {
			if (data?.getBoardArticles) {
				const articles = data.getBoardArticles.list || [];
				setMemberBoArticles(articles);
				
				const metaCounter = data.getBoardArticles.metaCounter;
				const totalCount = Array.isArray(metaCounter) 
					? (metaCounter[0]?.total || 0)
					: (metaCounter?.total || 0);
				setTotal(totalCount);
			}
		},
		onError: (err) => {
			console.error('GetBoardArticles Query Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (memberId) {
			setSearchFilter({ 
				...initialInput, 
				search: { ...initialInput.search, memberId: memberId as string } 
			});
		}
	}, [memberId]);

	useEffect(() => {
		if (searchFilter.search?.memberId && refetch) {
			refetch({
				input: {
					page: searchFilter.page || 1,
					limit: searchFilter.limit || 6,
					sort: searchFilter.sort || 'createdAt',
					direction: searchFilter.direction || 'DESC',
					search: searchFilter.search || {},
				},
			});
		}
	}, [searchFilter, refetch]);

	/** HANDLERS **/
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	if (device === 'mobile') {
		return <div>MEMBER ARTICLES MOBILE</div>;
	} else {
		return (
			<div id="member-articles-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Articles</Typography>
					</Stack>
				</Stack>
				<Stack className="articles-list-box">
					{loading ? (
						<div className={'no-data'}>
							<Typography>Loading articles...</Typography>
						</div>
					) : error ? (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<Typography color={'error'}>Error loading articles: {error.message}</Typography>
						</div>
					) : memberBoArticles?.length === 0 ? (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No Articles found!</p>
						</div>
					) : (
						memberBoArticles?.map((boardArticle: BoardArticle) => {
							return <CommunityCard boardArticle={boardArticle} key={boardArticle?._id} size={'small'} />;
						})
					)}
				</Stack>
				{memberBoArticles?.length !== 0 && (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchFilter.limit) || 1}
								page={searchFilter.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>{total} article{total !== 1 ? 's' : ''} available</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		);
	}
};

MemberArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MemberArticles;
