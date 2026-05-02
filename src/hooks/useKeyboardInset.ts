import { useEffect, useState } from 'react';

/**
 * Tracks the on-screen keyboard / virtual keyboard inset using VisualViewport API.
 * Returns the number of pixels the keyboard occupies at the bottom of the layout viewport.
 * Falls back to 0 on browsers without VisualViewport support.
 *
 * Use this to apply `paddingBottom` to bottom sheets / sticky footers so the submit
 * button is never hidden under the keyboard on iOS Safari & Chrome Android.
 */
export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return;

    const update = () => {
      // Difference between layout viewport and visual viewport bottom edge
      const diff = window.innerHeight - vv.height - vv.offsetTop;
      setInset(diff > 80 ? diff : 0); // ignore minor URL-bar adjustments
    };

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return inset;
}
