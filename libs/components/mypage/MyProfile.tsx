import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Box, Button, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { REACT_APP_API_URL, REACT_APP_API_GRAPHQL_URL } from '../../config';
import { getJwtToken, setJwtToken, updateUserInfo } from '../../auth';
import { useReactiveVar, useMutation, useLazyQuery } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { GET_MEMBER } from '../../../apollo/user/query';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../sweetAlert';

const MyProfile: NextPage = ({ initialValues, ...props }: any) => {
	const { t } = useTranslation('common');
	const device = useDeviceDetect();
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);

	/** APOLLO REQUESTS **/
	const [updateMemberMutation, { loading: updating }] = useMutation(UPDATE_MEMBER);
	const [getMemberQuery] = useLazyQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (user._id) {
			setUpdateData({
				_id: user._id,
				memberNick: user.memberNick || '',
				memberPhone: user.memberPhone || '',
				memberAddress: user.memberAddress || '',
				memberImage: user.memberImage || '',
				memberDesc: user.memberDesc || '',
				memberExperience: user.memberExperience || '',
				memberEducation: user.memberEducation || '',
			});
		}
	}, [user]);

	/** HANDLERS **/
	const uploadImage = async (e: any) => {
		try {
			const image = e.target.files[0];
			console.log('+image:', image);

			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target) 
				  }`,
					variables: {
						file: null,
						target: 'member',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			const response = await axios.post(`${REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader;
			console.log('+responseImage: ', responseImage);
			
			// Update updateData state
			setUpdateData((prev) => ({
				...prev,
				memberImage: responseImage,
			}));

			// Update userVar immediately when image is uploaded
			userVar({
				...user,
				memberImage: responseImage,
			});

			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (err) {
			console.log('Error, uploadImage:', err);
		}
	};

	const updatePropertyHandler = useCallback(async () => {
		try {
			if (!user._id) {
				await sweetErrorHandling(new Error('User not found'));
				return;
			}

			console.log('Updating profile with data:', {
				_id: user._id,
				memberNick: updateData.memberNick,
				memberPhone: updateData.memberPhone,
				memberAddress: updateData.memberAddress,
				memberImage: updateData.memberImage,
				memberDesc: updateData.memberDesc,
			});

			const result = await updateMemberMutation({
				variables: {
					input: {
						_id: user._id,
						memberNick: updateData.memberNick?.trim() || '',
						memberPhone: updateData.memberPhone?.trim() || '',
				memberAddress: updateData.memberAddress?.trim() || '',
				memberImage: updateData.memberImage || '',
				memberDesc: updateData.memberDesc?.trim() || '',
				memberExperience: updateData.memberExperience?.trim() || '',
				memberEducation: updateData.memberEducation?.trim() || '',
					},
				},
			});

			console.log('Update result:', result);

			if (result.data?.updateMember) {
				const updatedMember = result.data.updateMember;
				
				// Update JWT token if new accessToken is provided
				if (updatedMember.accessToken) {
					setJwtToken(updatedMember.accessToken);
					// Update userVar from new JWT token to ensure consistency
					updateUserInfo(updatedMember.accessToken);
				} else {
					// If no new token, fetch fresh member data to get updated JWT token
					try {
						const memberResult = await getMemberQuery({
							variables: {
								input: user._id,
							},
						});

						if (memberResult.data?.getMember?.accessToken) {
							setJwtToken(memberResult.data.getMember.accessToken);
							updateUserInfo(memberResult.data.getMember.accessToken);
						} else {
							// Fallback: Update userVar directly if no new token
							userVar({
								_id: updatedMember._id || user._id,
								memberType: updatedMember.memberType || user.memberType,
								memberStatus: updatedMember.memberStatus || user.memberStatus,
								memberAuthType: updatedMember.memberAuthType || user.memberAuthType,
								memberPhone: updatedMember.memberPhone || user.memberPhone,
								memberNick: updatedMember.memberNick || user.memberNick,
								memberFullName: updatedMember.memberFullName || user.memberFullName,
								memberImage: updatedMember.memberImage || user.memberImage,
								memberAddress: updatedMember.memberAddress || user.memberAddress,
								memberDesc: updatedMember.memberDesc || user.memberDesc,
								memberExperience: updatedMember.memberExperience ?? user.memberExperience,
								memberEducation: updatedMember.memberEducation ?? user.memberEducation,
								memberProducts: updatedMember.memberProducts || user.memberProducts || 0,
								memberRank: updatedMember.memberRank || user.memberRank || 0,
								memberArticles: updatedMember.memberArticles || user.memberArticles || 0,
								memberPoints: updatedMember.memberPoints || user.memberPoints || 0,
								memberLikes: updatedMember.memberLikes || user.memberLikes || 0,
								memberViews: updatedMember.memberViews || user.memberViews || 0,
								memberWarnings: updatedMember.memberWarnings || user.memberWarnings || 0,
								memberBlocks: updatedMember.memberBlocks || user.memberBlocks || 0,
							});
						}
					} catch (fetchErr) {
						console.error('Error fetching updated member:', fetchErr);
						// Fallback: Update userVar directly
						userVar({
							_id: updatedMember._id || user._id,
							memberType: updatedMember.memberType || user.memberType,
							memberStatus: updatedMember.memberStatus || user.memberStatus,
							memberAuthType: updatedMember.memberAuthType || user.memberAuthType,
							memberPhone: updatedMember.memberPhone || user.memberPhone,
							memberNick: updatedMember.memberNick || user.memberNick,
							memberFullName: updatedMember.memberFullName || user.memberFullName,
							memberImage: updatedMember.memberImage || user.memberImage,
							memberAddress: updatedMember.memberAddress || user.memberAddress,
							memberDesc: updatedMember.memberDesc || user.memberDesc,
							memberExperience: updatedMember.memberExperience ?? user.memberExperience,
							memberEducation: updatedMember.memberEducation ?? user.memberEducation,
							memberProducts: updatedMember.memberProducts || user.memberProducts || 0,
							memberRank: updatedMember.memberRank || user.memberRank || 0,
							memberArticles: updatedMember.memberArticles || user.memberArticles || 0,
							memberPoints: updatedMember.memberPoints || user.memberPoints || 0,
							memberLikes: updatedMember.memberLikes || user.memberLikes || 0,
							memberViews: updatedMember.memberViews || user.memberViews || 0,
							memberWarnings: updatedMember.memberWarnings || user.memberWarnings || 0,
							memberBlocks: updatedMember.memberBlocks || user.memberBlocks || 0,
						});
					}
				}

				await sweetTopSuccessAlert('Profile updated successfully!', 700);
			}
		} catch (err: any) {
			console.error('Update Profile Error:', err);
			await sweetErrorHandling(err);
		}
	}, [updateData, user, updateMemberMutation]);

	const doDisabledCheck = () => {
		// Only disable if user is not loaded or updating
		if (!user._id || updating) {
			return true;
		}
		
		// Check if required fields are filled
		const isDisabled = !updateData.memberNick?.trim() ||
			!updateData.memberPhone?.trim() ||
			!updateData.memberAddress?.trim();
		
		console.log('doDisabledCheck:', {
			userId: user._id,
			memberNick: updateData.memberNick,
			memberPhone: updateData.memberPhone,
			memberAddress: updateData.memberAddress,
			isDisabled,
			updating,
		});
		
		return isDisabled;
	};

	console.log('+updateData', updateData);
	console.log('+user', user);

	if (device === 'mobile') {
		return (
			<Stack className={'mobile-myprofile-page'}>
				<Stack className={'mobile-myprofile-photo-box'}>
					<Box component={'div'} className={'mobile-myprofile-avatar'}>
						<img
							src={
								updateData?.memberImage
									? `${REACT_APP_API_URL}/${updateData?.memberImage}`
									: `/img/profile/defaultUser.svg`
							}
							alt=""
						/>
					</Box>
					<input
						type="file"
						hidden
						id="mobile-hidden-input"
						onChange={uploadImage}
						accept="image/jpg, image/jpeg, image/png"
					/>
					<label htmlFor="mobile-hidden-input" className={'mobile-myprofile-upload-label'}>
						{t('UploadProfileImage')}
					</label>
					<Typography className={'mobile-myprofile-upload-hint'}>{t('PhotoFormatHint')}</Typography>
				</Stack>

				<Stack className={'mobile-myprofile-form'}>
					<Stack className={'mobile-field'}>
						<Typography className={'mobile-field-label'}>{t('Username')}</Typography>
						<input
							type="text"
							placeholder={t('PlaceholderUsername')}
							value={updateData.memberNick}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberNick: value })}
						/>
					</Stack>
					<Stack className={'mobile-field'}>
						<Typography className={'mobile-field-label'}>{t('Phone')}</Typography>
						<input
							type="text"
							placeholder={t('PlaceholderPhone')}
							value={updateData.memberPhone}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberPhone: value })}
						/>
					</Stack>
					<Stack className={'mobile-field'}>
						<Typography className={'mobile-field-label'}>{t('Address')}</Typography>
						<input
							type="text"
							placeholder={t('PlaceholderAddress')}
							value={updateData.memberAddress}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberAddress: value })}
						/>
					</Stack>
					<Stack className={'mobile-field'}>
						<Typography className={'mobile-field-label'}>{t('MemberDescription')}</Typography>
						<textarea
							className={'mobile-textarea'}
							placeholder={t('PlaceholderMemberDescription')}
							value={updateData.memberDesc || ''}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberDesc: value })}
							rows={4}
							maxLength={2000}
						/>
					</Stack>
					<Stack className={'mobile-field'}>
						<Typography className={'mobile-field-label'}>{t('Experience')}</Typography>
						<input
							type="text"
							placeholder={t('PlaceholderExperience')}
							value={updateData.memberExperience || ''}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberExperience: value })}
						/>
					</Stack>
					<Stack className={'mobile-field'}>
						<Typography className={'mobile-field-label'}>{t('Education')}</Typography>
						<input
							type="text"
							placeholder={t('PlaceholderEducation')}
							value={updateData.memberEducation || ''}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberEducation: value })}
						/>
					</Stack>
				</Stack>

				<Stack className={'mobile-myprofile-actions'}>
					<Button
						className={'mobile-btn-primary mobile-myprofile-submit'}
						disabled={doDisabledCheck()}
						onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.preventDefault();
							updatePropertyHandler();
						}}
					>
						{updating ? t('Updating') : t('UpdateProfile')}
					</Button>
				</Stack>
			</Stack>
		);
	} else
		return (
			<div id="my-profile-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">{t('MyProfile')}</Typography>
						<Typography className="sub-title">{t('MyProfileSubtitle')}</Typography>
					</Stack>
				</Stack>
				<Stack className="top-box">
					<Stack className="photo-box">
						<Typography className="title">{t('Photo')}</Typography>
						<Stack className="image-big-box">
							<Stack className="image-box">
								<img
									src={
										updateData?.memberImage
											? `${REACT_APP_API_URL}/${updateData?.memberImage}`
											: `/img/profile/defaultUser.svg`
									}
									alt=""
								/>
							</Stack>
							<Stack className="upload-big-box">
								<input
									type="file"
									hidden
									id="hidden-input"
									onChange={uploadImage}
									accept="image/jpg, image/jpeg, image/png"
								/>
								<label htmlFor="hidden-input" className="labeler">
									<Typography>{t('UploadProfileImage')}</Typography>
								</label>
								<Typography className="upload-text">{t('PhotoFormatHint')}</Typography>
							</Stack>
						</Stack>
					</Stack>
					<Stack className="small-input-box">
						<Stack className="input-box">
							<Typography className="title">{t('Username')}</Typography>
							<input
								type="text"
								placeholder={t('PlaceholderUsername')}
								value={updateData.memberNick}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberNick: value })}
							/>
						</Stack>
						<Stack className="input-box">
							<Typography className="title">{t('Phone')}</Typography>
							<input
								type="text"
								placeholder={t('PlaceholderPhone')}
								value={updateData.memberPhone}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberPhone: value })}
							/>
						</Stack>
					</Stack>
					<Stack className="address-box">
						<Typography className="title">{t('Address')}</Typography>
						<input
							type="text"
							placeholder={t('PlaceholderAddress')}
							value={updateData.memberAddress}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberAddress: value })}
						/>
					</Stack>
					<Stack className="member-desc-box">
						<Typography className="title">{t('MemberDescription')}</Typography>
						<textarea
							className="member-desc-textarea"
							placeholder={t('PlaceholderMemberDescription')}
							value={updateData.memberDesc || ''}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberDesc: value })}
							rows={5}
							spellCheck={true}
							maxLength={2000}
							aria-label={t('MemberDescription')}
						/>
					</Stack>
					<Stack className="small-input-box">
						<Stack className="input-box">
							<Typography className="title">{t('Experience')}</Typography>
							<input
								type="text"
								placeholder={t('PlaceholderExperience')}
								value={updateData.memberExperience || ''}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberExperience: value })}
							/>
						</Stack>
						<Stack className="input-box">
							<Typography className="title">{t('Education')}</Typography>
							<input
								type="text"
								placeholder={t('PlaceholderEducation')}
								value={updateData.memberEducation || ''}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberEducation: value })}
							/>
						</Stack>
					</Stack>
					<Stack className="about-me-box">
						<Button 
							className="update-button" 
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.preventDefault();
								e.stopPropagation();
								console.log('Button clicked!', { updateData, user });
								updatePropertyHandler();
							}} 
							disabled={doDisabledCheck()}
							sx={{ 
								cursor: doDisabledCheck() ? 'not-allowed' : 'pointer',
								opacity: doDisabledCheck() ? 0.6 : 1,
							}}
						>
							<Typography>{updating ? t('Updating') : t('UpdateProfile')}</Typography>
							<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
								<g clipPath="url(#clip0_7065_6985)">
									<path
										d="M12.6389 0H4.69446C4.49486 0 4.33334 0.161518 4.33334 0.361122C4.33334 0.560727 4.49486 0.722245 4.69446 0.722245H11.7672L0.105803 12.3836C-0.0352676 12.5247 -0.0352676 12.7532 0.105803 12.8942C0.176321 12.9647 0.268743 13 0.361131 13C0.453519 13 0.545907 12.9647 0.616459 12.8942L12.2778 1.23287V8.30558C12.2778 8.50518 12.4393 8.6667 12.6389 8.6667C12.8385 8.6667 13 8.50518 13 8.30558V0.361122C13 0.161518 12.8385 0 12.6389 0Z"
										fill="white"
									/>
								</g>
								<defs>
									<clipPath id="clip0_7065_6985">
										<rect width="13" height="13" fill="white" />
									</clipPath>
								</defs>
							</svg>
						</Button>
					</Stack>
				</Stack>
			</div>
		);
};

MyProfile.defaultProps = {
	initialValues: {
		_id: '',
		memberImage: '',
		memberNick: '',
		memberPhone: '',
		memberAddress: '',
		memberDesc: '',
		memberExperience: '',
		memberEducation: '',
	},
};

export default MyProfile;
