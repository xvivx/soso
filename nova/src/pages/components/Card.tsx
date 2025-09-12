import React, { memo, ReactNode } from 'react';
import { cn } from '@utils';

interface BaseProps {
  className?: string;
  titleClassName?: string;
  children: ReactNode;
}

/**
 * @description 基础卡片组件
 * @param {Object} props - 组件属性
 * @param {ReactNode} props.title - 卡片标题
 * @param {string} props.className - 自定义类名
 * @param {ReactNode} props.children - 卡片内容
 * @returns {JSX.Element}
 */
function Card({ title, children, className, titleClassName }: BaseProps & { title?: ReactNode }) {
  return (
    <div className={cn('detrade-card text-secondary text-14 font-500', className)}>
      {Boolean(title) && <Title className={titleClassName}>{title}</Title>}
      {children}
    </div>
  );
}

function Title({ className, children }: BaseProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between text-primary text-16 font-800 border-b border-thirdly pb-4 mb-4',
        className
      )}
    >
      {children}
    </div>
  );
}

Card.displayName = 'Card';

export default Object.assign(memo(Card), { Title: memo(Title) });
