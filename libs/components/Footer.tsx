import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import type { HTMLAttributes, ReactNode } from 'react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import moment from 'moment';
import Link from 'next/link';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { useTranslation } from 'react-i18next';

type DivProps = HTMLAttributes<HTMLDivElement> & { children?: ReactNode };
const Stack = ({ children, ...props }: DivProps) => <div {...props}>{children}</div>;
const Box = ({ children, ...props }: DivProps) => <div {...props}>{children}</div>;

const Footer = (): JSX.Element => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const currentYear = moment().year();
	const mapAddress = '청남도 천안시 동남구 풍세면 풍세산단5로 61';
	const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`;

	if (device == 'mobile') {
		return (
			<Stack className={'footer-container'}>
				<Box className={'watermark-text'}>PNS DEV</Box>
				<Box className={'footer-content-box'}>
					<Box className={'blue-line'}></Box>
					<Stack className={'main-content'}>
						<Stack className={'left-section'}>
							<Box className={'logo-section'}>
								<Box className={'logo-wrapper'}>
									<img src="/img/logo/pns-arched-door.svg" alt="PNS Window Logo" className={'logo'} />
								</Box>
								<h2 className={'brand-name'}>PNS DEV</h2>
								<p className={'description'}>
									{t('FooterDesc')}
								</p>
							</Box>
							<Stack className={'navigation-columns'}>
								<Box className={'nav-column'}>
									<Link href={'/about'}>
										<span>{t('FooterAbout')}</span>
									</Link>
									<Link href={'/community'}>
										<span>{t('FooterJournal')}</span>
									</Link>
									<Link href={'/cs'}>
										<span>{t('FooterFAQ')}</span>
									</Link>
									<Link href={'/cs'}>
										<span>{t('FooterGetInTouch')}</span>
									</Link>
									<span>{t('FooterCareers')}</span>
								</Box>
								<Box className={'nav-column'}>
									<span>{t('FooterPricing')}</span>
									<span>{t('FooterHowItWorks')}</span>
									<span>{t('FooterOurServices')}</span>
								</Box>
								<Box className={'nav-column'}>
									<Link href={'/property'}>
										<span>{t('Windows')}</span>
									</Link>
									<Link href={'/property'}>
										<span>{t('Doors')}</span>
									</Link>
									<span>{t('FooterOurProjects')}</span>
									<Link href={'/cs'}>
										<span>{t('FooterTermsConditions')}</span>
									</Link>
									<span>{t('FooterSupportCenter')}</span>
								</Box>
							</Stack>
						</Stack>
						<Stack className={'right-section'}>
							<Box className={'contact-info'}>
								<Box className={'contact-item'}>
									<PhoneIcon className={'contact-icon'} />
									<a href="tel:+8201082005998">+82 010 8200 5998</a>
								</Box>
								<Box className={'contact-item'}>
									<EmailIcon className={'contact-icon'} />
									<a href="mailto:abbosamirov571@gmail.com">abbosamirov571@gmail.com</a>
								</Box>
							</Box>
							<Box className={'map-placeholder'}>
								<iframe
									src={mapUrl}
									width="100%"
									height="100%"
									style={{ border: 0, borderRadius: '12px' }}
									allowFullScreen
									loading="lazy"
									referrerPolicy="no-referrer-when-downgrade"
									title="PNS DEV Location"
								></iframe>
							</Box>
							<Box className={'social-icons'}>
								<FacebookOutlinedIcon className={'social-icon'} />
								<InstagramIcon className={'social-icon'} />
								<TwitterIcon className={'social-icon'} />
							</Box>
						</Stack>
					</Stack>
					<Box className={'copyright'}>
						<span>{t('FooterCopyright', { year: currentYear })}</span>
					</Box>
				</Box>
				<Box className={'background-text'}>Touch</Box>
			</Stack>
		);
	} else {
		return (
			<Stack className={'footer-container'}>
				<Box className={'watermark-text'}>PNS DEV</Box>
				<Box className={'footer-content-box'}>
					<Box className={'blue-line'}></Box>
					<Stack className={'main-content'}>
						<Stack className={'left-section'}>
							<Box className={'logo-section'}>
								<Box className={'logo-wrapper'}>
									<img src="/img/logo/pns-arched-door.svg" alt="PNS Window Logo" className={'logo'} />
								</Box>
								<h2 className={'brand-name'}>PNS DEV</h2>
								<p className={'description'}>
									{t('FooterDesc')}
								</p>
							</Box>
							<Stack className={'navigation-columns'}>
								<Box className={'nav-column'}>
									<Link href={'/about'}>
										<span>{t('FooterAbout')}</span>
									</Link>
									<Link href={'/community'}>
										<span>{t('FooterJournal')}</span>
									</Link>
									<Link href={'/cs'}>
										<span>{t('FooterFAQ')}</span>
									</Link>
									<Link href={'/cs'}>
										<span>{t('FooterGetInTouch')}</span>
									</Link>
									<span>{t('FooterCareers')}</span>
								</Box>
								<Box className={'nav-column'}>
									<span>{t('FooterPricing')}</span>
									<span>{t('FooterHowItWorks')}</span>
									<span>{t('FooterOurServices')}</span>
								</Box>
								<Box className={'nav-column'}>
									<Link href={'/property'}>
										<span>{t('Windows')}</span>
									</Link>
									<Link href={'/property'}>
										<span>{t('Doors')}</span>
									</Link>
									<span>{t('FooterOurProjects')}</span>
									<Link href={'/cs'}>
										<span>{t('FooterTermsConditions')}</span>
									</Link>
									<span>{t('FooterSupportCenter')}</span>
								</Box>
							</Stack>
						</Stack>
						<Stack className={'right-section'}>
							<Box className={'contact-info'}>
								<Box className={'contact-item'}>
									<PhoneIcon className={'contact-icon'} />
									<a href="tel:+8201082005998">+82 010 8200 5998</a>
								</Box>
								<Box className={'contact-item'}>
									<EmailIcon className={'contact-icon'} />
									<a href="mailto:abbosamirov571@gmail.com">abbosamirov571@gmail.com</a>
								</Box>
							</Box>
							<Box className={'map-placeholder'}>
								<iframe
									src={mapUrl}
									width="100%"
									height="100%"
									style={{ border: 0, borderRadius: '12px' }}
									allowFullScreen
									loading="lazy"
									referrerPolicy="no-referrer-when-downgrade"
									title="PNS DEV Location"
								></iframe>
							</Box>
							<Box className={'social-icons'}>
								<FacebookOutlinedIcon className={'social-icon'} />
								<InstagramIcon className={'social-icon'} />
								<TwitterIcon className={'social-icon'} />
							</Box>
						</Stack>
					</Stack>
					<Box className={'copyright'}>
						<span>{t('FooterCopyright', { year: currentYear })}</span>
					</Box>
				</Box>
				<Box className={'background-text'}>Door</Box>
			</Stack>
		);
	}
};

export default Footer;
