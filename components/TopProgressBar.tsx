'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Reset/complete progress when path changes
  useEffect(() => {
    setProgress(100);
    const timer = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Listen to anchor clicks to trigger progress immediately on navigation start
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a');
      
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const targetAttr = anchor.getAttribute('target');

      // Only trigger if it's an internal route link and not target="_blank"
      if (href && href.startsWith('/') && targetAttr !== '_blank') {
        const currentUrl = window.location.pathname + window.location.search;
        if (href !== currentUrl) {
          setVisible(true);
          setProgress(25);
          
          // Animate progress smoothly
          const timer1 = setTimeout(() => setProgress(65), 150);
          const timer2 = setTimeout(() => setProgress(85), 400);

          return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
          };
        }
      }
    };

    window.addEventListener('click', handleAnchorClick);
    return () => window.removeEventListener('click', handleAnchorClick);
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-blue-600 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(37,99,235,0.6)]"
        style={{
          width: `${progress}%`,
          opacity: visible || progress > 0 ? 1 : 0,
        }}
      />
    </div>
  );
}
