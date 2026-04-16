function envInt(key: string, fallback: number): number {
  const raw = import.meta.env[key];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const APP_LIMITS = {
  /** Default credit allocation for free-tier users */
  freeCredits: envInt('VITE_FREE_CREDITS', 20),

  /** Max number of resume imports (AI-parsed) per account */
  maxResumeImports: envInt('VITE_MAX_RESUME_IMPORTS', 10),

  /** Max number of JD imports (AI-parsed) per account */
  maxJdImports: envInt('VITE_MAX_JD_IMPORTS', 10),
} as const;
