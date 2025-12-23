import React, { useMemo, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { GET_LOCATIONS } from '../../../apollo/user/query';
import { sweetErrorHandling } from '../../sweetAlert';
import { Direction } from '../../enums/common.enum';
import { LocationsInquiry } from '../../types/location/location.input';
import { Location } from '../../types/location/location';
import CityCard from '../city/CityCard';
import { T } from '../../types/common';

const MemberLocations: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { memberId } = router.query;

	// Local pagination (backend doesn't support memberId in search)
	const [page, setPage] = useState<number>(1);
	const limit = 9;

	const { data, loading, error } = useQuery(GET_LOCATIONS, {
		variables: {
			input: {
				page: 1,
				limit: 300,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {},
			} as LocationsInquiry,
		},
		skip: !memberId,
		fetchPolicy: 'network-only',
		errorPolicy: 'all',
		onError: (err) => {
			console.error('GetLocations Query Error:', err);
			sweetErrorHandling(err).then();
		},
	});

	const memberLocationsAll: Location[] = useMemo(() => {
		const list: Location[] = data?.getLocations?.list || [];
		const id = memberId as string | undefined;
		if (!id) return [];
		return list.filter((l) => l.memberId === id);
	}, [data, memberId]);

	const pagedLocations: Location[] = useMemo(() => {
		const start = (page - 1) * limit;
		return memberLocationsAll.slice(start, start + limit);
	}, [memberLocationsAll, page]);

	const paginationHandler = (e: T, value: number) => {
		setPage(value);
	};

	if (device === 'mobile') {
		return <div>MEMBER LOCATIONS MOBILE</div>;
	}

	return (
		<div id="member-locations-page">
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">Locations</Typography>
				</Stack>
			</Stack>

			<Stack className="locations-list-box">
				{loading ? (
					<div className={'no-data'}>
						<Typography>Loading locations...</Typography>
					</div>
				) : error ? (
					<div className={'no-data'}>
						<img src="/img/icons/icoAlert.svg" alt="" />
						<Typography color={'error'}>Error loading locations: {error.message}</Typography>
					</div>
				) : memberLocationsAll.length === 0 ? (
					<div className={'no-data'}>
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>No Locations found!</p>
					</div>
				) : (
					<>
						<Stack className="locations-grid">
							{pagedLocations.map((loc: Location) => (
								<div className={'wrap-main'} key={loc._id}>
									<CityCard city={loc} />
								</div>
							))}
						</Stack>

						<Stack className="pagination-config">
							<Stack className="pagination-box">
								<Pagination
									count={Math.ceil(memberLocationsAll.length / limit) || 1}
									page={page}
									shape="circular"
									color="primary"
									onChange={paginationHandler}
								/>
							</Stack>
							<Stack className="total-result">
								<Typography>
									{memberLocationsAll.length} location{memberLocationsAll.length > 1 ? 's' : ''} available
								</Typography>
							</Stack>
						</Stack>
					</>
				)}
			</Stack>
		</div>
	);
};

MemberLocations.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	},
};

export default MemberLocations;


