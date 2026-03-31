import React from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Box, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Notice from '../../libs/components/cs/Notice';
import Faq from '../../libs/components/cs/Faq';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import NotificationsIcon from '@mui/icons-material/Notifications';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { useTranslation } from 'next-i18next';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CS: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');

	/** HANDLERS **/
	const changeTabHandler = (tab: string) => {
		router.push(
			{
				pathname: '/cs',
				query: { tab: tab },
			},
			undefined,
			{ scroll: false },
		);
	};
	const tab = router.query.tab ?? 'notice';

	if (device === 'mobile') {
		return <h1>{t('CsPageMobile')}</h1>;
	} else {
		return (
			<Stack className={'cs-page'}>
				<Stack className={'container'}>
					{/* Header Section */}
					<Box component={'div'} className={'cs-header'}>
						<Stack className={'header-content'} direction="row" alignItems="center" spacing={2}>
							<HelpCenterIcon className={'header-icon'} />
							<Stack spacing={0.5}>
								<Typography className={'header-title'}>{t('CsHeroTitle')}</Typography>
								<Typography className={'header-subtitle'}>{t('CsHeroSubtitle')}</Typography>
							</Stack>
						</Stack>
					</Box>

					{/* Tab Navigation */}
					<Box component={'div'} className={'cs-tabs'}>
						<Stack className={'tab-buttons'} direction="row" spacing={2}>
							<Box
								component={'div'}
								className={`tab-button ${tab === 'notice' ? 'active' : ''}`}
								onClick={() => changeTabHandler('notice')}
							>
								<NotificationsIcon className={'tab-icon'} />
								<Typography className={'tab-text'}>{t('CsTabNotice')}</Typography>
							</Box>
							<Box
								component={'div'}
								className={`tab-button ${tab === 'faq' ? 'active' : ''}`}
								onClick={() => changeTabHandler('faq')}
							>
								<QuestionAnswerIcon className={'tab-icon'} />
								<Typography className={'tab-text'}>{t('CsTabFaq')}</Typography>
							</Box>
						</Stack>
					</Box>

					{/* Content Section */}
					<Box component={'div'} className={'cs-content'}>
						{tab === 'notice' && <Notice />}
						{tab === 'faq' && <Faq />}
					</Box>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(CS);
