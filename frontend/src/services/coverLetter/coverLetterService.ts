import type { CoverLetter } from 'types/coverLetter';
import { callGroq } from 'lib/groq-client';

const STORAGE_KEY = 'meowfolio:cover-letters';

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

// Local Storage Helper
function getLocalLetters(): CoverLetter[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveLocalLetters(letters: CoverLetter[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
}

export const coverLetterService = {
  async list(): Promise<CoverLetter[]> {
    const { isGuestUser, token } = await getAuthDetails();
    if (isGuestUser) {
      return getLocalLetters();
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/cover_letters?order=created_at.desc`, {
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
      console.warn('Supabase cover_letters list failed, falling back to localStorage:', err);
      return getLocalLetters();
    }
  },

  async save(letter: Partial<CoverLetter>): Promise<CoverLetter> {
    const { isGuestUser, token, userId } = await getAuthDetails();
    const nowStr = new Date().toISOString();

    if (isGuestUser) {
      const letters = getLocalLetters();
      if (letter.id) {
        const idx = letters.findIndex(l => l.id === letter.id);
        if (idx !== -1) {
          letters[idx] = { ...letters[idx], ...letter, updated_at: nowStr };
          saveLocalLetters(letters);
          return letters[idx];
        }
      }
      const newLetter: CoverLetter = {
        id: letter.id || `cl-mock-${Date.now()}`,
        user_id: userId,
        title: letter.title || 'Untitled Cover Letter',
        company: letter.company || '',
        job_role: letter.job_role || '',
        content: letter.content || '',
        created_at: nowStr,
        updated_at: nowStr,
      };
      letters.unshift(newLetter);
      saveLocalLetters(letters);
      return newLetter;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    try {
      const isUpdate = !!letter.id;
      const url = isUpdate
        ? `${supabaseUrl}/rest/v1/cover_letters?id=eq.${letter.id}`
        : `${supabaseUrl}/rest/v1/cover_letters`;

      const body = isUpdate
        ? { ...letter, updated_at: nowStr }
        : {
            ...letter,
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
      console.warn('Supabase cover_letters save failed, falling back to localStorage:', err);
      const letters = getLocalLetters();
      if (letter.id) {
        const idx = letters.findIndex(l => l.id === letter.id);
        if (idx !== -1) {
          letters[idx] = { ...letters[idx], ...letter, updated_at: nowStr };
          saveLocalLetters(letters);
          return letters[idx];
        }
      }
      const newLetter: CoverLetter = {
        id: letter.id || `cl-mock-${Date.now()}`,
        user_id: userId,
        title: letter.title || 'Untitled Cover Letter',
        company: letter.company || '',
        job_role: letter.job_role || '',
        content: letter.content || '',
        created_at: nowStr,
        updated_at: nowStr,
      };
      letters.unshift(newLetter);
      saveLocalLetters(letters);
      return newLetter;
    }
  },

  async delete(id: string): Promise<void> {
    const { isGuestUser, token } = await getAuthDetails();
    if (isGuestUser) {
      const letters = getLocalLetters();
      const nextLetters = letters.filter(l => l.id !== id);
      saveLocalLetters(nextLetters);
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/cover_letters?id=eq.${id}`, {
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
      console.warn('Supabase cover_letters delete failed, falling back to localStorage:', err);
      const letters = getLocalLetters();
      const nextLetters = letters.filter(l => l.id !== id);
      saveLocalLetters(nextLetters);
    }
  },

  async generate(resumeText: string, jdText: string, tone = 'professional'): Promise<string> {
    const systemPrompt = `You are an expert career advisor and professional writer.
Write a highly-tailored, compelling cover letter matching the candidate's resume details to the job description (JD) requirements.
The tone of the letter should be ${tone}.
Format the layout nicely using normal formal spacing and structure (date, recipient block, introduction, body highlighting candidate achievements, call to action, closing).
Return the result STRICTLY as a JSON object containing a single key "cover_letter". Do not output markdown text outside the JSON. Example:
{
  "cover_letter": "Dear Hiring Manager... \\n\\nSincerely,\\n[Name]"
}`;

    const userPrompt = `RESUME CONTENT:\n${resumeText}\n\nJOB DESCRIPTION:\n${jdText}`;

    const rawResult = await callGroq(systemPrompt, userPrompt);
    try {
      const parsed = JSON.parse(rawResult);
      if (parsed?.cover_letter) {
        return parsed.cover_letter;
      }
      return rawResult;
    } catch {
      return rawResult;
    }
  },
};
