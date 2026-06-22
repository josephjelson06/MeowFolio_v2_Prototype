import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { cn } from 'lib/cn';
import { WorkspaceBadge } from 'components/workspace/WorkspaceBadge';
import { WorkspaceShell } from 'components/workspace/WorkspaceShell';
import { profileService } from 'services/profileService';
import { userProfileService } from 'services/profile/userProfileService';
import { useSession } from 'state/session/sessionContext';
import { useUiContext } from 'state/ui/uiContext';
import type { ProfileSummary, UsageMetric } from 'types/ui';
import type {
  UserProfile,
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  SkillGroup,
  AchievementEntry,
} from 'types/userProfile';

// ── Empty entry factories ──────────────────────────────────────────────────────
const emptyEdu = (): EducationEntry => ({
  id: crypto.randomUUID(), institution: '', degree: '', field: '',
  startDate: '', endDate: '', gpa: '', location: '',
});
const emptyExp = (): ExperienceEntry => ({
  id: crypto.randomUUID(), company: '', role: '', startDate: '', endDate: '',
  location: '', current: false, bullets: ['', '', ''],
});
const emptyProj = (): ProjectEntry => ({
  id: crypto.randomUUID(), name: '', description: '', techStack: '',
  link: '', startDate: '', endDate: '',
});
const emptyAch = (): AchievementEntry => ({
  id: crypto.randomUUID(), title: '', issuer: '', date: '', description: '',
});

