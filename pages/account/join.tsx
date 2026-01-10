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
				await sweetMixinErrorAlert('Please fill in all required fields');
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
	}, [input, router]);

	const doSignUp = useCallback(async () => {
		try {
			if (!input.nick || !input.password || !input.phone || !input.type) {
				await sweetMixinErrorAlert('Please fill in all required fields');
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
							<div className={'logo-section'}>
								<Typography className={'brand-name'}>PNS DEV</Typography>
								<Typography className={'tagline'}>Explore More. Experience Life.</Typography>
							</div>

							{/* Toggle Buttons */}
							<div className={'toggle-buttons'}>
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
							</div>

							{/* Heading */}
							<Typography className={'section-heading'}>
								{loginView ? 'Journey Begins' : 'Start Your Journey'}
							</Typography>

							{/* Social Login */}
							{loginView && (
								<>
									<Typography className={'social-text'}>Log In with Open account</Typography>
									<div className={'social-buttons'}>
										<Button className={'social-btn'}>
											<AppleIcon />
										</Button>
										<Button className={'social-btn'}>
											<GoogleIcon />
										</Button>
										<Button className={'social-btn'}>
											<TwitterIcon />
										</Button>
									</div>
									<Typography className={'or-separator'}>or</Typography>
								</>
							)}

							{/* Input Fields */}
							<div className={'input-wrap'}>
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
							</div>

							{/* Remember Me & Forgot Password (Login only) */}
							{loginView && (
								<div className={'remember-forgot'}>
									<FormControlLabel
										control={<Checkbox defaultChecked />}
										label="Remember me"
									/>
									<Typography component="a" className={'forgot-link'}>
										Forgot Password?
									</Typography>
								</div>
							)}

							{/* User Type Selection (Signup only) */}
							{!loginView && (
								<div className={'user-type-selection'}>
									<Typography className={'type-label'}>I want to be registered as:</Typography>
									<div className={'type-checkboxes'}>
										<FormControlLabel
											control={
												<Checkbox
													name={MemberType.USER}
													onChange={checkUserTypeHandler}
													checked={input?.type == MemberType.USER}
												/>
											}
											label="User"
										/>
										<FormControlLabel
											control={
												<Checkbox
													name={MemberType.MEASURER}
													onChange={checkUserTypeHandler}
													checked={input?.type == MemberType.MEASURER}
												/>
											}
											label="Measurer"
										/>
										<FormControlLabel
											control={
												<Checkbox
													name={MemberType.INSTALLER}
													onChange={checkUserTypeHandler}
													checked={input?.type == MemberType.INSTALLER}
												/>
											}
											label="Installer"
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
								{isLoading ? 'Loading...' : loginView ? 'Log In' : 'Sign Up'}
							</Button>
						</Stack>

						{/* Right Section - Promotional Image */}
						<Stack className={'right'}>
							<div className={'promo-image'}>
								<div className={'promo-text-top'}>
									<Typography className={'promo-title'}>
									Professional & Trustworth ❤️
									</Typography>
									<Typography className={'promo-subtitle'}>
									Quality You See. Comfort You Feel.
									Experience durable, stylish, and energy-efficient doors and windows crafted for every home.
									</Typography>
								</div>
								<div className={'promo-text-bottom'}>
									<Typography className={'promo-main'}>
									Open your home the smart way.
									</Typography>
									<Typography className={'promo-secondary'}>
										Experience the world your way!
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
