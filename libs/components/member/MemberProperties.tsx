import React from 'react';
import { Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const MemberProperties = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') return <div>MEMBER PROPERTIES MOBILE</div>;

	return (
		<Stack className={'member-properties'}>
			<Typography className={'title'}>Member Products</Typography>
		</Stack>
	);
};

export default MemberProperties;

