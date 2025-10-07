export async function withRetry<T>(
  runner: (signal: AbortSignal) => Promise<T>,
  attempts = 2,
  timeoutMs = 7000,
  backoffMs = 700
): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort("timeout"), timeoutMs);
    try {
      const res = await runner(ac.signal);
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      await new Promise((r) => setTimeout(r, backoffMs * Math.pow(2, i)));
    }
  }
  throw lastErr;
}
