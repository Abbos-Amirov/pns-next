import React, { useMemo } from 'react';
import { Dialog, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'next-i18next';
import type { AboutOfficeDef } from '../../data/aboutOffices';

function buildGoogleMapsEmbedSrc(mapSearchUrl: string): string {
	try {
		const u = new URL(mapSearchUrl);
		const q = u.searchParams.get('query');
		if (q) {
			return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&hl=ko&z=16&output=embed`;
		}
	} catch {
		/* ignore */
	}
	return mapSearchUrl;
}

type Props = {
	open: boolean;
	onClose: () => void;
	office: AboutOfficeDef | null;
};

const AboutOfficeMapModal = ({ open, onClose, office }: Props) => {
	const { t } = useTranslation('common');

	const embedSrc = useMemo(() => {
		if (!office) return '';
		return buildGoogleMapsEmbedSrc(t(office.mapUrlKey));
	}, [office, t]);

	const externalMapUrl = office ? t(office.mapUrlKey) : '';

	if (!office) {
		return null;
	}

	const title = t(office.titleKey);

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			className="about-office-map-dialog"
			PaperProps={{
				className: 'about-office-map-dialog-paper',
				elevation: 8,
			}}
		>
			<div className="about-office-map-dialog-head">
				<h2 className="about-office-map-dialog-title">{title}</h2>
				<IconButton
					type="button"
					onClick={onClose}
					aria-label="Close"
					className="about-office-map-dialog-close"
					size="small"
				>
					<CloseIcon />
				</IconButton>
			</div>
			<div className="about-office-map-dialog-frame">
				{embedSrc ? (
					<iframe
						title={title}
						src={embedSrc}
						className="about-office-map-dialog-iframe"
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
						allowFullScreen
					/>
				) : null}
			</div>
			<div className="about-office-map-dialog-footer">
				<p className="about-office-map-dialog-line">
					<span className="about-office-map-dialog-bullet" aria-hidden />
					<span>
						{t('AboutMapLabelAddress')} : {t(office.addressKey)}
					</span>
				</p>
				<p className="about-office-map-dialog-line">
					<span className="about-office-map-dialog-bullet" aria-hidden />
					<span>
						{t('AboutMapLabelPhoneFax')} : {t(office.telKey)}
					</span>
				</p>
				<a
					href={externalMapUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="about-office-map-dialog-external"
				>
					{t('AboutMapOpenInMaps')}
				</a>
			</div>
		</Dialog>
	);
};

export default AboutOfficeMapModal;
