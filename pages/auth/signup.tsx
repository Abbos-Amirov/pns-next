import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Button, Stack, InputAdornment, IconButton } from '@mui/material';
import { useRouter } from 'next/router';
import { signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Signup: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const [input, setInput] = useState({ memberNick: '', memberPhone: '', memberPassword: '', type: 'USER' });
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

	const doSignUp = useCallback(async () => {
		try {
			await signUp(input.memberNick, input.memberPassword, input.memberPhone, input.type);
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
						<Box component="div" className={'form-header'}>
							<h1>Sign Up</h1>
							<p>Create your account</p>
						</Box>
						<Box component="div" className={'input-wrap'}>
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
									type="text"
									placeholder={'Phone'}
									value={input.memberPhone}
									onChange={(e) => handleInput('memberPhone', e.target.value)}
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
							disabled={input.memberNick === '' || input.memberPassword === '' || input.memberPhone === ''}
							onClick={doSignUp}
						>
							Start
						</Button>
						<Box component="div" className={'login-link'}>
							<p>
								Already have an account? <span onClick={() => router.push('/auth/login')}>Log in</span>
							</p>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack className={'auth-page signup-page'}>
				<Box component="div" className={'background-overlay'}></Box>
				<Stack className={'container'}>
					<Stack className={'main-content'}>
						<Stack className={'left-section'}>
							<Box component="div" className={'form-container'}>
								<Box component="div" className={'form-header'}>
									<h1>Start your perfect trip</h1>
								</Box>
								<Box component="div" className={'input-wrap'}>
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
											type="text"
											placeholder={'Phone'}
											value={input.memberPhone}
											onChange={(e) => handleInput('memberPhone', e.target.value)}
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
									disabled={input.memberNick === '' || input.memberPassword === '' || input.memberPhone === ''}
									onClick={doSignUp}
								>
									Start
								</Button>
								<Box component="div" className={'login-link'}>
									<p>
										Already have an account? <span onClick={() => router.push('/auth/login')}>Log in</span>
									</p>
								</Box>
							</Box>
						</Stack>
						<Stack className={'right-section'}>
							<Box component="div" className={'map-visualization'}>
								{/* Map visualization will be here */}
							</Box>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(Signup);

