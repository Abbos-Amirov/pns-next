import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import { useRouter } from 'next/router';
import ScrollableFeed from 'react-scrollable-feed';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';

type AiRole = 'user' | 'ai';

type AiMessage = {
  role: AiRole;
  text: string;
  at: number;
};

function aiReply(input: string): string {
  const text = input.trim().toLowerCase();
  if (!text) return 'Write something and I will help.';
  if (text.includes('hello') || text.includes('hi') || text.includes('salom')) {
    return 'Hello! Tell me what you want to do in the app.';
  }
  if (text.includes('like')) return 'If you tell me which page, I can help you fix the like behavior.';
  if (text.includes('location')) return 'Locations: I can help with list, create, edit, delete, and UI.';
  if (text.includes('chat')) return 'I can help you improve chat UI and message behavior.';
  return `Got it. You said: "${input}". What exactly should I change?`;
}

const AIChat = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const [open, setOpen] = useState(false);
  const [openButton, setOpenButton] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<AiMessage[]>(() => [
    { role: 'ai', text: 'I am IA. How can I help you today?', at: Date.now() },
  ]);

  const myNick = useMemo(() => (user as any)?.memberNick || (user as any)?.memberFullName || 'You', [user]);

  const handleOpen = () => setOpen((p) => !p);

  useEffect(() => {
    const timeoutId = setTimeout(() => setOpenButton(true), 100);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    setOpenButton(false);
  }, [router.pathname]);

  const onSend = useCallback(() => {
    const text = messageInput.trim();
    if (!text) return;

    const now = Date.now();
    setMessages((prev) => [...prev, { role: 'user', text, at: now }]);
    setMessageInput('');

    window.setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'ai', text: aiReply(text), at: Date.now() }]);
    }, 350);
  }, [messageInput]);

  const onKeyDown = (e: any) => {
    if (e.key === 'Enter') onSend();
  };

  return (
    <Stack className="ai-chatting">
      {openButton ? (
        <button className="ai-chat-button" onClick={handleOpen} aria-label="I am IA">
          <SmartToyRoundedIcon sx={{ fontSize: 26 }} />
          <span className="ai-chat-label">Hi I am IA</span>
          
        </button>
      ) : null}

      <Stack className={`ai-chat-frame ${open ? 'open' : ''}`}>
        <Box className="ai-chat-top" component={'div'}>
          <Box className="ai-title" component={'div'}>
            <Avatar className="ai-avatar">
              <SmartToyRoundedIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Box component={'div'} className="ai-title-texts">
              <Typography className="ai-title-main">I am IA</Typography>
              <Typography className="ai-title-sub">AI assistant</Typography>
            </Box>
          </Box>

          <button className="ai-close" onClick={handleOpen} aria-label="Close IA chat">
            <CloseFullscreenIcon sx={{ fontSize: 18 }} />
          </button>
        </Box>

        <Box className="ai-chat-content" component={'div'}>
          <ScrollableFeed>
            <Stack className="ai-chat-main">
              {messages.map((m) => {
                const key = `${m.role}-${m.at}-${m.text.slice(0, 10)}`;
                if (m.role === 'user') {
                  return (
                    <Box key={key} component={'div'} className="ai-msg-row right">
                      <div className="ai-msg-right">{m.text}</div>
                      <Avatar className="ai-msg-avatar right">{myNick?.slice(0, 1) || 'Y'}</Avatar>
                    </Box>
                  );
                }
                return (
                  <Box key={key} component={'div'} className="ai-msg-row left">
                    <Avatar className="ai-msg-avatar left">
                      <SmartToyRoundedIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <div className="ai-msg-left">{m.text}</div>
                  </Box>
                );
              })}
            </Stack>
          </ScrollableFeed>
        </Box>

        <Box className="ai-chat-bott" component={'div'}>
          <input
            type="text"
            className="ai-msg-input"
            placeholder="Ask IA..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button className="ai-send-btn" onClick={onSend} aria-label="Send to IA">
            <SendIcon sx={{ color: '#fff', fontSize: 18 }} />
          </button>
        </Box>
      </Stack>
    </Stack>
  );
};

export default AIChat;


