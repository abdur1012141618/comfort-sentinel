/**
 * withRetry - Retry a promise-returning function up to 2 attempts
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 2
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, attempt * 500));
      }
    }
  }
  
  throw lastError;
}
