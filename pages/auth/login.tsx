import React, { useCallback, useState, useEffect } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, Stack, IconButton, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
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

const Login: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const device = useDeviceDetect();
	const [input, setInput] = useState({ memberNick: '', memberPassword: '' });
	const [showPassword, setShowPassword] = useState(false);

	const handleGoogleLogin = () => {
		window.location.href = '/api/auth/google?from=login';
	};
	const handleKakaoLogin = () => {
		window.location.href = '/api/auth/kakao';
	};

	useEffect(() => {
		if (router.query.error === 'google_no_client_id') {
			sweetMixinErrorAlert(
				".env.local ga REACT_APP_GOOGLE_CLIENT_ID qo'shing (backend .env dagi GOOGLE_CLIENT_ID bilan bir xil). Redirect URI: " +
					(typeof window !== 'undefined' ? `${window.location.origin}/auth/callback/google` : '') +
					" — buni Google Console da ham qo'shing."
			);
			router.replace('/auth/login');
		}
	}, [router.query.error, router]);

	/** HANDLERS **/
	const handleInput = useCallback((name: any, value: any) => {
		setInput((prev) => {
			return { ...prev, [name]: value };
		});
	}, []);

	const handleTogglePassword = () => {
		setShowPassword(!showPassword);
	};

	const doLogin = useCallback(async () => {
		try {
			await logIn(input.memberNick, input.memberPassword);
			await router.push('/');
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input, router]);

	if (device === 'mobile') {
		return (
			<Stack className={'auth-page'}>
				<Stack className={'container'}>
					<Stack className={'auth-form'}>
						<div className={'form-header'}>
							<h1>Login</h1>
							<p>Sign in to your account</p>
						</div>
						<div className={'auth-social-buttons'}>
							<Typography className={'social-text'}>{t('JoinLogInWithOpen')}</Typography>
							<div className={'social-buttons'}>
								<Button className={'social-btn social-btn-google'} onClick={handleGoogleLogin} startIcon={<GoogleIconSvg size={20} />}>
									Google
								</Button>
								<Button className={'social-btn social-btn-kakao'} onClick={handleKakaoLogin} startIcon={<KakaoIconSvg size={20} />}>
									KakaoTalk
								</Button>
							</div>
							<Typography className={'or-separator'}>{t('JoinOr')}</Typography>
						</div>
						<div className={'input-wrap'}>
							<div className={'input-box'}>
								<input
									type="text"
									placeholder={'Full name'}
									value={input.memberNick}
									onChange={(e) => handleInput('memberNick', e.target.value)}
									required={true}
								/>
							</div>
							<div className={'input-box'}>
								<input
									type={showPassword ? 'text' : 'password'}
									placeholder={'Password'}
									value={input.memberPassword}
									onChange={(e) => handleInput('memberPassword', e.target.value)}
									required={true}
								/>
								<IconButton onClick={handleTogglePassword} className={'password-toggle'}>
									{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
								</IconButton>
							</div>
						</div>
						<Button
							className={'submit-btn'}
							disabled={input.memberNick === '' || input.memberPassword === ''}
							onClick={doLogin}
						>
							Login
						</Button>
						<div className={'signup-link'}>
							<p>
								Not registered yet? <span onClick={() => router.push('/auth/signup')}>Sign up</span>
							</p>
						</div>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'auth-page login-page'}>
				<div className={'background-overlay'}></div>
				<Stack className={'container'}>
					<Stack className={'main-content'}>
						<Stack className={'left-section'}>
							<div className={'form-container'}>
								<div className={'form-header'}>
									<h1>Start your perfect trip</h1>
								</div>
								<div className={'auth-social-buttons'}>
									<Typography className={'social-text'}>{t('JoinLogInWithOpen')}</Typography>
									<div className={'social-buttons'}>
										<Button className={'social-btn social-btn-google'} onClick={handleGoogleLogin} startIcon={<GoogleIconSvg size={20} />}>
											Google
										</Button>
										<Button className={'social-btn social-btn-kakao'} onClick={handleKakaoLogin} startIcon={<KakaoIconSvg size={20} />}>
											KakaoTalk
										</Button>
									</div>
									<Typography className={'or-separator'}>{t('JoinOr')}</Typography>
								</div>
								<div className={'input-wrap'}>
									<div className={'input-box'}>
										<input
											type="text"
											placeholder={'Full name'}
											value={input.memberNick}
											onChange={(e) => handleInput('memberNick', e.target.value)}
											required={true}
										/>
									</div>
									<div className={'input-box'}>
										<input
											type={showPassword ? 'text' : 'password'}
											placeholder={'Password'}
											value={input.memberPassword}
											onChange={(e) => handleInput('memberPassword', e.target.value)}
											required={true}
										/>
										<IconButton onClick={handleTogglePassword} className={'password-toggle'}>
											{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
										</IconButton>
									</div>
								</div>
								<Button
									className={'submit-btn'}
									disabled={input.memberNick === '' || input.memberPassword === ''}
									onClick={doLogin}
								>
									Login
								</Button>
								<div className={'signup-link'}>
									<p>
										Not registered yet? <span onClick={() => router.push('/auth/signup')}>Sign up</span>
									</p>
								</div>
							</div>
						</Stack>
						<Stack className={'right-section'}>
							<div className={'map-visualization'}>
								{/* Map visualization will be here */}
							</div>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(Login);

