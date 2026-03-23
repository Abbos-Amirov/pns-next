import decodeJWT from 'jwt-decode';
import { initializeApollo } from '../../apollo/client';
import { userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { sweetMixinErrorAlert } from '../sweetAlert';
import { LOGIN, LOGIN_WITH_GOOGLE, SIGN_UP } from '../../apollo/user/mutation';

export function getJwtToken(): any {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken') ?? '';
	}
}

export function setJwtToken(token: string) {
	localStorage.setItem('accessToken', token);
}

export const logIn = async (nick: string, password: string): Promise<void> => {
	try {
		const { jwtToken } = await requestJwtToken({ nick, password });

		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
		}
	} catch (err: any) {
		console.warn('login err', err);
		// Xato xabari allaqachon sweetMixinErrorAlert orqali ko'rsatilgan
		// Faqat error ni throw qilamiz
		throw err;
	}
};

const requestJwtToken = async ({
	nick,
	password,
}: {
	nick: string;
	password: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: LOGIN,
			variables: { input: { memberNick: nick, memberPassword: password } },
			fetchPolicy: 'network-only',
		});

		console.log('---------- login ----------');
		const { accessToken } = result?.data?.login;

		if (!accessToken) {
			throw new Error('No access token received from server');
		}

		return { jwtToken: accessToken };
	} catch (err: any) {
		console.log('request login token err', err);
		let errorMessage = 'Login failed. Please try again.';
		
		// GraphQL xatolarini tekshirish
		if (err?.graphQLErrors && Array.isArray(err.graphQLErrors) && err.graphQLErrors.length > 0) {
			const graphQLError = err.graphQLErrors[0];
			const errorMsg = graphQLError?.message || graphQLError || 'Unknown error';
			
			switch (errorMsg) {
				case 'Definer: login and password do not match':
					errorMessage = 'Please check your password again';
					break;
				case 'Definer: user has been blocked!':
					errorMessage = 'User has been blocked!';
					break;
				case 'Definer: user not found':
				case 'Definer: memberNick not found':
					errorMessage = 'User with this nickname does not exist';
					break;
				default:
					errorMessage = typeof errorMsg === 'string' ? errorMsg : errorMessage;
			}
		} else if (err?.networkError) {
			// Network xatolari
			const networkErr = err.networkError;
			if (networkErr?.message) {
				errorMessage = `Network error: ${networkErr.message}`;
			} else {
				errorMessage = 'Network error. Please check your connection and try again.';
			}
		} else if (err?.message) {
			// Umumiy xato xabari
			errorMessage = err.message;
		} else if (typeof err === 'string') {
			// Agar err string bo'lsa
			errorMessage = err;
		} else {
			// Boshqa holatlar
			errorMessage = 'Login failed. Please try again.';
		}
		
		// Xato xabarini ko'rsatish
		await sweetMixinErrorAlert(errorMessage);
		throw new Error(errorMessage);
	}
};

/**
 * Google OAuth orqali GraphQL loginWithGoogle mutation chaqiriladi.
 * GoogleLoginInput odatda { code, redirectUri } yoki { idToken } qabul qiladi.
 */
export const loginWithGoogle = async (input: { code?: string; redirectUri?: string; idToken?: string }): Promise<void> => {
	const { jwtToken } = await requestGoogleJwtToken(input);
	if (jwtToken) {
		updateStorage({ jwtToken });
		updateUserInfo(jwtToken);
	}
};

const requestGoogleJwtToken = async (
	input: { code?: string; redirectUri?: string; idToken?: string }
): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();

	const graphqlInput: Record<string, string> = {};
	if (input.idToken) {
		graphqlInput.idToken = input.idToken;
	} else if (input.code && input.redirectUri) {
		graphqlInput.code = input.code;
		graphqlInput.redirectUri = input.redirectUri;
	} else {
		throw new Error('Google login: idToken yoki (code + redirectUri) talab qilinadi');
	}

	try {
		const result = await apolloClient.mutate({
			mutation: LOGIN_WITH_GOOGLE,
			variables: { input: graphqlInput },
			fetchPolicy: 'network-only',
		});

		const data = result?.data as { loginWithGoogle?: { accessToken?: string } };
		const accessToken = data?.loginWithGoogle?.accessToken;

		if (!accessToken) {
			throw new Error('No access token received from server');
		}

		return { jwtToken: accessToken };
	} catch (err: any) {
		console.log('request google login token err', err);
		let errorMessage = 'Google login failed. Please try again.';

		if (err?.graphQLErrors && Array.isArray(err.graphQLErrors) && err.graphQLErrors.length > 0) {
			const graphQLError = err.graphQLErrors[0];
			errorMessage = (graphQLError as any)?.message || errorMessage;
		} else if (err?.message) {
			errorMessage = err.message;
		}
		await sweetMixinErrorAlert(errorMessage);
		throw new Error(errorMessage);
	}
};

