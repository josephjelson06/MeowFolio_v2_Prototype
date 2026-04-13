import { useEffect, useRef, useState } from 'react';

export function useAutoHideHeader() {
    const [isHidden, setIsHidden] = useState(false);
    const lastScrollYRef = useRef(0);

    useEffect(() => {
        function handleScroll() {
            const currentScrollY = window.scrollY;
            const delta = currentScrollY - lastScrollYRef.current;

            if (currentScrollY <= 24) {
                setIsHidden(false);
                lastScrollYRef.current = currentScrollY;
                return;
            }
            if (delta > 8) {
                setIsHidden(true);
            } else if (delta < -8) {
                setIsHidden(false);
            }
            lastScrollYRef.current = currentScrollY;
        }
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };

    }, []);
    return isHidden;
}