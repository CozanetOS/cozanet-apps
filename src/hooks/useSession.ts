'use client';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Returns a stable sessionId that persists in localStorage.
 * Same session is restored on page refresh / browser close+open.
 * Memory survives as long as the SQLite DB on the server persists.
 */
export function useSession(): string {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    let id = localStorage.getItem('cozanet-session-id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('cozanet-session-id', id);
    }
    setSessionId(id);
  }, []);

  return sessionId;
}

export function newSession(): string {
  const id = uuidv4();
  localStorage.setItem('cozanet-session-id', id);
  return id;
}
