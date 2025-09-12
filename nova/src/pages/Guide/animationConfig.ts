// 动画配置常量
export const ANIMATION_CONFIG = {
  pageTransition: {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -100 },
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  cardTransition: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.6 },
  },
  floatingElement: {
    duration: 3,
    repeatType: 'reverse' as const,
    ease: 'easeInOut',
  },
  clockRotation: {
    animate: { rotate: 360 },
    transition: { duration: 1, repeat: Infinity, ease: 'linear' },
  },
  thumbsUp: {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: { delay: 0.2, duration: 0.5, type: 'spring' },
  },
} as const;
