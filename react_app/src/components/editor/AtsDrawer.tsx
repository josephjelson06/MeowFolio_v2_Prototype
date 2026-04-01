interface AtsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function AtsDrawer({ open, onClose }: AtsDrawerProps) {
  return (
    <div className={`ats-drawer${open ? ' open' : ''}`}>
      <div className="drawer-head">
        <span>ATS Report</span>
        <button className="close-x" type="button" onClick={onClose}>&times;</button>
      </div>
      <div className="score-big">
        <div className="score-num">74</div>
        <div className="score-sub">out of 100 &middot; Good - a few fixes needed</div>
      </div>
      <div className="bar-row">
        <div className="bar-label"><span>Keywords</span><span className="bar-val">82%</span></div>
        <div className="bar-track"><div className="bar-fill editor-bar-82"></div></div>
      </div>
      <div className="bar-row">
        <div className="bar-label"><span>Formatting</span><span className="bar-val">90%</span></div>
        <div className="bar-track"><div className="bar-fill editor-bar-90"></div></div>
      </div>
      <div className="bar-row">
        <div className="bar-label"><span>Section structure</span><span className="bar-val">65%</span></div>
        <div className="bar-track"><div className="bar-fill warn editor-bar-65"></div></div>
      </div>
      <div className="audit">
        <div className="audit-head">Checklist</div>
        <div className="audit-row"><span className="abadge bp">&#10003;</span>File format readable</div>
        <div className="audit-row"><span className="abadge bp">&#10003;</span>Contact info present</div>
        <div className="audit-row"><span className="abadge bw">!</span>Add measurable impact</div>
        <div className="audit-row"><span className="abadge bf">&#10007;</span>Missing summary section</div>
        <div className="audit-row"><span className="abadge bw">!</span>Quantify skills section</div>
      </div>
    </div>
  );
}
