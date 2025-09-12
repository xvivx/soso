import { forwardRef, memo, MouseEvent, ReactNode, useState } from 'react';
import { Slot } from '@radix-ui/react-slot';
import useMemoCallback from '@hooks/useMemoCallback';
import { cn } from '@utils';

export type ButtonClickEvent = MouseEvent<HTMLButtonElement, globalThis.MouseEvent>;

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'onClick'> {
  theme?: 'primary' | 'transparent' | 'secondary' | 'ghost' | 'text';
  loading?: boolean;
  size?: 'lg' | 'md' | 'sm' | 'free';
  icon?: ReactNode;
  asChild?: boolean;
  hoverable?: boolean;
  onClick?: (event: ButtonClickEvent) => any | Promise<any>;
}

/**
 * Button组件
 * @param {ButtonProps} props - 按钮属性
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, outerRef) {
  const {
    children,
    className,
    disabled,
    onClick,
    theme = 'primary',
    loading: propsLoading,
    size = 'md',
    asChild = false,
    icon,
    hoverable = true,
    ...restProps
  } = props;
  const [localeLoading, setLocaleLoading] = useState(propsLoading);

  /**
   * 处理点击事件
   * 支持异步操作并自动处理loading状态
   */
  const handleClick = useMemoCallback(async (event: ButtonClickEvent) => {
    const clickReturn = onClick ? (onClick(event) as unknown as Promise<void>) : null;
    if (clickReturn instanceof Promise) {
      try {
        setLocaleLoading(true);
        await clickReturn;
      } finally {
        setLocaleLoading(false);
      }
    }
  });

  const loading = propsLoading || localeLoading;
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      ref={outerRef}
      onClick={disabled || loading ? undefined : handleClick}
      disabled={disabled || loading}
      {...restProps}
      className={cn(
        // 基础样式
        'detrade-button',
        propsLoading !== false && loading && 'detrade-button-loading',
        hoverable && 'hoverable',
        // 主题相关
        {
          'bg-transparent shadow-none': theme === 'transparent' || theme === 'text',
          'bg-brand text-primary_brand hover:brightness-110': theme === 'primary',
          // hover:text-primary, 是需要的, 避免外部传入color后无法hover变色
          'bg-layer5 text-primary hover:text-primary hover:darkness': theme === 'secondary',
          'border-2 border-thirdly': theme === 'ghost',
        },
        // 尺寸相关 玩法三结局历史处使用aspect-square在IOS有兼容问题, 用宽高实现
        size === 'lg' && ['h-10 s768:h-12 px-4 rounded-2 text-14 s768:text-16', icon && 'w-10 s768:w-12'],
        size === 'md' && [
          'h-8 px-2 rounded-2 text-12 s768:h-10 s768:px-3 s768:text-14',
          icon && 'w-8 s768:w-10 s768:px-0',
        ],
        size === 'sm' && ['h-7 px-2 text-11 s768:h-8 s768:text-12', icon && 'w-7 s768:w-8'],
        icon && 'p-0',
        className
      )}
    >
      {icon || children}
    </Comp>
  );
});

Button.displayName = 'Button';
export default memo(Button);
