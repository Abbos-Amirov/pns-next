import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { loginWithGoogle } from '../../../libs/auth';
import { Typography, CircularProgress, Stack } from '@mui/material';

/**
 * Google OAuth callback sahifasi.
 * Google redirect qilganda ?code=xxx&state=... bilan keladi.
 * Code orqali GraphQL loginWithGoogle mutation chaqiriladi.
 */
const GoogleCallback: React.FC = () => {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [done, setDone] = useState(false);

	useEffect(() => {
		if (!router.isReady || done) return;

		const code = router.query.code as string;
		if (!code) {
			const errorParam = router.query.error as string;
			setError(errorParam === 'access_denied' ? 'Login cancelled' : 'No authorization code received');
			setDone(true);
			return;
		}

		const redirectUri =
			typeof window !== 'undefined'
				? `${window.location.origin}/auth/callback/google`
				: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback/google`;

		loginWithGoogle({ code, redirectUri })
			.then(() => {
				setDone(true);
				router.replace('/');
			})
			.catch((err) => {
				setError(err?.message || 'Google login failed');
				setDone(true);
			});
	}, [router.isReady, router.query, router, done]);

	if (error) {
		return (
			<Stack alignItems="center" justifyContent="center" minHeight="50vh" p={3}>
				<Typography color="error">{error}</Typography>
				<Typography
					sx={{ mt: 2, cursor: 'pointer', color: 'primary.main', textDecoration: 'underline' }}
					onClick={() => router.push('/')}
				>
					Go to home
				</Typography>
			</Stack>
		);
	}

	return (
		<Stack alignItems="center" justifyContent="center" minHeight="50vh">
			<CircularProgress />
			<Typography sx={{ mt: 2 }}>Logging in with Google...</Typography>
		</Stack>
	);
};

export default GoogleCallback;
