interface AtsFullReportProps {
  onBack: () => void;
}

export function AtsFullReport({ onBack }: AtsFullReportProps) {
  return (
    <div className="ats-full">
      <div className="ats-score-card">
        <div className="ats-score-num">74</div>
        <div className="ats-score-info">
          <div className="ats-score-label">Good - a few fixes needed</div>
          <div className="ats-score-desc">resume_v3.tex &middot; Analyzed just now</div>
        </div>
        <button className="analyze-btn" type="button" onClick={onBack}>&larr; Back to Editor</button>
      </div>
      <div className="ats-bars">
        <div className="ats-bar-item">
          <div className="ats-bar-label"><span>Keywords</span><span className="editor-accent-val">82%</span></div>
          <div className="ats-bar-track"><div className="ats-bar-fill editor-bar-82"></div></div>
        </div>
        <div className="ats-bar-item">
          <div className="ats-bar-label"><span>Formatting</span><span className="editor-accent-val">90%</span></div>
          <div className="ats-bar-track"><div className="ats-bar-fill editor-bar-90"></div></div>
        </div>
        <div className="ats-bar-item">
          <div className="ats-bar-label"><span>Section structure</span><span className="editor-warn-val">65%</span></div>
          <div className="ats-bar-track"><div className="ats-bar-fill warn editor-bar-65"></div></div>
        </div>
        <div className="ats-bar-item">
          <div className="ats-bar-label"><span>Length &amp; density</span><span className="editor-accent-val">88%</span></div>
          <div className="ats-bar-track"><div className="ats-bar-fill editor-bar-88"></div></div>
        </div>
      </div>
      <div className="ats-checklist">
        <div className="ats-check-row"><span className="check-ico editor-check-ok">&#10003;</span>File format is ATS-readable (PDF via LaTeX)</div>
        <div className="ats-check-row"><span className="check-ico editor-check-ok">&#10003;</span>Contact information is complete</div>
        <div className="ats-check-row"><span className="check-ico editor-check-ok">&#10003;</span>Standard section headings detected</div>
        <div className="ats-check-row"><span className="check-ico editor-check-warn">!</span>Add measurable impact to experience bullets</div>
        <div className="ats-check-row"><span className="check-ico editor-check-warn">!</span>Skills section lacks proficiency context</div>
        <div className="ats-check-row"><span className="check-ico editor-check-bad">&#10007;</span>Missing professional summary / objective</div>
      </div>
    </div>
  );
}
