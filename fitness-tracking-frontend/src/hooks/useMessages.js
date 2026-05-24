import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../utils/api';

// Frontend API_BASE — the value baked into Vite at build time. We need it
// for the EventSource URL (axios isn't used for SSE) and to construct the
// ?token= query string since EventSource can't send Authorization headers.
const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Hook for one community's chat. Owns:
 *   - the message list (oldest-first for natural append rendering)
 *   - the live SSE subscription (auto-reconnects via EventSource defaults)
 *   - send / delete actions
 *
 * Returns { messages, isLoading, error, send, remove, refetch }.
 */
export const useMessages = (communityId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Ref so the EventSource onmessage handler doesn't capture a stale setter.
  const sourceRef = useRef(null);

  const refetch = useCallback(async () => {
    if (!communityId) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/communities/${communityId}/messages`);
      setMessages(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages');
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [communityId]);

  // Initial load + SSE subscribe. Re-runs on communityId change so navigating
  // between communities cleanly disconnects the old stream.
  useEffect(() => {
    if (!communityId) return undefined;
    refetch();

    const token = localStorage.getItem('token');
    if (!token) return undefined;

    const url = `${API_BASE}/communities/${communityId}/messages/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    sourceRef.current = es;

    es.addEventListener('message:new', (e) => {
      try {
        const msg = JSON.parse(e.data);
        // Dedupe: postMessage's own POST response already appended this
        // message locally for the sender, so the SSE echo would duplicate.
        setMessages((prev) =>
          prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
        );
      } catch (_err) {
        // Malformed SSE payload — skip this event; the next one will be fine.
      }
    });

    es.addEventListener('message:delete', (e) => {
      try {
        const { _id } = JSON.parse(e.data);
        setMessages((prev) =>
          prev.map((m) => (m._id === _id ? { ...m, content: '', deletedAt: new Date().toISOString() } : m))
        );
      } catch (_err) {
        // Malformed SSE payload — skip this event; the next one will be fine.
      }
    });

    es.onerror = () => {
      // EventSource auto-reconnects on transient failures; we don't tear down
      // here unless the connection is permanently closed.
    };

    return () => {
      es.close();
      sourceRef.current = null;
    };
  }, [communityId, refetch]);

  const send = async (content) => {
    if (!content?.trim()) return;
    // Optimistic-ish: rely on the SSE echo to eventually arrive, but ALSO
    // append from the POST response so the sender sees their message
    // immediately without waiting for the round-trip via the bus.
    const res = await api.post(`/communities/${communityId}/messages`, { content });
    const msg = res.data?.data;
    if (msg) {
      setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
    }
  };

  const remove = async (messageId) => {
    await api.delete(`/communities/${communityId}/messages/${messageId}`);
    // SSE message:delete will arrive too, but we update locally for instant feedback.
    setMessages((prev) =>
      prev.map((m) => (m._id === messageId ? { ...m, content: '', deletedAt: new Date().toISOString() } : m))
    );
  };

  return { messages, isLoading, error, send, remove, refetch };
};

export default useMessages;
