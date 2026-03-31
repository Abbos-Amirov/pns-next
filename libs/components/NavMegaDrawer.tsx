import React, { useLayoutEffect, useState } from 'react';
import Link from 'next/link';
import Drawer from '@mui/material/Drawer';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'next-i18next';

export type MegaPanel = 'home' | 'product' | 'experts' | 'support';

export const MEGA_ITEMS: Record<
	MegaPanel,
	{ href: string; labelKey: string; img: string }[]
> = {
	home: [
		{ href: '/', labelKey: 'Home', img: '/img/nav-overlay/home.png' },
		{ href: '/configurator', labelKey: 'Configurator', img: '/img/configurator/hero-1.png' },
	],
	product: [
		{ href: '/property/window', labelKey: 'Windows', img: '/img/property/menu-product-window.png' },
		{ href: '/property/door', labelKey: 'Doors', img: '/img/property/menu-product-door.png' },
	],
	experts: [
		{ href: '/agent', labelKey: 'Measurers', img: '/img/experts/measurers.png' },
		{ href: '/installer', labelKey: 'Installers', img: '/img/experts/installers.png' },
	],
	support: [
		{ href: '/our-services', labelKey: 'OurServices', img: '/img/support/our-services.png' },
		{ href: '/cs', labelKey: 'Support', img: '/img/support/support.png' },
		{ href: '/pns-history/', labelKey: 'PnsHistoryNav', img: '/img/contact/contact-hero.png' },
		{ href: '/repair-maintenance', labelKey: 'RepairMaintenanceService', img: '/img/support/our-services.png' },
		{ href: '/about-me', labelKey: 'AboutMe', img: '/img/support/about-me.png' },
		{ href: '/contact-us', labelKey: 'ContactUs', img: '/img/support/images.jpeg' },
	],
};

const NAV_FALLBACK_TOP = 88;

export interface NavMegaDrawerProps {
	panel: MegaPanel | null;
	onClose: () => void;
	mode: 'light' | 'dark';
}

const NavMegaDrawer: React.FC<NavMegaDrawerProps> = ({ panel, onClose, mode }) => {
	const { t } = useTranslation('common');
	const open = Boolean(panel);
	const items = panel ? MEGA_ITEMS[panel] : [];
	const [navBottom, setNavBottom] = useState(NAV_FALLBACK_TOP);

	const sectionTitle =
		panel === 'home'
			? t('Home')
			: panel === 'product'
				? t('Product')
				: panel === 'experts'
					? t('Experts')
					: panel === 'support'
						? t('Support')
						: '';

	const gridClass =
		panel === 'support' ? 'nav-mega-grid nav-mega-grid--6' : 'nav-mega-grid nav-mega-grid--2';

	useLayoutEffect(() => {
		if (!open) return;

		const measure = () => {
			const el = document.getElementById('navbar-primary');
			if (!el) {
				setNavBottom(NAV_FALLBACK_TOP);
				return;
			}
			const r = el.getBoundingClientRect();
			setNavBottom(Math.max(56, Math.round(r.bottom)));
		};

		measure();
		const measureSoon = window.setTimeout(measure, 0);
		window.addEventListener('resize', measure);
		window.addEventListener('scroll', measure, true);

		return () => {
			window.clearTimeout(measureSoon);
			window.removeEventListener('resize', measure);
			window.removeEventListener('scroll', measure, true);
		};
	}, [open, panel]);

	const enterEase = 'cubic-bezier(0.16, 1, 0.3, 1)';
	const exitEase = 'cubic-bezier(0.4, 0, 0.2, 1)';

	return (
		<Drawer
			anchor="top"
			open={open}
			onClose={onClose}
			className="nav-overlay-drawer nav-mega-drawer"
			disableScrollLock={false}
			transitionDuration={{ enter: 480, exit: 300 }}
			SlideProps={{
				easing: {
					enter: enterEase,
					exit: exitEase,
				},
			}}
			ModalProps={{
				keepMounted: false,
				disableEnforceFocus: true,
				disableAutoFocus: true,
			}}
			BackdropProps={{
				sx: {
					top: `${navBottom}px`,
					bottom: 0,
					left: 0,
					right: 0,
					pointerEvents: 'auto',
					backgroundColor: 'rgba(8, 10, 16, 0.58)',
					backdropFilter: 'blur(4px)',
					WebkitBackdropFilter: 'blur(4px)',
				},
			}}
			sx={{
				zIndex: 1200,
				/* Root covers viewport; pass clicks through to navbar — only backdrop + paper capture pointers */
				pointerEvents: 'none',
				'& .MuiDrawer-paper': {
					pointerEvents: 'auto',
					width: '100%',
					maxWidth: '100%',
					height: 'auto',
					maxHeight: `calc(100vh - ${navBottom}px)`,
					top: `${navBottom}px`,
					left: 0,
					right: 0,
					bottom: 'auto',
					margin: 0,
					borderRadius: '0 0 20px 20px',
					boxSizing: 'border-box',
					background: 'linear-gradient(180deg, #2f3541 0%, #2a2f3a 48%, #262b35 100%)',
					color: '#e8eaef',
					borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
					boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.04)',
					overflowY: 'auto',
					transformOrigin: 'top center',
					willChange: 'transform',
				},
			}}
		>
			<div className="nav-mega-panel" data-theme={mode}>
				<div className="nav-mega-header">
					<div className="nav-mega-header-left">
						<img
							src={mode === 'dark' ? '/img/logo/pns-arched-door-light.svg' : '/img/logo/pns-arched-door-light.svg'}
							alt="PNS"
							className="nav-mega-logo"
						/>
						{panel && <span className="nav-mega-section-title">{sectionTitle}</span>}
					</div>
					<IconButton className="nav-mega-close" onClick={onClose} size="large" aria-label="Close menu">
						<CloseIcon />
					</IconButton>
				</div>
				<div className="nav-mega-content">
					<div className={gridClass}>
						{items.map((item) => (
							<Link
								key={item.href + item.labelKey}
								href={item.href}
								className="nav-overlay-card nav-mega-card"
								onClick={onClose}
							>
								<div className="nav-overlay-card-image nav-mega-card-image">
									<img src={item.img} alt={t(item.labelKey)} />
								</div>
								<span className="nav-overlay-card-label">{t(item.labelKey)}</span>
							</Link>
						))}
					</div>
				</div>
			</div>
		</Drawer>
	);
};

export default NavMegaDrawer;
