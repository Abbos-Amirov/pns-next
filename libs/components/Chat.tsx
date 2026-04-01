import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Box, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import Badge from '@mui/material/Badge';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import { useRouter } from 'next/router';
import ScrollableFeed from 'react-scrollable-feed';
import { RippleBadge } from '../../scss/MaterialTheme/styled';
import { useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../apollo/store';
import { Member } from '../types/member/member';
import { Messages, REACT_APP_API_URL } from '../config';
import { sweetErrorAlert } from '../sweetAlert';

const DEFAULT_AVATAR_SRC = '/img/profile/defaultUser.svg';

function buildAvatarSrc(memberImage?: string): string {
	if (!memberImage) return DEFAULT_AVATAR_SRC;
	if (memberImage.startsWith('http://') || memberImage.startsWith('https://')) return memberImage;
	if (memberImage.startsWith('/img/')) return memberImage;
	return `${REACT_APP_API_URL}/${memberImage}`;
}

const NewMessage = (type: any) => {
	if (type === 'right') {
		return (
			<Box
				component={'div'}
				flexDirection={'row'}
				style={{ display: 'flex' }}
				alignItems={'flex-end'}
				justifyContent={'flex-end'}
				sx={{ m: '10px 0px' }}
			>
				<div className={'msg-right'}></div>
			</Box>
		);
	} else {
		return (
			<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
				<Avatar
					alt={'user'}
					src={DEFAULT_AVATAR_SRC}
					sx={{
						bgcolor: '#8B4513',
						border: '2px solid rgba(139, 69, 19, 0.25)',
						boxShadow: '0px 6px 14px rgba(0,0,0,0.12)',
					}}
				/>
				
				<div className={'msg-left'}></div>
			</Box>
		);
	}
};

interface MessagePayload {
	event: string;
	text: string;
	memberData: ClientUser;
  }

type ChatMessage = MessagePayload & {
	__local?: boolean; // client-side message (always mine)
	__localId?: string;
	__localAt?: number;
};
  
  interface InfoPayload {
	event: string;
	totalClients: number;
	memberData: ClientUser;
	action: string;
  }
  

const Chat = () => {
	const chatContentRef = useRef<HTMLDivElement>(null);
	const [messagesList, setMessagesList] = useState<ChatMessage[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<number>(0);
	const [messageInput, setMessageInput] = useState<string>('');
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const socket = useReactiveVar(socketVar);
	const myAvatarSrc = useMemo(() => buildAvatarSrc((user as any)?.memberImage), [user]);
	const pendingSentRef = useRef<Array<{ text: string; at: number }>>([]);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!socket) return;

		const onMessage = (msg: MessageEvent) => {
			try {
				const data = JSON.parse(msg.data as any);
				// console.log('Websocket message', data);

				switch (data?.event) {
					case 'info': {
						const newInfo: InfoPayload = data;
						setOnlineUsers(newInfo.totalClients);
						break;
					}
					case 'getMessages': {
						const list: ChatMessage[] = (data.list || []).map((m: any) => ({
							...m,
							__local: false,
						}));
						setMessagesList(list);
						break;
					}
					case 'message': {
						const newMessage: ChatMessage = { ...data, __local: false };

						// If this message was just sent by this client, we already rendered it locally on the right.
						const now = Date.now();
						const idx = pendingSentRef.current.findIndex(
							(p) => p.text === newMessage.text && now - p.at < 10_000,
						);
						if (idx !== -1) {
							pendingSentRef.current.splice(idx, 1);
							return;
						}

						setMessagesList((prev) => [...prev, newMessage]);
						break;
					}
				}
			} catch (e) {
				// ignore malformed payloads
			}
		};

		socket.onmessage = onMessage;
		return () => {
			// cleanup when socket changes/unmounts
			if (socket.onmessage === onMessage) socket.onmessage = null;
		};
	}, [socket]);


	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setOpenButton(true);
		}, 100);
		return () => clearTimeout(timeoutId);
	}, []);

	useEffect(() => {
		setOpenButton(false);
		const timeoutId = setTimeout(() => setOpenButton(true), 120);
		return () => clearTimeout(timeoutId);
	}, [router.pathname]);

	/** HANDLERS **/
	const handleOpenChat = () => {
		setOpen((prevState) => !prevState);
	};

	const getInputMessageHandler = useCallback(
		(e: any) => {
			const text = e.target.value;
			setMessageInput(text);
		},
		[messageInput],
	);

	const getKeyHandler = (e: any) => {
		try {
			if (e.key == 'Enter') {
				onClickHandler();
			}
		} catch (err: any) {
			console.log(err);
		}
	};

	const onClickHandler = () => {
		if (!messageInput) {
			sweetErrorAlert(Messages.error4);
			return;
		}

		if (!socket) {
			sweetErrorAlert('Socket is not connected yet. Please try again in a moment.');
			return;
		}

		try {
			// Add message locally first so it always appears on the right for this client
			const localAt = Date.now();
			const localMsg: ChatMessage = {
				event: 'message',
				text: messageInput,
				memberData: (user?._id
					? ({
							...(user as any),
							_id: user._id,
							memberImage: (user as any)?.memberImage,
					  } as any)
					: ({
							_id: 'guest',
							memberNick: 'Guest',
							memberType: 'GUEST',
							memberImage: '',
					  } as any)) as ClientUser,
				__local: true,
				__localId: `${localAt}-${Math.random().toString(16).slice(2)}`,
				__localAt: localAt,
			};
			pendingSentRef.current.push({ text: messageInput, at: localAt });
			setMessagesList((prev) => [...prev, localMsg]);

			socket.send(JSON.stringify({ event: 'message', data: messageInput }));
			setMessageInput('');
		} catch (e) {
			sweetErrorAlert('Failed to send message. Please try again.');
		}
	}

	return (
		<Stack className="chatting">
			{openButton ? (
				<button className="chat-button" onClick={handleOpenChat}>
					{open ? <CloseFullscreenIcon sx={{ fontSize: 24 }} /> : <SupportAgentRoundedIcon sx={{ fontSize: 28 }} />}
				</button>
			) : null}
			<Stack className={`chat-frame ${open ? 'open' : ''}`}>
				<Box className={'chat-top'} component={'div'}>
					<div style={{ fontFamily: 'Nunito' }}>Online Chat</div>
					<RippleBadge style={{ margin: '-18px 0 0 21px'}} badgeContent={onlineUsers} />
					<Badge
						style={{
							margin: '-30px 0 0 20px',
							color: '#33c1c1',
							background: 'none',
						}}
						badgeContent={''}
					/>
				</Box>
				<Box className={'chat-content'} id="chat-content" ref={chatContentRef} component={'div'}>
					<ScrollableFeed>
						<Stack className={'chat-main'}>
							<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
								<div className={'welcome'}>Welcome to Live chat!</div>
							</Box>
							{messagesList.map((ele: ChatMessage) => {
								const {text, memberData} = ele;
								const memberImage = buildAvatarSrc(memberData?.memberImage);
								const avatarCommonSx = {
									bgcolor: '#8B4513',
									border: '2px solid rgba(139, 69, 19, 0.25)',
									boxShadow: '0px 6px 14px rgba(0,0,0,0.12)',
									width: 34,
									height: 34,
								} as const;

								const isMine = !!ele.__local || (memberData?._id && memberData?._id === user?._id);

								return isMine ? (<Box
									component={'div'}
									flexDirection={'row'}
									style={{ display: 'flex' }}
									alignItems={'flex-end'}
									justifyContent={'flex-end'}
									sx={{ m: '10px 0px' }}
								>
									<div className={'msg-right'}>{text}</div>
									<Avatar alt={'me'} src={myAvatarSrc} sx={{ ...avatarCommonSx, ml: '10px' }} />
								</Box>) : (<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
									<Avatar alt={'user'} src={memberImage} sx={avatarCommonSx} />
									<div className={'msg-left'}>{text}</div>
								</Box>)
							})}
							<>
								
								
							</>
						</Stack>
					</ScrollableFeed>
				</Box>
				<Box className={'chat-bott'} component={'div'}>
					<input
						type={'text'}
						name={'message'}
						className={'msg-input'}
						value={messageInput}
						placeholder={'Type message'}
						onChange={getInputMessageHandler}
						onKeyDown={getKeyHandler}
					/>
					<button className={'send-msg-btn'} onClick={onClickHandler}>
						<SendIcon style={{ color: '#fff' }} />
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default Chat;

type Guest = {
	_id:string
	memberNick: string;
	memberType: 'GUEST';
	memberImage: string
  };
  
  // Har bir client uchun saqlanadigan foydalanuvchi turi
  type ClientUser = Member | Guest;