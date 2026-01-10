import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, split, from, NormalizedCacheObject } from '@apollo/client';

import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { createUploadLink } from 'apollo-upload-client';
import { Observable } from '@apollo/client/utilities';
import { getJwtToken, setJwtToken } from '../libs/auth';
import { sweetErrorAlert } from '../libs/sweetAlert';
import { socketVar } from './store';
let apolloClient: ApolloClient<NormalizedCacheObject>;

function getHeaders() {
	const headers = {} as HeadersInit;
	const token = getJwtToken();

	// @ts-ignore
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

function isTokenValidOrUndefined(): boolean {
	const token = getJwtToken();
	if (!token) return true;
	try {
		const payloadPart = token.split('.')[1];
		if (!payloadPart) return true;
		const { exp } = JSON.parse(atob(payloadPart));
		if (typeof exp !== 'number') return true;
		return Date.now() < exp * 1000;
	} catch {
		// Agar token parse bo‘lmasa, refresh qilishga urinib ko‘ramiz (valid deb qabul qilmaymiz).
		return false;
	}
}

async function fetchAccessToken(): Promise<string | null> {
	try {
		const res = await fetch('/refresh', {
			method: 'POST',
			credentials: 'include',
		});
		if (!res.ok) return null;

		// Backend turlicha field qaytarishi mumkin, shuning uchun ikkisini ham tekshiramiz.
		const data = await res.json().catch(() => null);
		const nextToken = data?.accessToken ?? data?.jwtToken ?? null;
		return typeof nextToken === 'string' && nextToken.length > 0 ? nextToken : null;
	} catch {
		return null;
	}
}

// Apollo v3 bilan mos token refresh link (apollo-link-token-refresh ishlatmaymiz)
const tokenRefreshLink = new ApolloLink((operation, forward) => {
	return new Observable((observer) => {
		let sub: any;
		let cancelled = false;

		(async () => {
			try {
				// Faqat browserda refresh endpoint’ga uramiz
				if (typeof window !== 'undefined' && !isTokenValidOrUndefined()) {
					const nextToken = await fetchAccessToken();
					if (nextToken) setJwtToken(nextToken);
				}
			} finally {
				if (cancelled) return;
				sub = forward(operation).subscribe({
					next: (v: any) => observer.next(v),
					error: (e: any) => observer.error(e),
					complete: () => observer.complete(),
				});
			}
		})();

		return () => {
			cancelled = true;
			if (sub) sub.unsubscribe();
		};
	});
});

// Custom WebSocket Client
class LoggingWebSocket {
	private socket: WebSocket;
  
	constructor(url: string) {
	  this.socket = new WebSocket( `${url}?token=${getJwtToken()}`);
	  socketVar(this.socket)
	  
  
	  this.socket.onopen = () => {
		console.log('WebSocket connection ');
	  };
  
	  this.socket.onmessage = (msg) => {
		console.log('WebSocket message:', msg.data);
	  };
  
	  this.socket.onerror = (error) => {
		console.log('WebSocket Xato:', error);
	  };
	}
  
	send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
	  this.socket.send(data);
	}
  
	close() {
	  this.socket.close();
	}
  }

function createIsomorphicLink() {
	const authLink = new ApolloLink((operation, forward) => {
		operation.setContext(({ headers = {} }) => ({
			headers: {
				...headers,
				...getHeaders(),
			},
		}));
		// Avoid logging whole operation object (can crash Next dev overlay / Apollo warnings)
		// console.debug('requesting.. ', operation.operationName);
		return forward(operation);
	});

	const httpLink = createUploadLink({
		uri: process.env.REACT_APP_API_GRAPHQL_URL,
	});

	const errorLink = onError(({ graphQLErrors, networkError }) => {
		if (graphQLErrors) {
			graphQLErrors.map(({ message, locations, path }) => {
				console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
				if (!message.includes('input')) sweetErrorAlert(message);
			});
		}
		if (networkError) console.log(`[Network error]: ${networkError}`);
		// @ts-ignore
		if (networkError?.statusCode === 401) {
		}
	});

	// SSR’da websocket yo‘q; faqat HTTP link ishlaydi
	if (typeof window === 'undefined') {
		return from([errorLink, authLink.concat(httpLink as any)]);
	}

	/* WEBSOCKET SUBSCRIPTION LINK */
	const wsLink = new WebSocketLink({
		uri: 'ws://localhost:3007',
		options: {
			reconnect: false,
			timeout: 30000,
			connectionParams: () => {
				return { headers: getHeaders() };
			},
		},
		webSocketImpl: LoggingWebSocket,
	});

	const splitLink = split(
		({ query }) => {
			const definition = getMainDefinition(query);
			return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
		},
		wsLink,
		authLink.concat(httpLink as any),
	);

	return from([errorLink, tokenRefreshLink, splitLink]);
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache({
			typePolicies: {
				Query: {
					fields: {
						// These endpoints return nested objects/lists; replacing them is fine for our UI.
						// Setting merge:false prevents Apollo "warnAboutDataLoss" warnings (and avoids runtime crash in dev overlay).
						// --- User-facing queries ---
						getAgents: { merge: false },
						getInstallers: { merge: false },
						getLocations: { merge: false },
						getLocation: { merge: false },
						getProperties: { merge: false },
						getProperty: { merge: false },
						getAgentProperties: { merge: false },
						getProducts: { merge: false },
						getProduct: { merge: false },
						getMeasurers: { merge: false },
						getMember: { merge: false },
						getMemberFollowers: { merge: false },
						getMemberFollowings: { merge: false },
						getBoardArticles: { merge: false },
						getBoardArticle: { merge: false },
						getComments: { merge: false },
						getFavorites: { merge: false },
						getVisited: { merge: false },
						getNoticeList: { merge: false },
						getCsNoticeList: { merge: false },

						// --- Admin queries (also used in admin pages) ---
						getAllMembersByAdmin: { merge: false },
						getAllProductsByAdmin: { merge: false },
						getAllBoardArticlesByAdmin: { merge: false },
					},
				},
			},
		}),
		resolvers: {},
	});
}

export function initializeApollo(initialState = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState: any) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}

// /**
// import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// // No Subscription required for develop process

// const httpLink = createHttpLink({
//   uri: "http://localhost:3007/graphql",
// });

// const client = new ApolloClient({
//   link: httpLink,
//   cache: new InMemoryCache(),
// });

// export default client;
// */
