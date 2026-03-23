import type { NextApiRequest, NextApiResponse } from 'next';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3007';
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const SCOPES = ['openid', 'email', 'profile'].join(' ');

/**
 * Backendda /auth/google yo'li yo'q. GraphQL loginWithGoogle mutation ishlatamiz:
 * 1. Frontend Google OAuth ga redirect (client_id kerak)
 * 2. Callback da code olamiz
 * 3. loginWithGoogle({ code, redirectUri }) GraphQL orqali backendga yuboramiz
 *
 * REACT_APP_GOOGLE_CLIENT_ID - backend .env dagi GOOGLE_CLIENT_ID bilan bir xil bo'lishi kerak
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	if (GOOGLE_CLIENT_ID) {
		const protocol = req.headers['x-forwarded-proto'] || (req.headers['host']?.includes('localhost') ? 'http' : 'https');
		const host = req.headers['host'] || 'localhost:3000';
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
		const redirectUri = `${baseUrl}/auth/callback/google`;

		const params = new URLSearchParams({
			client_id: GOOGLE_CLIENT_ID,
			redirect_uri: redirectUri,
			response_type: 'code',
			scope: SCOPES,
			access_type: 'offline',
			prompt: 'consent',
		});
		if (req.query.state) params.set('state', req.query.state as string);

		return res.redirect(302, `${GOOGLE_AUTH_URL}?${params.toString()}`);
	}

	// Client ID bo'lmasa - aniq xato
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://${req.headers['host'] || 'localhost:3000'}`;
	const from = (req.query.from as string) || 'login';
	const path = from === 'signup' ? '/auth/signup' : '/auth/login';
	return res.redirect(302, `${baseUrl}${path}?error=google_no_client_id`);
}
