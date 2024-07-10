// adds option timeout (in ms)
async function fetchWithTimeout(
  resource: RequestInfo | URL,
  options: Partial<RequestInit> & { timeout?: number } = {}
) {
  const { timeout = 10000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}

export default fetchWithTimeout;
