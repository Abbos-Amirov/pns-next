import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Box, Menu } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from 'next-i18next';

export type HomeNavDropdownVariant = 'light' | 'dark';

const HOME_IMG = '/img/nav-overlay/home.png';
const CONFIGURATOR_IMG = '/img/configurator/hero-1.png';

export interface HomeNavDropdownProps {
	variant?: HomeNavDropdownVariant;
}

/**
 * Home ustiga kelganda 2 ta havola (Home, Configurator) rasmlar bilan ochiladi.
 */
const HomeNavDropdown: React.FC<HomeNavDropdownProps> = ({ variant = 'light' }) => {
	const { t } = useTranslation('common');
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const triggerRef = useRef<HTMLSpanElement | null>(null);

	const cancelClose = () => {
		if (closeTimer.current) {
			clearTimeout(closeTimer.current);
			closeTimer.current = null;
		}
	};

	const scheduleClose = () => {
		closeTimer.current = setTimeout(() => {
			setAnchorEl(null);
			closeTimer.current = null;
		}, 200);
	};

	const openMenu = () => {
		cancelClose();
		if (triggerRef.current) {
			setAnchorEl(triggerRef.current);
		}
	};

	const isOpen = Boolean(anchorEl);

	const linkClass =
		variant === 'dark' ? 'nav-link-dark home-link-dark' : 'nav-link home-link';
	const menuClass =
		variant === 'dark'
			? 'product-menu-dark home-menu premium-mega-menu'
			: 'product-menu home-menu premium-mega-menu';
	const labelClass =
		variant === 'dark'
			? 'product-menu-card-label support-menu-card-label-dark'
			: 'product-menu-card-label';

	const wrapperClass =
		variant === 'dark' ? 'home-dropdown-dark product-dropdown-dark' : 'home-dropdown product-dropdown';
	const iconClass = variant === 'dark' ? 'dropdown-icon-dark' : 'dropdown-icon';

	return (
		<Box
			component="div"
			className={wrapperClass}
			sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', overflow: 'visible' }}
			onMouseEnter={openMenu}
			onMouseLeave={scheduleClose}
		>
			<Box
				component="span"
				ref={triggerRef}
				className={`${linkClass} ${isOpen ? 'is-open' : ''}`}
				sx={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'default' }}
			>
				{t('Home')}
				<KeyboardArrowDownIcon className={iconClass} />
			</Box>
			<Menu
				anchorEl={anchorEl}
				open={isOpen}
				onClose={() => {}}
				disablePortal
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				transformOrigin={{ vertical: 'top', horizontal: 'left' }}
				className={menuClass}
				MenuListProps={{
					onMouseEnter: cancelClose,
					onMouseLeave: scheduleClose,
					sx: { display: 'flex', flexDirection: 'row', padding: 0, gap: 0 },
					autoFocusItem: false,
				}}
				PaperProps={{
					onMouseEnter: cancelClose,
					onMouseLeave: scheduleClose,
				}}
			>
				<Link href={'/'} className={'product-menu-card'} onClick={() => setAnchorEl(null)}>
					<span className={labelClass}>{t('Home')}</span>
					<div className={'product-menu-card-image'}>
						<img src={HOME_IMG} alt="" />
					</div>
				</Link>
				<Link href={'/configurator'} className={'product-menu-card'} onClick={() => setAnchorEl(null)}>
					<span className={labelClass}>{t('Configurator')}</span>
					<div className={'product-menu-card-image'}>
						<img src={CONFIGURATOR_IMG} alt="" />
					</div>
				</Link>
			</Menu>
		</Box>
	);
};

export default HomeNavDropdown;
