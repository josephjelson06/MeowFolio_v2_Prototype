export interface SessionActor {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  credits: number;
  plan: string;
}
