export interface JobApplication {
  id: string;
  user_id: string;
  date: string;
  job_role: string;
  company: string;
  source: string;
  method: string;
  status: string;
  recency: string;
  experience: string;
  done_via: string;
  notes: string;
  reachout: string;
  created_at?: string;
  updated_at?: string;
}

export interface OutreachContact {
  id: string;
  user_id: string;
  date: string;
  person: string;
  role: string;
  company: string;
  medium: string;
  contact: string;
  contact2: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}
