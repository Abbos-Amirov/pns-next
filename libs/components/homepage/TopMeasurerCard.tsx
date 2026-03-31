import React, { useMemo } from 'react';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Member } from '../../types/member/member';
import { useTranslation } from 'next-i18next';

interface TopMeasurerProps {
	measurer: Member;
}

const truncate = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1).trim()}…` : s);

const TopMeasurerCard = (props: TopMeasurerProps) => {
	const { measurer } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	const measurerImage = measurer?.memberImage
		? `${process.env.REACT_APP_API_URL}/${measurer?.memberImage}`
		: '/img/profile/defaultUser.svg';

	/** Tajriba: avvalo API dagi memberExperience, keyin memberDesc, so‘ng default */
	const experienceDisplay = useMemo(() => {
		const exp = measurer.memberExperience?.trim();
		if (exp) return exp;
		const desc = measurer.memberDesc?.trim();
		if (desc) return desc;
		return t('MeasurerDescDefault');
	}, [measurer.memberExperience, measurer.memberDesc, t]);

	/** O‘qigan joy: faqat memberEducation; bo‘sh bo‘lsa placeholder */
	const educationDisplay = useMemo(() => {
		const edu = measurer.memberEducation?.trim();
		if (edu) return edu;
		return t('MeasurerEducationPlaceholder');
	}, [measurer.memberEducation, t]);

	const mobileExp = truncate(experienceDisplay, 100);
	const mobileEdu = truncate(educationDisplay, 100);

	if (device === 'mobile') {
		return (
			<Stack className="top-agent-card top-agent-card--mobile">
				<div className="top-agent-card-visual">
					<div className="top-agent-card-frame">
						<img className="top-agent-card-img" src={measurerImage} alt="" />
					</div>
				</div>
				<strong>{measurer?.memberNick}</strong>
				<span>{measurer?.memberType}</span>
				<div className="top-agent-card-excerpt-wrap">
					<p className="top-agent-card-excerpt top-agent-card-excerpt--labeled">
						<span className="top-agent-card-excerpt-label">{t('Experience')}</span>
						{mobileExp}
					</p>
					<p className="top-agent-card-excerpt top-agent-card-excerpt--labeled top-agent-card-excerpt--education">
						<span className="top-agent-card-excerpt-label">{t('Education')}</span>
						{mobileEdu}
					</p>
				</div>
			</Stack>
		);
	}

	return (
		<Stack className="top-agent-card top-agent-card--desktop">
			<div className="top-agent-card-visual">
				<div className="top-agent-card-hover" aria-hidden="true">
					<div className="top-agent-card-hover-panel">
						<div className="top-agent-card-hover-block">
							<span className="top-agent-card-hover-label">{t('Experience')}</span>
							<p className="top-agent-card-hover-text">{experienceDisplay}</p>
						</div>
						<div className="top-agent-card-hover-block top-agent-card-hover-block--education">
							<span className="top-agent-card-hover-label">{t('Education')}</span>
							<p className="top-agent-card-hover-text">{educationDisplay}</p>
						</div>
					</div>
					<div className="top-agent-card-hover-arrow" />
				</div>
				<div className="top-agent-card-frame">
					<img className="top-agent-card-img" src={measurerImage} alt="" />
				</div>
			</div>
			<strong>{measurer?.memberNick}</strong>
			<span>{measurer?.memberType}</span>
		</Stack>
	);
};

export default TopMeasurerCard;
