import React from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box, Button } from '@mui/material';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { ABOUT_KOREA_MAP_MARKERS } from '../../libs/data/aboutKoreaMap';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const About: NextPage = () => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return <div>{t('AboutPageMobile')}</div>;
	} else {
		return (
			<Stack className={'about-page'}>
				<Stack className={'intro'}>
					<Stack className={'container about-intro-container'}>
						<Stack className={'left about-intro-left'}>
							<span className={'about-intro-kicker'}>{t('AboutIntroKicker')}</span>
							<strong className={'about-intro-headline'}>{t('AboutIntroHeadline')}</strong>
						</Stack>
						<Stack className={'right about-intro-right'}>
							<div className={'about-intro-copy'}>
								<p>{t('AboutIntroPara1')}</p>
								<p>{t('AboutIntroPara2')}</p>
								<p>{t('AboutIntroPara3')}</p>
							</div>
							<div className={'about-intro-cards'}>
								<div className={'about-intro-card'}>
									<div className={'about-intro-card-icon'}>
										<img src="/img/icons/garden.svg" alt="" />
									</div>
									<div className={'about-intro-card-body'}>
										<span className={'about-intro-card-title'}>{t('AboutIntroCard1Title')}</span>
										<p>{t('AboutIntroCard1Body')}</p>
									</div>
								</div>
								<div className={'about-intro-card'}>
									<div className={'about-intro-card-icon'}>
										<img src="/img/icons/securePayment.svg" alt="" />
									</div>
									<div className={'about-intro-card-body'}>
										<span className={'about-intro-card-title'}>{t('AboutIntroCard2Title')}</span>
										<p>{t('AboutIntroCard2Body')}</p>
									</div>
								</div>
							</div>
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'statistics'}>
					<Stack className={'container'}>
						<Stack className={'banner'}>
							<img src="/img/banner/city%20pns.avif" alt="" />
						</Stack>
						<div className={'info about-stats'}>
							<div className={'about-stat-card'}>
								<span className={'about-stat-value'}>{t('AboutStats1Value')}</span>
								<p className={'about-stat-label'}>{t('AboutStats1Label')}</p>
							</div>
							<div className={'about-stat-card'}>
								<span className={'about-stat-value'}>{t('AboutStats2Value')}</span>
								<p className={'about-stat-label'}>{t('AboutStats2Label')}</p>
							</div>
							<div className={'about-stat-card'}>
								<span className={'about-stat-value'}>{t('AboutStats3Value')}</span>
								<p className={'about-stat-label'}>{t('AboutStats3Label')}</p>
							</div>
						</div>
					</Stack>
				</Stack>
				<Stack className={'agents about-agents-bridge'}>
					<Stack className={'container about-agents-inner'}>
						<span className={'about-agents-kicker'}>{t('AboutAgentsKicker')}</span>
						<h2 className={'title about-agents-title'}>{t('AboutAgentsSectionTitle')}</h2>
						<p className={'desc about-agents-desc'}>{t('AboutAgentsSectionDesc')}</p>
						<div className={'about-agents-cta-row'}>
							<Link href={'/agent'} className={'about-agents-cta-btn'}>
								{t('AboutAgentsCtaMeasurers')}
								<img src="/img/icons/rightup.svg" alt="" />
							</Link>
							<Link href={'/installer'} className={'about-agents-cta-btn about-agents-cta-btn--outline'}>
								{t('AboutAgentsCtaInstallers')}
								<img src="/img/icons/rightup.svg" alt="" />
							</Link>
						</div>
					</Stack>
				</Stack>
				<section className={'options'}>
					<Stack className={'container about-options-content'}>
						<strong className={'about-options-title'}>{t('AboutBusanOptionsTitle')}</strong>
						<div className={'about-options-cards'}>
							<div className={'about-option-card'}>
								<div className={'about-option-card-icon'}>
									<img src="/img/icons/security.svg" alt="" />
								</div>
								<div className={'about-option-card-text'}>
									<span className={'about-option-card-heading'}>{t('AboutBusanOption1Title')}</span>
									<p>{t('AboutBusanOption1Body')}</p>
								</div>
							</div>
							<div className={'about-option-card'}>
								<div className={'about-option-card-icon'}>
									<img src="/img/icons/keywording.svg" alt="" />
								</div>
								<div className={'about-option-card-text'}>
									<span className={'about-option-card-heading'}>{t('AboutBusanOption2Title')}</span>
									<p>{t('AboutBusanOption2Body')}</p>
								</div>
							</div>
							<div className={'about-option-card'}>
								<div className={'about-option-card-icon'}>
									<img src="/img/icons/investment.svg" alt="" />
								</div>
								<div className={'about-option-card-text'}>
									<span className={'about-option-card-heading'}>{t('AboutBusanOption3Title')}</span>
									<p>{t('AboutBusanOption3Body')}</p>
								</div>
							</div>
						</div>
						<Link href={'/contact-us'} className={'about-options-cta-link'}>
							<Stack className={'btn'}>
								{t('AboutBusanOptionsCta')}
								<img src="/img/icons/rightup.svg" alt="" />
							</Stack>
						</Link>
					</Stack>
					<div className={'about-options-banner'}>
						<div className={'about-options-banner-accent about-options-banner-accent--left'} />
						<div className={'about-options-banner-visual'}>
							<img
								src="/img/about/busan-branch-hero.png"
								alt=""
								className={'about-options-banner-img'}
								loading="lazy"
							/>
							<div className={'about-options-banner-scrim'} />
							<p className={'about-options-banner-label'}>{t('AboutBusanBranchHero')}</p>
						</div>
						<div className={'about-options-banner-accent about-options-banner-accent--right'} />
					</div>
				</section>

				<section className={'about-map-section'}>
					<div className={'about-map-section-inner'}>
						<h2 className={'about-map-heading'}>{t('AboutMapSectionTitle')}</h2>
						<div className={'about-map-visual'}>
							<img
								className={'about-map-image'}
								src="/img/about/korea-locations-map.png"
								alt=""
								loading="lazy"
							/>
							{ABOUT_KOREA_MAP_MARKERS.map((m) => (
								<div
									key={m.labelKey}
									className={'about-map-marker'}
									style={{ top: m.top, left: m.left }}
								>
									<span className={'about-map-dot'} aria-hidden />
									<span className={'about-map-label'}>{t(m.labelKey)}</span>
								</div>
							))}

							<div className={'about-map-card about-map-card--seoul'}>
								<div className={'about-map-card-head'}>
									<span className={'about-map-card-pill'}>{t('AboutOfficeSeoulTitle')}</span>
									<Button
										component={Link}
										href={t('AboutOfficeSeoulMapUrl')}
										target="_blank"
										rel="noopener noreferrer"
										className={'about-map-card-map-btn'}
										size="small"
									>
										{t('AboutMapViewMap')}
									</Button>
								</div>
								<div className={'about-map-card-rows'}>
									<div className={'about-map-card-row'}>
										<span className={'about-map-k'}>{t('AboutMapLabelAddress')}</span>
										<span className={'about-map-v'}>{t('AboutOfficeSeoulAddress')}</span>
									</div>
									<div className={'about-map-card-row'}>
										<span className={'about-map-k'}>{t('AboutMapLabelPhoneFax')}</span>
										<span className={'about-map-v'}>{t('AboutOfficeSeoulTel')}</span>
									</div>
								</div>
							</div>

							<div className={'about-map-card about-map-card--cheonan'}>
								<div className={'about-map-card-head'}>
									<span className={'about-map-card-pill'}>{t('AboutOfficeCheonanTitle')}</span>
									<Button
										component={Link}
										href={t('AboutOfficeCheonanMapUrl')}
										target="_blank"
										rel="noopener noreferrer"
										className={'about-map-card-map-btn'}
										size="small"
									>
										{t('AboutMapViewMap')}
									</Button>
								</div>
								<div className={'about-map-card-rows'}>
									<div className={'about-map-card-row'}>
										<span className={'about-map-k'}>{t('AboutMapLabelAddress')}</span>
										<span className={'about-map-v'}>{t('AboutOfficeCheonanAddress')}</span>
									</div>
									<div className={'about-map-card-row'}>
										<span className={'about-map-k'}>{t('AboutMapLabelPhoneFax')}</span>
										<span className={'about-map-v'}>{t('AboutOfficeCheonanTel')}</span>
									</div>
								</div>
							</div>

							<div className={'about-map-card about-map-card--busan'}>
								<div className={'about-map-card-head'}>
									<span className={'about-map-card-pill'}>{t('AboutOfficeBusanTitle')}</span>
									<Button
										component={Link}
										href={t('AboutOfficeBusanMapUrl')}
										target="_blank"
										rel="noopener noreferrer"
										className={'about-map-card-map-btn'}
										size="small"
									>
										{t('AboutMapViewMap')}
									</Button>
								</div>
								<div className={'about-map-card-rows'}>
									<div className={'about-map-card-row'}>
										<span className={'about-map-k'}>{t('AboutMapLabelAddress')}</span>
										<span className={'about-map-v'}>{t('AboutOfficeBusanAddress')}</span>
									</div>
									<div className={'about-map-card-row'}>
										<span className={'about-map-k'}>{t('AboutMapLabelPhoneFax')}</span>
										<span className={'about-map-v'}>{t('AboutOfficeBusanTel')}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<Stack className={'partners'}>
					<Stack className={'container'}>
						<span>Trusted bu the world's best</span>
						<Stack className={'wrap'}>
							<img src="/img/icons/brands/amazon.svg" alt="" />
							<img src="/img/icons/brands/amd.svg" alt="" />
							<img src="/img/icons/brands/cisco.svg" alt="" />
							<img src="/img/icons/brands/dropcam.svg" alt="" />
							<img src="/img/icons/brands/spotify.svg" alt="" />
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'help about-help-cta'}>
					<Stack className={'container about-help-inner'}>
						<Box component={'div'} className={'left about-help-left'}>
							<strong className={'about-help-title'}>{t('AboutHelpTitle')}</strong>
							<p className={'about-help-subtitle'}>{t('AboutHelpSubtitle')}</p>
						</Box>
						<Box component={'div'} className={'right about-help-actions'}>
							<Link href={'/contact-us'} className={'about-help-btn about-help-btn--outline'}>
								{t('ContactUs')}
								<img src="/img/icons/rightup.svg" alt="" aria-hidden />
							</Link>
							<a href={'tel:15514201'} className={'about-help-btn about-help-btn--primary'}>
								<img src="/img/icons/call.svg" alt="" aria-hidden />
								{t('AboutHelpPhoneDisplay')}
							</a>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(About);
