import React, { useCallback, useRef } from 'react';
import { IconButton, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTranslation } from 'next-i18next';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

interface ImageUploadAreaProps {
	files: File[];
	onChange: (files: File[]) => void;
	maxFiles?: number;
}

const ImageUploadArea: React.FC<ImageUploadAreaProps> = ({ files, onChange, maxFiles = 4 }) => {
	const { t } = useTranslation('common');
	const inputRef = useRef<HTMLInputElement>(null);

	const handleSelect = useCallback(
		(fileList: FileList | null) => {
			if (!fileList || fileList.length === 0) return;
			const validFiles = Array.from(fileList).filter((f) => ACCEPTED_TYPES.includes(f.type));
			const current = files;
			const remaining = maxFiles - current.length;
			const toAdd = validFiles.slice(0, remaining);
			onChange([...current, ...toAdd]);
		},
		[files, onChange, maxFiles]
	);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			handleSelect(e.dataTransfer.files);
		},
		[handleSelect]
	);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleClick = () => inputRef.current?.click();

	const removeAt = (idx: number) => {
		const next = files.filter((_, i) => i !== idx);
		onChange(next);
	};

	return (
		<div className="our-services-image-upload">
			<div className="our-services-image-upload-grid">
				{files.map((file, idx) => (
					<div key={`${file.name}-${idx}`} className="our-services-image-preview-card">
						<img
							src={URL.createObjectURL(file)}
							alt={`Preview ${idx + 1}`}
							className="our-services-image-preview-img"
						/>
						<div className="our-services-image-preview-overlay">
							<CheckCircleIcon className="our-services-image-success-icon" />
							<span className="our-services-image-success-text">{t('ImageUploadSuccess')}</span>
						</div>
						<IconButton
							className="our-services-image-remove-btn"
							size="small"
							onClick={() => removeAt(idx)}
							aria-label="Remove"
						>
							<CloseIcon fontSize="small" />
						</IconButton>
					</div>
				))}
				{files.length < maxFiles && (
					<div
						className="our-services-image-dropzone"
						onDragOver={handleDragOver}
						onDrop={handleDrop}
						onClick={handleClick}
					>
						<input
							ref={inputRef}
							type="file"
							accept={ACCEPTED_TYPES.join(',')}
							multiple
							onChange={(e) => handleSelect(e.target.files)}
							className="our-services-image-input-hidden"
						/>
						<CloudUploadIcon className="our-services-image-upload-icon" />
						<Typography variant="body2" className="our-services-image-upload-hint">
							{t('ImageUploadHint')}
						</Typography>
						<Typography variant="caption" className="our-services-image-upload-max">
							{t('ImageUploadMax')}
						</Typography>
					</div>
				)}
			</div>
		</div>
	);
};

export default ImageUploadArea;
