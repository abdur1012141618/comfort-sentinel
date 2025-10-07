// src/lib/retry.ts
type RetryOpts = {
  retries?: number; // কতবার চেষ্টা করবে
  timeoutMs?: number; // প্রতি অ্যাটেম্পট টাইমআউট
  backoffMs?: number; // বেস ব্যাকঅফ (exponential)
};

export async function withRetry<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  { retries = 2, timeoutMs = 7000, backoffMs = 600 }: RetryOpts = {},
): Promise<T> {
  let lastErr: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);

    try {
      const res = await fn(ac.signal);
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;

      // যদি শেষ অ্যাটেম্পট না হয়, একটু backoff
      if (attempt < retries) {
        const wait = backoffMs * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
    }
  }
  throw lastErr;
}
