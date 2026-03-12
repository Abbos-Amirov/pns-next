import React, { useState } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ImageUploadArea from '../../libs/components/our-services/ImageUploadArea';
import ApartmentIcon from '@mui/icons-material/Apartment';
import HomeIcon from '@mui/icons-material/Home';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

type ServiceType = 'apartment' | 'house';

const OurServices: NextPage = () => {
	const { t } = useTranslation('common');
	const [serviceType, setServiceType] = useState<ServiceType | null>(null);

	// Apartment form state
	const [apartmentAddress, setApartmentAddress] = useState('');
	const [apartmentBuilding, setApartmentBuilding] = useState('');
	const [apartmentFloor, setApartmentFloor] = useState('');
	const [apartmentNumber, setApartmentNumber] = useState('');
	const [apartmentProblemDescription, setApartmentProblemDescription] = useState('');
	const [apartmentImages, setApartmentImages] = useState<File[]>([]);

	// House form state
	const [houseAddress, setHouseAddress] = useState('');
	const [houseNumber, setHouseNumber] = useState('');
	const [houseProblemDescription, setHouseProblemDescription] = useState('');
	const [houseImages, setHouseImages] = useState<File[]>([]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: integrate with API when backend is ready
		console.log({ serviceType, apartment: { apartmentAddress, apartmentBuilding, apartmentFloor, apartmentNumber, apartmentProblemDescription, apartmentImages }, house: { houseAddress, houseNumber, houseProblemDescription, houseImages } });
	};

	return (
		<div className="our-services-page">
			<div className="our-services-container">
				{/* Header */}
				<header className="our-services-header">
					<Typography component="h1" className="our-services-title">
						{t('RepairMaintenanceService')}
					</Typography>
					<Typography component="p" className="our-services-subtitle">
						{t('OurServicesSubtitle')}
					</Typography>
				</header>

				{/* Service Type Selector */}
				<div className="our-services-selector">
					<div className="our-services-selector-grid">
						<button
							type="button"
							className={`our-services-option-card ${serviceType === 'apartment' ? 'selected' : ''}`}
							onClick={() => setServiceType('apartment')}
						>
							<div className="our-services-option-icon">
								<ApartmentIcon />
							</div>
							<span className="our-services-option-label">{t('ServiceTypeApartment')}</span>
						</button>
						<button
							type="button"
							className={`our-services-option-card ${serviceType === 'house' ? 'selected' : ''}`}
							onClick={() => setServiceType('house')}
						>
							<div className="our-services-option-icon">
								<HomeIcon />
							</div>
							<span className="our-services-option-label">{t('ServiceTypeHouse')}</span>
						</button>
					</div>
					{!serviceType && (
						<p className="our-services-select-hint">{t('ServiceSelectHint')}</p>
					)}
				</div>

				{/* Form Card */}
				{serviceType && (
					<div className="our-services-form-wrapper">
						<form className="our-services-form" onSubmit={handleSubmit}>
							{serviceType === 'apartment' && (
								<>
									<div className="our-services-field">
										<label className="our-services-label">{t('LabelAddress')}</label>
										<TextField
											fullWidth
											variant="outlined"
											placeholder={t('PlaceholderOurServicesAddress')}
											value={apartmentAddress}
											onChange={(e) => setApartmentAddress(e.target.value)}
											className="our-services-input"
										/>
									</div>
									<div className="our-services-field-row">
										<div className="our-services-field">
											<label className="our-services-label">{t('LabelBuildingNumber')}</label>
											<TextField
												fullWidth
												variant="outlined"
												placeholder={t('PlaceholderBuildingNumber')}
												value={apartmentBuilding}
												onChange={(e) => setApartmentBuilding(e.target.value)}
												className="our-services-input"
											/>
										</div>
										<div className="our-services-field">
											<label className="our-services-label">{t('LabelFloorNumber')}</label>
											<TextField
												fullWidth
												variant="outlined"
												placeholder={t('PlaceholderFloorNumber')}
												value={apartmentFloor}
												onChange={(e) => setApartmentFloor(e.target.value)}
												className="our-services-input"
											/>
										</div>
										<div className="our-services-field">
											<label className="our-services-label">{t('LabelApartmentNumber')}</label>
											<TextField
												fullWidth
												variant="outlined"
												placeholder={t('PlaceholderApartmentNumber')}
												value={apartmentNumber}
												onChange={(e) => setApartmentNumber(e.target.value)}
												className="our-services-input"
											/>
										</div>
									</div>
									<div className="our-services-field">
										<label className="our-services-label">{t('LabelProblemDescription')}</label>
										<TextField
											fullWidth
											variant="outlined"
											placeholder={t('PlaceholderProblemDescription')}
											value={apartmentProblemDescription}
											onChange={(e) => setApartmentProblemDescription(e.target.value)}
											className="our-services-textarea"
										/>
									</div>
									<div className="our-services-field">
										<label className="our-services-label">{t('ImageUploadLabel')}</label>
										<ImageUploadArea
											files={apartmentImages}
											onChange={setApartmentImages}
											maxFiles={4}
										/>
									</div>
								</>
							)}

							{serviceType === 'house' && (
								<>
									<div className="our-services-field">
										<label className="our-services-label">{t('LabelAddress')}</label>
										<TextField
											fullWidth
											variant="outlined"
											placeholder={t('PlaceholderOurServicesAddress')}
											value={houseAddress}
											onChange={(e) => setHouseAddress(e.target.value)}
											className="our-services-input"
										/>
									</div>
									<div className="our-services-field">
										<label className="our-services-label">{t('LabelHouseNumber')}</label>
										<TextField
											fullWidth
											variant="outlined"
											placeholder={t('PlaceholderHouseNumber')}
											value={houseNumber}
											onChange={(e) => setHouseNumber(e.target.value)}
											className="our-services-input"
										/>
									</div>
									<div className="our-services-field">
										<label className="our-services-label">{t('LabelProblemDescription')}</label>
										<TextField
											fullWidth
											minRows={5}
											maxRows={10}
											variant="outlined"
											placeholder={t('PlaceholderProblemDescription')}
											value={houseProblemDescription}
											onChange={(e) => setHouseProblemDescription(e.target.value)}
											className="our-services-textarea"
										/>
									</div>
									<div className="our-services-field">
										<label className="our-services-label">{t('ImageUploadLabel')}</label>
										<ImageUploadArea
											files={houseImages}
											onChange={setHouseImages}
											maxFiles={4}
										/>
									</div>
								</>
							)}

							<div className="our-services-cta">
								<Button type="submit" variant="contained" className="our-services-submit-btn">
									{t('SubmitServiceRequest')}
								</Button>
							</div>
						</form>
					</div>
				)}
			</div>
		</div>
	);
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

export default withLayoutBasic(OurServices);
