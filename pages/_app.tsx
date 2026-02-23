import type { AppProps } from 'next/app';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { light, dark } from '../scss/MaterialTheme';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import Loading from '../libs/components/common/Loading';
import { ThemeProvider, useThemeMode } from '../libs/context/ThemeContext';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

const ThemedApp = ({ Component, pageProps }: AppProps) => {
	const { mode } = useThemeMode();
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const client = useApollo(pageProps.initialApolloState);

	useEffect(() => {
		const handleStart = (url: string) => {
			if (url !== router.asPath) {
				setIsLoading(true);
			}
		};

		const handleComplete = () => {
			setIsLoading(false);
		};

		router.events.on('routeChangeStart', handleStart);
		router.events.on('routeChangeComplete', handleComplete);
		router.events.on('routeChangeError', handleComplete);

		return () => {
			router.events.off('routeChangeStart', handleStart);
			router.events.off('routeChangeComplete', handleComplete);
			router.events.off('routeChangeError', handleComplete);
		};
	}, [router]);

	// @ts-ignore - Material theme options compatibility
	const muiTheme = React.useMemo(() => createTheme(mode === 'dark' ? dark : light), [mode]);

	return (
		<ApolloProvider client={client}>
			<MuiThemeProvider theme={muiTheme}>
				<CssBaseline />
				<Loading isLoading={isLoading} />
				<Component {...pageProps} />
			</MuiThemeProvider>
		</ApolloProvider>
	);
};

const App = (props: AppProps) => (
	<ThemeProvider>
		<ThemedApp {...props} />
	</ThemeProvider>
);

export default appWithTranslation(App);
