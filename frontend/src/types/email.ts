export interface EmailRecord {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  content: string;
  company?: string;
  job_role?: string;
  created_at?: string;
  updated_at?: string;
}
