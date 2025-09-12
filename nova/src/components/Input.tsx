import { ChangeEvent, ComponentProps, FormEvent, forwardRef, memo, ReactNode, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, SvgIcon } from '@components';
import { cn } from '@utils';

export interface BaseProps
  extends Omit<ComponentProps<'input'>, 'onChange' | 'onInput' | 'size' | 'prefix' | 'suffix' | 'ref'> {
  prefix?: ReactNode;
  suffix?: ReactNode;
  onInput?: (value: string, event: FormEvent<HTMLInputElement>) => void;
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  size?: 'sm' | 'md' | 'lg';
  status?: 'error' | 'warning';
}

const BaseInput = memo(
  forwardRef<HTMLInputElement, BaseProps>((props, inputRef) => {
    const { className, size = 'md', onChange, onInput, prefix, suffix, status, ...rests } = props;
    return (
      <div
        className={cn(
          'detrade-input relative flex flex-nowrap items-center rounded-2 px-3',
          'border bg-layer4 shadow-sm text-primary font-700 transition-all',
          status === undefined && 'border-input',
          status === 'error' && 'border-error',
          status === 'warning' && 'border-warn',
          size === 'sm' && 'h-7 text-11 s768:h-8 s768:text-12',
          size === 'md' && 'h-8 text-12 s768:h-10 s768:text-14',
          size === 'lg' && 'h-10 s768:h-12 text-14 s768:text-16',
          suffix && 'py-[3px] pr-[3px]',
          className
        )}
      >
        {prefix}
        <input
          ref={inputRef}
          className={cn(
            'h-full flex-1 w-0 basis-0 placeholder:text-quarterary placeholder:font-500 bg-transparent outline-none caret-brand',
            props.disabled && 'pointer-events-none'
          )}
          onInput={
            onInput &&
            ((event) => onInput(formatInput((event.target as HTMLInputElement).value, props.inputMode), event))
          }
          onChange={onChange && ((event) => onChange(formatInput(event.target.value, props.inputMode), event))}
          autoComplete="off"
          {...rests}
        />
        {suffix}
      </div>
    );
  })
);
BaseInput.displayName = 'Input';

function Search(props: Omit<BaseProps, 'prefix' | 'suffix'>) {
  const { t } = useTranslation();
  return <BaseInput prefix={<SvgIcon name="search" className="mr-1 size-4" />} placeholder={t('Search')} {...props} />;
}

function Password(props: Omit<BaseProps, 'prefix' | 'suffix' | 'type'>) {
  const [showPassword, toggleShowPassword] = useReducer((value: boolean) => !value, false);
  const { disabled, className, ...resets } = props;
  return (
    <BaseInput
      autoComplete="new-password"
      className={cn('pr-3', className)}
      disabled={disabled}
      {...resets}
      suffix={
        <Button
          type="button"
          className="h-full"
          onClick={toggleShowPassword}
          disabled={disabled}
          size="free"
          theme="transparent"
          icon={<SvgIcon className="size-4 text-primary" name={showPassword ? 'eyes' : 'closeEyes'} />}
        />
      }
      type={showPassword ? 'text' : 'password'}
    />
  );
}

/**
 * Textarea组件的属性接口
 * @extends Omit<ComponentProps<'textarea'>, 'onChange' | 'onInput' | 'size'>
 */
export interface TextareaProps extends Omit<ComponentProps<'textarea'>, 'onChange'> {
  onChange?: (value: string, event: ChangeEvent<HTMLTextAreaElement>) => void;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  const { className, onChange, ...rests } = props;
  return (
    <textarea
      ref={ref}
      className={cn(
        'rounded-2 p-3 bg-layer3  border border-input outline-none focus:border-brand focus:outline-none caret-brand',
        'text-primary text-14 font-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      onChange={onChange && ((event) => onChange(event.target.value, event))}
      {...rests}
    />
  );
});

Textarea.displayName = 'Textarea';

export default Object.assign(BaseInput, {
  Search: memo(Search),
  Password: memo(Password),
  Textarea: memo(Textarea),
});

function formatInput(value: string, mode: BaseProps['inputMode']) {
  if (mode === 'numeric') {
    return value.replace(/[^\d]/g, '');
  }

  return value;
}
