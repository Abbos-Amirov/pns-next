import React from 'react';
import { NextPage } from 'next';
import { Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AboutMe: NextPage = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	if (device === 'mobile') {
		return <h1>ABOUT ME MOBILE</h1>;
	}

	return (
		<Stack className={'about-me-page'} sx={{ py: 6, px: 2, alignItems: 'center', minHeight: '50vh' }}>
			<Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
				{t('AboutMe')}
			</Typography>
			<Typography color="text.secondary">Page coming soon.</Typography>
		</Stack>
	);
};

export default withLayoutBasic(AboutMe);
