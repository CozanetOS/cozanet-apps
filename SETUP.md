# Cozanet OS — Local Setup Guide

## What you're running

| Service | Repo | Port | Purpose |
|---------|------|------|---------|
| Backend API | `cozanet-core` | 3001 | CEO + LLM + Memory |
| Frontend | `cozanet-apps` | 3000 | Chat interface |

Memory is stored in `cozanet-core/data/cozanet-memory.db` (SQLite).
**This file persists across restarts, redeployments, and browser refreshes.**

---

## 1. Get a free LLM API key

The recommended provider is **Groq** (free, fast):
1. Go to https://console.groq.com
2. Create an account and generate an API key
3. Add it to `cozanet-core/.env` as `GROQ_API_KEY`

---

## 2. Start the backend

```bash
cd cozanet-core
npm install
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
npm run dev
```

Backend runs at http://localhost:3001

Test it:
```bash
curl http://localhost:3001/api/health
```

---

## 3. Start the frontend

```bash
cd cozanet-apps
npm install
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001 (default, no change needed)
npm run dev
```

Frontend runs at http://localhost:3000

---

## 4. Use it

- Open http://localhost:3000
- Start chatting
- Close the tab, come back — **your conversation is still there**
- Restart the backend — **memory survives** (SQLite file on disk)
- Click "New session" to start a fresh conversation

---

## Memory Architecture

```
Browser (localStorage)
  └── sessionId  ←── persists across refresh/close

Backend (SQLite @ data/cozanet-memory.db)
  ├── conversations table  ←── full chat history per session
  ├── memory_records table ←── long-term facts
  ├── semantic_entries     ←── concepts and knowledge
  └── episodes             ←── events and experiences
```

Memory survives:
- ✅ Page refresh
- ✅ Browser close + reopen  
- ✅ Server restart
- ✅ Redeployment (as long as data/ folder is preserved or on persistent volume)
