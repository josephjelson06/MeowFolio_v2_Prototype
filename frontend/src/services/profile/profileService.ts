import { supabase } from 'lib/supabase';
import { APP_LIMITS } from 'lib/constants';
import type { ProfileSummary, UsageMetric } from 'types/ui';

export const profileService = {
  async getSummary(): Promise<ProfileSummary> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { name: 'Guest', email: '', plan: 'Free Plan', memberSince: '' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('name, plan, created_at')
      .eq('id', user.id)
      .single();

    const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date();
    const memberSince = createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    return {
      name: profile?.name ?? user.user_metadata?.full_name ?? 'User',
      email: user.email ?? '',
      plan: `${(profile?.plan ?? 'free').charAt(0).toUpperCase()}${(profile?.plan ?? 'free').slice(1)} Plan`,
      memberSince,
    };
  },

  async getUsage(): Promise<UsageMetric[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    const credits = profile?.credits ?? APP_LIMITS.freeCredits;
    const used = APP_LIMITS.freeCredits - credits;

    return [
      { label: 'AI credits used', used, total: APP_LIMITS.freeCredits },
      { label: 'Resume imports', used: 0, total: APP_LIMITS.maxResumeImports },
      { label: 'JD imports', used: 0, total: APP_LIMITS.maxJdImports },
    ];
  },
};
