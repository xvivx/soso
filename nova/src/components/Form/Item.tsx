import { memo, ReactNode, useEffect, useId, useRef } from 'react';
import Accordion from '@components/Accordion';
import { cn } from '@utils';

interface FormItemProps {
  className?: string;
  label: ReactNode;
  children: ReactNode;
  error?: ReactNode;
  required?: boolean;
  id?: string;
}

function FormItem(props: FormItemProps) {
  const { className, label, children, error, required, id } = props;
  const htmlId = useId();
  const divRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    if (!labelRef.current) return;
    const input = divRef.current!.querySelector('.detrade-input input') as HTMLInputElement;
    if (!input) return;

    const inputId = input.getAttribute('id');
    if (inputId) {
      labelRef.current.setAttribute('for', inputId);
    } else {
      input.setAttribute('id', htmlId);
      labelRef.current.setAttribute('for', htmlId);
    }
    if (required) input.required = true;
  }, [htmlId, required]);

  return (
    <div className={cn('detrade-form-item', error && 'detrade-form-error', className)} ref={divRef} id={id}>
      {label && (
        <label className="inline-flex mb-2 leading-4 text-secondary text-12 font-500 max-w-full" ref={labelRef}>
          {required && <span>*</span>}
          {label}
        </label>
      )}

      {children}

      <Accordion.Collapse className="w-full" defaultOpen={Boolean(error)}>
        <div className="pt-2 leading-4 text-error text-12 font-500 whitespace-normal">{error}</div>
      </Accordion.Collapse>
    </div>
  );
}

FormItem.displayName = 'FormItem';
export default memo(FormItem);
