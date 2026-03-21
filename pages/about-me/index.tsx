import React from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';

const ABOUT_IMAGES = {
	hero: '/img/about/automatic-production-line-for-aluminum-window-and-door-3-c91bbd0d-5b31-4bc8-8acb-5fa000dd4ef7.png',
	experience: '/img/about/automatic-production-line-for-aluminum-window-and-door-4-4eb5d476-63c5-4004-98d6-9f4286e71f5d.png',
	different: '/img/about/production-video-upvc-windows-0c699a23-1e23-43f4-8435-1769f81eab00.png',
	workProcess: '/img/about/news-p.v1.20240610.ddc04ec3783c44ea827b4c2f770e3295_P1-315e5ec4-0c1a-4738-bb3b-c08a97e78120.png',
	advantages: '/img/about/door-production-01-9374388c-25e3-499d-a9a0-6a5c12f85719.png',
	trust: '/img/about/rasimlar_-dc80f673-2245-4c65-9f44-f19edecdcbb5.png',
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const AboutMe: NextPage = () => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<div className="about-me-page about-me-mobile">
				<section className="amu-section amu-hero-section">
					<div className="amu-container">
						<h2 className="amu-hero-title">{t('AboutHeroTitle')}</h2>
						{(t('AboutHeroText') as string).split('\n\n').map((para, i) => (
							<p key={i}>{para}</p>
						))}
						<div className="amu-img-wrap">
							<img src={ABOUT_IMAGES.hero} alt={t('AboutHeroTitle')} />
						</div>
					</div>
				</section>
				<section className="amu-section">
					<p>{t('AboutExperienceText1')}</p>
					<p>{t('AboutExperienceText2')}</p>
					<img src={ABOUT_IMAGES.experience} alt="" />
				</section>
				<section className="amu-section">
					<img src={ABOUT_IMAGES.different} alt="" />
					<p>{t('AboutDifferentText1')}</p>
					<p>{t('AboutDifferentText2')}</p>
				</section>
			</div>
		);
	}

	return (
		<div className="about-me-page">
			{/* 1. HERO - two-column like sections below (text left, image right) */}
			<section className="amu-section amu-hero-section">
				<div className="amu-container">
					<div className="amu-row">
						<div className="amu-text amu-hero-text">
							<h2 className="amu-hero-title">{t('AboutHeroTitle')}</h2>
							{(t('AboutHeroText') as string).split('\n\n').map((para, i) => (
								<p key={i}>{para}</p>
							))}
						</div>
						<div className="amu-img-wrap">
							<img src={ABOUT_IMAGES.hero} alt={t('AboutHeroTitle')} />
						</div>
					</div>
				</div>
			</section>

			{/* 2. OUR EXPERIENCE - text left, image right */}
			<section className="amu-section amu-section-1">
				<div className="amu-container">
					<div className="amu-row">
						<div className="amu-text">
							<h2>{t('AboutExperienceTitle')}</h2>
							<p>{t('AboutExperienceText1')}</p>
							<p>{t('AboutExperienceText2')}</p>
						</div>
						<div className="amu-img-wrap">
							<img src={ABOUT_IMAGES.experience} alt={t('AboutExperienceTitle')} />
						</div>
					</div>
				</div>
			</section>

			{/* 3. WHAT MAKES DIFFERENT - image left, text right */}
			<section className="amu-section amu-section-2">
				<div className="amu-container">
					<div className="amu-row amu-row-reverse">
						<div className="amu-text">
							<h2>{t('AboutDifferentTitle')}</h2>
							<p>{t('AboutDifferentText1')}</p>
							<p>{t('AboutDifferentText2')}</p>
							<ul>
								<li>{t('AboutDifferent1')}</li>
								<li>{t('AboutDifferent2')}</li>
								<li>{t('AboutDifferent3')}</li>
								<li>{t('AboutDifferent4')}</li>
								<li>{t('AboutDifferent5')}</li>
								<li>{t('AboutDifferent6')}</li>
							</ul>
						</div>
						<div className="amu-img-wrap">
							<img src={ABOUT_IMAGES.different} alt={t('AboutDifferentTitle')} />
						</div>
					</div>
				</div>
			</section>

			{/* 4. OUR WORK PROCESS - text left, image right */}
			<section className="amu-section amu-section-3">
				<div className="amu-container">
					<div className="amu-row">
						<div className="amu-text">
							<h2>{t('AboutProcessTitle')}</h2>
							<p>{t('AboutProcessDesc')}</p>
							<ol>
								<li>{t('AboutProcess1')}</li>
								<li>{t('AboutProcess2')}</li>
								<li>{t('AboutProcess3')}</li>
								<li>{t('AboutProcess4')}</li>
								<li>{t('AboutProcess5')}</li>
							</ol>
						</div>
						<div className="amu-img-wrap">
							<img src={ABOUT_IMAGES.workProcess} alt={t('AboutProcessTitle')} />
						</div>
					</div>
				</div>
			</section>

			{/* 5. OUR ADVANTAGES - image left, text right */}
			<section className="amu-section amu-section-4">
				<div className="amu-container">
					<div className="amu-row amu-row-reverse">
						<div className="amu-text">
							<h2>{t('AboutAdvantagesTitle')}</h2>
							<p>{t('AboutAdvantagesDesc')}</p>
							<ul>
								<li>{t('AboutAdvantages1')}</li>
								<li>{t('AboutAdvantages2')}</li>
								<li>{t('AboutAdvantages3')}</li>
								<li>{t('AboutAdvantages4')}</li>
								<li>{t('AboutAdvantages5')}</li>
							</ul>
						</div>
						<div className="amu-img-wrap">
							<img src={ABOUT_IMAGES.advantages} alt={t('AboutAdvantagesTitle')} />
						</div>
					</div>
				</div>
			</section>

			{/* 6. FINAL TRUST */}
			<section className="amu-section amu-trust">
				<div className="amu-container">
					<h2 className="amu-trust-title">{t('AboutTrustTitle')}</h2>
					<p className="amu-trust-desc">{t('AboutTrustDesc')}</p>
					<div className="amu-trust-img">
						<img src={ABOUT_IMAGES.trust} alt={t('AboutTrustTitle')} />
					</div>
				</div>
			</section>
		</div>
	);
};

export default withLayoutBasic(AboutMe);
