import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import type { HTMLAttributes, ReactNode } from 'react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import moment from 'moment';
import Link from 'next/link';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

type DivProps = HTMLAttributes<HTMLDivElement> & { children?: ReactNode };
const Stack = ({ children, ...props }: DivProps) => <div {...props}>{children}</div>;
const Box = ({ children, ...props }: DivProps) => <div {...props}>{children}</div>;

const Footer = (): JSX.Element => {
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
									<img src="/img/logo/favicon.svg" alt="PNS DEV Logo" className={'logo'} />
								</Box>
								<h2 className={'brand-name'}>PNS DEV</h2>
								<p className={'description'}>
									We are a window studio offering high-quality window and door solutions for businesses and homes.
								</p>
							</Box>
							<Stack className={'navigation-columns'}>
								<Box className={'nav-column'}>
									<Link href={'/about'}>
										<span>About</span>
									</Link>
									<Link href={'/community'}>
										<span>Journal</span>
									</Link>
									<Link href={'/cs'}>
										<span>FAQ</span>
									</Link>
									<Link href={'/cs'}>
										<span>Get In Touch</span>
									</Link>
									<span>Careers</span>
								</Box>
								<Box className={'nav-column'}>
									<span>Pricing</span>
									<span>How It Works?</span>
									<span>Our Services</span>
								</Box>
								<Box className={'nav-column'}>
									<Link href={'/property'}>
										<span>Windows</span>
									</Link>
									<Link href={'/property'}>
										<span>Doors</span>
									</Link>
									<span>Our Projects</span>
									<Link href={'/cs'}>
										<span>Terms & Conditions</span>
									</Link>
									<span>Support Center</span>
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
						<span>©{currentYear} PNS DEV. All Rights Reserved.</span>
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
									<img src="/img/logo/favicon.svg" alt="PNS DEV Logo" className={'logo'} />
								</Box>
								<h2 className={'brand-name'}>PNS DEV</h2>
								<p className={'description'}>
									We are a window studio offering high-quality window and door solutions for businesses and homes.
								</p>
							</Box>
							<Stack className={'navigation-columns'}>
								<Box className={'nav-column'}>
									<Link href={'/about'}>
										<span>About</span>
									</Link>
									<Link href={'/community'}>
										<span>Journal</span>
									</Link>
									<Link href={'/cs'}>
										<span>FAQ</span>
									</Link>
									<Link href={'/cs'}>
										<span>Get In Touch</span>
									</Link>
									<span>Careers</span>
								</Box>
								<Box className={'nav-column'}>
									<span>Pricing</span>
									<span>How It Works?</span>
									<span>Our Services</span>
								</Box>
								<Box className={'nav-column'}>
									<Link href={'/property'}>
										<span>Windows</span>
									</Link>
									<Link href={'/property'}>
										<span>Doors</span>
									</Link>
									<span>Our Projects</span>
									<Link href={'/cs'}>
										<span>Terms & Conditions</span>
									</Link>
									<span>Support Center</span>
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
						<span>©{currentYear} PNS DEV. All Rights Reserved.</span>
					</Box>
				</Box>
				<Box className={'background-text'}>Door</Box>
			</Stack>
		);
	}
};

export default Footer;
