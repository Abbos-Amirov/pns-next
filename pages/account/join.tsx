import React, { useCallback, useState, useEffect } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Stack, TextField, InputAdornment, IconButton, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AppleIcon from '@mui/icons-material/Apple';
import GoogleIcon from '@mui/icons-material/Google';
import TwitterIcon from '@mui/icons-material/Twitter';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Join: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
	const [showPassword, setShowPassword] = useState(false);
	
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
			handleInput('type', value);
		} else {
			handleInput('type', 'USER');
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
				await sweetMixinErrorAlert('Please fill in all required fields');
				return;
			}
			await logIn(input.nick, input.password);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input, router]);

	const doSignUp = useCallback(async () => {
		try {
			if (!input.nick || !input.password || !input.phone || !input.type) {
				await sweetMixinErrorAlert('Please fill in all required fields');
				return;
			}
			await signUp(input.nick, input.password, input.phone, input.type);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input, router]);

	if (device === 'mobile') {
		return <div>LOGIN MOBILE</div>;
	} else {
		return (
			<Stack className={'join-page'}>
				<Stack className={'container'}>
					<Stack className={'main'}>
						{/* Left Section - Form */}
						<Stack className={'left'}>
							{/* Logo and Tagline */}
							<Box className={'logo-section'}>
								<Typography className={'brand-name'}>PNS DEV</Typography>
								<Typography className={'tagline'}>Explore More. Experience Life.</Typography>
							</Box>

							{/* Toggle Buttons */}
							<Box className={'toggle-buttons'}>
								<Button
									className={`toggle-btn ${!loginView ? 'active' : ''}`}
									onClick={() => viewChangeHandler(false)}
								>
									Sign Up
								</Button>
								<Button
									className={`toggle-btn ${loginView ? 'active' : ''}`}
									onClick={() => viewChangeHandler(true)}
								>
									Log In
								</Button>
							</Box>

							{/* Heading */}
							<Typography className={'section-heading'}>
								{loginView ? 'Journey Begins' : 'Start Your Journey'}
							</Typography>

							{/* Social Login */}
							{loginView && (
								<>
									<Typography className={'social-text'}>Log In with Open account</Typography>
									<Box className={'social-buttons'}>
										<Button className={'social-btn'}>
											<AppleIcon />
										</Button>
										<Button className={'social-btn'}>
											<GoogleIcon />
										</Button>
										<Button className={'social-btn'}>
											<TwitterIcon />
										</Button>
									</Box>
									<Typography className={'or-separator'}>or</Typography>
								</>
							)}

							{/* Input Fields */}
							<Box className={'input-wrap'}>
								<TextField
									fullWidth
									label="Username"
									value={input.nick}
									onChange={(e) => handleInput('nick', e.target.value)}
									placeholder={loginView ? 'eli_trekker' : 'Enter Username'}
									className={'input-field'}
									onKeyDown={(event) => {
										if (event.key == 'Enter' && loginView) doLogin();
										if (event.key == 'Enter' && !loginView) doSignUp();
									}}
								/>

								{!loginView && (
									<TextField
										fullWidth
										label="Phone"
										value={input.phone}
										onChange={(e) => handleInput('phone', e.target.value)}
										placeholder={'Enter Phone'}
										className={'input-field'}
										onKeyDown={(event) => {
											if (event.key == 'Enter') doSignUp();
										}}
									/>
								)}

								<TextField
									fullWidth
									type={showPassword ? 'text' : 'password'}
									label="Password"
									value={input.password}
									onChange={(e) => handleInput('password', e.target.value)}
									placeholder={'Enter Password'}
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
							</Box>

							{/* Remember Me & Forgot Password (Login only) */}
							{loginView && (
								<Box className={'remember-forgot'}>
									<FormControlLabel
										control={<Checkbox defaultChecked />}
										label="Remember me"
									/>
									<Typography component="a" className={'forgot-link'}>
										Forgot Password?
									</Typography>
								</Box>
							)}

							{/* User Type Selection (Signup only) */}
							{!loginView && (
								<Box className={'user-type-selection'}>
									<Typography className={'type-label'}>I want to be registered as:</Typography>
									<Box className={'type-checkboxes'}>
										<FormControlLabel
											control={
												<Checkbox
													name={'USER'}
													onChange={checkUserTypeHandler}
													checked={input?.type == 'USER'}
												/>
											}
											label="User"
										/>
										<FormControlLabel
											control={
												<Checkbox
													name={'Measurer'}
													onChange={checkUserTypeHandler}
													checked={input?.type == 'Measurer'}
												/>
											}
											label="Measurer"
										/>
										<FormControlLabel
											control={
												<Checkbox
													name={'INSTALLER'}
													onChange={checkUserTypeHandler}
													checked={input?.type == 'INSTALLER'}
												/>
											}
											label="Installer"
										/>
									</Box>
								</Box>
							)}

							{/* Submit Button */}
							<Button
								className={'submit-btn'}
								disabled={
									loginView
										? input.nick == '' || input.password == ''
										: input.nick == '' || input.password == '' || input.phone == '' || input.type == ''
								}
								onClick={loginView ? doLogin : doSignUp}
							>
								{loginView ? 'Log In' : 'Sign Up'}
							</Button>
						</Stack>

						{/* Right Section - Promotional Image */}
						<Stack className={'right'}>
							<Box className={'promo-image'}>
								<Box className={'promo-text-top'}>
									<Typography className={'promo-title'}>
										Wander, Explore, Experience. ❤️
									</Typography>
									<Typography className={'promo-subtitle'}>
										Discover new places, embrace adventures, & create unforgettable travel memories worldwide.
									</Typography>
								</Box>
								<Box className={'promo-text-bottom'}>
									<Typography className={'promo-main'}>
										Escape the Ordinary, Embrace the Journey!
									</Typography>
									<Typography className={'promo-secondary'}>
										Experience the world your way!
									</Typography>
								</Box>
							</Box>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(Join);
