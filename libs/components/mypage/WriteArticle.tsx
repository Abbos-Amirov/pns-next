import React from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
const TuiEditor = dynamic(() => import('../community/Teditor'), { ssr: false });

const WriteArticle: NextPage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'mobile-writearticle-page'}>
				<Stack className={'mobile-mypage-tab-header'}>
					<Typography className={'mobile-mypage-tab-title'}>Write an Article</Typography>
					<Typography className={'mobile-mypage-tab-subtitle'}>Feel free to write your ideas!</Typography>
				</Stack>
				<Stack className={'mobile-writearticle-editor'}>
					<TuiEditor />
				</Stack>
			</Stack>
		);
	} else
		return (
			<div id="write-article-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Write an Article</Typography>
						<Typography className="sub-title">Feel free to write your ideas!</Typography>
					</Stack>
				</Stack>
				<TuiEditor />
			</div>
		);
};

export default WriteArticle;
