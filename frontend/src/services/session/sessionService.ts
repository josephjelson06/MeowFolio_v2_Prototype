import { apiClient } from 'lib/apiClient';
import type { SessionActor } from 'types/session';

interface SessionResponse {
  actor: SessionActor | null;
  mode: 'dev';
}

export const sessionService = {
  async bootstrap() {
    const response = await apiClient.get<SessionResponse>('/session');
    apiClient.setActorId(response.actor?.id ?? null);
    return response.actor;
  },
};
