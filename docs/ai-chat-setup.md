## AI Chat (OpenAI) setup

### 1) Add your OpenAI key (server-side only)

Create a file in the project root called **`.env.local`** (do not commit it) and add:

```bash
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
OPENAI_MODEL=gpt-4o-mini
```

If your project already uses `REACT_APP_*` env naming, you can also use:

```bash
REACT_APP_OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
```

### 2) Restart the dev server

After adding `.env.local`, restart Next.js:

```bash
npm run dev
```

### Notes

- The AI chat UI calls **`/api/ai/chat`** which runs on the server, so the key is never exposed to the browser.
- If you accidentally shared an API key in chat, rotate it in your OpenAI dashboard.


