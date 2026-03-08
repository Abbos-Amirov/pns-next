import React from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { PropertyList } from './index';

const doorInitialInput = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: 'DESC',
	search: {
		typeList: ['DOOR'],
	},
};

const PropertyDoorPage: NextPage = (props: any) => {
	return <PropertyList {...props} initialInput={doorInitialInput} />;
};

PropertyDoorPage.defaultProps = {
	initialInput: doorInitialInput,
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
		initialInput: doorInitialInput,
	},
});

export default withLayoutBasic(PropertyDoorPage);
