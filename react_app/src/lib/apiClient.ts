const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  'http://localhost:4000/api';

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const payload = await response.json() as { error?: string };
      if (payload.error) message = payload.error;
    } catch {
      // noop
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  baseUrl: API_BASE_URL,
  async get<T>(path: string) {
    const response = await fetch(`${API_BASE_URL}${path}`);
    return parseResponse<T>(response);
  },
  async post<T>(path: string, body?: unknown) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    return parseResponse<T>(response);
  },
  async patch<T>(path: string, body: unknown) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    });
    return parseResponse<T>(response);
  },
  async delete(path: string) {
    const response = await fetch(`${API_BASE_URL}${path}`, { method: 'DELETE' });
    return parseResponse<void>(response);
  },
  async postForm<T>(path: string, formData: FormData) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      body: formData,
      method: 'POST',
    });
    return parseResponse<T>(response);
  },
};
