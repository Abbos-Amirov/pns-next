import type { NextApiRequest, NextApiResponse } from 'next';

const GET_PRODUCTS_QUERY = `
  query GetProducts($input: ProductsInquiry!) {
    getProducts(input: $input) {
      list {
        _id
        productType
        productStatus
        productLocation
        productAddress
        productHeight
        productWidth
        productTitle
        productPrice
        productMaterial
        productGlassType
        productOpenType
        productCategory
        productColor
        productItems
        productViews
        productLikes
        productComments
        productRank
        productImages
        productDesc
        productRent
        memberId
        soldAt
        deletedAt
        manufacturedAt
        createdAt
        updatedAt
        meLiked {
          memberId
          likeRefId
          myFavorite
        }
      }
      metaCounter {
        total
      }
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	const graphqlUrl = process.env.REACT_APP_API_GRAPHQL_URL || 'http://localhost:3007/graphql';

	try {
		const { input } = req.body || {};
		const inquiry = input || {
			page: 1,
			limit: 9,
			sort: 'createdAt',
			direction: 'DESC',
			search: {},
		};

		const authHeader = req.headers.authorization;
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};
		if (authHeader) headers['Authorization'] = authHeader;

		const response = await fetch(graphqlUrl, {
			method: 'POST',
			headers,
			body: JSON.stringify({
				query: GET_PRODUCTS_QUERY,
				variables: { input: inquiry },
			}),
		});

		if (!response.ok) {
			const text = await response.text();
			console.error('Products API: Backend error', response.status, text);
			return res.status(502).json({
				error: 'Backend request failed',
				details: text?.slice(0, 200),
			});
		}

		const json = await response.json();

		if (json.errors && json.errors.length > 0) {
			console.error('Products API: GraphQL errors', json.errors);
			return res.status(400).json({
				error: 'GraphQL error',
				details: json.errors,
			});
		}

		const data = json?.data?.getProducts;
		if (!data) {
			return res.status(200).json({ list: [], metaCounter: [{ total: 0 }] });
		}

		return res.status(200).json(data);
	} catch (err: any) {
		console.error('Products API error:', err);
		return res.status(500).json({
			error: 'Failed to fetch products',
			message: err?.message || 'Unknown error',
		});
	}
}
