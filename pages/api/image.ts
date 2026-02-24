import type { NextApiRequest, NextApiResponse } from 'next';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3007';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { path } = req.query;
	if (!path || typeof path !== 'string') {
		return res.status(400).json({ error: 'Missing path parameter' });
	}

	const cleanPath = path.replace(/^\/+/, '');
	const imageUrl = `${API_URL}/${cleanPath}`;

	try {
		const response = await fetch(imageUrl);
		if (!response.ok) {
			return res.status(response.status).end();
		}
		const contentType = response.headers.get('content-type') || 'image/jpeg';
		res.setHeader('Content-Type', contentType);
		res.setHeader('Cache-Control', 'public, max-age=86400');
		const buffer = await response.arrayBuffer();
		return res.send(Buffer.from(buffer));
	} catch (err) {
		console.error('Image proxy error:', err);
		return res.status(502).end();
	}
}
