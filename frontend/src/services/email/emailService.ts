import type { EmailRecord } from 'types/email';
import type { UserProfile } from 'types/userProfile';
import type { ParsedJD } from 'types/jd';
import { callGroq } from 'lib/groq-client';

const STORAGE_KEY = 'meowfolio:emails';

function getUserIdFromToken(token: string): string {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.sub ?? 'guest-user';
  } catch {
    return 'guest-user';
  }
}

async function getAuthDetails() {
  let token = '';
  try {
    const { getCachedToken } = await import('lib/supabase');
    token = getCachedToken();
  } catch {}

  const isGuest =
    (import.meta.env.DEV || import.meta.env.VITE_ENABLE_TEST_SEAM === 'true') &&
    typeof window !== 'undefined' &&
    window.localStorage.getItem('TEST_SEAM_ACTIVE') === 'true';

  const isGuestUser = isGuest || !token;
  return {
    isGuestUser,
    token,
    userId: token ? getUserIdFromToken(token) : 'guest-user',
  };
}

// Local Storage Helpers
function getLocalEmails(): EmailRecord[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalEmails(emails: EmailRecord[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
}

export const emailService = {
  async list(): Promise<EmailRecord[]> {
    const { isGuestUser, token } = await getAuthDetails();
    if (isGuestUser) {
      return getLocalEmails();
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/emails?order=created_at.desc`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Database error: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.warn('Supabase emails query failed, falling back to localStorage:', err);
      return getLocalEmails();
    }
  },

  async save(email: Partial<EmailRecord>): Promise<EmailRecord> {
    const { isGuestUser, token, userId } = await getAuthDetails();
    const nowStr = new Date().toISOString();

    if (isGuestUser) {
      const emails = getLocalEmails();
      if (email.id) {
        const idx = emails.findIndex(e => e.id === email.id);
        if (idx !== -1) {
          emails[idx] = { ...emails[idx], ...email, updated_at: nowStr };
          saveLocalEmails(emails);
          return emails[idx];
        }
      }
      const newEmail: EmailRecord = {
        id: email.id || `em-mock-${Date.now()}`,
        user_id: userId,
        title: email.title || 'Untitled Email Draft',
        subject: email.subject || '',
        content: email.content || '',
        company: email.company || '',
        job_role: email.job_role || '',
        created_at: nowStr,
        updated_at: nowStr,
      };
      emails.unshift(newEmail);
      saveLocalEmails(emails);
      return newEmail;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    try {
      const isUpdate = !!email.id;
      const url = isUpdate
        ? `${supabaseUrl}/rest/v1/emails?id=eq.${email.id}`
        : `${supabaseUrl}/rest/v1/emails`;

      const body = isUpdate
        ? { ...email, updated_at: nowStr }
        : {
            ...email,
            user_id: userId,
            created_at: nowStr,
            updated_at: nowStr,
          };

      const response = await fetch(url, {
        method: isUpdate ? 'PATCH' : 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Database save failed: ${response.statusText}`);
      }

      const resData = await response.json();
      return Array.isArray(resData) ? resData[0] : resData;
    } catch (err) {
      console.warn('Supabase emails save failed, falling back to localStorage:', err);
      const emails = getLocalEmails();
      if (email.id) {
        const idx = emails.findIndex(e => e.id === email.id);
        if (idx !== -1) {
          emails[idx] = { ...emails[idx], ...email, updated_at: nowStr };
          saveLocalEmails(emails);
          return emails[idx];
        }
      }
      const newEmail: EmailRecord = {
        id: email.id || `em-mock-${Date.now()}`,
        user_id: userId,
        title: email.title || 'Untitled Email Draft',
        subject: email.subject || '',
        content: email.content || '',
        company: email.company || '',
        job_role: email.job_role || '',
        created_at: nowStr,
        updated_at: nowStr,
      };
      emails.unshift(newEmail);
      saveLocalEmails(emails);
      return newEmail;
    }
  },

  async delete(id: string): Promise<void> {
    const { isGuestUser, token } = await getAuthDetails();
    if (isGuestUser) {
      const emails = getLocalEmails();
      const nextEmails = emails.filter(e => e.id !== id);
      saveLocalEmails(nextEmails);
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/emails?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Database delete failed: ${response.statusText}`);
      }
    } catch (err) {
      console.warn('Supabase emails delete failed, falling back to localStorage:', err);
      const emails = getLocalEmails();
      const nextEmails = emails.filter(e => e.id !== id);
      saveLocalEmails(nextEmails);
    }
  },

  async generate(
    resumeText: string,
    jdText: string,
    emailType = 'outreach',
    tone = 'professional',
    profileData?: UserProfile | null,
    parsedJd?: ParsedJD | null
  ): Promise<{ subject: string; body: string }> {
    const systemPrompt = `You are an expert career consultant and professional copywriter.
Write a highly-tailored, compelling email based on the candidate's professional background and the target job description (JD).
The email type should be: ${emailType} (e.g. outreach/cold email, referral request, or follow-up).
The tone of the email should be: ${tone}.

CRITICAL EMAIL GUIDELINES:
1. Keep the email length between 100 to 150 words. Be brief and respectful of their time.
2. Hook the reader immediately. Avoid long introductions.
3. Make it metric-led: extract and highlight 1 or 2 key high-impact achievements/metrics from the candidate's experience that directly solve a pain point or align with responsibilities in the JD.
4. Have a clear, single low-friction Call to Action (CTA) at the end.
5. Format the output STRICTLY as a JSON object containing two keys:
- "subject" (the email subject line)
- "body" (the email body, using appropriate \\n formatting for paragraph breaks)

Do not output markdown text outside the JSON. Example:
{
  "subject": "AI Engineer Application - [Name]",
  "body": "Dear Hiring Manager... \\n\\nBest regards,\\n[Name]"
}`;

    let userPrompt = '';
    if (profileData && parsedJd) {
      userPrompt = `CANDIDATE PROFILE DATA (Structured):\n${JSON.stringify(profileData, null, 2)}\n\nTARGET JOB INTEL (Parsed JD):\n${JSON.stringify(parsedJd, null, 2)}`;
    } else if (profileData) {
      userPrompt = `CANDIDATE PROFILE DATA (Structured):\n${JSON.stringify(profileData, null, 2)}\n\nJOB DESCRIPTION:\n${jdText}`;
    } else if (parsedJd) {
      userPrompt = `RESUME CONTENT:\n${resumeText}\n\nTARGET JOB INTEL (Parsed JD):\n${JSON.stringify(parsedJd, null, 2)}`;
    } else {
      userPrompt = `RESUME CONTENT:\n${resumeText}\n\nJOB DESCRIPTION:\n${jdText}`;
    }

    const rawResult = await callGroq(systemPrompt, userPrompt);
    try {
      const parsed = JSON.parse(rawResult);
      if (parsed?.subject && parsed?.body) {
        return {
          subject: parsed.subject,
          body: parsed.body,
        };
      }
      return {
        subject: `Application Inquiry`,
        body: rawResult,
      };
    } catch {
      return {
        subject: `Application Inquiry`,
        body: rawResult,
      };
    }
  },
};