// ── Shared UI helpers ──────────────────────────────────────────────────────────
function Btn({
  children, onClick, variant = 'primary', small = false, type = 'button', disabled = false,
}: {
  children: ReactNode; onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  small?: boolean; type?: 'button' | 'submit'; disabled?: boolean;
}) {
  const base =
    'inline-flex items-center gap-1.5 rounded-full border-2 border-charcoal font-headline font-bold tracking-[0.01em] transition duration-150 ease-out shadow-tactile-sm hover:-translate-x-px hover:-translate-y-px active:translate-x-px active:translate-y-px active:shadow-none disabled:opacity-50 disabled:pointer-events-none';
  const sz = small ? 'px-3 py-1.5 text-[10px]' : 'px-4 py-2 text-xs';
  const v = {
    primary:   'bg-white/95 text-on-surface hover:bg-surface-container-low hover:text-primary hover:shadow-tactile',
    secondary: 'bg-white/70 text-[color:var(--txt1)] hover:bg-white',
    danger:    'border-error/50 bg-error-container/60 text-error',
    ghost:     'border-transparent bg-transparent shadow-none hover:bg-white/50',
  }[variant];
  return (
    <button className={cn(base, sz, v)} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Field({
  label, value, onChange, placeholder = '', type = 'text', readOnly = false,
}: {
  label: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; type?: string; readOnly?: boolean;
}) {
  return (
    <div className="grid gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">{label}</label>
      <input
        className={cn(
          'w-full rounded-xl border border-charcoal/20 bg-white/60 px-3 py-2 text-sm font-medium text-on-surface placeholder:text-[color:var(--txt2)]/40 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition',
          readOnly && 'cursor-not-allowed opacity-60',
        )}
        placeholder={placeholder} readOnly={readOnly} type={type} value={value}
        onChange={e => onChange?.(e.target.value)}
      />
    </div>
  );
}

function TArea({
  label, value, onChange, placeholder = '', rows = 4,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div className="grid gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">{label}</label>
      <textarea
        className="w-full resize-none rounded-xl border border-charcoal/20 bg-white/60 px-3 py-2 text-sm font-medium text-on-surface placeholder:text-[color:var(--txt2)]/40 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition"
        placeholder={placeholder} rows={rows} value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

function SectionCard({
  title, icon, onEdit, editMode = false, children,
}: {
  title: string; icon: string; onEdit?: () => void; editMode?: boolean; children: ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/85 p-5 shadow-tactile md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{title}</span>
        </div>
        {onEdit && !editMode && (
          <Btn variant="ghost" small onClick={onEdit}>✏️ Edit</Btn>
        )}
      </div>
      {children}
    </section>
  );
}

// ── Inline form sub-components ─────────────────────────────────────────────────
function EduForm({
  value, saving, onChange, onSave, onCancel,
}: {
  value: EducationEntry; saving: boolean;
  onChange: (v: EducationEntry) => void; onSave: () => void; onCancel: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-primary/20 bg-white/60 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Institution *" value={value.institution} placeholder="IIT Bombay"
          onChange={v => onChange({ ...value, institution: v })} />
        <Field label="Degree *" value={value.degree} placeholder="B.Tech"
          onChange={v => onChange({ ...value, degree: v })} />
        <Field label="Field of Study" value={value.field} placeholder="Computer Science"
          onChange={v => onChange({ ...value, field: v })} />
        <Field label="Location" value={value.location} placeholder="Mumbai, India"
          onChange={v => onChange({ ...value, location: v })} />
        <Field label="Start Date" value={value.startDate} placeholder="Aug 2020"
          onChange={v => onChange({ ...value, startDate: v })} />
        <Field label="End Date (or 'Present')" value={value.endDate} placeholder="May 2024"
          onChange={v => onChange({ ...value, endDate: v })} />
        <Field label="GPA / CGPA" value={value.gpa} placeholder="9.2 / 10"
          onChange={v => onChange({ ...value, gpa: v })} />
      </div>
      <div className="flex gap-2">
        <Btn onClick={onSave} disabled={saving || !value.institution.trim()}>💾 Save</Btn>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  );
}

function ExpForm({
  value, saving, onChange, onSave, onCancel,
}: {
  value: ExperienceEntry; saving: boolean;
  onChange: (v: ExperienceEntry) => void; onSave: () => void; onCancel: () => void;
}) {
  const setBullet = (i: number, text: string) => {
    const bullets = [...value.bullets];
    bullets[i] = text;
    onChange({ ...value, bullets });
  };
  return (
    <div className="grid gap-3 rounded-2xl border border-primary/20 bg-white/60 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Company *" value={value.company} placeholder="Google"
          onChange={v => onChange({ ...value, company: v })} />
        <Field label="Role / Title *" value={value.role} placeholder="Software Engineer"
          onChange={v => onChange({ ...value, role: v })} />
        <Field label="Location" value={value.location} placeholder="Bangalore, India"
          onChange={v => onChange({ ...value, location: v })} />
        <Field label="Start Date" value={value.startDate} placeholder="Jun 2022"
          onChange={v => onChange({ ...value, startDate: v })} />
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <Field label="End Date" value={value.endDate} placeholder="May 2024"
              onChange={v => onChange({ ...value, endDate: v })} />
          </div>
          <label className="flex cursor-pointer items-center gap-1.5 pb-2.5 text-[10px] font-bold text-[color:var(--txt2)]">
            <input
              type="checkbox" checked={value.current}
              onChange={e => onChange({ ...value, current: e.target.checked, endDate: e.target.checked ? '' : value.endDate })}
            />
            Current
          </label>
        </div>
      </div>
      <div className="grid gap-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
          Bullet Points <span className="normal-case font-normal">(3–4 recommended · Action → What → Impact)</span>
        </div>
        {value.bullets.map((b, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-2.5 shrink-0 font-bold text-primary">•</span>
            <textarea
              className="flex-1 resize-none rounded-xl border border-charcoal/20 bg-white/60 px-3 py-2 text-sm font-medium text-on-surface placeholder:text-[color:var(--txt2)]/40 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition"
              placeholder={i === 0 ? 'Built / Developed / Led...' : i === 2 ? 'Reduced latency by 40%, saving $500K annually...' : 'Describe responsibility or impact...'}
              rows={2} value={b}
              onChange={e => setBullet(i, e.target.value)}
            />
          </div>
        ))}
        {value.bullets.length < 6 && (
          <button
            className="text-left text-[10px] font-bold text-primary hover:underline"
            type="button"
            onClick={() => onChange({ ...value, bullets: [...value.bullets, ''] })}
          >+ Add bullet</button>
        )}
      </div>
      <div className="flex gap-2">
        <Btn onClick={onSave} disabled={saving || !value.company.trim()}>💾 Save</Btn>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  );
}

function ProjForm({
  value, saving, onChange, onSave, onCancel,
}: {
  value: ProjectEntry; saving: boolean;
  onChange: (v: ProjectEntry) => void; onSave: () => void; onCancel: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-primary/20 bg-white/60 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Project Name *" value={value.name} placeholder="MeowFolio"
          onChange={v => onChange({ ...value, name: v })} />
        <Field label="Tech Stack (comma-separated)" value={value.techStack} placeholder="React, FastAPI, PostgreSQL"
          onChange={v => onChange({ ...value, techStack: v })} />
        <Field label="Link / GitHub URL" value={value.link} placeholder="github.com/you/project"
          onChange={v => onChange({ ...value, link: v })} />
        <Field label="Start Date" value={value.startDate} placeholder="Jan 2024"
          onChange={v => onChange({ ...value, startDate: v })} />
        <Field label="End Date (or 'Present')" value={value.endDate} placeholder="Mar 2024"
          onChange={v => onChange({ ...value, endDate: v })} />
      </div>
      <TArea label="Description" value={value.description} placeholder="Built a full-stack AI portfolio platform that..." rows={3}
        onChange={v => onChange({ ...value, description: v })} />
      <div className="flex gap-2">
        <Btn onClick={onSave} disabled={saving || !value.name.trim()}>💾 Save</Btn>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  );
}

function AchForm({
  value, saving, onChange, onSave, onCancel,
}: {
  value: AchievementEntry; saving: boolean;
  onChange: (v: AchievementEntry) => void; onSave: () => void; onCancel: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-primary/20 bg-white/60 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title *" value={value.title} placeholder="Winner – Smart India Hackathon"
          onChange={v => onChange({ ...value, title: v })} />
        <Field label="Issuer / Organisation" value={value.issuer} placeholder="AICTE"
          onChange={v => onChange({ ...value, issuer: v })} />
        <Field label="Date" value={value.date} placeholder="Nov 2023"
          onChange={v => onChange({ ...value, date: v })} />
      </div>
      <TArea label="Description" value={value.description} placeholder="Brief explanation of the achievement or what was certified..." rows={2}
        onChange={v => onChange({ ...value, description: v })} />
      <div className="flex gap-2">
        <Btn onClick={onSave} disabled={saving || !value.title.trim()}>💾 Save</Btn>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { actor, initials, credits, plan } = useSession();
  const { openLogout } = useUiContext();

  // ── Platform data (existing) ───────────────────────────────────────────
  const [summary, setSummary] = useState<ProfileSummary>({ name: 'User', email: '', plan: 'Free Plan', memberSince: '' });
  const [usage, setUsage] = useState<UsageMetric[]>([]);

  // ── Rich profile data (new) ────────────────────────────────────────────
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '', phone: '', location: '', linkedIn: '', github: '', portfolio: '',
    defaultTitle: '', summary: '',
    education: [], experience: [], projects: [],
    skillGroups: [], achievements: [],
    updatedAt: '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // ── Simple-section edit modes ──────────────────────────────────────────
  const [editContact, setEditContact] = useState(false);
  const [editProfessional, setEditProfessional] = useState(false);
  const [editSkills, setEditSkills] = useState(false);

  // ── Simple-section drafts ──────────────────────────────────────────────
  const [contactDraft, setContactDraft] = useState({ fullName: '', phone: '', location: '', linkedIn: '', github: '', portfolio: '' });
  const [profDraft, setProfDraft] = useState({ defaultTitle: '', summary: '' });
  const [skillsDraft, setSkillsDraft] = useState<SkillGroup[]>([]);

  // ── List-section add/edit states ───────────────────────────────────────
  const [eduEditId, setEduEditId] = useState<string | null>(null);
  const [eduAddMode, setEduAddMode] = useState(false);
  const [eduForm, setEduForm] = useState<EducationEntry>(emptyEdu());

  const [expEditId, setExpEditId] = useState<string | null>(null);
  const [expAddMode, setExpAddMode] = useState(false);
  const [expForm, setExpForm] = useState<ExperienceEntry>(emptyExp());

  const [projEditId, setProjEditId] = useState<string | null>(null);
  const [projAddMode, setProjAddMode] = useState(false);
  const [projForm, setProjForm] = useState<ProjectEntry>(emptyProj());

  const [achEditId, setAchEditId] = useState<string | null>(null);
  const [achAddMode, setAchAddMode] = useState(false);
  const [achForm, setAchForm] = useState<AchievementEntry>(emptyAch());

  // ── Load on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const [nextSummary, nextUsage, nextProfile] = await Promise.all([
        profileService.getSummary(),
        profileService.getUsage(),
        userProfileService.get(),
      ]);
      setSummary(nextSummary);
      setUsage(nextUsage);
      // Auto-seed fullName from session if profile is blank
      const seeded: UserProfile = {
        ...nextProfile,
        fullName: nextProfile.fullName || actor?.name || '',
      };
      setProfile(seeded);
    }
    void load();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const persist = async (patch: Partial<UserProfile>) => {
    setSaving(true);
    const updated = { ...profile, ...patch };
    setProfile(updated);
    try {
      await userProfileService.save(updated);
      showToast('Saved ✓');
    } catch {
      showToast('Save failed — try again');
    } finally {
      setSaving(false);
    }
  };

  // ── Contact helpers ────────────────────────────────────────────────────
  const openContactEdit = () => {
    setContactDraft({ fullName: profile.fullName, phone: profile.phone, location: profile.location, linkedIn: profile.linkedIn, github: profile.github, portfolio: profile.portfolio });
    setEditContact(true);
  };

  // ── Professional helpers ───────────────────────────────────────────────
  const openProfEdit = () => {
    setProfDraft({ defaultTitle: profile.defaultTitle, summary: profile.summary });
    setEditProfessional(true);
  };

  // ── Skills helpers ─────────────────────────────────────────────────────
  const openSkillsEdit = () => {
    setSkillsDraft(profile.skillGroups.map(g => ({ ...g })));
    setEditSkills(true);
  };

  // ── List save/delete helpers ───────────────────────────────────────────
  const saveEdu = (entry: EducationEntry) => {
    const list = profile.education.some(e => e.id === entry.id)
      ? profile.education.map(e => e.id === entry.id ? entry : e)
      : [...profile.education, entry];
    void persist({ education: list });
    setEduEditId(null); setEduAddMode(false); setEduForm(emptyEdu());
  };
  const deleteEdu = (id: string) => void persist({ education: profile.education.filter(e => e.id !== id) });

  const saveExp = (entry: ExperienceEntry) => {
    const cleaned = { ...entry, bullets: entry.bullets.filter(b => b.trim()) };
    const list = profile.experience.some(e => e.id === entry.id)
      ? profile.experience.map(e => e.id === entry.id ? cleaned : e)
      : [...profile.experience, cleaned];
    void persist({ experience: list });
    setExpEditId(null); setExpAddMode(false); setExpForm(emptyExp());
  };
  const deleteExp = (id: string) => void persist({ experience: profile.experience.filter(e => e.id !== id) });

  const saveProj = (entry: ProjectEntry) => {
    const list = profile.projects.some(p => p.id === entry.id)
      ? profile.projects.map(p => p.id === entry.id ? entry : p)
      : [...profile.projects, entry];
    void persist({ projects: list });
    setProjEditId(null); setProjAddMode(false); setProjForm(emptyProj());
  };
  const deleteProj = (id: string) => void persist({ projects: profile.projects.filter(p => p.id !== id) });

  const saveAch = (entry: AchievementEntry) => {
    const list = profile.achievements.some(a => a.id === entry.id)
      ? profile.achievements.map(a => a.id === entry.id ? entry : a)
      : [...profile.achievements, entry];
    void persist({ achievements: list });
    setAchEditId(null); setAchAddMode(false); setAchForm(emptyAch());
  };
  const deleteAch = (id: string) => void persist({ achievements: profile.achievements.filter(a => a.id !== id) });

  // ── JSX ───────────────────────────────────────────────────────────────
  return (
    <WorkspaceShell title="Profile">
      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-charcoal/10 bg-on-surface px-5 py-2.5 text-xs font-bold text-background shadow-tactile">
          {toast}
        </div>
      )}

      <div className="grid gap-6">

        {/* ── Identity Hero ─────────────────────────────────────────────── */}
        <section className="flex flex-col gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/85 p-5 shadow-tactile md:flex-row md:items-center md:gap-6 md:p-6">
          <div className="grid size-16 shrink-0 place-items-center rounded-full border border-outline bg-surface text-xl font-semibold text-secondary">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap gap-2">
              <WorkspaceBadge variant="accent">{summary.plan.toUpperCase()}</WorkspaceBadge>
              {summary.memberSince && (
                <WorkspaceBadge variant="info">{`MEMBER SINCE ${summary.memberSince.toUpperCase()}`}</WorkspaceBadge>
              )}
            </div>
            <div className="font-headline text-xl font-extrabold text-on-surface">{actor?.name ?? summary.name}</div>
            <div className="mt-0.5 text-sm text-[color:var(--txt2)]">{actor?.email ?? summary.email}</div>
            {profile.defaultTitle && (
              <div className="mt-1 text-xs font-semibold text-primary">{profile.defaultTitle}</div>
            )}
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-error/50 bg-error-container/60 px-5 py-2.5 text-xs font-headline font-bold text-error shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px active:translate-x-px active:translate-y-px active:shadow-none"
            type="button"
            onClick={openLogout}
          >
            Logout
          </button>
        </section>

        {/* ── Contact & Links ───────────────────────────────────────────── */}
        <SectionCard title="Contact & Links" icon="📋" editMode={editContact} onEdit={openContactEdit}>
          {editContact ? (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" value={contactDraft.fullName} placeholder="Joseph Jelson"
                  onChange={v => setContactDraft(d => ({ ...d, fullName: v }))} />
                <Field label="Email (from account)" value={actor?.email ?? ''} readOnly />
                <Field label="Phone" value={contactDraft.phone} placeholder="+91 98765 43210"
                  onChange={v => setContactDraft(d => ({ ...d, phone: v }))} />
                <Field label="Location" value={contactDraft.location} placeholder="Mumbai, India"
                  onChange={v => setContactDraft(d => ({ ...d, location: v }))} />
                <Field label="LinkedIn URL" value={contactDraft.linkedIn} placeholder="linkedin.com/in/username" type="url"
                  onChange={v => setContactDraft(d => ({ ...d, linkedIn: v }))} />
                <Field label="GitHub URL" value={contactDraft.github} placeholder="github.com/username" type="url"
                  onChange={v => setContactDraft(d => ({ ...d, github: v }))} />
                <Field label="Portfolio / Website" value={contactDraft.portfolio} placeholder="yoursite.dev" type="url"
                  onChange={v => setContactDraft(d => ({ ...d, portfolio: v }))} />
              </div>
              <div className="flex gap-2 pt-1">
                <Btn disabled={saving} onClick={() => { void persist(contactDraft); setEditContact(false); }}>💾 Save</Btn>
                <Btn variant="secondary" onClick={() => setEditContact(false)}>Cancel</Btn>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                { label: 'Phone',     value: profile.phone,     icon: '📞' },
                { label: 'Location',  value: profile.location,  icon: '📍' },
                { label: 'LinkedIn',  value: profile.linkedIn,  icon: '🔗' },
                { label: 'GitHub',    value: profile.github,    icon: '💻' },
                { label: 'Portfolio', value: profile.portfolio, icon: '🌐' },
              ] as const).map(({ label, value, icon }) => (
                <div key={label} className="flex items-start gap-2">
                  <span className="mt-0.5 text-sm">{icon}</span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">{label}</div>
                    {value ? (
                      <div className="truncate text-sm font-medium text-on-surface">{value}</div>
                    ) : (
                      <div className="text-sm italic text-[color:var(--txt2)]/40">Not set</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── Professional Identity ──────────────────────────────────────── */}
        <SectionCard title="Professional Identity" icon="🎯" editMode={editProfessional} onEdit={openProfEdit}>
          {editProfessional ? (
            <div className="grid gap-4">
              <Field label="Default Job Title" value={profDraft.defaultTitle} placeholder="AI / ML Engineer"
                onChange={v => setProfDraft(d => ({ ...d, defaultTitle: v }))} />
              <TArea
                label="Professional Summary (3–5 lines · opens with strong adjective / verb)"
                value={profDraft.summary}
                placeholder="Results-driven AI engineer with 3+ years building scalable ML systems..."
                rows={5}
                onChange={v => setProfDraft(d => ({ ...d, summary: v }))}
              />
              <div className="flex gap-2 pt-1">
                <Btn disabled={saving} onClick={() => { void persist(profDraft); setEditProfessional(false); }}>💾 Save</Btn>
                <Btn variant="secondary" onClick={() => setEditProfessional(false)}>Cancel</Btn>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {profile.defaultTitle ? (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">Default Title</div>
                  <span className="mt-1 inline-block rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-sm font-bold text-primary">
                    {profile.defaultTitle}
                  </span>
                </div>
              ) : (
                <div className="text-sm italic text-[color:var(--txt2)]/40">No job title set — click Edit to add</div>
              )}
              {profile.summary ? (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">Summary</div>
                  <p className="mt-1 text-sm leading-relaxed text-[color:var(--txt1)]">{profile.summary}</p>
                </div>
              ) : (
                <div className="text-sm italic text-[color:var(--txt2)]/40">No summary added yet</div>
              )}
            </div>
          )}
        </SectionCard>

        {/* ── Education ─────────────────────────────────────────────────── */}
        <SectionCard title="Education" icon="🎓">
          <div className="grid gap-3">
            {profile.education.map(edu => (
              <div key={edu.id}>
                {eduEditId === edu.id ? (
                  <EduForm value={eduForm} saving={saving} onChange={setEduForm}
                    onSave={() => saveEdu(eduForm)}
                    onCancel={() => { setEduEditId(null); setEduForm(emptyEdu()); }} />
                ) : (
                  <div className="flex items-start gap-3 rounded-2xl border border-charcoal/10 bg-white/50 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-headline text-sm font-bold text-on-surface">{edu.institution}</div>
                      <div className="text-xs text-[color:var(--txt1)]">
                        {edu.degree}{edu.field ? ` · ${edu.field}` : ''}
                      </div>
                      <div className="mt-0.5 text-[10px] text-[color:var(--txt2)]">
                        {edu.startDate}{edu.endDate ? ` → ${edu.endDate}` : ''}
                        {edu.location ? ` · ${edu.location}` : ''}
                        {edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <Btn variant="ghost" small
                        onClick={() => { setEduForm({ ...edu }); setEduEditId(edu.id); setEduAddMode(false); }}>✏️</Btn>
                      <Btn variant="danger" small onClick={() => deleteEdu(edu.id)}>🗑️</Btn>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {eduAddMode && (
              <EduForm value={eduForm} saving={saving} onChange={setEduForm}
                onSave={() => saveEdu(eduForm)}
                onCancel={() => { setEduAddMode(false); setEduForm(emptyEdu()); }} />
            )}
            {!eduAddMode && !eduEditId && (
              <Btn variant="secondary"
                onClick={() => { setEduForm(emptyEdu()); setEduAddMode(true); }}>
                + Add Education
              </Btn>
            )}
          </div>
        </SectionCard>

        {/* ── Work Experience ───────────────────────────────────────────── */}
        <SectionCard title="Work Experience" icon="💼">
          <div className="grid gap-3">
            {profile.experience.map(exp => (
              <div key={exp.id}>
                {expEditId === exp.id ? (
                  <ExpForm value={expForm} saving={saving} onChange={setExpForm}
                    onSave={() => saveExp(expForm)}
                    onCancel={() => { setExpEditId(null); setExpForm(emptyExp()); }} />
                ) : (
                  <div className="flex items-start gap-3 rounded-2xl border border-charcoal/10 bg-white/50 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-headline text-sm font-bold text-on-surface">{exp.role}</div>
                      <div className="text-xs text-[color:var(--txt1)]">
                        {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                      </div>
                      <div className="mt-0.5 text-[10px] text-[color:var(--txt2)]">
                        {exp.startDate}{exp.current ? ' → Present' : exp.endDate ? ` → ${exp.endDate}` : ''}
                      </div>
                      {exp.bullets.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {exp.bullets.slice(0, 2).map((b, i) => (
                            <li key={i} className="flex gap-1.5 text-[11px] text-[color:var(--txt2)]">
                              <span className="mt-0.5 shrink-0 text-primary">•</span>
                              <span className="line-clamp-1">{b}</span>
                            </li>
                          ))}
                          {exp.bullets.length > 2 && (
                            <li className="text-[10px] text-[color:var(--txt2)]/50">
                              +{exp.bullets.length - 2} more bullet{exp.bullets.length - 2 > 1 ? 's' : ''}
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <Btn variant="ghost" small
                        onClick={() => { setExpForm({ ...exp, bullets: [...exp.bullets] }); setExpEditId(exp.id); setExpAddMode(false); }}>✏️</Btn>
                      <Btn variant="danger" small onClick={() => deleteExp(exp.id)}>🗑️</Btn>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {expAddMode && (
              <ExpForm value={expForm} saving={saving} onChange={setExpForm}
                onSave={() => saveExp(expForm)}
                onCancel={() => { setExpAddMode(false); setExpForm(emptyExp()); }} />
            )}
            {!expAddMode && !expEditId && (
              <Btn variant="secondary"
                onClick={() => { setExpForm(emptyExp()); setExpAddMode(true); }}>
                + Add Experience
              </Btn>
            )}
          </div>
        </SectionCard>

        {/* ── Projects ──────────────────────────────────────────────────── */}
        <SectionCard title="Projects" icon="🚀">
          <div className="grid gap-3">
            {profile.projects.map(proj => (
              <div key={proj.id}>
                {projEditId === proj.id ? (
                  <ProjForm value={projForm} saving={saving} onChange={setProjForm}
                    onSave={() => saveProj(projForm)}
                    onCancel={() => { setProjEditId(null); setProjForm(emptyProj()); }} />
                ) : (
                  <div className="flex items-start gap-3 rounded-2xl border border-charcoal/10 bg-white/50 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-headline text-sm font-bold text-on-surface">{proj.name}</div>
                      {proj.techStack && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {proj.techStack.split(',').slice(0, 5).map(t => (
                            <span key={t.trim()} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                              {t.trim()}
                            </span>
                          ))}
                          {proj.techStack.split(',').length > 5 && (
                            <span className="text-[10px] text-[color:var(--txt2)]/50 px-1">
                              +{proj.techStack.split(',').length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                      {proj.description && (
                        <p className="mt-1.5 line-clamp-2 text-[11px] text-[color:var(--txt2)]">{proj.description}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <Btn variant="ghost" small
                        onClick={() => { setProjForm({ ...proj }); setProjEditId(proj.id); setProjAddMode(false); }}>✏️</Btn>
                      <Btn variant="danger" small onClick={() => deleteProj(proj.id)}>🗑️</Btn>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {projAddMode && (
              <ProjForm value={projForm} saving={saving} onChange={setProjForm}
                onSave={() => saveProj(projForm)}
                onCancel={() => { setProjAddMode(false); setProjForm(emptyProj()); }} />
            )}
            {!projAddMode && !projEditId && (
              <Btn variant="secondary"
                onClick={() => { setProjForm(emptyProj()); setProjAddMode(true); }}>
                + Add Project
              </Btn>
            )}
          </div>
        </SectionCard>

        {/* ── Skills ────────────────────────────────────────────────────── */}
        <SectionCard title="Skills" icon="⚡" editMode={editSkills} onEdit={openSkillsEdit}>
          {editSkills ? (
            <div className="grid gap-4">
              {skillsDraft.map((group, idx) => (
                <div key={group.id} className="grid gap-2 rounded-2xl border border-charcoal/10 bg-white/50 p-3">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Field label="Category" value={group.category} placeholder="Programming Languages"
                        onChange={v => setSkillsDraft(prev => prev.map((g, i) => i === idx ? { ...g, category: v } : g))} />
                    </div>
                    <button
                      className="mb-0.5 rounded-full border border-error/30 bg-error-container/40 px-2 py-1.5 text-[10px] font-bold text-error transition hover:bg-error-container"
                      type="button"
                      onClick={() => setSkillsDraft(prev => prev.filter((_, i) => i !== idx))}
                    >✕ Remove</button>
                  </div>
                  <Field label="Skills (comma-separated)" value={group.skills} placeholder="Python, TypeScript, Java, C++"
                    onChange={v => setSkillsDraft(prev => prev.map((g, i) => i === idx ? { ...g, skills: v } : g))} />
                </div>
              ))}
              <Btn variant="secondary"
                onClick={() => setSkillsDraft(prev => [...prev, { id: crypto.randomUUID(), category: '', skills: '' }])}>
                + Add Category
              </Btn>
              <div className="flex gap-2 pt-1">
                <Btn disabled={saving} onClick={() => { void persist({ skillGroups: skillsDraft }); setEditSkills(false); }}>💾 Save</Btn>
                <Btn variant="secondary" onClick={() => setEditSkills(false)}>Cancel</Btn>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {profile.skillGroups.some(g => g.skills.trim()) ? (
                profile.skillGroups.filter(g => g.skills.trim()).map(group => (
                  <div key={group.id}>
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[color:var(--txt2)]">
                      {group.category}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.skills.split(',').filter(s => s.trim()).map(skill => (
                        <span
                          key={skill.trim()}
                          className="rounded-full border border-charcoal/15 bg-white/80 px-3 py-1 text-[11px] font-semibold text-[color:var(--txt1)] shadow-tactile-sm"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm italic text-[color:var(--txt2)]/40">No skills added yet — click Edit to add</div>
              )}
            </div>
          )}
        </SectionCard>

        {/* ── Achievements & Certifications ─────────────────────────────── */}
        <SectionCard title="Achievements & Certifications" icon="🏆">
          <div className="grid gap-3">
            {profile.achievements.map(ach => (
              <div key={ach.id}>
                {achEditId === ach.id ? (
                  <AchForm value={achForm} saving={saving} onChange={setAchForm}
                    onSave={() => saveAch(achForm)}
                    onCancel={() => { setAchEditId(null); setAchForm(emptyAch()); }} />
                ) : (
                  <div className="flex items-start gap-3 rounded-2xl border border-charcoal/10 bg-white/50 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-headline text-sm font-bold text-on-surface">{ach.title}</div>
                      {ach.issuer && (
                        <div className="text-xs text-[color:var(--txt1)]">
                          {ach.issuer}{ach.date ? ` · ${ach.date}` : ''}
                        </div>
                      )}
                      {ach.description && (
                        <p className="mt-1 line-clamp-2 text-[11px] text-[color:var(--txt2)]">{ach.description}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <Btn variant="ghost" small
                        onClick={() => { setAchForm({ ...ach }); setAchEditId(ach.id); setAchAddMode(false); }}>✏️</Btn>
                      <Btn variant="danger" small onClick={() => deleteAch(ach.id)}>🗑️</Btn>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {achAddMode && (
              <AchForm value={achForm} saving={saving} onChange={setAchForm}
                onSave={() => saveAch(achForm)}
                onCancel={() => { setAchAddMode(false); setAchForm(emptyAch()); }} />
            )}
            {!achAddMode && !achEditId && (
              <Btn variant="secondary"
                onClick={() => { setAchForm(emptyAch()); setAchAddMode(true); }}>
                + Add Achievement
              </Btn>
            )}
          </div>
        </SectionCard>

        {/* ── AI Credits ────────────────────────────────────────────────── */}
        <section className="rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/85 p-5 shadow-tactile md:p-6">
          <div className="mb-4 font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">AI Credits</div>
          <div className="flex items-end gap-4">
            <div className="font-headline text-5xl font-extrabold leading-none text-on-surface">{credits}</div>
            <div className="mb-1 text-sm text-[color:var(--txt2)]">
              of 20 remaining · {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-charcoal/10">
            <div
              className={`h-2 rounded-full transition-all ${credits <= 3 ? 'bg-[color:var(--warn)]' : 'bg-tertiary'}`}
              style={{ width: `${Math.min(100, (credits / 20) * 100)}%` }}
            />
          </div>
          {credits <= 3 && (
            <div className="mt-3 rounded-xl border border-[color:var(--warn)]/30 bg-[color:var(--warn)]/5 p-3 text-sm text-[color:var(--warn)]">
              {credits <= 0
                ? 'You have no credits left. AI-powered parsing is disabled until you upgrade.'
                : `Only ${credits} credit${credits === 1 ? '' : 's'} remaining. Consider upgrading.`}
            </div>
          )}
        </section>

        {/* ── Usage Details ─────────────────────────────────────────────── */}
        <section className="rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/85 p-5 shadow-tactile md:p-6">
          <div className="mb-4 font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface">
            Usage Details
          </div>
          {usage.map((item, index) => {
            const pct = Math.round((item.used / item.total) * 100);
            return (
              <div className={index > 0 ? 'mt-4' : ''} key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm text-[color:var(--txt1)]">
                  <span>{item.label}</span>
                  <span className="font-headline text-sm font-semibold">{item.used} / {item.total}</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-container-high">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </section>

      </div>
    </WorkspaceShell>
  );
}

