import { supabase } from 'lib/supabase';
import { APP_LIMITS } from 'lib/constants';
import type { SessionActor } from 'types/session';

export const sessionService = {
  /**
   * Check for an existing Supabase session and return the actor.
   * If no session exists, returns null (user is not logged in).
   */
  async bootstrap(): Promise<SessionActor | null> {
    if (typeof window !== 'undefined' && window.localStorage.getItem('TEST_SEAM_ACTIVE') === 'true') {
      return {
        id: 'test-seam-mock-id',
        name: 'Test Agent (Seam)',
        email: 'test@testsprite.local',
        avatarUrl: null,
        credits: APP_LIMITS.freeCredits,
        plan: 'free',
      };
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const user = session.user;

    // Fetch the profile row (created automatically by the DB trigger on signup)
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, avatar_url, plan, credits')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      name: profile?.name ?? user.user_metadata?.full_name ?? null,
      email: user.email ?? null,
      avatarUrl: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
      credits: profile?.credits ?? APP_LIMITS.freeCredits,
      plan: profile?.plan ?? 'free',
    };
  },

  /**
   * Initiate Google OAuth sign-in via Supabase.
   * Opens a popup/redirect to Google. After approval, the user is redirected
   * back to /auth/callback which exchanges the code for a session.
   */
  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  },

  /**
   * Sign out the current user. Clears the Supabase session.
   */
  async signOut() {
    if (typeof window !== 'undefined' && window.localStorage.getItem('TEST_SEAM_ACTIVE') === 'true') {
      window.localStorage.removeItem('TEST_SEAM_ACTIVE');
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Re-fetch the profile to get updated credits/plan.
   * Returns the updated actor or null if not logged in.
   */
  async refreshProfile(): Promise<SessionActor | null> {
    return this.bootstrap();
  },
};
