import { NextPage } from 'next';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import Brand from '../libs/components/homepage/Brand';
import PopularProducts from '../libs/components/homepage/PopularProducts';
import TopMeasurers from '../libs/components/homepage/TopMeasurers';
import Events from '../libs/components/homepage/Events';
import TrendProperties from '../libs/components/homepage/TrendProperties';
import TopProperties from '../libs/components/homepage/TopProperties';
import { Stack } from '@mui/material';
import Advertisement from '../libs/components/homepage/Advertisement';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'home-page'}>
				<Brand />
				<PopularProducts />
				<TrendProperties />
				<Advertisement />
				<TopProperties />
				<TopMeasurers />
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<Brand />
				<PopularProducts />
				<TrendProperties />
				<TopProperties />
				<Advertisement />
				<TopMeasurers />
				<Events />
				<CommunityBoards />
			</Stack>
		);
	}
};

export default withLayoutMain(Home);
