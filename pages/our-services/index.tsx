import React, { useState } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { SERVICES_DATA } from '../../libs/components/our-services/servicesData';
import ApartmentIcon from '@mui/icons-material/Apartment';
import HomeIcon from '@mui/icons-material/Home';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

type PropertyType = 'apartment' | 'house';

const OurServices: NextPage = () => {
	const { t } = useTranslation('common');
	const [propertyType, setPropertyType] = useState<PropertyType | null>(null);

	return (
		<div className="our-services-full-page">
			{/* 1. HERO SECTION */}
			<section className="os-hero">
				<div className="os-hero-inner">
					<div className="os-hero-badge">{t('OurServicesHeroBadge')}</div>
					<h1 className="os-hero-title">{t('OurServicesHeroTitle')}</h1>
					<p className="os-hero-subtitle">{t('OurServicesHeroSubtitle')}</p>
					<p className="os-hero-support">{t('OurServicesHeroSupport')}</p>
				</div>
			</section>

			{/* 2. SERVICE CATEGORY SECTION */}
			<section className="os-section os-services">
				<div className="os-container">
					<h2 className="os-section-title">{t('OurServicesSectionServices')}</h2>
					<div className="os-service-grid">
						{SERVICES_DATA.map((item) => (
							<div key={item.id} className="os-service-card">
								<div className="os-service-card-icon">
									<item.Icon />
								</div>
								<h3 className="os-service-card-title">{t(item.titleKey)}</h3>
								<p className="os-service-card-desc">{t(item.descKey)}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* 3. PROPERTY TYPE SELECTION */}
			<section className="os-section os-property">
				<div className="os-container">
					<h2 className="os-section-title">{t('OurServicesSectionProperty')}</h2>
					<div className="os-property-grid">
						<button
							type="button"
							className={`os-property-card ${propertyType === 'apartment' ? 'selected' : ''}`}
							onClick={() => setPropertyType('apartment')}
						>
							<div className="os-property-icon">
								<ApartmentIcon />
							</div>
							<span>{t('ServiceTypeApartment')}</span>
						</button>
						<button
							type="button"
							className={`os-property-card ${propertyType === 'house' ? 'selected' : ''}`}
							onClick={() => setPropertyType('house')}
						>
							<div className="os-property-icon">
								<HomeIcon />
							</div>
							<span>{t('ServiceTypeHouse')}</span>
						</button>
					</div>
					{!propertyType && <p className="os-property-hint">{t('ServiceSelectHint')}</p>}
					{propertyType && (
						<div className="os-cta-box">
							<Link href="/repair-maintenance/">
								<Button variant="contained" className="os-cta-btn">
									{t('OurServicesRequestCTA')} <ArrowForwardIcon fontSize="small" sx={{ ml: 0.5 }} />
								</Button>
							</Link>
						</div>
					)}
				</div>
			</section>

			{/* 4. REPAIR / ISSUE SUPPORT SECTION */}
			<section className="os-section os-repair">
				<div className="os-container">
					<div className="os-repair-block">
						<div className="os-repair-icon">
							<BuildIcon />
						</div>
						<div className="os-repair-content">
							<h3 className="os-repair-title">{t('OurServicesRepairTitle')}</h3>
							<p className="os-repair-desc">{t('OurServicesRepairDesc')}</p>
							<ul className="os-repair-list">
								<li>{t('OurServicesRepairEx1')}</li>
								<li>{t('OurServicesRepairEx2')}</li>
								<li>{t('OurServicesRepairEx3')}</li>
								<li>{t('OurServicesRepairEx4')}</li>
								<li>{t('OurServicesRepairEx5')}</li>
								<li>{t('OurServicesRepairEx6')}</li>
								<li>{t('OurServicesRepairEx7')}</li>
							</ul>
							<Link href="/repair-maintenance/">
								<Button variant="outlined" className="os-repair-btn">
									{t('OurServicesRepairCTA')}
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* 5. WHY CHOOSE US SECTION */}
			<section className="os-section os-why">
				<div className="os-container">
					<h2 className="os-section-title">{t('OurServicesWhyTitle')}</h2>
					<div className="os-why-grid">
						<div className="os-why-item">
							<CheckCircleIcon className="os-why-icon" />
							<span>{t('OurServicesWhy1')}</span>
						</div>
						<div className="os-why-item">
							<CheckCircleIcon className="os-why-icon" />
							<span>{t('OurServicesWhy2')}</span>
						</div>
						<div className="os-why-item">
							<CheckCircleIcon className="os-why-icon" />
							<span>{t('OurServicesWhy3')}</span>
						</div>
						<div className="os-why-item">
							<CheckCircleIcon className="os-why-icon" />
							<span>{t('OurServicesWhy4')}</span>
						</div>
						<div className="os-why-item">
							<CheckCircleIcon className="os-why-icon" />
							<span>{t('OurServicesWhy5')}</span>
						</div>
					</div>
				</div>
			</section>

			{/* 6. FINAL CTA SECTION */}
			<section className="os-section os-cta-final">
				<div className="os-container">
					<div className="os-cta-card">
						<h2 className="os-cta-title">{t('OurServicesCTATitle')}</h2>
						<p className="os-cta-subtitle">{t('OurServicesCTASubtitle')}</p>
						<Link href="/repair-maintenance/">
							<Button variant="contained" size="large" className="os-cta-main-btn">
								{t('OurServicesCTABtn')}
							</Button>
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

export default withLayoutBasic(OurServices);
