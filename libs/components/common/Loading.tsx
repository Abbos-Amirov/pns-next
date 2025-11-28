import React from 'react';
import { Stack, Typography, Box, CircularProgress } from '@mui/material';

interface LoadingProps {
	isLoading: boolean;
}

const Loading = ({ isLoading }: LoadingProps) => {
	if (!isLoading) return null;

	return (
		<Box component={'div'} className={'page-loading-overlay'}>
			<Stack className={'loading-content'}>
				<Typography className={'loading-text-top'}>LOADING</Typography>
				<Box component={'div'} className={'loading-circle-wrapper'}>
					<CircularProgress 
						className={'loading-spinner'}
						size={120}
						thickness={4}
					/>
					<Typography className={'loading-text-circle'}>WINDOW</Typography>
				</Box>
				<Typography className={'loading-text-bottom'}>DOOR</Typography>
			</Stack>
		</Box>
	);
};

export default Loading;

