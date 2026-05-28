import { useRef, useState, useCallback, useEffect } from 'react';

interface SwipeGestureOptions {
  readonly onSwipeLeft?: () => void;
  readonly onSwipeRight?: () => void;
  readonly threshold?: number;
  readonly enabled?: boolean;
}

interface SwipeGestureResult {
  readonly ref: React.RefObject<HTMLDivElement | null>;
  readonly offsetX: number;
  readonly swiping: boolean;
  readonly direction: 'left' | 'right' | null;
}

const SWIPE_HINT_KEY = 'ikl-fantasy-swipe-hint-shown';

export function useSwipeHintShown(): boolean {
  try {
    return !!localStorage.getItem(SWIPE_HINT_KEY);
  } catch {
    return true;
  }
}

export function markSwipeHintShown(): void {
  try {
    localStorage.setItem(SWIPE_HINT_KEY, '1');
  } catch {
    // localStorage unavailable
  }
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  threshold = 80,
  enabled = true,
}: SwipeGestureOptions): SwipeGestureResult {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const isTracking = useRef(false);
  const isHorizontal = useRef<boolean | null>(null);

  const direction: 'left' | 'right' | null =
    offsetX > 30 ? 'right' : offsetX < -30 ? 'left' : null;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    currentX.current = touch.clientX;
    isTracking.current = true;
    isHorizontal.current = null;
    setSwiping(true);
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isTracking.current || !enabled) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startX.current;
    const dy = touch.clientY - startY.current;

    // Determine scroll direction on first significant move
    if (isHorizontal.current === null) {
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        isHorizontal.current = Math.abs(dx) > Math.abs(dy);
      }
    }

    // Only track horizontal swipes, let vertical scroll pass through
    if (isHorizontal.current === false) {
      isTracking.current = false;
      setSwiping(false);
      setOffsetX(0);
      return;
    }

    if (isHorizontal.current) {
      e.preventDefault();
      currentX.current = touch.clientX;
      // Dampen the movement for a more natural feel
      const dampened = dx * 0.6;
      setOffsetX(dampened);
    }
  }, [enabled]);

  const handleTouchEnd = useCallback(() => {
    if (!isTracking.current || !enabled) return;
    isTracking.current = false;
    setSwiping(false);

    const dx = currentX.current - startX.current;

    if (dx > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (dx < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }

    setOffsetX(0);
  }, [enabled, threshold, onSwipeLeft, onSwipeRight]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    el.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      el.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { ref, offsetX, swiping, direction };
}
