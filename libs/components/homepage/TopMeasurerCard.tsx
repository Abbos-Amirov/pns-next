import React from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Member } from '../../types/member/member';

interface TopMeasurerProps {
	measurer: Member;
}

const TopMeasurerCard = (props: TopMeasurerProps) => {
	const { measurer } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const measurerImage = measurer?.memberImage
		? `${process.env.REACT_APP_API_URL}/${measurer?.memberImage}`
		: '/img/profile/defaultUser.svg';

	// Optional: could navigate to member profile detail later
	// const goMeasurerDetail = () => router.push(`/agent/detail?id=${measurer?._id}`);

	if (device === 'mobile') {
		return (
			<Stack className="top-agent-card">
				<img src={measurerImage} alt="" />
				<strong>{measurer?.memberNick}</strong>
				<span>{measurer?.memberType}</span>
			</Stack>
		);
	}

	return (
		<Stack className="top-agent-card">
			<img src={measurerImage} alt="" />
			<strong>{measurer?.memberNick}</strong>
			<span>{measurer?.memberType}</span>
		</Stack>
	);
};

export default TopMeasurerCard;


