'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

export function useFetch<T = unknown>(url: string | null): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const versionRef = useRef(0);

  const fetchData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }
    versionRef.current += 1;
    const version = versionRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      const json = await res.json();
      if (version === versionRef.current) {
        setData(json);
      }
    } catch (err) {
      if (version === versionRef.current) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      if (version === versionRef.current) {
        setLoading(false);
      }
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, mutate: fetchData };
}

interface SessionData {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
  customer: {
    id: string;
    companyName: string;
    status: string;
    onboardingComplete: boolean;
  } | null;
}

interface UseSessionResult {
  user: SessionData['user'];
  customer: SessionData['customer'];
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

export function useSession(): UseSessionResult {
  const { data, loading, error, mutate } = useFetch<SessionData>('/api/auth/session');
  return {
    user: data?.user ?? null,
    customer: data?.customer ?? null,
    loading,
    error,
    mutate,
  };
}
