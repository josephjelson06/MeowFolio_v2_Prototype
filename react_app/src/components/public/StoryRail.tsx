import { useRef, type ReactNode } from 'react';

interface StoryItem {
  step: string;
  title: string;
  copy: string;
  image: string;
  alt: string;
}

interface StoryRailProps {
  items: StoryItem[];
  cta?: ReactNode;
}

export function StoryRail({ items, cta }: StoryRailProps) {
  const railRef = useRef<HTMLDivElement | null>(null);

  function scroll(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * Math.max(260, rail.clientWidth * 0.75), behavior: 'smooth' });
  }

  return (
    <div className="ra-stack-md">
      <div className="pub-section-head">
        <div>
          <div className="section-label pub-label-tight">MOCHII'S JOURNEY</div>
          <div className="pub-section-title">How one cat changes everything.</div>
          <div className="pub-section-desc">The same story rail explains the product loop from first draft to better outcomes.</div>
        </div>
        <div className="pub-rail-actions">
          <button className="pub-rail-btn" type="button" onClick={() => scroll(-1)}>&larr;</button>
          <button className="pub-rail-btn" type="button" onClick={() => scroll(1)}>&rarr;</button>
        </div>
      </div>

      <div className="ra-story-grid" ref={railRef}>
        {items.map(item => (
          <article className="pub-story-card ra-story-card" key={item.step}>
            <div className="pub-story-media"><img src={item.image} alt={item.alt} loading="lazy" /></div>
            <div className="pub-story-step">{item.step}</div>
            <div className="pub-story-title">{item.title}</div>
            <div className="pub-story-copy">{item.copy}</div>
          </article>
        ))}
        {cta}
      </div>
    </div>
  );
}
