import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useTimeout(ms: number = 8000) {
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startTimeout = useCallback(() => {
    setTimedOut(false);
    timeoutRef.current = setTimeout(() => {
      setTimedOut(true);
    }, ms);
  }, [ms]);

  const clearTimeoutFunc = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      setTimedOut(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { timedOut, startTimeout, clearTimeout: clearTimeoutFunc };
}

export function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Request timed out')), timeoutMs)
    )
  ]);
}