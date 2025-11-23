import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
	authModalOpen: boolean;
	authModalType: 'login' | 'signup';
	openAuthModal: (type: 'login' | 'signup') => void;
	closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [authModalOpen, setAuthModalOpen] = useState(false);
	const [authModalType, setAuthModalType] = useState<'login' | 'signup'>('login');

	const openAuthModal = (type: 'login' | 'signup') => {
		setAuthModalType(type);
		setAuthModalOpen(true);
	};

	const closeAuthModal = () => {
		setAuthModalOpen(false);
	};

	return (
		<AuthContext.Provider value={{ authModalOpen, authModalType, openAuthModal, closeAuthModal }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

