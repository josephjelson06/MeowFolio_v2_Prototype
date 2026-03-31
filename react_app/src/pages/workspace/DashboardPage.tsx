import { useEffect, useMemo, useState } from 'react';
import { Card } from 'components/ui/Card';
import { Button } from 'components/ui/Button';
import { Badge } from 'components/ui/Badge';
import { KpiCard } from 'components/workspace/KpiCard';
import { QuickActionCard } from 'components/workspace/QuickActionCard';
import { routes } from 'lib/routes';
import { resumeService } from 'services/resumeService';
import { tipsService } from 'services/tipsService';
import { useResumeModal } from 'hooks/useResumeModal';

const kpis = [
  { label: 'Average ATS Score', value: 74, icon: 'O' },
  { label: 'Resume Strength', value: 79, icon: '◆' },
  { label: 'JD Match Success', value: 18, icon: '◔' },
];

export function DashboardPage() {
  const { openResume } = useResumeModal();
  const resumes = useMemo(() => resumeService.list(), []);
  const recentResume = useMemo(() => resumes.find(item => item.recent) ?? resumes[0], [resumes]);
  const tips = useMemo(() => tipsService.list(), []);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    if (tips.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setTipIndex(current => (current + 1) % tips.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [tips]);

  return (
    <div className="ra-page-stack">
      <div className="ra-page-header">
        <div className="section-label">WELCOME BACK</div>
        <h1 className="ra-card-title">Good afternoon, Arjun Kumar!</h1>
      </div>

      <section className="ra-dashboard-kpis">
        {kpis.map(kpi => <KpiCard key={kpi.label} {...kpi} />)}
      </section>

      <section className="ra-dashboard-middle">
        <Card className="ra-dashboard-card">
          <div className="ra-stack-lg">
            <div className="ra-stack-sm">
              <div className="section-label">CREATE NEW RESUME</div>
              <h2 className="ra-card-title">Start from scratch or upload</h2>
              <p className="ra-card-copy">Open the shared modal flow, then either upload an existing resume or begin with a blank editor.</p>
            </div>
            <div className="ra-actions">
              <Button onClick={openResume}>+ Create Resume</Button>
            </div>
          </div>
        </Card>

        <Card className="ra-dashboard-card">
          <div className="ra-stack-md">
            <div className="section-label">ACTIVE RESUME</div>
            <div className="ra-chip-row">
              <Badge variant="accent">Most recent</Badge>
              <Badge variant="info">Updated {recentResume.updated}</Badge>
            </div>
            <div className="ra-stack-sm">
              <h2 className="ra-card-title">{recentResume.name}</h2>
              <p className="ra-card-copy">Resume workspace</p>
              <p className="ra-card-copy">Open the latest saved resume directly in the editor and continue from where you left off.</p>
            </div>
            <div className="ra-mini-doc" aria-hidden="true">
              <div className="pdf-name">Arjun Kumar</div>
              <div className="pdf-contact">arjun@email.com</div>
              <div className="pdf-divider"></div>
              <div className="ra-mini-line medium"></div>
              <div className="ra-mini-line long"></div>
              <div className="ra-mini-line medium"></div>
              <div className="ra-mini-line short"></div>
            </div>
            <div className="ra-chip-row">
              <Badge>{resumes.length} saved resumes</Badge>
              <Badge>Editor ready</Badge>
            </div>
            <div className="ra-actions">
              <Button to={routes.editor} variant="secondary">Open editor</Button>
            </div>
          </div>
        </Card>

        <Card className="ra-dashboard-card">
          <div className="ra-stack-lg">
            <div className="ra-stack-sm">
              <div className="section-label">QUICK ACTIONS</div>
              <h2 className="ra-card-title">Move faster</h2>
            </div>
            <div className="ra-quick-actions">
              <QuickActionCard title="Open editor" copy="Jump back into the latest resume." />
              <QuickActionCard title="Calculate ATS Score" copy="Run a formatting and content scan." />
              <QuickActionCard title="Calculate JD Match" copy="Compare resume against a target role." />
            </div>
          </div>
        </Card>
      </section>

      <Card>
        <div className="ra-stack-md">
          <div className="section-label">TIPS</div>
          <h2 className="ra-card-title">One good reminder at a time</h2>
          <div className="ra-action-tile">
            <p className="ra-card-copy">{tips[tipIndex]}</p>
          </div>
          <div className="ra-chip-row">
            {tips.map((tip, index) => (
              <span key={tip} className={`badge-outline${index === tipIndex ? ' active' : ''}`}>{index + 1}</span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
