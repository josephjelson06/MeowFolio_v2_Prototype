import { supabase } from 'lib/supabase';
import type { UserProfile, SkillGroup } from 'types/userProfile';

const LS_KEY = 'meowfolio:user-profile';

function uid(): string {
  return crypto.randomUUID();
}

/** Default skill groups seeded for every new profile */
function defaultSkillGroups(): SkillGroup[] {
  return [
    { id: uid(), category: 'Programming Languages', skills: '' },
    { id: uid(), category: 'Frameworks & Libraries', skills: '' },
    { id: uid(), category: 'Tools & Technologies', skills: '' },
  ];
}

export const DEFAULT_PROFILE: UserProfile = {
  fullName: '',
  phone: '',
  location: '',
  linkedIn: '',
  github: '',
  portfolio: '',
  defaultTitle: '',
  summary: '',
  education: [],
  experience: [],
  projects: [],
  skillGroups: defaultSkillGroups(),
  achievements: [],
  updatedAt: '',
};

export const userProfileService = {
  /** Load the user's rich profile. Priority: Supabase → localStorage → DEFAULT_PROFILE */
  async get(): Promise<UserProfile> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('profile_data')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data?.profile_data) {
          return data.profile_data as UserProfile;
        }
      }
    } catch {
      // fall through to localStorage
    }

    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as UserProfile;
      } catch {
        // fall through to default
      }
    }

    return { ...DEFAULT_PROFILE, skillGroups: defaultSkillGroups() };
  },

  /** Save the user's rich profile. Always writes to localStorage; attempts Supabase upsert. */
  async save(profile: UserProfile): Promise<void> {
    const updated: UserProfile = { ...profile, updatedAt: new Date().toISOString() };

    // Always persist locally first
    localStorage.setItem(LS_KEY, JSON.stringify(updated));

    // Best-effort Supabase upsert
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_profiles').upsert(
          { user_id: user.id, profile_data: updated, updated_at: updated.updatedAt },
          { onConflict: 'user_id' },
        );
      }
    } catch {
      // localStorage already saved — silently ignore DB errors
    }
  },
};
