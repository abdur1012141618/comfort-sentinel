import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OptimisticMutationOptions<T, P> {
  mutationFn: (params: P) => Promise<T>;
  onSuccess?: (data: T, params: P) => void;
  onError?: (error: Error, params: P) => void;
  onSettled?: (data: T | null, error: Error | null, params: P) => void;
  optimisticUpdate?: (params: P) => void;
  rollback?: (params: P) => void;
  timeout?: number;
  retries?: number;
}

export function useOptimisticMutation<T, P>({
  mutationFn,
  onSuccess,
  onError,
  onSettled,
  optimisticUpdate,
  rollback,
  timeout = 8000,
  retries = 2
}: OptimisticMutationOptions<T, P>) {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const mutate = useCallback(async (params: P) => {
    setIsPending(true);
    let attempt = 0;
    let lastError: Error | null = null;

    // Apply optimistic update
    if (optimisticUpdate) {
      optimisticUpdate(params);
    }

    while (attempt <= retries) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        );

        const result = await Promise.race([
          mutationFn(params),
          timeoutPromise
        ]);

        setIsPending(false);
        onSuccess?.(result, params);
        onSettled?.(result, null, params);
        return result;
      } catch (error) {
        lastError = error as Error;
        attempt++;
        
        if (attempt <= retries) {
          // Exponential backoff: wait 1s, then 2s, then 4s...
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed - rollback optimistic update
    if (rollback) {
      rollback(params);
    }

    setIsPending(false);
    const finalError = lastError || new Error('Unknown error');
    onError?.(finalError, params);
    onSettled?.(null, finalError, params);
    
    toast({
      title: "Error",
      description: finalError.message,
      variant: "destructive",
    });

    throw finalError;
  }, [mutationFn, onSuccess, onError, onSettled, optimisticUpdate, rollback, timeout, retries, toast]);

  return {
    mutate,
    isPending
  };
}