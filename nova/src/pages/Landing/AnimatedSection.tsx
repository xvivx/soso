import { ReactNode, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@utils';

type AnimatedSectionProps = {
  children: ((inView: boolean) => ReactNode) | ReactNode;
  index: number;
};
/**
 * 用于滚动到视口淡入显示模块
 */
export const AnimatedSection = ({ children, index }: AnimatedSectionProps) => {
  const inViewRef = useRef<HTMLDivElement>(null);
  const inView = useInView(inViewRef, { margin: '-100px 0px' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="w-full"
      ref={inViewRef}
    >
      {typeof children === 'function' ? children(inView) : children}
    </motion.div>
  );
};

/**
 * 单词逐个从下往上移动显示的动画组件
 *
 * delay - 单词之间的动画延迟时间（秒）
 *
 * initialDelay - 整个动画开始前的初始延迟时间（秒）
 */
export const WordRevealAnimation = ({
  text,
  delay = 0.2,
  duration = 0.8,
  initialDelay = 0,
  className,
}: {
  text: string;
  delay?: number;
  duration?: number;
  initialDelay?: number;
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    margin: '-50px 0px', // 提前触发检测
    amount: 0.1, // 至少10%元素可见时触发
  });

  // 分割文本为单词数组，保留空格和标点符号
  const words = text.split(/(\s+)/).filter((word) => word.trim().length > 0 || word === ' ');

  const variants = {
    hidden: { y: 20, opacity: 0 },
    visible: (custom: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: initialDelay + custom * delay,
        duration: duration,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <motion.div ref={ref} className={cn('flex flex-wrap', className)}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={variants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={index}
          className="inline-block whitespace-pre-wrap"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

interface FlipTextProps {
  children: ReactNode;
  // 翻转高度
  flipHeight: number;
  className?: string;
}
/**
 * 翻转动画
 */
export const FlipText = ({ children, flipHeight, className = '' }: FlipTextProps) => {
  return (
    <motion.div
      className={cn('relative overflow-hidden flex flex-col cursor-pointer', className)}
      whileHover="hover"
      initial="rest"
    >
      {/* 主文本 */}
      <motion.span
        variants={{
          rest: { transform: 'translateY(0)' },
          hover: { transform: `translateY(-${flipHeight}px)` },
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.span>

      {/* 副本文本 (用于动画效果) */}
      <motion.span
        aria-hidden
        variants={{
          rest: { transform: 'translateY(0)' },
          hover: { transform: `translateY(-${flipHeight}px)` },
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.span>
    </motion.div>
  );
};
