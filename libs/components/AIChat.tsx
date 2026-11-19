import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/router';
import ScrollableFeed from 'react-scrollable-feed';
import { useApolloClient, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { AI_CHAT } from '../../apollo/user/mutation';

type AiRole = 'user' | 'ai';

type AiMessage = {
	role: AiRole;
	text: string;
	at: number;
};

type AiChatResult = { aiChat?: { ok?: boolean; reply?: string } };

const navigationCommands = [
	{ keywords: ['about', 'about us', 'company'], path: '/about', label: 'About' },
	{ keywords: ['our services', 'services'], path: '/our-services', label: 'Our Services' },
	{ keywords: ['repair', 'maintenance'], path: '/repair-maintenance', label: 'Repair & Maintenance' },
	{ keywords: ['contact', 'contact us'], path: '/contact-us', label: 'Contact Us' },
	{ keywords: ['history', 'pns history'], path: '/pns-history', label: 'PNS History' },
	{ keywords: ['community'], path: '/community', label: 'Community' },
	{ keywords: ['city', 'location'], path: '/city', label: 'City' },
	{ keywords: ['agent'], path: '/agent', label: 'Agent' },
	{ keywords: ['installer'], path: '/installer', label: 'Installer' },
	{ keywords: ['property', 'product'], path: '/property', label: 'Property' },
	{ keywords: ['login', 'signup', 'sign up', 'join', 'account'], path: '/account/join', label: 'Login / Signup' },
	{ keywords: ['home', 'homepage'], path: '/', label: 'Home' },
];

const pageDescriptions: Record<string, { greeting: string; detail: string }> = {
	'/': {
		greeting: '🏠 Welcome to PNS Window!',
		detail:
			'You are on the homepage. Explore premium windows & doors, special offers, and featured properties. How can I help you today?',
	},
	'/about': {
		greeting: 'ℹ️ About PNS Window',
		detail:
			'You are on the About page. Learn about our company history, mission, and the team behind PNS Window. Feel free to ask me anything!',
	},
	'/our-services': {
		greeting: '🔧 Our Services',
		detail:
			'You are on the Services page. Browse all professional window and door services we offer — installation, customization, and more.',
	},
	'/repair-maintenance': {
		greeting: '🛠️ Repair & Maintenance',
		detail:
			'You are on the Repair & Maintenance page. Get expert repair services for your windows and doors. Ask me about what\'s covered!',
	},
	'/contact-us': {
		greeting: '📞 Contact Us',
		detail: 'You are on the Contact page. Have questions? Reach our team here — or ask me right now, I\'m ready to help!',
	},
	'/pns-history': {
		greeting: '📚 PNS History',
		detail: 'You are on the PNS History page. Explore the rich history and milestones of PNS Window since its founding.',
	},
	'/community': {
		greeting: '👥 Community',
		detail:
			'You are on the Community page. Connect with PNS users, read stories, and share your own experiences. Welcome!',
	},
	'/city': {
		greeting: '🌆 City Explorer',
		detail: 'You are on the City page. Find PNS Window services available in your city and discover opportunities near you.',
	},
	'/agent': {
		greeting: '🤝 Our Agents',
		detail:
			'You are on the Agents page. Meet our professional agents who can help you find the perfect window & door solution.',
	},
	'/installer': {
		greeting: '👷 Installers',
		detail:
			'You are on the Installers page. Find certified installers in your area for professional installation of all PNS products.',
	},
	'/property': {
		greeting: '🪟 Properties',
		detail:
			'You are on the Properties page. Browse our wide range of window and door products. Filter by style, size, and material.',
	},
	'/account/join': {
		greeting: '🔐 Account',
		detail: 'Login or create your PNS account to access exclusive features, track orders, and manage your profile.',
	},
	'/auth/login': {
		greeting: '🔐 Login',
		detail: 'Welcome back! Sign in to your PNS account to continue enjoying our services.',
	},
	'/auth/signup': {
		greeting: '📝 Sign Up',
		detail: 'Create your PNS account today and enjoy exclusive member benefits!',
	},
	'/mypage': {
		greeting: '👤 My Page',
		detail: 'You are on your personal page. Manage your profile, view activity, and track your orders here.',
	},
	'/member': {
		greeting: '👥 Members',
		detail: 'You are on the Members page. Browse PNS Window members and connect with the community.',
	},
	'/cs': {
		greeting: '🎧 Customer Support',
		detail: 'You are on the Support page. Browse FAQs or contact our team — I can also answer common questions right here!',
	},
	'/configurator': {
		greeting: '🎨 3D Configurator',
		detail: 'You are on the Configurator page. Design your dream windows and doors with our interactive 3D tool!',
	},
};

const getPageInfo = (pathname: string): { greeting: string; detail: string } => {
	if (pageDescriptions[pathname]) return pageDescriptions[pathname];
	for (const [key, val] of Object.entries(pageDescriptions)) {
		if (key !== '/' && pathname.startsWith(key)) return val;
	}
	return {
		greeting: '✨ Welcome to PNS Window!',
		detail: "I'm your PNS AI assistant. Ask me anything about our products, services, or pages!",
	};
};

const AIChat = () => {
	const router = useRouter();
	const apollo = useApolloClient();
	const user = useReactiveVar(userVar);
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const [messageInput, setMessageInput] = useState('');
	const [isSending, setIsSending] = useState(false);
	const [greetingBubble, setGreetingBubble] = useState<{ greeting: string; detail: string } | null>(null);
	const greetingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isFirstRender = useRef(true);

	const [messages, setMessages] = useState<AiMessage[]>(() => {
		const info = getPageInfo('/');
		return [{ role: 'ai', text: `${info.greeting}\n${info.detail}`, at: Date.now() }];
	});

	const myNick = useMemo(() => (user as any)?.memberNick || (user as any)?.memberFullName || 'You', [user]);

	const showGreeting = useCallback((info: { greeting: string; detail: string }) => {
		setGreetingBubble(info);
		if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current);
		greetingTimerRef.current = setTimeout(() => setGreetingBubble(null), 7000);
	}, []);

	useEffect(() => {
		const info = getPageInfo(router.pathname);
		setMessages([{ role: 'ai', text: `${info.greeting}\n${info.detail}`, at: Date.now() }]);
		const btnTimer = setTimeout(() => {
			setOpenButton(true);
			showGreeting(info);
		}, 200);
		return () => clearTimeout(btnTimer);
	}, []);

	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}
		const info = getPageInfo(router.pathname);
		setMessages((prev) => [...prev, { role: 'ai', text: `${info.greeting}\n${info.detail}`, at: Date.now() }]);
		showGreeting(info);
		setOpenButton(false);
		const t = setTimeout(() => setOpenButton(true), 120);
		return () => clearTimeout(t);
	}, [router.pathname, showGreeting]);

	useEffect(() => {
		return () => {
			if (greetingTimerRef.current) clearTimeout(greetingTimerRef.current);
		};
	}, []);

	const handleOpen = () => {
		setOpen((p) => !p);
		setGreetingBubble(null);
	};

	const detectNavigation = useCallback((text: string) => {
		const inputLower = text.toLowerCase();
		const triggerRegex = /\b(go to|open|show me|take me to|navigate|visit|move to|page)\b/;
		if (!triggerRegex.test(inputLower)) return null;
		for (const command of navigationCommands) {
			if (command.keywords.some((keyword) => inputLower.includes(keyword))) {
				return command;
			}
		}
		return null;
	}, []);

	const callAiChat = useCallback(
		async (text: string): Promise<string> => {
			const candidates: any[] = [{ text }, { message: text }, { prompt: text }, { question: text }];
			let lastErr: any = null;
			for (const input of candidates) {
				try {
					const { data } = await apollo.mutate<AiChatResult>({
						mutation: AI_CHAT,
						variables: { input },
						fetchPolicy: 'no-cache',
					});
					const ok = data?.aiChat?.ok;
					const reply = data?.aiChat?.reply;
					if (ok && typeof reply === 'string' && reply.trim()) return reply;
					if (typeof reply === 'string' && reply.trim()) return reply;
					lastErr = new Error('Empty AI reply from server.');
				} catch (e: any) {
					lastErr = e;
					const msg = e?.message || '';
					const isInputFieldErr =
						msg.includes('AiChatInput') || msg.toLowerCase().includes('field') || msg.toLowerCase().includes('input');
					if (isInputFieldErr) continue;
					break;
				}
			}
			const gqlErr =
				lastErr?.graphQLErrors?.[0]?.message ||
				lastErr?.networkError?.message ||
				lastErr?.message ||
				'AI request failed.';
			throw new Error(gqlErr);
		},
		[apollo],
	);

	const onSend = useCallback(async () => {
		const text = messageInput.trim();
		if (!text || isSending) return;
		const now = Date.now();
		setMessages((prev) => [...prev, { role: 'user', text, at: now }]);
		setMessageInput('');
		const navigation = detectNavigation(text);
		if (navigation) {
			setMessages((prev) => [
				...prev,
				{ role: 'ai', text: `Sure, I will take you to the ${navigation.label} page.`, at: Date.now() },
			]);
			router.push(navigation.path);
			return;
		}
		try {
			setIsSending(true);
			const reply = await callAiChat(text);
			setMessages((prev) => [...prev, { role: 'ai', text: reply, at: Date.now() }]);
		} catch (e: any) {
			setMessages((prev) => [
				...prev,
				{ role: 'ai', text: e?.message || 'AI request failed. Please try again.', at: Date.now() },
			]);
		} finally {
			setIsSending(false);
		}
	}, [messageInput, isSending, callAiChat, detectNavigation, router]);

	const onKeyDown = (e: any) => {
		if (e.key === 'Enter') onSend();
	};

	return (
		<Stack className="ai-chatting">
			{greetingBubble && !open && (
				<Box className="ai-greeting-bubble" component="div" onClick={handleOpen}>
					<button
						className="ai-greeting-close"
						onClick={(e) => {
							e.stopPropagation();
							setGreetingBubble(null);
						}}
						aria-label="Close greeting"
					>
						<CloseIcon sx={{ fontSize: 13 }} />
					</button>
					<div className="ai-greeting-icon">
						<SmartToyRoundedIcon sx={{ fontSize: 18 }} />
					</div>
					<div className="ai-greeting-text">
						<span className="ai-greeting-title">{greetingBubble.greeting}</span>
						<span className="ai-greeting-detail">{greetingBubble.detail}</span>
					</div>
				</Box>
			)}

			{openButton && (
				<button className="ai-chat-button" onClick={handleOpen} aria-label="Open PNS AI Chat">
					<span className="ai-btn-pulse" />
					<SmartToyRoundedIcon sx={{ fontSize: 24 }} />
					<span className="ai-chat-label">PNS AI</span>
				</button>
			)}

			<Stack className={`ai-chat-frame ${open ? 'open' : ''}`}>
				<Box className="ai-chat-top" component="div">
					<Box className="ai-title" component="div">
						<Avatar className="ai-avatar">
							<SmartToyRoundedIcon sx={{ fontSize: 18 }} />
						</Avatar>
						<Box component="div" className="ai-title-texts">
							<Typography className="ai-title-main">PNS AI Assistant</Typography>
							<Typography className="ai-title-sub">
								<span className="ai-status-dot" />
								Online · Always here to help
							</Typography>
						</Box>
					</Box>
					<button className="ai-close" onClick={handleOpen} aria-label="Close AI chat">
						<CloseFullscreenIcon sx={{ fontSize: 16 }} />
					</button>
				</Box>

				<Box className="ai-chat-content" component="div">
					<ScrollableFeed>
						<Stack className="ai-chat-main">
							{messages.map((m) => {
								const key = `${m.role}-${m.at}-${m.text.slice(0, 10)}`;
								if (m.role === 'user') {
									return (
										<Box key={key} component="div" className="ai-msg-row right">
											<div className="ai-msg-right">{m.text}</div>
											<Avatar className="ai-msg-avatar right">{myNick?.slice(0, 1) || 'Y'}</Avatar>
										</Box>
									);
								}
								return (
									<Box key={key} component="div" className="ai-msg-row left">
										<Avatar className="ai-msg-avatar left">
											<SmartToyRoundedIcon sx={{ fontSize: 16 }} />
										</Avatar>
										<div className="ai-msg-left">
											{m.text.split('\n').map((line, i) => (
												<span key={i}>
													{i === 0 ? <strong>{line}</strong> : line}
													{i < m.text.split('\n').length - 1 && <br />}
												</span>
											))}
										</div>
									</Box>
								);
							})}
							{isSending && (
								<Box component="div" className="ai-msg-row left">
									<Avatar className="ai-msg-avatar left">
										<SmartToyRoundedIcon sx={{ fontSize: 16 }} />
									</Avatar>
									<div className="ai-msg-left ai-typing">
										<span />
										<span />
										<span />
									</div>
								</Box>
							)}
						</Stack>
					</ScrollableFeed>
				</Box>

				<Box className="ai-chat-bott" component="div">
					<input
						type="text"
						className="ai-msg-input"
						placeholder="Ask PNS AI anything..."
						value={messageInput}
						onChange={(e) => setMessageInput(e.target.value)}
						onKeyDown={onKeyDown}
						disabled={isSending}
					/>
					<button className="ai-send-btn" onClick={onSend} aria-label="Send message" disabled={isSending}>
						<SendIcon sx={{ color: '#fff', fontSize: 17 }} />
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default AIChat;
