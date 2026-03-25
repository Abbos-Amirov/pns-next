import React, { FormEvent, useState } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import { Button, Stack, TextField, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { sweetTopSuccessAlert } from '../../libs/sweetAlert';

const CONTACT_HERO = '/img/contact/contact-hero.png';
const COMMENTS_MAX = 600;

const ADDRESS = '충청남도 천안시 동남구 풍세면 풍세산단5로 61';
const OFFICE_HOURS = '8:00 – 19:30';
const PHONES = ['010-8200-5998', '010-2027-3030'];
const CONTACT_EMAIL = 'Iyh@pnswindow.co.kr';

export const getStaticProps = async ({ locale }: { locale: string }) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const ContactUs: NextPage = () => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [comments, setComments] = useState('');

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !email.trim() || !comments.trim()) {
			return;
		}
		await sweetTopSuccessAlert(t('ContactFormThankYou'));
		setName('');
		setEmail('');
		setPhone('');
		setComments('');
	};

	const mobileClass = device === 'mobile' ? ' contact-us-mobile' : '';

	return (
		<div className={`contact-us-page${mobileClass}`}>
			<section className="contact-us-hero-section" aria-labelledby="contact-us-heading">
				<div className="contact-us-hero-section-inner">
					<div className="contact-us-hero-block">
						<Typography id="contact-us-heading" className="contact-us-page-title" component="h1">
							{t('ContactUs')}
						</Typography>
						<div className="contact-us-hero">
							<img src={CONTACT_HERO} alt="" />
						</div>
					</div>
				</div>
			</section>

			<div className="contact-us-inner">
				<div className="contact-us-grid">
					<section className="contact-form-col">
						<Typography className="contact-form-title" component="h2">
							{t('SendMessage')}
						</Typography>
						<form className="contact-form" onSubmit={onSubmit} noValidate>
							<Stack spacing={2.5}>
								<TextField
									required
									label={
										<>
											{t('ContactName')}
											<span className="required-star">*</span>
										</>
									}
									name="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									variant="standard"
									fullWidth
									autoComplete="name"
								/>
								<TextField
									required
									type="email"
									label={
										<>
											{t('ContactEmailLabel')}
											<span className="required-star">*</span>
										</>
									}
									name="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									variant="standard"
									fullWidth
									autoComplete="email"
								/>
								<TextField
									label={t('Phone')}
									name="phone"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									variant="standard"
									fullWidth
									autoComplete="tel"
								/>
								<div>
									<TextField
										required
										label={
											<>
												{t('Comments')}
												<span className="required-star">*</span>
											</>
										}
										name="comments"
										value={comments}
										onChange={(e) => {
											const v = e.target.value;
											if (v.length <= COMMENTS_MAX) setComments(v);
										}}
										variant="standard"
										fullWidth
										multiline
										minRows={5}
									/>
									<Typography component="span" className="contact-char-count">
										{t('ContactCharCount', { count: comments.length, max: COMMENTS_MAX })}
									</Typography>
								</div>
							</Stack>

							<div className="contact-captcha-placeholder">{t('ContactCaptchaPlaceholder')}</div>

							<Button type="submit" variant="contained" className="contact-submit-btn" disableElevation>
								{t('ContactSubmit')}
							</Button>
						</form>
					</section>

					<aside className="contact-info-col">
						<div className="contact-info-block">
							<LocationOnIcon className="contact-info-icon" />
							<Typography className="contact-info-heading" component="h2">
								{t('Address')}
							</Typography>
							<p className="contact-info-text">{ADDRESS}</p>
						</div>
						<div className="contact-info-block">
							<AccessTimeIcon className="contact-info-icon" />
							<Typography className="contact-info-heading" component="h2">
								{t('OfficeHours')}
							</Typography>
							<p className="contact-info-text">{OFFICE_HOURS}</p>
						</div>
						<div className="contact-info-block">
							<PhoneIcon className="contact-info-icon" />
							<Typography className="contact-info-heading" component="h2">
								{t('Phone')}
							</Typography>
							<div className="contact-info-text">
								{PHONES.map((num) => (
									<p key={num} style={{ margin: '0 0 6px' }}>
										<a href={`tel:${num.replace(/-/g, '')}`}>{num}</a>
									</p>
								))}
							</div>
						</div>
						<div className="contact-info-block">
							<EmailIcon className="contact-info-icon" />
							<Typography className="contact-info-heading" component="h2">
								{t('ContactEmailLabel')}
							</Typography>
							<p className="contact-info-text">
								<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
							</p>
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(ContactUs);
