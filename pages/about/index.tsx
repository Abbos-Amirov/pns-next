import React, { useState, useCallback } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box } from '@mui/material';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { ABOUT_OFFICES, getAboutOfficeById, type AboutOfficeDef } from '../../libs/data/aboutOffices';
import { ABOUT_KOREA_MAP_MARKERS } from '../../libs/data/aboutKoreaMap';
import AboutOfficeMapModal from '../../libs/components/about/AboutOfficeMapModal';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const About: NextPage = () => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const [mapModalOffice, setMapModalOffice] = useState<AboutOfficeDef | null>(null);
	const openMapModal = useCallback((office: AboutOfficeDef) => setMapModalOffice(office), []);
	const closeMapModal = useCallback(() => setMapModalOffice(null), []);

	if (device === 'mobile') {
		return <div>{t('AboutPageMobile')}</div>;
	} else {
		return (
			<Stack className={'about-page'}>
				<Stack className={'statistics'}>
					<Stack className={'container'}>
						<header className={'about-stats-hero'}>
							<span className={'about-stats-hero-kicker'}>{t('AboutStatsHeroKicker')}</span>
							<h1 className={'about-stats-hero-title'}>{t('AboutStatsHeroTitle')}</h1>
							<p className={'about-stats-hero-sub'}>{t('AboutStatsHeroSub')}</p>
						</header>
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
				<Stack className={'intro'}>
					<Stack className={'container about-intro-container'}>
						<Stack className={'left about-intro-left'}>
							<span className={'about-intro-kicker'}>{t('AboutIntroKicker')}</span>
							<strong className={'about-intro-headline'}>{t('AboutIntroHeadline')}</strong>
							<p className={'about-intro-headline-sub'}>{t('AboutIntroHeadlineSub')}</p>
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
				<section className={'about-map-section'}>
					<div className={'about-map-hero'}>
						<div className={'about-map-hero-inner'}>
							<header className={'about-map-hero-header'}>
								<h2 className={'about-map-hero-title'}>{t('AboutMapHeroTitle')}</h2>
								<p className={'about-map-hero-sub'}>{t('AboutMapHeroSubtitle')}</p>
							</header>
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

								{(['seoul', 'cheonan', 'busanFactory'] as const).map((fid) => {
									const o = getAboutOfficeById(fid);
									if (!o) return null;
									const cardClass =
										fid === 'seoul'
											? 'about-map-card about-map-card--seoul'
											: fid === 'cheonan'
												? 'about-map-card about-map-card--cheonan'
												: 'about-map-card about-map-card--busan';
									return (
										<div key={fid} className={cardClass}>
											<div className={'about-map-card-head'}>
												<span className={'about-map-card-pill'}>{t(o.titleKey)}</span>
												<button
													type="button"
													className={'about-map-card-map-btn'}
													onClick={() => openMapModal(o)}
												>
													{t('AboutMapViewMap')}
												</button>
											</div>
											<div className={'about-map-card-rows'}>
												<div className={'about-map-card-row'}>
													<span className={'about-map-k'}>{t('AboutMapLabelAddress')}</span>
													<span className={'about-map-v'}>{t(o.addressKey)}</span>
												</div>
												<div className={'about-map-card-row'}>
													<span className={'about-map-k'}>{t('AboutMapLabelPhoneFax')}</span>
													<span className={'about-map-v'}>{t(o.telKey)}</span>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>

					<div className={'about-map-grid-block'}>
						<div className={'about-map-section-inner'}>
							<h2 className={'about-map-grid-title'}>{t('AboutMapOfficesGridTitle')}</h2>
							<div className={'about-offices-grid'}>
								{ABOUT_OFFICES.map((office) => (
									<article key={office.id} className={'about-office-card'}>
										<div className={'about-office-card-head'}>
											<h3 className={'about-office-card-title'}>{t(office.titleKey)}</h3>
											<button
												type="button"
												className={'about-office-map-btn'}
												onClick={() => openMapModal(office)}
											>
												{t('AboutMapViewMap')}
											</button>
										</div>
										<ul className={'about-office-card-list'}>
											<li>
												<span className={'about-office-card-bullet'} aria-hidden />
												<span className={'about-office-card-line'}>
													<span className={'about-office-card-k'}>{t('AboutMapLabelAddress')}</span>
													{t(office.addressKey)}
												</span>
											</li>
											<li>
												<span className={'about-office-card-bullet'} aria-hidden />
												<span className={'about-office-card-line'}>
													<span className={'about-office-card-k'}>{t('AboutMapLabelPhoneFax')}</span>
													{t(office.telKey)}
												</span>
											</li>
										</ul>
									</article>
								))}
							</div>
						</div>
					</div>
					<AboutOfficeMapModal open={!!mapModalOffice} onClose={closeMapModal} office={mapModalOffice} />
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
