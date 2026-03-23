import type { NextApiRequest, NextApiResponse } from 'next';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3007';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}
	const redirectUri = req.query.redirect_uri as string | undefined;
	const backendPath = '/auth/kakao';
	const url = new URL(backendPath, API_URL);
	if (redirectUri) url.searchParams.set('redirect_uri', redirectUri);
	res.redirect(302, url.toString());
}
