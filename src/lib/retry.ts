export async function withRetry<T>(
  task: (signal: AbortSignal) => Promise<T>,
  opts: { retries?: number; timeoutMs?: number; baseDelay?: number } = {},
): Promise<T> {
  const retries = opts.retries ?? 2; // মোট 3 চেষ্টা (0,1,2)
  const timeoutMs = opts.timeoutMs ?? 7000; // Lovable preview < 8s
  const baseDelay = opts.baseDelay ?? 400;

  let lastErr: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort("timeout"), timeoutMs);

    try {
      const res = await task(ac.signal);
      clearTimeout(t);
      return res;
    } catch (err: any) {
      clearTimeout(t);
      lastErr = err;
      if (attempt === retries) break;
      // জিটারসহ ব্যাকঅফ
      const wait = baseDelay * 2 ** attempt + Math.floor(Math.random() * 200);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}
