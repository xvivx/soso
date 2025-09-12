type EasingType =
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic';

interface TweenOptions {
  duration: number;
  onUpdate: (progress: number) => void;
  onComplete?: () => void;
  easing?: EasingType;
}

// Easing functions
const easingFunctions: Record<EasingType, (t: number) => number> = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
};

export function tweening(options: TweenOptions): () => void {
  const { duration, onUpdate, onComplete, easing = 'linear' } = options;
  const startTime = performance.now();
  let isCancelled = false;

  const animate = (currentTime: number) => {
    if (isCancelled) return;

    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easingFunctions[easing](progress);

    onUpdate(easedProgress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else if (onComplete) {
      onComplete();
    }
  };

  requestAnimationFrame(animate);

  return () => {
    isCancelled = true;
  };
}
