import { ProgressBar } from 'components/ui/ProgressBar';

export function AtsDrawer() {
  return (
    <div className="ra-stack-md">
      <div className="section-label">ATS DRAWER</div>
      <div className="ra-stack-sm">
        <h3 className="ra-card-title">Resume strength</h3>
        <p className="ra-card-copy">The ATS view stays route-local to the editor and does not own workspace-level chrome.</p>
      </div>
      <div className="ra-stack-sm">
        <div className="ra-report-hero">
          <div>
            <div className="ra-card-title">79%</div>
            <div className="ra-card-copy">Formatting and content scan</div>
          </div>
        </div>
        <ProgressBar value={79} />
      </div>
    </div>
  );
}
