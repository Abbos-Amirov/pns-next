import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
	mode: ThemeMode;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'pns-theme-mode';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [mode, setMode] = useState<ThemeMode>('light');

	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
		if (saved === 'dark' || saved === 'light') setMode(saved);
	}, []);

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, mode);
		document.documentElement.setAttribute('data-theme', mode);
	}, [mode]);

	const toggleTheme = () => {
		setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
	};

	return (
		<ThemeContext.Provider value={{ mode, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useThemeMode = () => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useThemeMode must be used within ThemeProvider');
	}
	return context;
};
