import { FocusEvent, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@store/wallet';
import useMemoCallback from '@hooks/useMemoCallback';
import { cn, formatter } from '@utils';
import Button from './Button';
import BaseInput, { BaseProps } from './Input';

interface InputProps extends Omit<BaseProps, 'onChange' | 'type' | 'value' | 'min' | 'max'> {
  value?: string;
  onChange: (value: string) => void;
  logo?: string;
  onMax?: () => void;
  max?: number;
  min?: number;
  precision?: number;
}

/**
 * 为了更灵活的处理格式化输入和边界情况使用字符串值传递
 * 功能: 千分位格式化, 只能输入数字, 区分0与空值, 抛出字符串, 外部使用需自行转成数字
 */
function Input(props: InputProps) {
  const { t } = useTranslation();
  const { className, value, onChange, onBlur, logo, max, min, onMax, ...others } = props;
  const currency = useCurrency();
  const handleChange = useCallback(
    (valueText: string) => {
      if (Number(valueText) === 0) return onChange(valueText);
      // 去除非数字和数部分最左侧的0, 001. => 1
      const input = valueText.replace(/[^\d.]/g, '').replace(/^0+(?!(\.|$))/, '');
      const [intVal, dotVal] = input.split('.');
      if (!intVal && !dotVal) {
        return onChange(input);
      } else if (!intVal) {
        return onChange('0.' + dotVal);
      } else if (!dotVal) {
        return onChange(intVal + (input.endsWith('.') ? '.' : ''));
      } else {
        return onChange(intVal + '.' + dotVal);
      }
    },
    [onChange]
  );

  const showValue = useMemo(() => {
    if (!value) return '';
    if (Number(value) === 0) return value;

    const [int = '', decimal = ''] = value.split('.');
    const dot = value.indexOf('.') > -1 ? '.' : '';
    return int.replace(/(\d)(?=(\d{3})+$)/g, '$1,') + dot + decimal;
  }, [value]);

  const handleBlur = useMemoCallback((event: FocusEvent<HTMLInputElement, Element>) => {
    if (onBlur) {
      onBlur(event);
    } else {
      const amount = Number(value) || 0;
      if (max && amount > max) {
        onChange(formatter.amount(max, currency.name).floor().toNumber().toString());
      } else if (min && amount < min) {
        onChange(formatter.amount(min, currency.name).ceil().toNumber().toString());
      } else if (amount) {
        onChange(formatter.amount(amount, currency.name).floor().toNumber().toString());
      }
    }
  });

  return (
    <BaseInput
      className={cn('bg-layer3', className)}
      type="text"
      value={showValue}
      inputMode="decimal"
      onChange={handleChange}
      onBlur={handleBlur}
      autoComplete="off"
      suffix={
        onMax && (
          <div className="flex h-full items-center gap-1">
            {Boolean(logo) && <img src={logo} className="size-5 rounded-full" />}
            <Button
              onClick={onMax}
              className="h-full bg-layer5"
              theme="transparent"
              type="button"
              disabled={others.disabled}
            >
              {t('Max')}
            </Button>
          </div>
        )
      }
      {...others}
    />
  );
}

export default memo(Input);
