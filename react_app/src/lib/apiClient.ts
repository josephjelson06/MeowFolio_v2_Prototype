const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  'http://localhost:4000/api';

const ACTOR_STORAGE_KEY = 'meowfolio:actor-user-id';
const LEGACY_ACTOR_STORAGE_KEY = 'resumeai:actor-user-id';

let actorId = (() => {
  try {
    return localStorage.getItem(ACTOR_STORAGE_KEY);
  } catch {
    try {
      return localStorage.getItem(LEGACY_ACTOR_STORAGE_KEY);
    } catch {
      return null;
    }
  }
})();

function withActorHeaders(headers?: HeadersInit) {
  const next = new Headers(headers);
  if (actorId) {
    next.set('x-user-id', actorId);
  }
  return next;
}

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
  getActorId() {
    return actorId;
  },
  setActorId(nextActorId: string | null) {
    actorId = nextActorId;
    try {
      if (nextActorId) {
        localStorage.setItem(ACTOR_STORAGE_KEY, nextActorId);
      } else {
        localStorage.removeItem(ACTOR_STORAGE_KEY);
      }
    } catch {
      // noop
    }
  },
  async get<T>(path: string) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: withActorHeaders(),
    });
    return parseResponse<T>(response);
  },
  async post<T>(path: string, body?: unknown) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: body === undefined ? withActorHeaders() : withActorHeaders({ 'Content-Type': 'application/json' }),
      method: 'POST',
    });
    return parseResponse<T>(response);
  },
  async patch<T>(path: string, body: unknown) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      body: JSON.stringify(body),
      headers: withActorHeaders({ 'Content-Type': 'application/json' }),
      method: 'PATCH',
    });
    return parseResponse<T>(response);
  },
  async delete(path: string) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: withActorHeaders(),
      method: 'DELETE',
    });
    return parseResponse<void>(response);
  },
  async postForm<T>(path: string, formData: FormData) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      body: formData,
      headers: withActorHeaders(),
      method: 'POST',
    });
    return parseResponse<T>(response);
  },
};
