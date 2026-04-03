import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'components/ui/Badge';
import { routes } from 'lib/routes';
import { resumeService } from 'services/resumeService';
import { tipsService } from 'services/tipsService';
import { useSession } from 'state/session/sessionContext';
import { useResumeModal } from 'hooks/useResumeModal';

const kpis = [
  { label: 'Average ATS Score', value: 74, icon: '\u25c8', warn: false },
  { label: 'Resume Strength', value: 79, icon: '\u25c6', warn: false },
  { label: 'JD Match Success', value: 18, icon: '\u2299', warn: true },
];

export function DashboardPage() {
  const { openResume } = useResumeModal();
  const { actor } = useSession();
  const [resumes, setResumes] = useState<Awaited<ReturnType<typeof resumeService.list>>>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [tipIndex, setTipIndex] = useState(0);
  const recentResume = useMemo(() => resumes.find(item => item.recent) ?? resumes[0] ?? {
    id: 'resume_placeholder',
    name: 'resume_v3.tex',
    template: 'template1',
    updated: 'just now',
  }, [resumes]);

  useEffect(() => {
    async function loadDashboardData() {
      const [resumeItems, tipItems] = await Promise.all([resumeService.list(), tipsService.list()]);
      setResumes(resumeItems);
      setTips(tipItems);
    }

    void loadDashboardData();
    window.addEventListener(resumeService.eventName, loadDashboardData);
    return () => window.removeEventListener(resumeService.eventName, loadDashboardData);
  }, []);

  useEffect(() => {
    if (tips.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setTipIndex(current => (current + 1) % tips.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [tips]);

  return (
    <div className="grid gap-6">
      <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">WELCOME BACK</div>
      <div className="font-headline text-4xl font-extrabold leading-tight text-on-surface md:text-5xl">
        Good afternoon, {actor?.name ?? 'there'}!
      </div>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3" aria-label="Key metrics">
        {kpis.map(kpi => (
          <article className="grid gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/85 p-5 shadow-tactile md:p-6" key={kpi.label}>
            <div className="font-headline text-sm font-bold uppercase tracking-[0.18em] text-primary">{kpi.icon}</div>
            <div className="text-sm text-[color:var(--txt1)]">{kpi.label}</div>
            <div className="font-headline text-5xl font-extrabold leading-none text-on-surface">{kpi.value}%</div>
            <div className="h-1.5 rounded-full bg-charcoal/10">
              <div className={`h-1.5 rounded-full ${kpi.warn ? 'bg-[color:var(--warn)]' : 'bg-primary'}`} style={{ width: `${kpi.value}%` }}></div>
            </div>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3" aria-label="Dashboard workspace">
        <button
          className="grid min-h-[22rem] content-start gap-4 rounded-[1.75rem] border-[1.5px] border-dashed border-charcoal/45 bg-white/70 p-5 text-left shadow-tactile-sm transition hover:-translate-x-px hover:-translate-y-px hover:border-charcoal/75 hover:shadow-tactile md:p-6"
          type="button"
          onClick={openResume}
        >
          <div className="grid size-14 place-items-center rounded-2xl border border-outline-variant bg-surface text-4xl text-primary">+</div>
          <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">CREATE NEW RESUME</div>
          <div className="font-headline text-2xl font-extrabold leading-tight text-on-surface">Start from scratch or upload</div>
          <div className="text-sm leading-7 text-[color:var(--txt2)]">
            Open the modal flow, then either upload an existing resume or begin with a blank editor.
          </div>
        </button>

        <article className="grid gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
          <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">ACTIVE RESUME</div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">MOST RECENT</Badge>
            <Badge variant="info">UPDATED {String(recentResume.updated).toUpperCase()}</Badge>
          </div>
          <div className="font-headline text-2xl font-extrabold text-on-surface">{recentResume.name}</div>
          <div className="text-sm text-[color:var(--txt1)]">Resume Workspace</div>
          <div className="text-sm leading-7 text-[color:var(--txt2)]">
            Open the latest saved resume directly in the editor and continue from where you left off.
          </div>
          <div className="grid gap-3 rounded-[1.25rem] border border-outline-variant bg-surface px-4 py-4">
            <div className="font-headline text-sm font-bold text-on-surface">Arjun Kumar</div>
            <div className="text-[11px] text-[color:var(--txt2)]">arjun@email.com</div>
            <div className="h-px bg-outline-variant"></div>
            <div className="h-1.5 w-2/5 rounded-full bg-outline-variant/70"></div>
            <div className="h-1.5 w-full rounded-full bg-primary/20"></div>
            <div className="h-1.5 w-4/5 rounded-full bg-primary/20"></div>
            <div className="h-1.5 w-3/4 rounded-full bg-primary/20"></div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border-[1.5px] border-charcoal/75 bg-white/85 px-3 py-1 font-headline text-[9px] font-bold uppercase tracking-[0.12em] text-[color:var(--txt1)] shadow-tactile-sm">B&amp;W</span>
            <span className="inline-flex items-center rounded-full border-[1.5px] border-charcoal/75 bg-white/85 px-3 py-1 font-headline text-[9px] font-bold uppercase tracking-[0.12em] text-[color:var(--txt1)] shadow-tactile-sm">Classic</span>
            <span className="inline-flex items-center rounded-full border-[1.5px] border-charcoal/75 bg-white/85 px-3 py-1 font-headline text-[9px] font-bold uppercase tracking-[0.12em] text-[color:var(--txt1)] shadow-tactile-sm">1 page</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{resumes.length} SAVED RESUMES</Badge>
            <Badge>EDITOR READY</Badge>
          </div>
          <Link className="font-headline text-sm font-bold text-primary transition hover:text-on-surface" to={`${routes.editor}?resumeId=${recentResume.id}`}>Open editor &rarr;</Link>
        </article>

        <article className="grid gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/90 p-5 shadow-tactile md:p-6">
          <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">QUICK ACTIONS</div>
          <div className="font-headline text-2xl font-extrabold text-on-surface">Move faster</div>
          <div className="grid gap-3">
            <Link className="grid gap-1 rounded-[1.25rem] border border-outline-variant bg-surface px-4 py-4 transition hover:-translate-x-px hover:-translate-y-px hover:border-charcoal/60 hover:bg-white" to={`${routes.editor}?resumeId=${recentResume.id}`}>
              <div className="text-sm font-bold text-on-surface">Open Editor</div>
              <div className="text-sm text-[color:var(--txt2)]">Jump back into the latest resume.</div>
            </Link>
            <Link className="grid gap-1 rounded-[1.25rem] border border-outline-variant bg-surface px-4 py-4 transition hover:-translate-x-px hover:-translate-y-px hover:border-charcoal/60 hover:bg-white" to={`${routes.editor}?resumeId=${recentResume.id}&mode=ats`}>
              <div className="text-sm font-bold text-on-surface">Calculate ATS Score</div>
              <div className="text-sm text-[color:var(--txt2)]">Run a formatting and content scan.</div>
            </Link>
            <Link className="grid gap-1 rounded-[1.25rem] border border-outline-variant bg-surface px-4 py-4 transition hover:-translate-x-px hover:-translate-y-px hover:border-charcoal/60 hover:bg-white" to={routes.jds}>
              <div className="text-sm font-bold text-on-surface">Calculate JD Match</div>
              <div className="text-sm text-[color:var(--txt2)]">Compare resume against a target role.</div>
            </Link>
          </div>
        </article>
      </section>

      <section className="grid gap-4 rounded-[1.75rem] border-[1.5px] border-charcoal/75 bg-white/85 p-5 shadow-tactile md:p-6">
        <div className="font-headline text-[11px] font-bold uppercase tracking-[0.18em] text-primary">TIPS</div>
        <div className="font-headline text-2xl font-extrabold text-on-surface">One good reminder at a time</div>
        <div className="rounded-[1.25rem] border border-outline-variant bg-surface px-4 py-4 text-sm leading-7 text-[color:var(--txt1)]">
          {tips[tipIndex]}
        </div>
        <div className="flex gap-2">
          {tips.map((tip, index) => (
            <span key={tip} className={`h-2.5 w-2.5 rounded-full ${index === tipIndex ? 'bg-primary' : 'bg-outline-variant'}`}></span>
          ))}
        </div>
      </section>
    </div>
  );
}
