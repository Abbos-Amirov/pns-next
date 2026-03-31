import React from 'react';
import { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import PnsHistoryContent from '../../libs/components/pns-history/PnsHistoryContent';
export const getStaticProps = async ({ locale }: { locale?: string }) => ({
	props: {
		...(await serverSideTranslations(locale ?? 'en', ['common'])),
	},
});

const PnsHistory: NextPage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<div className="pns-history-page-root pns-history-page--mobile">
				<PnsHistoryContent />
			</div>
		);
	}

	return (
		<div className="pns-history-page-root">
			<PnsHistoryContent />
		</div>
	);
};

export default withLayoutBasic(PnsHistory);
