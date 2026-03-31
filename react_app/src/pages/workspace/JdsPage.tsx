import { useMemo, useState } from 'react';
import { Card } from 'components/ui/Card';
import { JdListPane } from 'components/jds/JdListPane';
import { JdMobileSheet } from 'components/jds/JdMobileSheet';
import { JdResultPane } from 'components/jds/JdResultPane';
import { ResumePickerPane } from 'components/jds/ResumePickerPane';
import { useJdModal } from 'hooks/useJdModal';
import { jdService } from 'services/jdService';

export function JdsPage() {
  const { openJd } = useJdModal();
  const [jds] = useState(() => jdService.list());
  const [activeJdId, setActiveJdId] = useState<number | null>(jds[0]?.id ?? null);
  const [activeResumeKey, setActiveResumeKey] = useState('resume_v3');
  const resumeProfiles = useMemo(() => Object.entries(jdService.getMatchProfiles()).map(([key, profile]) => ({ key, profile })), []);
  const report = useMemo(() => {
    if (!activeJdId) return null;
    return jdService.buildReport(activeResumeKey, activeJdId);
  }, [activeJdId, activeResumeKey]);

  return (
    <div className="ra-page-stack">
      <div className="ra-page-header">
        <div className="section-label">JD MATCHING</div>
        <h1 className="ra-card-title">Compare saved resumes against saved JDs.</h1>
        <p className="ra-subtitle">The React version keeps the report logic in the service layer and leaves route rendering to feature components.</p>
      </div>

      <section className="ra-jd-layout">
        <Card>
          <div className="ra-stack-lg">
            <JdListPane items={jds} activeId={activeJdId} onSelect={setActiveJdId} onAdd={openJd} />
            <ResumePickerPane items={resumeProfiles} activeKey={activeResumeKey} onSelect={setActiveResumeKey} />
          </div>
        </Card>

        <Card>
          <JdResultPane report={report} />
        </Card>
      </section>

      <JdMobileSheet report={report} />
    </div>
  );
}
