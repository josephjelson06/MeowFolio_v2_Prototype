export function ToolbarPane() {
  return (
    <div className="ra-stack-md">
      <div className="section-label">TOOLBAR</div>
      <div className="ra-field">
        <label>Density</label>
        <input type="range" min="1" max="10" defaultValue="6" />
      </div>
      <div className="ra-field">
        <label>Whitespace</label>
        <input type="range" min="1" max="10" defaultValue="5" />
      </div>
      <div className="ra-field">
        <label>Emphasis</label>
        <input type="range" min="1" max="10" defaultValue="7" />
      </div>
    </div>
  );
}
