import * as React from 'react';
import { OTPInput, OTPInputContext } from 'input-otp';
import { cn } from '@utils';

/**
 * InputOTPSlot 组件 - OTP输入框的单个输入格
 * @component
 * @param {Object} props - 组件属性
 * @param {number} props.index - 输入格的索引值
 * @param {string} [props.className] - 自定义CSS类名
 * @param {React.Ref<HTMLDivElement>} ref - React ref对象
 */
const InputOTPSlot = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        // 基础尺寸和布局
        'relative flex-center',
        // 背景和边框样式
        'bg-layer4 rounded-2 outline-none shadow-sm border border-input',
        isActive && 'z-10 border-brand',
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-0.5 h-6 bg-brand duration-1000 opt-caret-blink" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = 'InputOTPSlot';

/**
 * InputOtp 组件的属性接口
 * @interface InputOtpProps
 */
interface InputOtpProps {
  className?: string;
  value?: string;
  /** OTP 输入完成时的回调函数 */
  onChange?: (value: string) => void;
  /** OTP 输入框的长度，默认为 6 */
  length?: number;
  /** 是否在组件加载时自动聚焦第一个输入框，默认为 false */
  autoFocus?: boolean;
  /** 输入框的尺寸, 不传会使用响应式 */
  size?: 'md' | 'lg' | number;
  disabled?: boolean;
}

/**
 * InputOtp 组件 - OTP验证码输入组件
 * @component
 */
const InputOtp = React.forwardRef<React.ElementRef<typeof OTPInput>, InputOtpProps>(
  ({ length = 6, autoFocus = false, size, className, ...rests }, ref) => {
    return (
      <OTPInput
        ref={ref}
        maxLength={length}
        autoFocus={autoFocus}
        containerClassName={cn(
          'flex items-center justify-between font-500 has-[:disabled]:opacity-50 text-primary',
          size === 'md' && 'text-24',
          size === 'lg' && 'text-30',
          !size && 'text-24 s768:text-30',
          className
        )}
        pattern="^\d+$"
        {...rests}
      >
        {Array.from({ length }, (_, index) => (
          <InputOTPSlot
            key={index}
            className={cn(size === 'md' && 'size-12', size === 'lg' && 'size-16', !size && 'size-12 s768:size-16')}
            index={index}
            style={size ? { height: size, width: size } : undefined}
          />
        ))}
      </OTPInput>
    );
  }
);

InputOtp.displayName = 'InputOtp';

export default React.memo(InputOtp);
