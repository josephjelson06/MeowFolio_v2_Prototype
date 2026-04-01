import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from 'lib/routes';
import { resumeService } from 'services/resumeService';
import { tipsService } from 'services/tipsService';
import { useResumeModal } from 'hooks/useResumeModal';

const kpis = [
  { label: 'Average ATS Score', value: 74, icon: '\u25c8', className: 'dash-stat-fill-74', warn: false },
  { label: 'Resume Strength', value: 79, icon: '\u25c6', className: 'dash-stat-fill-79', warn: false },
  { label: 'JD Match Success', value: 18, icon: '\u2299', className: 'dash-stat-fill-18', warn: true },
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
    <div className="dash-body dash-page">
      <div className="dash-greeting-label">WELCOME BACK</div>
      <div className="dash-greeting-name">Good afternoon, Arjun Kumar!</div>

      <section className="dash-stats-row" aria-label="Key metrics">
        {kpis.map(kpi => (
          <article className="dash-stat-big" key={kpi.label}>
            <div className="dash-stat-icon">{kpi.icon}</div>
            <div className="dash-stat-label">{kpi.label}</div>
            <div className="dash-stat-num">{kpi.value}%</div>
            <div className="dash-stat-bar">
              <div className={`dash-stat-fill ${kpi.warn ? 'warn ' : ''}${kpi.className}`}></div>
            </div>
          </article>
        ))}
      </section>

      <section className="dash-middle-grid" aria-label="Dashboard workspace">
        <button className="dash-create-card dash-middle-card" type="button" onClick={openResume}>
          <div className="dash-create-plus">+</div>
          <div className="dash-create-label">CREATE NEW RESUME</div>
          <div className="dash-create-title">Start from scratch or upload</div>
          <div className="dash-create-desc">Open the modal flow, then either upload an existing resume or begin with a blank editor.</div>
        </button>

        <article className="dash-active-card dash-middle-card">
          <div className="section-label">ACTIVE RESUME</div>
          <div className="dash-recent-badges">
            <span className="badge-accent">MOST RECENT</span>
            <span className="badge-info">UPDATED {String(recentResume.updated).toUpperCase()}</span>
          </div>
          <div className="dash-recent-name">{recentResume.name}</div>
          <div className="dash-recent-sub">Resume Workspace</div>
          <div className="dash-recent-desc">Open the latest saved resume directly in the editor and continue from where you left off.</div>
          <div className="dash-preview-thumb dash-active-thumb">
            <div className="pdf-name dash-preview-name">Arjun Kumar</div>
            <div className="pdf-contact dash-preview-contact">arjun@email.com</div>
            <div className="pdf-divider"></div>
            <div className="pdf-line d dash-preview-line-a"></div>
            <div className="pdf-line dash-preview-line-b"></div>
            <div className="pdf-line dash-preview-line-c"></div>
            <div className="pdf-divider"></div>
            <div className="pdf-line d dash-preview-line-d"></div>
            <div className="pdf-line dash-preview-line-e"></div>
          </div>
          <div className="dash-preview-chips">
            <span className="chip">B&amp;W</span>
            <span className="chip">Classic</span>
            <span className="chip">1 page</span>
          </div>
          <div className="dash-recent-tags">
            <span className="badge-outline">{resumes.length} SAVED RESUMES</span>
            <span className="badge-outline">EDITOR READY</span>
          </div>
          <Link className="dash-recent-link" to={routes.editor}>Open editor &rarr;</Link>
        </article>

        <article className="dash-actions-card dash-middle-card">
          <div className="section-label">QUICK ACTIONS</div>
          <div className="dash-actions-title">Move faster</div>
          <div className="dash-actions-grid">
            <Link className="dash-action-item" to={routes.editor}>
              <div className="dash-action-icon">&#8801;</div>
              <div className="dash-action-copy">
                <div className="dash-action-name">Open Editor</div>
                <div className="dash-action-desc">Jump back into the latest resume.</div>
              </div>
            </Link>
            <Link className="dash-action-item" to={`${routes.editor}?mode=ats`}>
              <div className="dash-action-icon">&#9678;</div>
              <div className="dash-action-copy">
                <div className="dash-action-name">Calculate ATS Score</div>
                <div className="dash-action-desc">Run a formatting and content scan.</div>
              </div>
            </Link>
            <Link className="dash-action-item" to={routes.jds}>
              <div className="dash-action-icon">&#8857;</div>
              <div className="dash-action-copy">
                <div className="dash-action-name">Calculate JD Match</div>
                <div className="dash-action-desc">Compare resume against a target role.</div>
              </div>
            </Link>
          </div>
        </article>
      </section>

      <section className="dash-tips-card">
        <div className="section-label">TIPS</div>
        <div className="dash-tips-title">One good reminder at a time</div>
        <div className="dash-tip-content">{tips[tipIndex]}</div>
        <div className="dash-tip-dots">
          {tips.map((tip, index) => (
            <span key={tip} className={`tip-dot${index === tipIndex ? ' active' : ''}`}></span>
          ))}
        </div>
      </section>
    </div>
  );
}
