import { useRef } from 'react';
interface TemplateItem {
  id: string;
  name: string;
  label: string;
  copy: string;
  previewImageUrl?: string;
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
    <div>
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

      <div className="pub-hscroll pub-template-rail" ref={railRef}>
        {items.map(item => (
          <article className="pub-template-card" key={item.id}>
            <div className="pub-template-preview">
              {item.previewImageUrl ? (
                <img src={item.previewImageUrl} alt={`${item.name} template preview`} className="pub-template-preview-img" loading="lazy" />
              ) : (
                <div className="pub-template-doc">
                  <div className="pdf-name pub-template-name">Arjun Kumar</div>
                  <div className="pdf-contact pub-template-sub">{item.label}</div>
                  <div className="pdf-divider"></div>
                  <div className="ra-mini-line medium"></div>
                  <div className="ra-mini-line short"></div>
                  <div className="ra-mini-line long"></div>
                </div>
              )}
            </div>
            <div className="pub-template-actions">
              <button className="r-action primary" type="button" onClick={onUse}>Use this template</button>
            </div>
            <div className="pub-card-title pub-template-title">{item.name}</div>
            <div className="pub-template-copy">{item.copy}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
