import type { JobApplication, OutreachContact } from 'types/tracker';

const STORAGE_KEY_APPLICATIONS = 'meowfolio:tracker-applications';
const STORAGE_KEY_OUTREACHES = 'meowfolio:tracker-outreaches';

function getUserIdFromToken(token: string): string {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded.sub ?? 'guest-user';
  } catch {
    return 'guest-user';
  }
}

// Helper to determine if we are in guest mode
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

// ─── Initial Mock Data ────────────────────────────────────────────────────────
const INITIAL_APPLICATIONS: JobApplication[] = [
  { id: 'app-1', user_id: 'guest-user', date: '2026-06-20', job_role: 'AI Engineer', company: 'True Tech Professionals', source: 'LinkedIn Jobs (Career Page)', method: 'Cold Email / EA', status: 'Applied', recency: '1', experience: '0-1', done_via: 'Word', notes: '', reachout: '' },
  { id: 'app-2', user_id: 'guest-user', date: '2026-06-20', job_role: 'Software Development Engineer', company: 'IQVIA', source: 'LinkedIn Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '1', experience: '', done_via: 'Word', notes: '', reachout: '' },
  { id: 'app-3', user_id: 'guest-user', date: '2026-06-20', job_role: 'Gradudate Engineer Trainee - Technology', company: 'Adani Digital Lab', source: 'LinkedIn Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '3', experience: 'Fresher', done_via: 'Word', notes: '', reachout: '' },
  { id: 'app-4', user_id: 'guest-user', date: '2026-06-20', job_role: 'Campus_Hire_Engineer_SW', company: 'Qualcomm', source: 'LInkedIn Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '3', experience: 'Graduate', done_via: 'Word', notes: '', reachout: '' },
  { id: 'app-5', user_id: 'guest-user', date: '2026-06-20', job_role: 'AI/ML Engineer', company: 'Sabre', source: 'LInkedIn Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '25', experience: '0-3', done_via: 'Word', notes: '', reachout: '' },
  { id: 'app-6', user_id: 'guest-user', date: '2026-06-20', job_role: 'Software Engineer 1', company: 'Zebra Technologies', source: 'LInkedIn Jobs (Career Page)', method: 'Career Page', status: 'Rejected', recency: '1', experience: '0', done_via: 'Word', notes: '', reachout: '' },
  { id: 'app-7', user_id: 'guest-user', date: '2026-06-20', job_role: 'Jr. Software Engineer', company: 'MetLife', source: 'LInkedIn Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '12', experience: '', done_via: 'Word', notes: '', reachout: '' },
  { id: 'app-8', user_id: 'guest-user', date: '2026-06-20', job_role: 'Junior Full Stack Developer', company: 'Epiroc', source: 'LInkedIn Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '18', experience: 'Junior', done_via: 'MeowFolio', notes: '', reachout: '' },
  { id: 'app-9', user_id: 'guest-user', date: '2026-06-20', job_role: 'Software Engineer', company: 'Cyncly', source: 'LInkedIn Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '11', experience: '3-5', done_via: 'MeowFolio', notes: '', reachout: '' },
  { id: 'app-10', user_id: 'guest-user', date: '2026-06-20', job_role: 'Full Stack Developer - React Native', company: 'Reltio', source: 'LInkedIn Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '1 (LinkedIn)', experience: '1-2', done_via: 'MeowFolio', notes: '', reachout: '' },
  { id: 'app-11', user_id: 'guest-user', date: '2026-06-20', job_role: 'Software Development Engineer - Fresher', company: 'Zyphra Tech Solutions', source: 'LinkedIn Jobs (Career Page)', method: 'Carrer Page', status: 'Applied', recency: '3', experience: 'Fresher', done_via: 'MeowFolio', notes: '', reachout: '' },
  { id: 'app-12', user_id: 'guest-user', date: '2026-06-20', job_role: 'AI Engineer', company: 'Anteriad', source: 'LinkedIn Jobs (Career Page)', method: 'Carrer Page', status: 'Applied', recency: '4 (LinkedIn)', experience: '1-2', done_via: 'MeowFolio', notes: '', reachout: '' },
  { id: 'app-13', user_id: 'guest-user', date: '2026-06-20', job_role: 'Gen AI Consultant', company: 'Evnek Technologies', source: 'LinkedIn Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '4', experience: '1-3', done_via: 'MeowFolio', notes: '', reachout: '' },
  { id: 'app-14', user_id: 'guest-user', date: '2026-06-20', job_role: 'Junior AI Engineer', company: 'ClearGrid', source: 'LinkedIn Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '2 (LinkedIn)', experience: '1-2', done_via: 'MeowFolio', notes: '', reachout: '' },
  { id: 'app-15', user_id: 'guest-user', date: '2026-06-20', job_role: 'AI Engineer', company: 'Taxmann', source: 'LinkedIn Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '2 (LinkedIn)', experience: '(Intern/Fresher/Experienced)', done_via: 'MeowFolio', notes: '', reachout: '' },
  { id: 'app-16', user_id: 'guest-user', date: '2026-06-21', job_role: 'AI Engineer', company: 'ClanX (HelloCounsel)', source: 'LinkedIn Jobs (Career Page)', method: 'Career Page | ClanX | Cold Email', status: 'Applied (Cold Email Scheduled)', recency: '1 (LinkedIn)', experience: '(3+ years)', done_via: 'MeowFolio', notes: 'HelloCounsel is Hiring | Clanx is the Recruiter', reachout: '' },
  { id: 'app-17', user_id: 'guest-user', date: '2026-06-21', job_role: 'Junior AI Developer', company: 'Dentsu Global Services', source: 'LinkedIn Jobs (Career Page)', method: 'Carrer Page', status: 'Applied', recency: '4', experience: 'Junior', done_via: 'MeowFolio', notes: '', reachout: '' },
  { id: 'app-18', user_id: 'guest-user', date: '2026-06-21', job_role: 'AI Engineer', company: 'TrexQuant', source: 'LinkedIn Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '5 (LinkedIn)', experience: '2+ Years', done_via: 'MeowFolio', notes: '', reachout: '' },
  { id: 'app-19', user_id: 'guest-user', date: '2026-06-21', job_role: 'Software Engineer - AI/ML', company: 'Google', source: 'LinkedIn Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '1 Reposed LinkedIn', experience: '1+ Years | Masters Degree', done_via: 'MeowFolio', notes: '', reachout: '' },
  { id: 'app-20', user_id: 'guest-user', date: '2026-06-21', job_role: 'AI Developer - Internship', company: 'BlitzenX', source: 'LinkedIn Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '1', experience: 'Intern', done_via: 'MeowFolio', notes: 'Internship', reachout: '' },
  { id: 'app-21', user_id: 'guest-user', date: '2026-06-21', job_role: 'AI Agent Developer', company: 'Tayana Solutions', source: 'Google Job Search', method: 'Cold Email', status: 'Applied', recency: '', experience: 'Fresher (WFH)', done_via: 'MeowFolio', notes: 'Cold Email | HR', reachout: 'Yes' },
  { id: 'app-22', user_id: 'guest-user', date: '2026-06-21', job_role: 'Research Intern AI/ML', company: 'Netedge Computing Solutions', source: 'Naukri Internships', method: 'Cold Email \\ Whatsapp', status: 'Applied', recency: '25-30 June', experience: 'Intern', done_via: 'MeowFolio', notes: 'Internship | Walk-In | Delhi | YTW', reachout: 'Yes' },
  { id: 'app-23', user_id: 'guest-user', date: '2026-06-21', job_role: 'AI Trainee', company: 'TechPerspect', source: 'Naukri Internships', method: 'Cold Email', status: 'Applied', recency: '', experience: 'Intern', done_via: 'MeowFolio', notes: 'Reachouts', reachout: 'Yes' },
  { id: 'app-24', user_id: 'guest-user', date: '2026-06-21', job_role: 'AI Engineer', company: 'TresVista', source: 'Naukri Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '3 (Naukri)', experience: '0-3', done_via: 'MeowFolio', notes: '', reachout: 'Yes' },
  { id: 'app-25', user_id: 'guest-user', date: '2026-06-21', job_role: 'AI Engineer', company: 'TwoSpoonsAI', source: 'X (Personal Lookup)', method: 'Cold Email \\ Whatsapp', status: 'Applied', recency: 'Expired - But reachout', experience: 'Intern/FullTime', done_via: 'MeowFolio', notes: 'Reachouts Expired - but still reachouts', reachout: 'Yes' },
  { id: 'app-26', user_id: 'guest-user', date: '2026-06-21', job_role: 'AI Engineer', company: 'Arango', source: 'LinkedIn Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '', experience: 'Fresher (3+)', done_via: 'MeowFolio', notes: '', reachout: '' },
  { id: 'app-27', user_id: 'guest-user', date: '2026-06-21', job_role: 'AI Intern', company: 'Arango', source: 'LinkedIn Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '', experience: 'Intern', done_via: 'MeowFolio', notes: '5 Different Reachouts LinkedIn', reachout: 'Yes' },
  { id: 'app-28', user_id: 'guest-user', date: '2026-06-21', job_role: 'Python Developer', company: 'SyanSoft', source: 'LinkedIn Jobs (Career Page)', method: 'Career Page (Form)', status: 'Applied', recency: '', experience: '', done_via: 'MeowFolio', notes: 'HR Reach Out (LinkedIn + Cold Email)', reachout: 'Yes' },
  { id: 'app-29', user_id: 'guest-user', date: '2026-06-21', job_role: 'AI Engineer', company: 'Legistify', source: 'LinkedIn Jobs (Google Form)', method: 'Google Form', status: 'Applied', recency: '', experience: '', done_via: 'MeowFolio', notes: 'HR Reach Out (LinkedIn)', reachout: 'Yes' },
  { id: 'app-30', user_id: 'guest-user', date: '2026-06-21', job_role: 'MLMachine Learning Engineer (ML / DL / GenAI)', company: 'CapeStart', source: 'LinkedIn Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '', experience: '', done_via: 'MeowFolio', notes: '', reachout: '' },
  { id: 'app-31', user_id: 'guest-user', date: '2026-06-21', job_role: 'AI Engineer [Fresher]', company: 'Add Web Solutions', source: 'LinkedIn Jobs (Career Page)', method: 'Career Page', status: 'Applied', recency: '18', experience: 'Fresher', done_via: 'MeowFolio', notes: 'HR Reach Out (LinkedIn + Cold Email)', reachout: 'Yes' }
];

const INITIAL_OUTREACHES: OutreachContact[] = [
  { id: 'out-1', user_id: 'guest-user', date: '2026-06-21', person: 'Pugazhenthy N', role: 'Founder', company: 'BiztelAI', medium: 'LinkedIn', contact: '', contact2: '', status: '' },
  { id: 'out-2', user_id: 'guest-user', date: '2026-06-21', person: 'Yashashree Bhorkar', role: 'HR', company: 'Tayana Solutions', medium: 'LinkedIn / Cold Email  (Guessed)', contact: 'yashashree.b@tayanasolutions.com,\nyashashree.bhorkar@tayanasolutions.com,\nyashashree@tayanasolutions.com', contact2: '', status: '' },
  { id: 'out-3', user_id: 'guest-user', date: '2026-06-21', person: 'Kriti', role: 'HR (Inferred)', company: 'Netedge Computing Solutions', medium: 'Cold Email / Whatsapp', contact: 'kirti@netedgecomputing.com', contact2: '78388-37993', status: '' },
  { id: 'out-4', user_id: 'guest-user', date: '2026-06-21', person: 'Bhawna Rawat\nTripti Verma', role: 'HR', company: 'TechPerspect', medium: 'LinkedIn / Cold Email (Guessed)', contact: 'bhawna@techperspect.com, \ntripti@techperspect.com\ninfo@techperspect.com\ncontact@techperspect.com', contact2: '', status: '' },
  { id: 'out-5', user_id: 'guest-user', date: '2026-06-21', person: 'Aman S.', role: 'Talent Acquisition Professional', company: 'TresVista', medium: 'LinkedIn', contact: '', contact2: '', status: 'Connection Accepted' },
  { id: 'out-6', user_id: 'guest-user', date: '2026-06-21', person: 'Ikkjin Ahh', role: 'Founder', company: 'Moloco', medium: 'LinkedIn', contact: '', contact2: '', status: '' },
  { id: 'out-7', user_id: 'guest-user', date: '2026-06-21', person: 'Sagar Tamang', role: 'Engineer/ContentCreator', company: 'TwoSpoonsAI', medium: 'X/LinkedIn', contact: 'sagar.bdr0000@gmail.com', contact2: '9706642743', status: 'Connection Accepted' },
  { id: 'out-8', user_id: 'guest-user', date: '2026-06-21', person: 'santosh bishnoi', role: 'Founder', company: 'TwoSpoonsAI', medium: 'X/LinkedIn', contact: 'santosh@twospoon.ai', contact2: '', status: '' },
  { id: 'out-9', user_id: 'guest-user', date: '2026-06-21', person: 'Leslie Anne', role: 'Talent Acquisition Professional', company: 'Arango', medium: 'LinkedIn', contact: '', contact2: '', status: '' },
  { id: 'out-10', user_id: 'guest-user', date: '2026-06-21', person: 'Ashley Cobb', role: 'Talent Acquisition Professional', company: 'Arango', medium: 'LinkedIn', contact: '', contact2: '', status: '' },
  { id: 'out-11', user_id: 'guest-user', date: '2026-06-21', person: 'Pranav Kumar Jain R.', role: 'Gen AI Engineer', company: 'Arango', medium: 'LinkedIn', contact: '', contact2: '', status: '' },
  { id: 'out-12', user_id: 'guest-user', date: '2026-06-21', person: 'Diego Mende Romero', role: 'Engineering Lead', company: 'Arango', medium: 'LinkedIn', contact: '', contact2: '', status: '' },
  { id: 'out-13', user_id: 'guest-user', date: '2026-06-21', person: 'Sai Bhavana Thirthala', role: 'Gen AI Engineer', company: 'Arango', medium: 'LinkedIn', contact: '', contact2: '', status: '' },
  { id: 'out-14', user_id: 'guest-user', date: '2026-06-21', person: 'Priya Pandey', role: '', company: 'SyanSoft', medium: 'LinkedIn/ColdEmail', contact: 'priya.pandey@syansoft.in', contact2: '', status: '' },
  { id: 'out-15', user_id: 'guest-user', date: '2026-06-21', person: 'Ranjana Raghav', role: 'Cheif of Staff (HR)', company: 'Legistify', medium: 'LinkedIn', contact: '', contact2: '', status: '' },
  { id: 'out-16', user_id: 'guest-user', date: '2026-06-21', person: 'Khushboo Sharma', role: 'IT Recruitment', company: 'Add Web Solution Pvt. Ltd.', medium: 'LinkedIn/ColdEmail', contact: 'khushboo.s@addwebsolution.in', contact2: '8401266922', status: '' },
  { id: 'out-17', user_id: 'guest-user', date: '2026-06-21', person: 'Khushboo Sharma', role: 'Senior Talent Acquisiion _ People Operations Specialist', company: 'Add Web Solution Pvt. Ltd.', medium: 'LinkedIn/ColdEmail', contact: 'hr@addwebsolution.com', contact2: '7929705640', status: '' }
];

// Helper to load/save local storage fallback
function getLocalApplications(): JobApplication[] {
  if (typeof window === 'undefined') return INITIAL_APPLICATIONS;
  const stored = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
    return INITIAL_APPLICATIONS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_APPLICATIONS;
  }
}

function saveLocalApplications(apps: JobApplication[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(apps));
}

function getLocalOutreaches(): OutreachContact[] {
  if (typeof window === 'undefined') return INITIAL_OUTREACHES;
  const stored = localStorage.getItem(STORAGE_KEY_OUTREACHES);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_OUTREACHES, JSON.stringify(INITIAL_OUTREACHES));
    return INITIAL_OUTREACHES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_OUTREACHES;
  }
}

function saveLocalOutreaches(contacts: OutreachContact[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_OUTREACHES, JSON.stringify(contacts));
}

// ─── Service Implementation ──────────────────────────────────────────────────
export const trackerService = {
  // --- JOB APPLICATIONS ---
  async listApplications(): Promise<JobApplication[]> {
    const { isGuestUser, token } = await getAuthDetails();
    if (isGuestUser) {
      return getLocalApplications();
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/job_applications?order=created_at.desc`, {
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
      console.warn('Supabase job_applications query failed, falling back to localStorage:', err);
      return getLocalApplications();
    }
  },

  async saveApplication(app: Partial<JobApplication>): Promise<JobApplication> {
    const { isGuestUser, token, userId } = await getAuthDetails();
    const nowStr = new Date().toISOString();

    if (isGuestUser) {
      const apps = getLocalApplications();
      if (app.id) {
        // Update
        const idx = apps.findIndex(a => a.id === app.id);
        if (idx !== -1) {
          apps[idx] = { ...apps[idx], ...app, updated_at: nowStr };
          saveLocalApplications(apps);
          return apps[idx];
        }
      }
      // Insert
      const newApp: JobApplication = {
        id: app.id || `app-mock-${Date.now()}`,
        user_id: userId,
        date: app.date || new Date().toISOString().split('T')[0],
        job_role: app.job_role || '',
        company: app.company || '',
        source: app.source || '',
        method: app.method || '',
        status: app.status || 'Applied',
        recency: app.recency || '1',
        experience: app.experience || '',
        done_via: app.done_via || 'MeowFolio',
        notes: app.notes || '',
        reachout: app.reachout || '',
        created_at: nowStr,
        updated_at: nowStr,
      };
      apps.unshift(newApp);
      saveLocalApplications(apps);
      return newApp;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    try {
      const isUpdate = !!app.id;
      const url = isUpdate
        ? `${supabaseUrl}/rest/v1/job_applications?id=eq.${app.id}`
        : `${supabaseUrl}/rest/v1/job_applications`;

      const body = isUpdate
        ? { ...app, updated_at: nowStr }
        : {
            ...app,
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
      console.warn('Supabase job_applications save failed, falling back to localStorage:', err);
      // Fallback update/insert in localStorage
      const apps = getLocalApplications();
      if (app.id) {
        const idx = apps.findIndex(a => a.id === app.id);
        if (idx !== -1) {
          apps[idx] = { ...apps[idx], ...app, updated_at: nowStr };
          saveLocalApplications(apps);
          return apps[idx];
        }
      }
      const newApp: JobApplication = {
        id: app.id || `app-mock-${Date.now()}`,
        user_id: userId,
        date: app.date || new Date().toISOString().split('T')[0],
        job_role: app.job_role || '',
        company: app.company || '',
        source: app.source || '',
        method: app.method || '',
        status: app.status || 'Applied',
        recency: app.recency || '1',
        experience: app.experience || '',
        done_via: app.done_via || 'MeowFolio',
        notes: app.notes || '',
        reachout: app.reachout || '',
        created_at: nowStr,
        updated_at: nowStr,
      };
      apps.unshift(newApp);
      saveLocalApplications(apps);
      return newApp;
    }
  },

  async deleteApplication(id: string): Promise<void> {
    const { isGuestUser, token } = await getAuthDetails();
    if (isGuestUser) {
      const apps = getLocalApplications();
      const nextApps = apps.filter(a => a.id !== id);
      saveLocalApplications(nextApps);
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/job_applications?id=eq.${id}`, {
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
      console.warn('Supabase job_applications delete failed, falling back to localStorage:', err);
      const apps = getLocalApplications();
      const nextApps = apps.filter(a => a.id !== id);
      saveLocalApplications(nextApps);
    }
  },

  // --- OUTREACH CONTACTS ---
  async listOutreaches(): Promise<OutreachContact[]> {
    const { isGuestUser, token } = await getAuthDetails();
    if (isGuestUser) {
      return getLocalOutreaches();
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/outreach_contacts?order=created_at.desc`, {
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
      console.warn('Supabase outreach_contacts query failed, falling back to localStorage:', err);
      return getLocalOutreaches();
    }
  },

  async saveOutreach(outreach: Partial<OutreachContact>): Promise<OutreachContact> {
    const { isGuestUser, token, userId } = await getAuthDetails();
    const nowStr = new Date().toISOString();

    if (isGuestUser) {
      const contacts = getLocalOutreaches();
      if (outreach.id) {
        const idx = contacts.findIndex(c => c.id === outreach.id);
        if (idx !== -1) {
          contacts[idx] = { ...contacts[idx], ...outreach, updated_at: nowStr };
          saveLocalOutreaches(contacts);
          return contacts[idx];
        }
      }
      const newContact: OutreachContact = {
        id: outreach.id || `out-mock-${Date.now()}`,
        user_id: userId,
        date: outreach.date || new Date().toISOString().split('T')[0],
        person: outreach.person || '',
        role: outreach.role || '',
        company: outreach.company || '',
        medium: outreach.medium || '',
        contact: outreach.contact || '',
        contact2: outreach.contact2 || '',
        status: outreach.status || '',
        created_at: nowStr,
        updated_at: nowStr,
      };
      contacts.unshift(newContact);
      saveLocalOutreaches(contacts);
      return newContact;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    try {
      const isUpdate = !!outreach.id;
      const url = isUpdate
        ? `${supabaseUrl}/rest/v1/outreach_contacts?id=eq.${outreach.id}`
        : `${supabaseUrl}/rest/v1/outreach_contacts`;

      const body = isUpdate
        ? { ...outreach, updated_at: nowStr }
        : {
            ...outreach,
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
      console.warn('Supabase outreach_contacts save failed, falling back to localStorage:', err);
      const contacts = getLocalOutreaches();
      if (outreach.id) {
        const idx = contacts.findIndex(c => c.id === outreach.id);
        if (idx !== -1) {
          contacts[idx] = { ...contacts[idx], ...outreach, updated_at: nowStr };
          saveLocalOutreaches(contacts);
          return contacts[idx];
        }
      }
      const newContact: OutreachContact = {
        id: outreach.id || `out-mock-${Date.now()}`,
        user_id: userId,
        date: outreach.date || new Date().toISOString().split('T')[0],
        person: outreach.person || '',
        role: outreach.role || '',
        company: outreach.company || '',
        medium: outreach.medium || '',
        contact: outreach.contact || '',
        contact2: outreach.contact2 || '',
        status: outreach.status || '',
        created_at: nowStr,
        updated_at: nowStr,
      };
      contacts.unshift(newContact);
      saveLocalOutreaches(contacts);
      return newContact;
    }
  },

  async deleteOutreach(id: string): Promise<void> {
    const { isGuestUser, token } = await getAuthDetails();
    if (isGuestUser) {
      const contacts = getLocalOutreaches();
      const nextContacts = contacts.filter(c => c.id !== id);
      saveLocalOutreaches(nextContacts);
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/outreach_contacts?id=eq.${id}`, {
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
      console.warn('Supabase outreach_contacts delete failed, falling back to localStorage:', err);
      const contacts = getLocalOutreaches();
      const nextContacts = contacts.filter(c => c.id !== id);
      saveLocalOutreaches(nextContacts);
    }
  },
};
