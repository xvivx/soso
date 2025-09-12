import { memo, useState } from 'react';
import useMemoCallback from '@hooks/useMemoCallback';
import { AmountInput, SvgIcon } from '@components';
import { cn } from '@utils';

interface props {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}
function MultiplierInput(props: props) {
  const { value, onChange, className } = props;
  const [focusing, setFocusing] = useState(false);
  const [localeValue, setLocaleValue] = useState(value);
  const handleInput = useMemoCallback((value) => {
    setFocusing(true);
    setLocaleValue(value);
  });
  const handleBlur = useMemoCallback(() => {
    setFocusing(false);
    onChange(localeValue);
  });

  return (
    <AmountInput
      className={cn('bg-layer2 pr-3', className)}
      size="lg"
      value={focusing ? localeValue : value}
      onChange={handleInput}
      onBlur={handleBlur}
      inputMode="numeric"
      autoComplete="off"
      suffix={<SvgIcon name="close" className="size-4" />}
    />
  );
}

export default memo(MultiplierInput);
