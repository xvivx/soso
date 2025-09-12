import { memo } from 'react';
import { cn } from '@utils';

/**
 * @description 步骤引导组件
 * @param {IStepItemType[]} steps - 步骤数据数组
 * @param {string} className - 自定义类名
 * @returns {JSX.Element}
 */
export interface IStepItemType {
  /** 步骤图标 URL */
  icon: string;
  /** 步骤标题 */
  title: string;
  /** 步骤描述 (可选) */
  desc?: string;
}

/**
 * @description 单个步骤项组件
 * @param {IStepItemType} props
 */
const StepItem = memo(({ icon, title, desc }: IStepItemType) => {
  return (
    <article className="flex flex-col items-center flex-1 text-center">
      <figure className="mb-6">
        <img src={icon} alt={`Step ${title}`} className="object-contain w-20 h-20" />
      </figure>
      <header>
        <h3 className="mb-3 text-14 s768:text-14 font-500">{title}</h3>
        {desc && <p className="text-12 s768:text-14 text-secondary">{desc}</p>}
      </header>
    </article>
  );
});

StepItem.displayName = 'StepItem';

interface IStepGuideProps {
  steps: IStepItemType[];
  className?: string;
}

const StepGuide = ({ steps, className = '' }: IStepGuideProps) => {
  return (
    <div className={cn('flex flex-col gap-8 s768:flex-row s768:justify-between', className)}>
      {steps.map((step, index) => (
        <StepItem key={`step-${index}-${step.title}`} {...step} />
      ))}
    </div>
  );
};

StepGuide.displayName = 'StepGuide';

export default memo(StepGuide);
