type Fetch = Parameters<typeof fetch>;
type FetchInput = Fetch[0];
type FetchInit = Omit<NonNullable<Fetch[1]>, 'signal'>;

export async function fetchWithTimeout(
  input: FetchInput,
  init: FetchInit & { timeout?: number } = {}
) {
  const { timeout = 10_000, ...requestInit } = init;

  const controller = new AbortController();
  const timerId = window.setTimeout(() => controller.abort('Request timed out'), timeout);

  const response = await fetch(input, {
    ...requestInit,
    signal: controller.signal,
  });

  window.clearTimeout(timerId);
  return response;
}
