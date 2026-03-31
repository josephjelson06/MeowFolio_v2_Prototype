import type { JdReportModel } from 'services/jdService';

interface JdMobileSheetProps {
  report: JdReportModel | null;
}

export function JdMobileSheet({ report }: JdMobileSheetProps) {
  if (!report) return null;

  return (
    <div className="ra-mobile-only">
      <div className="ra-section-card">
        <div className="ra-report-hero">
          <div>
            <div className="section-label">SUMMARY</div>
            <h3 className="ra-card-title">{report.resume.score}% match</h3>
          </div>
          <span className="badge-outline">{report.verdict}</span>
        </div>
      </div>
    </div>
  );
}
