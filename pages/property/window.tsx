import React from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { PropertyList } from './index';

const windowInitialInput = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: 'DESC',
	search: {
		typeList: ['WINDOW'],
	},
};

const PropertyWindowPage: NextPage = (props: any) => {
	return <PropertyList {...props} initialInput={windowInitialInput} />;
};

PropertyWindowPage.defaultProps = {
	initialInput: windowInitialInput,
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
		initialInput: windowInitialInput,
	},
});

export default withLayoutBasic(PropertyWindowPage);
