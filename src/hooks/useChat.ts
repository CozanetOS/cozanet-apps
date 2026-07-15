'use client';
import { useState, useCallback, useRef } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  streaming?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useChat(sessionId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !sessionId || isLoading) return;

    setError(null);

    // Add user message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Add placeholder assistant message (streaming)
    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      streaming: true,
    };
    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(true);

    abortRef.current = new AbortController();

    try {
      const resp = await fetch(`${API_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content.trim(), sessionId }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok) {
        throw new Error(`Server error: ${resp.status}`);
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let assembled = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.done) break;
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.chunk) {
              assembled += parsed.chunk;
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: assembled, streaming: true }
                  : m
              ));
            }
          } catch (e: any) {
            if (e.message && !e.message.includes('JSON')) throw e;
          }
        }
      }

      // Mark streaming complete
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, streaming: false } : m
      ));

    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Connection failed');
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: '⚠️ Failed to get response. Is the backend running?', streaming: false }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isLoading]);

  const loadHistory = useCallback(async () => {
    if (!sessionId) return;
    try {
      const resp = await fetch(`${API_URL}/api/history/${sessionId}`);
      if (!resp.ok) return;
      const data = await resp.json();
      const msgs: Message[] = data.messages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        streaming: false,
      }));
      setMessages(msgs);
    } catch { /* ignore — backend might not be running yet */ }
  }, [sessionId]);

  const clearChat = useCallback(async () => {
    if (!sessionId) return;
    await fetch(`${API_URL}/api/history/${sessionId}`, { method: 'DELETE' });
    setMessages([]);
  }, [sessionId]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isLoading, error, sendMessage, loadHistory, clearChat, stopStreaming };
}
