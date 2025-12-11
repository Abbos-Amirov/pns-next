import React from 'react';
import { Stack, Box, Typography, Chip } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const Notice = () => {
	const device = useDeviceDetect();

	/** APOLLO REQUESTS **/
	/** LIFECYCLES **/
	/** HANDLERS **/

	const data = [
		{
			no: 1,
			event: true,
			title: 'Register to use and get discounts',
			date: '01.03.2024',
		},
		{
			no: 2,
			title: "It's absolutely free to upload and trade properties",
			date: '31.03.2024',
		},
	];

	if (device === 'mobile') {
		return <div>NOTICE MOBILE</div>;
	} else {
		return (
			<Stack className={'notice-content'}>
				<Typography className={'title'} variant="h5">
					Notice
				</Typography>
				<Stack className={'main'}>
					{/* Table Header */}
					<Box component={'div'} className={'notice-header'}>
						<Box component={'div'} className={'header-item'}>
							<Typography className={'header-text'}>No.</Typography>
						</Box>
						<Box component={'div'} className={'header-item header-title'}>
							<Typography className={'header-text'}>Title</Typography>
						</Box>
						<Box component={'div'} className={'header-item'}>
							<Typography className={'header-text'}>Date</Typography>
						</Box>
					</Box>
					{/* Notice Cards */}
					<Stack className={'notice-list'}>
						{data.map((ele: any, index: number) => (
							<Box
								component={'div'}
								className={`notice-card ${ele?.event ? 'event' : ''}`}
								key={ele.title || index}
							>
								<Box component={'div'} className={'notice-number-section'}>
									{ele?.event ? (
										<Chip
											icon={<EventIcon />}
											label="Event"
											className={'event-badge'}
											size="small"
										/>
									) : (
										<Typography className={'notice-number'}>{ele.no}</Typography>
									)}
								</Box>
								<Box component={'div'} className={'notice-title-section'}>
									<Typography className={'notice-title'}>{ele.title}</Typography>
								</Box>
								<Box component={'div'} className={'notice-date-section'}>
									<Stack direction="row" alignItems="center" spacing={1}>
										<CalendarTodayIcon className={'date-icon'} />
										<Typography className={'notice-date'}>{ele.date}</Typography>
									</Stack>
								</Box>
							</Box>
						))}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Notice;
