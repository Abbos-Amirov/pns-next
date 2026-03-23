import React, { useCallback, useState, useEffect } from 'react';
import { Button, Stack, IconButton, Modal, FormControlLabel, Checkbox, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn, signUp, getJwtToken } from '../../auth';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { useTranslation } from 'next-i18next';
import { MemberType } from '../../enums/member.enum';
import decodeJWT from 'jwt-decode';
import { CustomJwtPayload } from '../../types/customJwtPayload';
import { GoogleIconSvg, KakaoIconSvg, NaverIconSvg } from './SocialAuthIcons';

interface AuthModalProps {
	open: boolean;
	onClose: () => void;
	type: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, type }) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const { openAuthModal } = useAuth();
	const { mode } = useThemeMode();
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: MemberType.USER });
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [loginView, setLoginView] = useState(type === 'login');

	useEffect(() => {
		setLoginView(type === 'login');
	}, [type]);

	const handleInput = useCallback((name: string, value: string | MemberType) => {
		setInput((prev) => ({ ...prev, [name]: value }));
	}, []);

	const checkUserTypeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		const checked = e.target.checked;
		if (checked) {
			const value = e.target.name as MemberType;
			if (value === MemberType.MEASURER) handleInput('type', MemberType.MEASURER);
			else if (value === MemberType.INSTALLER) handleInput('type', MemberType.INSTALLER);
			else handleInput('type', MemberType.USER);
		} else {
			handleInput('type', MemberType.USER);
		}
	};

	const doLogin = useCallback(async () => {
		try {
			if (!input.nick || !input.password) {
				await sweetMixinErrorAlert(t('JoinFillRequiredFields'));
				return;
			}
			setIsLoading(true);
			await logIn(input.nick, input.password);
			setIsLoading(false);
			const jwtToken = getJwtToken();
			if (jwtToken) {
				try {
					const claims = decodeJWT<CustomJwtPayload>(jwtToken);
					if (claims?.memberType === MemberType.ADMIN) {
						onClose();
						await router.push('/_admin');
						return;
					}
				} catch {
					// ignore
				}
			}
			onClose();
			setInput({ nick: '', password: '', phone: '', type: MemberType.USER });
			router.reload();
		} catch (err: any) {
			setIsLoading(false);
			console.error('Login error:', err);
		}
	}, [input, router, onClose, t]);

	const doSignUp = useCallback(async () => {
		try {
			if (!input.nick || !input.password || !input.phone || !input.type) {
				await sweetMixinErrorAlert(t('JoinFillRequiredFields'));
				return;
			}
			setIsLoading(true);
			await signUp(input.nick, input.password, input.phone, input.type);
			setIsLoading(false);
			const jwtToken = getJwtToken();
			if (jwtToken) {
				try {
					const claims = decodeJWT<CustomJwtPayload>(jwtToken);
					if (claims?.memberType === MemberType.ADMIN) {
						onClose();
						await router.push('/_admin');
						return;
					}
				} catch {
					// ignore
				}
			}
			onClose();
			setInput({ nick: '', password: '', phone: '', type: MemberType.USER });
			router.reload();
		} catch (err: any) {
			setIsLoading(false);
			console.error('Signup error:', err);
		}
	}, [input, router, onClose, t]);

	const handleClose = () => {
		setInput({ nick: '', password: '', phone: '', type: MemberType.USER });
		setShowPassword(false);
		onClose();
	};

	const handleGoogleLogin = () => {
		const from = loginView ? 'login' : 'signup';
		window.location.href = `/api/auth/google?from=${from}`;
	};

	const handleKakaoLogin = () => {
		const redirectUri = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin + '/') : '';
		window.location.href = `/api/auth/kakao${redirectUri ? `?redirect_uri=${redirectUri}` : ''}`;
	};

	const handleNaverLogin = () => {
		const redirectUri = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin + '/') : '';
		window.location.href = `/api/auth/naver${redirectUri ? `?redirect_uri=${redirectUri}` : ''}`;
	};

	return (
		<Modal
			open={open}
			onClose={handleClose}
			className={`auth-modal auth-modal-${mode}`}
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				'& .MuiBackdrop-root': {
					backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.6)',
					backdropFilter: 'blur(8px)',
				},
			}}
		>
			<Stack className={`auth-modal-content auth-modal-compact`} data-theme={mode}>
				<IconButton className={'close-button'} onClick={handleClose} size="small">
					<CloseIcon />
				</IconButton>

				<div className={'auth-modal-form'}>
					<div className={'auth-modal-header'}>
						<img src={'/img/logo/pns-arched-door.svg'} alt="PNS" className={'auth-modal-logo'} />
						<Typography className={'auth-modal-title'}>PNS Window</Typography>
					</div>

					<div className={'toggle-buttons'}>
						<Button
							className={`toggle-btn ${!loginView ? 'active' : ''}`}
							onClick={() => setLoginView(false)}
							sx={{ textTransform: 'none' }}
						>
							{t('JoinSignUp')}
						</Button>
						<Button
							className={`toggle-btn ${loginView ? 'active' : ''}`}
							onClick={() => setLoginView(true)}
							sx={{ textTransform: 'none' }}
						>
							{t('JoinLogIn')}
						</Button>
					</div>

					<Typography className={'auth-modal-heading'}>
						{loginView ? t('JoinJourneyBegins') : t('JoinStartYourJourney')}
					</Typography>

					<div className={'input-wrap'}>
						<div className={'input-box'}>
							<input
								type="text"
								placeholder={loginView ? t('JoinPlaceholderUsernameLogin') : t('JoinPlaceholderUsername')}
								value={input.nick}
								onChange={(e) => handleInput('nick', e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' && loginView) doLogin();
									if (e.key === 'Enter' && !loginView) doSignUp();
								}}
							/>
						</div>
						{!loginView && (
							<div className={'input-box'}>
								<input
									type="text"
									placeholder={t('JoinPlaceholderPhone')}
									value={input.phone}
									onChange={(e) => handleInput('phone', e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && doSignUp()}
								/>
							</div>
						)}
						<div className={'input-box'}>
							<input
								type={showPassword ? 'text' : 'password'}
								placeholder={t('JoinPlaceholderPassword')}
								value={input.password}
								onChange={(e) => handleInput('password', e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' && loginView) doLogin();
									if (e.key === 'Enter' && !loginView) doSignUp();
								}}
							/>
							<IconButton onClick={() => setShowPassword(!showPassword)} className={'password-toggle'} size="small">
								{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
							</IconButton>
						</div>
					</div>

					{loginView && (
						<div className={'remember-forgot'}>
							<FormControlLabel
								control={<Checkbox defaultChecked size="small" />}
								label={t('JoinRememberMe')}
								sx={{ '& .MuiTypography-root': { fontSize: 13 } }}
							/>
							<Typography component="a" className={'forgot-link'} sx={{ fontSize: 13 }}>
								{t('JoinForgotPassword')}
							</Typography>
						</div>
					)}

					{!loginView && (
						<div className={'user-type-selection'}>
							<Typography className={'type-label'} sx={{ fontSize: 13 }}>
								{t('JoinRegisterAs')}
							</Typography>
							<div className={'type-checkboxes'}>
								<FormControlLabel
									control={
										<Checkbox
											name={MemberType.USER}
											onChange={checkUserTypeHandler}
											checked={input.type === MemberType.USER}
											size="small"
										/>
									}
									label={t('User')}
									sx={{ '& .MuiTypography-root': { fontSize: 13 } }}
								/>
								<FormControlLabel
									control={
										<Checkbox
											name={MemberType.MEASURER}
											onChange={checkUserTypeHandler}
											checked={input.type === MemberType.MEASURER}
											size="small"
										/>
									}
									label={t('JoinMeasurer')}
									sx={{ '& .MuiTypography-root': { fontSize: 13 } }}
								/>
								<FormControlLabel
									control={
										<Checkbox
											name={MemberType.INSTALLER}
											onChange={checkUserTypeHandler}
											checked={input.type === MemberType.INSTALLER}
											size="small"
										/>
									}
									label={t('JoinInstaller')}
									sx={{ '& .MuiTypography-root': { fontSize: 13 } }}
								/>
							</div>
						</div>
					)}

					{/* Social Login - Google, KakaoTalk, Naver (I want to be registered as pastidan) */}
					<div className={'auth-social-buttons auth-social-bottom'}>
						<Typography className={'social-text'}>{t('JoinLogInWithOpen')}</Typography>
						<div className={'social-buttons'}>
							<Button className={'social-btn social-btn-google'} onClick={handleGoogleLogin} startIcon={<GoogleIconSvg size={20} />}>
								Google
							</Button>
							<Button className={'social-btn social-btn-kakao'} onClick={handleKakaoLogin} startIcon={<KakaoIconSvg size={20} />}>
								KakaoTalk
							</Button>
							<Button className={'social-btn social-btn-naver'} onClick={handleNaverLogin} startIcon={<NaverIconSvg size={20} />}>
								Naver
							</Button>
						</div>
					</div>

					<Button
						className={'submit-btn'}
						disabled={
							isLoading ||
							(loginView
								? !input.nick || !input.password
								: !input.nick || !input.password || !input.phone)
						}
						onClick={loginView ? doLogin : doSignUp}
						sx={{ textTransform: 'none' }}
					>
						{isLoading ? t('JoinLoading') : loginView ? t('JoinLogIn') : t('JoinSignUp')}
					</Button>

					<div className={loginView ? 'signup-link' : 'login-link'}>
						{loginView ? (
							<p>
								{t('JoinNotRegisteredYet')}{' '}
								<span onClick={() => openAuthModal('signup')}>{t('JoinSignUp')}</span>
							</p>
						) : (
							<p>
								{t('JoinAlreadyHaveAccount')}{' '}
								<span onClick={() => openAuthModal('login')}>{t('JoinLogIn')}</span>
							</p>
						)}
					</div>
				</div>
			</Stack>
		</Modal>
	);
};

export default AuthModal;
