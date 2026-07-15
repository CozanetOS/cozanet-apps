'use client';

import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { useSession, newSession } from '@/hooks/useSession';
import { useChat, Message } from '@/hooks/useChat';

export default function ChatPage() {
  const sessionId = useSession();
  const { messages, isLoading, error, sendMessage, loadHistory, clearChat, stopStreaming } = useChat(sessionId);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Load history once session is ready
  useEffect(() => {
    if (sessionId && !historyLoaded) {
      loadHistory().then(() => setHistoryLoaded(true));
    }
  }, [sessionId, historyLoaded, loadHistory]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewSession = () => {
    newSession();
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg)' }}>
      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-5 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'var(--accent)' }}
          >
            C
          </div>
          <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
            Cozanet OS
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--border)', color: 'var(--muted)' }}>
            Memory Tool — v0.1
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--muted)', background: 'var(--border)' }}
            title="Clear current conversation"
          >
            Clear
          </button>
          <button
            onClick={handleNewSession}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text)', background: 'var(--accent)' }}
            title="Start a new session (new memory context)"
          >
            New session
          </button>
        </div>
      </header>

      {/* ── Messages ── */}
      <main className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && historyLoaded && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              🧠
            </div>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Memory active — your conversations persist across sessions
            </p>
          </div>
        )}

        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-3 message-appear">
            <Avatar role="assistant" />
            <div
              className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <span className="dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--muted)' }} />
              <span className="dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--muted)' }} />
              <span className="dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--muted)' }} />
            </div>
          </div>
        )}

        {error && (
          <div
            className="mx-auto max-w-sm text-xs text-center px-4 py-2 rounded-lg"
            style={{ background: '#1a0000', color: '#f87171', border: '1px solid #450a0a' }}
          >
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* ── Input ── */}
      <footer
        className="shrink-0 px-4 py-4 border-t"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <div
          className="flex items-end gap-3 rounded-2xl px-4 py-3"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Cozanet OS…"
            rows={1}
            disabled={!sessionId}
            className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed"
            style={{ color: 'var(--text)', caretColor: 'var(--accent)' }}
          />
          {isLoading ? (
            <button
              onClick={stopStreaming}
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-opacity"
              style={{ background: '#450a0a', color: '#f87171' }}
              title="Stop"
            >
              ■
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim() || !sessionId}
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-opacity"
              style={{
                background: input.trim() ? 'var(--accent)' : 'var(--border)',
                color: input.trim() ? 'white' : 'var(--muted)',
                opacity: !sessionId ? 0.5 : 1,
              }}
              title="Send (Enter)"
            >
              ↑
            </button>
          )}
        </div>
        <p className="text-center text-xs mt-2" style={{ color: 'var(--muted)' }}>
          Enter to send · Shift+Enter for newline · Memory persists across sessions
        </p>
      </footer>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-3 message-appear ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar role={message.role} />
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'
        } ${message.streaming ? 'streaming-cursor' : ''}`}
        style={{
          background: isUser ? 'var(--accent)' : 'var(--surface)',
          color: 'var(--text)',
          border: isUser ? 'none' : '1px solid var(--border)',
        }}
      >
        {message.content || (message.streaming ? '' : '…')}
      </div>
    </div>
  );
}

function Avatar({ role }: { role: 'user' | 'assistant' }) {
  return (
    <div
      className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
      style={{
        background: role === 'user' ? '#1e293b' : 'var(--accent)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
      }}
    >
      {role === 'user' ? 'U' : 'C'}
    </div>
  );
}
