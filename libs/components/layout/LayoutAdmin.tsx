import type { ComponentType } from 'react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MenuList from '../admin/AdminMenuList';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/Logout';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { getJwtToken, logOut, updateUserInfo } from '../../auth';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { MemberType } from '../../enums/member.enum';
const drawerWidth = 280;

const withAdminLayout = (Component: ComponentType) => {
	return (props: object) => {
		const router = useRouter();
		const user = useReactiveVar(userVar);
		const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
		const [title, setTitle] = useState('admin');
		const [loading, setLoading] = useState(true);
		const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
			setLoading(false);
		}, []);

		useEffect(() => {
			if (!loading && user.memberType !== MemberType.ADMIN) {
				router.push('/').then();
			}
		}, [loading, user, router]);

		/** HANDLERS **/
		const handleLogoutClick = () => {
			setLogoutDialogOpen(true);
		};

		const handleLogoutConfirm = async () => {
			try {
				setLogoutDialogOpen(false);
				logOut();
				await router.push('/');
			} catch (err: any) {
				console.log('ERROR, logoutHandler:', err.message);
			}
		};

		const handleLogoutCancel = () => {
			setLogoutDialogOpen(false);
		};

		if (!user || user?.memberType !== MemberType.ADMIN) return null;

		return (
			<main id="pc-wrap" className="admin">
				<Box component={'div'} sx={{ display: 'flex' }}>
					<AppBar
						position="fixed"
						sx={{
							width: `calc(100% - ${drawerWidth}px)`,
							ml: `${drawerWidth}px`,
							boxShadow: 'rgb(100 116 139 / 12%) 0px 1px 4px',
							background: '#ffffff',
							borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
						}}
					>
						<Toolbar sx={{ justifyContent: 'space-between', px: 3, minHeight: '64px !important' }}>
							<Box sx={{ flexGrow: 1 }} />
							<Stack direction={'row'} alignItems={'center'} spacing={2.5}>
								{/* User Info Card */}
								<Box
									sx={{
										display: 'flex',
										alignItems: 'center',
										gap: 1.5,
										px: 2,
										py: 1,
										borderRadius: '12px',
										background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.05) 0%, rgba(160, 82, 45, 0.03) 100%)',
										border: '1px solid rgba(139, 69, 19, 0.1)',
										transition: 'all 0.3s ease',
										'&:hover': {
											background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.08) 0%, rgba(160, 82, 45, 0.05) 100%)',
											borderColor: 'rgba(139, 69, 19, 0.2)',
											transform: 'translateY(-1px)',
											boxShadow: '0px 4px 12px rgba(139, 69, 19, 0.1)',
										},
									}}
								>
									<Avatar
										src={
											user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'
										}
										sx={{
											width: 44,
											height: 44,
											border: '2px solid #ffffff',
											boxShadow: '0px 2px 8px rgba(139, 69, 19, 0.15)',
										}}
									/>
									<Box sx={{ minWidth: 0 , }}>
										<Typography
											variant={'body2'}
											sx={{
												fontWeight: 700,
												color: '#181a20',
												fontSize: '14px',
												lineHeight: 1.3,
												mb: 0.25,
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
												maxWidth: '150px',
											}}
										>
											{user?.memberNick || 'Admin'}
										</Typography>
										<Typography
											variant={'caption'}
											sx={{
												color: '#8B4513',
												fontSize: '11px',
												fontWeight: 500,
												display: 'flex',
												alignItems: 'center',
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
												maxWidth: '150px',
											}}
										>
											{user?.memberPhone || 'No phone'}
										</Typography>
									</Box>
								</Box>
								
								{/* Logout Button */}
								<Button
									variant={'contained'}
									startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
									onClick={handleLogoutClick}
									className={'admin-logout-btn'}
									sx={{
										textTransform: 'none',
										
										borderRadius: '10px',
										background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
										color: '#ffffff',
										fontWeight: 600,
										fontSize: '13px',
										px: 2.5,
										py: 1.2,
										boxShadow: '0px 2px 8px rgba(139, 69, 19, 0.25)',
										transition: 'all 0.3s ease',
										'&:hover': {
											background: 'linear-gradient(135deg, #6B3410 0%, #8B4513 100%)',
											boxShadow: '0px 4px 16px rgba(139, 69, 19, 0.35)',
											transform: 'translateY(-2px)',
										},
										'&:active': {
											transform: 'translateY(0px)',
											boxShadow: '0px 2px 8px rgba(139, 69, 19, 0.25)',
										},
									}}
								>
									Logout
								</Button>
							</Stack>
						</Toolbar>
					</AppBar>

					<Drawer
						sx={{
							width: drawerWidth,
							flexShrink: 0,
							'& .MuiDrawer-paper': {
								width: drawerWidth,
								boxSizing: 'border-box',
							},
						}}
						variant="permanent"
						anchor="left"
						className="aside"
					>
						<Toolbar sx={{ flexDirection: 'column', alignItems: 'flexStart', pt: 3, pb: 2 }}>
							<Stack className={'logo-box'} sx={{ mb: 2 }}>
								<img src={'/img/logo/pns-arched-door.svg'} alt={'PNS Window Logo'} className={'admin-logo'} />
							</Stack>

							<Box
								className="user"
								sx={{
									width: '100%',
									background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.08) 0%, rgba(160, 82, 45, 0.05) 100%)',
									borderRadius: '12px',
									padding: '16px',
									marginTop: '8px',
									border: '1px solid rgba(139, 69, 19, 0.1)',
									transition: 'all 0.3s ease',
									'&:hover': {
										background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.12) 0%, rgba(160, 82, 45, 0.08) 100%)',
										borderColor: 'rgba(139, 69, 19, 0.2)',
										transform: 'translateY(-2px)',
										boxShadow: '0px 4px 12px rgba(139, 69, 19, 0.15)',
									},
								}}
							>
								<Stack direction={'row'} alignItems={'center'} spacing={2}>
									<Avatar
										src={
											user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'
										}
										sx={{
											width: 56,
											height: 56,
											border: '3px solid #ffffff',
											boxShadow: '0px 2px 8px rgba(139, 69, 19, 0.2)',
										}}
									/>
									<Box sx={{ flex: 1, minWidth: 0 }}>
										<Typography
											variant={'body1'}
											sx={{
												fontWeight: 700,
												color: '#181a20',
												fontSize: '15px',
												lineHeight: 1.3,
												mb: 0.5,
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												whiteSpace: 'nowrap',
											}}
										>
											{user?.memberNick || 'Admin User'}
										</Typography>
										<Typography
											variant={'caption'}
											sx={{
												color: '#8B4513',
												fontSize: '12px',
												fontWeight: 500,
												display: 'flex',
												alignItems: 'center',
												gap: 0.5,
											}}
										>
											{user?.memberPhone || 'No phone'}
										</Typography>
										<Box
											sx={{
												mt: 1,
												px: 1.5,
												py: 0.5,
												borderRadius: '6px',
												backgroundColor: 'rgba(139, 69, 19, 0.1)',
												display: 'inline-block',
											}}
										>
											<Typography
												variant={'caption'}
												sx={{
													color: '#8B4513',
													fontSize: '11px',
													fontWeight: 600,
													textTransform: 'uppercase',
													letterSpacing: '0.5px',
												}}
											>
												Administrator
											</Typography>
										</Box>
									</Box>
								</Stack>
							</Box>
						</Toolbar>

						<Divider />

						<MenuList />
					</Drawer>

					<Box component={'div'} id="bunker" sx={{ flexGrow: 1 }}>
						{/*@ts-ignore*/}
						<Component {...props} setSnackbar={setSnackbar} setTitle={setTitle} />
					</Box>
				</Box>

				{/* Logout Confirmation Dialog */}
				<Dialog
					open={logoutDialogOpen}
					onClose={handleLogoutCancel}
					PaperProps={{
						sx: {
							borderRadius: '16px',
							minWidth: '400px',
							boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12)',
						},
					}}
				>
					<DialogTitle
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 2,
							pb: 2,
							borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
						}}
					>
						<Box
							sx={{
								width: 48,
								height: 48,
								borderRadius: '12px',
								background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: '#FF9800',
							}}
						>
							<WarningAmberIcon sx={{ fontSize: 28 }} />
						</Box>
						<Typography variant={'h6'} sx={{ fontWeight: 700, color: '#181a20' }}>
							Confirm Logout
						</Typography>
					</DialogTitle>
					<DialogContent sx={{ pt: 3, pb: 2 }}>
						<DialogContentText
							sx={{
								color: '#616161',
								fontSize: '15px',
								lineHeight: 1.6,
								mb: 1,
							}}
						>
							Are you sure you want to logout from your account?
						</DialogContentText>
						<DialogContentText
							sx={{
								color: '#9e9e9e',
								fontSize: '13px',
								lineHeight: 1.5,
							}}
						>
							You will need to login again to access the admin panel.
						</DialogContentText>
					</DialogContent>
					<DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
						<Button
							onClick={handleLogoutCancel}
							variant={'outlined'}
							sx={{
								textTransform: 'none',
								borderRadius: '8px',
								borderColor: '#e0e0e0',
								color: '#616161',
								fontWeight: 600,
								px: 3,
								py: 1,
								'&:hover': {
									borderColor: '#bdbdbd',
									backgroundColor: 'rgba(0, 0, 0, 0.04)',
								},
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={handleLogoutConfirm}
							variant={'contained'}
							startIcon={<LogoutIcon />}
							sx={{
								textTransform: 'none',
								borderRadius: '8px',
								background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
								color: '#ffffff',
								fontWeight: 600,
								px: 3,
								py: 1,
								boxShadow: '0px 2px 8px rgba(139, 69, 19, 0.25)',
								'&:hover': {
									background: 'linear-gradient(135deg, #6B3410 0%, #8B4513 100%)',
									boxShadow: '0px 4px 16px rgba(139, 69, 19, 0.35)',
								},
							}}
						>
							Logout
						</Button>
					</DialogActions>
				</Dialog>
			</main>
		);
	};
};

export default withAdminLayout;
