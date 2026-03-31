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
import Hendel from '../libs/components/homepage/Hendel';
import PnsPdf from '../libs/components/homepage/PnsPdf';

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
				<Hendel />
				<Advertisement />
				<TopProperties />
				<TopMeasurers />
				<PnsPdf />
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<Brand />
				<PopularProducts />
				<TrendProperties />
				
				<Advertisement />
				<Hendel />
				<TopMeasurers />
				<Events />
				<PnsPdf />
				{/* <CommunityBoards /> */}
			</Stack>
		);
	}
};

export default withLayoutMain(Home);
