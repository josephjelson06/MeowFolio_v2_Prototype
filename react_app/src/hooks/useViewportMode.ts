import { useEffect, useState } from 'react';

export function useViewportMode(breakpoint = 768) {
  const getValue = () => window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
  const [isMobile, setIsMobile] = useState(() => getValue());

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    setIsMobile(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [breakpoint]);

  return { isMobile };
}
