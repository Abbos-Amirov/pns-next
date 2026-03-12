import React, { useState } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ApartmentIcon from '@mui/icons-material/Apartment';
import HomeIcon from '@mui/icons-material/Home';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import ImageUploadArea from '../../libs/components/our-services/ImageUploadArea';

type PropertyType = 'apartment' | 'house';

const RepairMaintenance: NextPage = () => {
	const { t } = useTranslation('common');
	const [propertyType, setPropertyType] = useState<PropertyType | null>('apartment');
	const [address, setAddress] = useState('');
	const [buildingNumber, setBuildingNumber] = useState('');
	const [floorNumber, setFloorNumber] = useState('');
	const [apartmentNumber, setApartmentNumber] = useState('');
	const [houseNumber, setHouseNumber] = useState('');
	const [problemDesc, setProblemDesc] = useState('');
	const [images, setImages] = useState<File[]>([]);

	return (
		<div className="our-services-page">
			<div className="our-services-container">
				<div className="our-services-header">
					<h1 className="our-services-title">{t('RepairMaintenanceService')}</h1>
					<p className="our-services-subtitle">{t('OurServicesSubtitle')}</p>
				</div>

				<div className="our-services-selector">
					<div className="our-services-selector-grid">
						<button
							type="button"
							className={`our-services-option-card ${propertyType === 'apartment' ? 'selected' : ''}`}
							onClick={() => setPropertyType('apartment')}
						>
							<div className="our-services-option-icon">
								<ApartmentIcon />
							</div>
							<span className="our-services-option-label">{t('ServiceTypeApartment')}</span>
						</button>
						<button
							type="button"
							className={`our-services-option-card ${propertyType === 'house' ? 'selected' : ''}`}
							onClick={() => setPropertyType('house')}
						>
							<div className="our-services-option-icon">
								<HomeIcon />
							</div>
							<span className="our-services-option-label">{t('ServiceTypeHouse')}</span>
						</button>
					</div>
					{!propertyType && <p className="our-services-select-hint">{t('ServiceSelectHint')}</p>}
				</div>

				{propertyType && (
					<div className="our-services-form-wrapper">
						<form className="our-services-form">
							<div className="our-services-field">
								<label className="our-services-label">{t('LabelAddress')}</label>
								<TextField
									fullWidth
									variant="outlined"
									placeholder={t('PlaceholderOurServicesAddress')}
									value={address}
									onChange={(e) => setAddress(e.target.value)}
									className="our-services-input"
								/>
							</div>

							{propertyType === 'apartment' ? (
								<div className="our-services-field-row">
									<div className="our-services-field">
										<label className="our-services-label">{t('LabelBuildingNumber')}</label>
										<TextField
											fullWidth
											variant="outlined"
											placeholder={t('PlaceholderBuildingNumber')}
											value={buildingNumber}
											onChange={(e) => setBuildingNumber(e.target.value)}
											className="our-services-input"
										/>
									</div>
									<div className="our-services-field">
										<label className="our-services-label">{t('LabelFloorNumber')}</label>
										<TextField
											fullWidth
											variant="outlined"
											placeholder={t('PlaceholderFloorNumber')}
											value={floorNumber}
											onChange={(e) => setFloorNumber(e.target.value)}
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
							) : (
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
							)}

							<div className="our-services-field">
								<label className="our-services-label">{t('LabelProblemDescription')}</label>
								<TextField
									fullWidth
									rows={4}
									variant="outlined"
									placeholder={t('PlaceholderProblemDescription')}
									value={problemDesc}
									onChange={(e) => setProblemDesc(e.target.value)}
									className="our-services-textarea"
								/>
							</div>

							<div className="our-services-field">
								<label className="our-services-label">{t('ImageUploadLabel')}</label>
								<ImageUploadArea files={images} onChange={setImages} maxFiles={4} />
							</div>

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

export default withLayoutBasic(RepairMaintenance);
