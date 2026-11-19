import React, { useCallback, useState, useEffect } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Stack, TextField, InputAdornment, IconButton, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn, signUp, getJwtToken } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { MemberType } from '../../libs/enums/member.enum';
import decodeJWT from 'jwt-decode';
import { CustomJwtPayload } from '../../libs/types/customJwtPayload';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { GoogleIconSvg, KakaoIconSvg } from '../../libs/components/auth/SocialAuthIcons';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Join: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: MemberType.USER });
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	
	// URL dan mode parametrini olish (login yoki signup)
	const mode = router.query.mode as string;
	const [loginView, setLoginView] = useState<boolean>(true);
	
	// URL o'zgarganda view ni yangilash
	useEffect(() => {
		if (mode === 'signup') {
			setLoginView(false);
		} else if (mode === 'login') {
			setLoginView(true);
		}
	}, [mode, router.query]);

	/** HANDLERS **/
	const viewChangeHandler = (state: boolean) => {
		setLoginView(state);
	};

	const checkUserTypeHandler = (e: any) => {
		const checked = e.target.checked;
		if (checked) {
			const value = e.target.name;
			// Backend MemberType enum: USER | MEASURER | INSTALLER | ADMIN (AGENT does not exist)
			if (value === MemberType.MEASURER) handleInput('type', MemberType.MEASURER);
			else if (value === MemberType.INSTALLER) handleInput('type', MemberType.INSTALLER);
			else handleInput('type', MemberType.USER);
		} else {
			handleInput('type', MemberType.USER);
		}
	};

	const handleInput = useCallback((name: any, value: any) => {
		setInput((prev) => {
			return { ...prev, [name]: value };
		});
	}, []);

	const doLogin = useCallback(async () => {
		try {
			if (!input.nick || !input.password) {
				await sweetMixinErrorAlert(t('JoinFillRequiredFields'));
				return;
			}
			setIsLoading(true);
			await logIn(input.nick, input.password);
			setIsLoading(false);
			
			// Admin tekshiruvi - JWT tokenni decode qilib memberType ni olish
			const jwtToken = getJwtToken();
			if (jwtToken) {
				try {
					const claims = decodeJWT<CustomJwtPayload>(jwtToken);
					if (claims?.memberType === MemberType.ADMIN) {
						// ADMIN bo'lsa, admin sahifasiga yo'naltirish
						await router.push('/_admin');
						return;
					}
				} catch (err) {
					console.error('JWT decode error:', err);
				}
			}
			
			// Muvaffaqiyatli login bo'lgandan keyin home page ga yo'naltirish
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			setIsLoading(false);
			// Xato xabari allaqachon libs/auth/index.ts da ko'rsatilgan
			// Bu yerda faqat console ga yozamiz
			console.error('Login error:', err);
		}
	}, [input, router, t]);

	const doSignUp = useCallback(async () => {
		try {
			if (!input.nick || !input.password || !input.phone || !input.type) {
				await sweetMixinErrorAlert(t('JoinFillRequiredFields'));
				return;
			}
			setIsLoading(true);
			await signUp(input.nick, input.password, input.phone, input.type);
			setIsLoading(false);
			
			// Admin tekshiruvi - JWT tokenni decode qilib memberType ni olish
			const jwtToken = getJwtToken();
			if (jwtToken) {
				try {
					const claims = decodeJWT<CustomJwtPayload>(jwtToken);
					if (claims?.memberType === MemberType.ADMIN) {
						// ADMIN bo'lsa, admin sahifasiga yo'naltirish
						await router.push('/_admin');
						return;
					}
				} catch (err) {
					console.error('JWT decode error:', err);
				}
			}
			
			// Muvaffaqiyatli signup bo'lgandan keyin home page ga yo'naltirish
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			setIsLoading(false);
			// Xato xabari allaqachon libs/auth/index.ts da ko'rsatilgan
			// Bu yerda faqat console ga yozamiz
			console.error('Signup error:', err);
		}
	}, [input, router, t]);

	if (device === 'mobile') {
		return (
			<Stack className={'mobile-join-page'}>
				<Stack className={'mobile-join-card'}>
					<Stack className={'mobile-join-logo-section'}>
						<Typography className={'mobile-join-brand-name'}>PNS DEV</Typography>
						<Typography className={'mobile-join-tagline'}>{t('JoinBrandTagline')}</Typography>
					</Stack>

					<Stack className={'mobile-join-toggle'} direction={'row'}>
						<Button
							disableRipple
							className={`mobile-join-toggle-btn ${!loginView ? 'active' : ''}`}
							onClick={() => viewChangeHandler(false)}
						>
							{t('JoinSignUp')}
						</Button>
						<Button
							disableRipple
							className={`mobile-join-toggle-btn ${loginView ? 'active' : ''}`}
							onClick={() => viewChangeHandler(true)}
						>
							{t('JoinLogIn')}
						</Button>
					</Stack>

					<Typography className={'mobile-join-heading'}>
						{loginView ? t('JoinJourneyBegins') : t('JoinStartYourJourney')}
					</Typography>

					<Typography className={'mobile-join-social-text'}>{t('JoinLogInWithOpen')}</Typography>
					<Stack className={'mobile-join-social'} direction={'row'}>
						<Button
							className={'mobile-join-social-btn google'}
							onClick={() => (window.location.href = '/api/auth/google')}
							startIcon={<GoogleIconSvg size={18} />}
						>
							Google
						</Button>
						<Button
							className={'mobile-join-social-btn kakao'}
							onClick={() => (window.location.href = '/api/auth/kakao')}
							startIcon={<KakaoIconSvg size={18} />}
						>
							KakaoTalk
						</Button>
					</Stack>
					<Stack className={'mobile-join-divider'} direction={'row'} alignItems={'center'}>
						<span />
						<Typography>{t('JoinOr')}</Typography>
						<span />
					</Stack>

					<Stack className={'mobile-join-fields'}>
						<TextField
							fullWidth
							label={t('Username')}
							value={input.nick}
							onChange={(e) => handleInput('nick', e.target.value)}
							placeholder={loginView ? t('JoinPlaceholderUsernameLogin') : t('JoinPlaceholderUsername')}
							className={'mobile-join-input'}
							onKeyDown={(event) => {
								if (event.key == 'Enter' && loginView) doLogin();
								if (event.key == 'Enter' && !loginView) doSignUp();
							}}
						/>

						{!loginView && (
							<TextField
								fullWidth
								label={t('Phone')}
								value={input.phone}
								onChange={(e) => handleInput('phone', e.target.value)}
								placeholder={t('JoinPlaceholderPhone')}
								className={'mobile-join-input'}
								onKeyDown={(event) => {
									if (event.key == 'Enter') doSignUp();
								}}
							/>
						)}

						<TextField
							fullWidth
							type={showPassword ? 'text' : 'password'}
							label={t('Password')}
							value={input.password}
							onChange={(e) => handleInput('password', e.target.value)}
							placeholder={t('JoinPlaceholderPassword')}
							className={'mobile-join-input'}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
											{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
										</IconButton>
									</InputAdornment>
								),
							}}
							onKeyDown={(event) => {
								if (event.key == 'Enter' && loginView) doLogin();
								if (event.key == 'Enter' && !loginView) doSignUp();
							}}
						/>
					</Stack>

					{loginView && (
						<Stack className={'mobile-join-remember-row'} direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
							<FormControlLabel control={<Checkbox defaultChecked size={'small'} />} label={t('JoinRememberMe')} />
							<Typography component="a" className={'mobile-join-forgot-link'}>
								{t('JoinForgotPassword')}
							</Typography>
						</Stack>
					)}

					{!loginView && (
						<Stack className={'mobile-join-type-selection'}>
							<Typography className={'mobile-join-type-label'}>{t('JoinRegisterAs')}</Typography>
							<Stack className={'mobile-join-type-checkboxes'} direction={'row'}>
								<FormControlLabel
									control={
										<Checkbox
											name={MemberType.USER}
											onChange={checkUserTypeHandler}
											checked={input?.type == MemberType.USER}
											size={'small'}
										/>
									}
									label={t('User')}
								/>
								<FormControlLabel
									control={
										<Checkbox
											name={MemberType.MEASURER}
											onChange={checkUserTypeHandler}
											checked={input?.type == MemberType.MEASURER}
											size={'small'}
										/>
									}
									label={t('JoinMeasurer')}
								/>
								<FormControlLabel
									control={
										<Checkbox
											name={MemberType.INSTALLER}
											onChange={checkUserTypeHandler}
											checked={input?.type == MemberType.INSTALLER}
											size={'small'}
										/>
									}
									label={t('JoinInstaller')}
								/>
							</Stack>
						</Stack>
					)}

					<Button
						className={'mobile-btn-primary mobile-join-submit'}
						disabled={
							isLoading ||
							(loginView
								? input.nick == '' || input.password == ''
								: input.nick == '' || input.password == '' || input.phone == '')
						}
						onClick={loginView ? doLogin : doSignUp}
					>
						{isLoading ? t('JoinLoading') : loginView ? t('JoinLogIn') : t('JoinSignUp')}
					</Button>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'join-page'}>
				<Stack className={'container'}>
					<Stack className={'main'}>
						{/* Left Section - Form */}
						<Stack className={'left'}>
							{/* Logo and Tagline */}
							<div className={'logo-section'}>
								<Typography className={'brand-name'}>PNS DEV</Typography>
								<Typography className={'tagline'}>{t('JoinBrandTagline')}</Typography>
							</div>

							{/* Toggle Buttons */}
							<div className={'toggle-buttons'}>
								<Button
									className={`toggle-btn ${!loginView ? 'active' : ''}`}
									onClick={() => viewChangeHandler(false)}
								>
									{t('JoinSignUp')}
								</Button>
								<Button
									className={`toggle-btn ${loginView ? 'active' : ''}`}
									onClick={() => viewChangeHandler(true)}
								>
									{t('JoinLogIn')}
								</Button>
							</div>

							{/* Heading */}
							<Typography className={'section-heading'}>
								{loginView ? t('JoinJourneyBegins') : t('JoinStartYourJourney')}
							</Typography>

							{/* Social Login - Google & KakaoTalk */}
							<>
								<Typography className={'social-text'}>{t('JoinLogInWithOpen')}</Typography>
								<div className={'social-buttons'}>
									<Button className={'social-btn social-btn-google'} onClick={() => window.location.href = '/api/auth/google'} startIcon={<GoogleIconSvg size={20} />}>
										Google
									</Button>
									<Button className={'social-btn social-btn-kakao'} onClick={() => window.location.href = '/api/auth/kakao'} startIcon={<KakaoIconSvg size={20} />}>
										KakaoTalk
									</Button>
								</div>
								<Typography className={'or-separator'}>{t('JoinOr')}</Typography>
							</>

							{/* Input Fields */}
							<div className={'input-wrap'}>
								<TextField
									fullWidth
									label={t('Username')}
									value={input.nick}
									onChange={(e) => handleInput('nick', e.target.value)}
									placeholder={loginView ? t('JoinPlaceholderUsernameLogin') : t('JoinPlaceholderUsername')}
									className={'input-field'}
									onKeyDown={(event) => {
										if (event.key == 'Enter' && loginView) doLogin();
										if (event.key == 'Enter' && !loginView) doSignUp();
									}}
								/>

								{!loginView && (
									<TextField
										fullWidth
										label={t('Phone')}
										value={input.phone}
										onChange={(e) => handleInput('phone', e.target.value)}
										placeholder={t('JoinPlaceholderPhone')}
										className={'input-field'}
										onKeyDown={(event) => {
											if (event.key == 'Enter') doSignUp();
										}}
									/>
								)}

								<TextField
									fullWidth
									type={showPassword ? 'text' : 'password'}
									label={t('Password')}
									value={input.password}
									onChange={(e) => handleInput('password', e.target.value)}
									placeholder={t('JoinPlaceholderPassword')}
									className={'input-field'}
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												<IconButton
													onClick={() => setShowPassword(!showPassword)}
													edge="end"
												>
													{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
												</IconButton>
											</InputAdornment>
										),
									}}
									onKeyDown={(event) => {
										if (event.key == 'Enter' && loginView) doLogin();
										if (event.key == 'Enter' && !loginView) doSignUp();
									}}
								/>
							</div>

							{/* Remember Me & Forgot Password (Login only) */}
							{loginView && (
								<div className={'remember-forgot'}>
									<FormControlLabel
										control={<Checkbox defaultChecked />}
										label={t('JoinRememberMe')}
									/>
									<Typography component="a" className={'forgot-link'}>
										{t('JoinForgotPassword')}
									</Typography>
								</div>
							)}

							{/* User Type Selection (Signup only) */}
							{!loginView && (
								<div className={'user-type-selection'}>
									<Typography className={'type-label'}>{t('JoinRegisterAs')}</Typography>
									<div className={'type-checkboxes'}>
										<FormControlLabel
											control={
												<Checkbox
													name={MemberType.USER}
													onChange={checkUserTypeHandler}
													checked={input?.type == MemberType.USER}
												/>
											}
											label={t('User')}
										/>
										<FormControlLabel
											control={
												<Checkbox
													name={MemberType.MEASURER}
													onChange={checkUserTypeHandler}
													checked={input?.type == MemberType.MEASURER}
												/>
											}
											label={t('JoinMeasurer')}
										/>
										<FormControlLabel
											control={
												<Checkbox
													name={MemberType.INSTALLER}
													onChange={checkUserTypeHandler}
													checked={input?.type == MemberType.INSTALLER}
												/>
											}
											label={t('JoinInstaller')}
										/>
									</div>
								</div>
							)}

							{/* Submit Button */}
							<Button
								className={'submit-btn'}
								disabled={
									isLoading ||
									(loginView
										? input.nick == '' || input.password == ''
											: input.nick == '' || input.password == '' || input.phone == '')
								}
								onClick={loginView ? doLogin : doSignUp}
							>
								{isLoading ? t('JoinLoading') : loginView ? t('JoinLogIn') : t('JoinSignUp')}
							</Button>
						</Stack>

						{/* Right Section - Promotional Image */}
						<Stack className={'right'}>
							<div className={'promo-image'}>
								<div className={'promo-text-top'}>
									<Typography className={'promo-title'}>
									{t('JoinPromoTitle')}
									</Typography>
									<Typography className={'promo-subtitle'}>
									{t('JoinPromoSubtitle')}
									</Typography>
								</div>
								<div className={'promo-text-bottom'}>
									<Typography className={'promo-main'}>
									{t('JoinPromoMain')}
									</Typography>
									<Typography className={'promo-secondary'}>
										{t('JoinPromoSecondary')}
									</Typography>
								</div>
							</div>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(Join);
