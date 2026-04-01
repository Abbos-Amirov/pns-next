import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
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

const AIChat = () => {
  const router = useRouter();
  const apollo = useApolloClient();
  const user = useReactiveVar(userVar);
  const [open, setOpen] = useState(false);
  const [openButton, setOpenButton] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
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
    const timeoutId = setTimeout(() => setOpenButton(true), 120);
    return () => clearTimeout(timeoutId);
  }, [router.pathname]);

  const callAiChat = useCallback(
    async (text: string): Promise<string> => {
      // Backend `AiChatInput` field name may differ across implementations.
      // We'll try a few common ones until one succeeds.
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
          // If the error is about input fields, try the next candidate.
          const msg = e?.message || '';
          const isInputFieldErr =
            msg.includes('AiChatInput') ||
            msg.toLowerCase().includes('field') ||
            msg.toLowerCase().includes('input');
          if (isInputFieldErr) continue;
          break;
        }
      }

      // Format Apollo error nicely
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
    if (!text) return;
    if (isSending) return;

    const now = Date.now();
    setMessages((prev) => [...prev, { role: 'user', text, at: now }]);
    setMessageInput('');

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
  }, [messageInput, isSending, callAiChat]);

  const onKeyDown = (e: any) => {
    if (e.key === 'Enter') onSend();
  };

  return (
    <Stack className="ai-chatting">
      {openButton ? (
        <button className="ai-chat-button" onClick={handleOpen} aria-label="I am IA">
          <SmartToyRoundedIcon sx={{ fontSize: 26 }} />
          <span className="ai-chat-label">I am PNS AI</span>
          
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
            disabled={isSending}
          />
          <button className="ai-send-btn" onClick={onSend} aria-label="Send to IA" disabled={isSending}>
            <SendIcon sx={{ color: '#fff', fontSize: 18 }} />
          </button>
        </Box>
      </Stack>
    </Stack>
  );
};

export default AIChat;