export const signUp = async (nick: string, password: string, phone: string, type: string): Promise<void> => {
	try {
		const { jwtToken } = await requestSignUpJwtToken({ nick, password, phone, type });

		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
		}
	} catch (err: any) {
		console.warn('signup err', err);
		// Xato xabari allaqachon sweetMixinErrorAlert orqali ko'rsatilgan
		// Faqat error ni throw qilamiz
		throw err;
	}
};

const requestSignUpJwtToken = async ({
	nick,
	password,
	phone,
	type,
}: {
	nick: string;
	password: string;
	phone: string;
	type: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: SIGN_UP,
			variables: {
				input: { memberNick: nick, memberPassword: password, memberPhone: phone, memberType: type },
			},
			fetchPolicy: 'network-only',
		});

		console.log('---------- signup ----------');
		const { accessToken } = result?.data?.signup;

		if (!accessToken) {
			throw new Error('No access token received from server');
		}

		return { jwtToken: accessToken };
	} catch (err: any) {
		console.log('request signup token err', err);
		let errorMessage = 'Signup failed. Please try again.';
		
		// GraphQL xatolarini tekshirish
		if (err?.graphQLErrors && Array.isArray(err.graphQLErrors) && err.graphQLErrors.length > 0) {
			const graphQLError = err.graphQLErrors[0];
			const errorMsg = graphQLError?.message || graphQLError || 'Unknown error';
			
			switch (errorMsg) {
				case 'Definer: login and password do not match':
					errorMessage = 'Please check your password again';
					break;
				case 'Definer: user has been blocked!':
					errorMessage = 'User has been blocked!';
					break;
				case 'Definer: user already exists':
				case 'Definer: memberNick already exists':
				case 'Definer: memberPhone already exists':
					errorMessage = 'User with this nickname or phone already exists';
					break;
				default:
					errorMessage = typeof errorMsg === 'string' ? errorMsg : errorMessage;
			}
		} else if (err?.networkError) {
			// Network xatolari
			const networkErr = err.networkError;
			if (networkErr?.message) {
				errorMessage = `Network error: ${networkErr.message}`;
			} else {
				errorMessage = 'Network error. Please check your connection and try again.';
			}
		} else if (err?.message) {
			// Umumiy xato xabari
			errorMessage = err.message;
		} else if (typeof err === 'string') {
			// Agar err string bo'lsa
			errorMessage = err;
		} else {
			// Boshqa holatlar
			errorMessage = 'Signup failed. Please try again.';
		}
		
		// Xato xabarini ko'rsatish
		await sweetMixinErrorAlert(errorMessage);
		throw new Error(errorMessage);
	}
};

export const updateStorage = ({ jwtToken }: { jwtToken: any }) => {
	setJwtToken(jwtToken);
	window.localStorage.setItem('login', Date.now().toString());
};

export const updateUserInfo = (jwtToken: any) => {
	if (!jwtToken) return false;

	const claims = decodeJWT<CustomJwtPayload>(jwtToken);
	userVar({
		_id: claims._id ?? '',
		memberType: claims.memberType ?? '',
		memberStatus: claims.memberStatus ?? '',
		memberAuthType: claims.memberAuthType,
		memberPhone: claims.memberPhone ?? '',
		memberNick: claims.memberNick ?? '',
		memberFullName: claims.memberFullName ?? '',
		memberImage:
			claims.memberImage === null || claims.memberImage === undefined
				? '/img/profile/defaultUser.svg'
				: `${claims.memberImage}`,
		memberAddress: claims.memberAddress ?? '',
		memberDesc: claims.memberDesc ?? '',
		memberProducts: claims.memberProducts ?? 0,
		memberRank: claims.memberRank,
		memberArticles: claims.memberArticles,
		memberPoints: claims.memberPoints,
		memberLikes: claims.memberLikes,
		memberViews: claims.memberViews,
		memberWarnings: claims.memberWarnings,
		memberBlocks: claims.memberBlocks,
	});
};

export const logOut = () => {
	deleteStorage();
	deleteUserInfo();
};

const deleteStorage = () => {
	localStorage.removeItem('accessToken');
	window.localStorage.setItem('logout', Date.now().toString());
};

const deleteUserInfo = () => {
	userVar({
		_id: '',
		memberType: '',
		memberStatus: '',
		memberAuthType: '',
		memberPhone: '',
		memberNick: '',
		memberFullName: '',
		memberImage: '',
		memberAddress: '',
		memberDesc: '',
		memberProducts: 0,
		memberRank: 0,
		memberArticles: 0,
		memberPoints: 0,
		memberLikes: 0,
		memberViews: 0,
		memberWarnings: 0,
		memberBlocks: 0,
	});
};
