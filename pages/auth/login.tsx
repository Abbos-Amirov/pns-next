import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Button, Stack, IconButton } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Login: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const [input, setInput] = useState({ memberNick: '', memberPassword: '' });
	const [showPassword, setShowPassword] = useState(false);

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
						<Box className={'form-header'}>
							<h1>Login</h1>
							<p>Sign in to your account</p>
						</Box>
						<Box className={'input-wrap'}>
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
						</Box>
						<Button
							className={'submit-btn'}
							disabled={input.memberNick === '' || input.memberPassword === ''}
							onClick={doLogin}
						>
							Login
						</Button>
						<Box className={'signup-link'}>
							<p>
								Not registered yet? <span onClick={() => router.push('/auth/signup')}>Sign up</span>
							</p>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'auth-page login-page'}>
				<Box className={'background-overlay'}></Box>
				<Stack className={'container'}>
					<Stack className={'main-content'}>
						<Stack className={'left-section'}>
							<Box className={'form-container'}>
								<Box className={'form-header'}>
									<h1>Start your perfect trip</h1>
								</Box>
								<Box className={'input-wrap'}>
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
								</Box>
								<Button
									className={'submit-btn'}
									disabled={input.memberNick === '' || input.memberPassword === ''}
									onClick={doLogin}
								>
									Login
								</Button>
								<Box className={'signup-link'}>
									<p>
										Not registered yet? <span onClick={() => router.push('/auth/signup')}>Sign up</span>
									</p>
								</Box>
							</Box>
						</Stack>
						<Stack className={'right-section'}>
							<Box className={'map-visualization'}>
								{/* Map visualization will be here */}
							</Box>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(Login);

