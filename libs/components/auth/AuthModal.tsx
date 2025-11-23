import React, { useCallback, useState, useEffect } from 'react';
import { Box, Button, Stack, IconButton, Modal } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../auth';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../context/AuthContext';


interface AuthModalProps {
	open: boolean;
	onClose: () => void;
	type: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, type }) => {
	const router = useRouter();
	const device = useDeviceDetect();
	const { openAuthModal } = useAuth();
	const [input, setInput] = useState({ memberNick: '', memberPhone: '', memberPassword: '', type: 'USER' });
	const [showPassword, setShowPassword] = useState(false);
	const [currentType, setCurrentType] = useState<'login' | 'signup'>(type);

	useEffect(() => {
		setCurrentType(type);
	}, [type]);

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
			onClose();
			setInput({ memberNick: '', memberPhone: '', memberPassword: '', type: 'USER' });
			await router.push('/');
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input, router, onClose]);

	const doSignUp = useCallback(async () => {
		try {
			await signUp(input.memberNick, input.memberPassword, input.memberPhone, input.type);
			onClose();
			setInput({ memberNick: '', memberPhone: '', memberPassword: '', type: 'USER' });
			await router.push('/');
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input, router, onClose]);

	const handleClose = () => {
		setInput({ memberNick: '', memberPhone: '', memberPassword: '', type: 'USER' });
		setShowPassword(false);
		onClose();
	};

	return (
		<Modal 
			open={open} 
			onClose={handleClose} 
			className={'auth-modal'}
			sx={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				'& .MuiBackdrop-root': {
					backgroundColor: 'rgba(0, 0, 0, 0.7)',
					backdropFilter: 'blur(8px)',
				},
			}}
		>
			<Stack className={'auth-modal-content'}>
				<Stack className={'main-content'}>
					<Stack className={'left-section'}>
						<Box className={'form-container'}>
							<IconButton className={'close-button'} onClick={handleClose}>
								<CloseIcon />
							</IconButton>
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
								{currentType === 'signup' && (
									<div className={'input-box'}>
										<input
											type="text"
											placeholder={'Phone'}
											value={input.memberPhone}
											onChange={(e) => handleInput('memberPhone', e.target.value)}
											required={true}
										/>
									</div>
								)}
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
							{currentType === 'login' ? (
								<Button
									className={'submit-btn'}
									disabled={input.memberNick === '' || input.memberPassword === ''}
									onClick={doLogin}
								>
									Login
								</Button>
							) : (
								<Button
									className={'submit-btn'}
									disabled={input.memberNick === '' || input.memberPassword === '' || input.memberPhone === ''}
									onClick={doSignUp}
								>
									Start
								</Button>
							)}
							<Box className={currentType === 'login' ? 'signup-link' : 'login-link'}>
								{currentType === 'login' ? (
									<p>
										Not registered yet? <span onClick={() => openAuthModal('signup')}>Sign up</span>
									</p>
								) : (
									<p>
										Already have an account? <span onClick={() => openAuthModal('login')}>Log in</span>
									</p>
								)}
							</Box>
						</Box>
					</Stack>
					<Stack className={'right-section'}>
						<Box className={'map-visualization'}>
							{/* Map visualization */}
						</Box>
					</Stack>
				</Stack>
			</Stack>
		</Modal>
	);
};

export default AuthModal;

