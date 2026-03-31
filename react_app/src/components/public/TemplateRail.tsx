import { useRef } from 'react';
import { Button } from 'components/ui/Button';

interface TemplateItem {
  name: string;
  label: string;
  copy: string;
  lines: readonly ('short' | 'medium' | 'long')[];
}

interface TemplateRailProps {
  items: TemplateItem[];
  onUse: () => void;
}

export function TemplateRail({ items, onUse }: TemplateRailProps) {
  const railRef = useRef<HTMLDivElement | null>(null);

  function scroll(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(240, rail.clientWidth * 0.65), behavior: 'smooth' });
  }

  return (
    <div className="ra-stack-md">
      <div className="pub-section-head">
        <div>
          <div className="section-label pub-label-tight">TEMPLATES</div>
          <div className="pub-section-title">Pick your vibe.</div>
        </div>
        <div className="pub-rail-actions">
          <button className="pub-rail-btn" type="button" onClick={() => scroll(-1)}>&larr;</button>
          <button className="pub-rail-btn" type="button" onClick={() => scroll(1)}>&rarr;</button>
        </div>
      </div>

      <div className="ra-template-grid" ref={railRef}>
        {items.map(item => (
          <article className="pub-template-card" key={item.label}>
            <div className="pub-template-preview">
              <div className="pub-template-doc">
                <div className="pdf-name pub-template-name">Arjun Kumar</div>
                <div className="pdf-contact pub-template-sub">{item.label}</div>
                <div className="pdf-divider"></div>
                {item.lines.map((line, index) => <div className={`ra-mini-line ${line}`} key={`${item.label}-${index}`}></div>)}
              </div>
            </div>
            <div className="pub-template-actions">
              <Button className="r-action primary" onClick={onUse}>Use this template</Button>
            </div>
            <div className="pub-card-title pub-template-title">{item.name}</div>
            <div className="pub-template-copy">{item.copy}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
