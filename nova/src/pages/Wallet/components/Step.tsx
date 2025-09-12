import { ReactNode } from 'react';
import { SvgIcon } from '@components';
import { cn } from '@utils';

export default function Step(props: {
  value: number;
  status: 'progress' | 'success' | 'failed' | 'pending';
  children: ReactNode;
}) {
  const { status, children, value } = props;
  return (
    <div className="flex items-stretch gap-2">
      <div className="relative z-10">
        <div
          className={cn(
            'flex-center size-6 p-1 rounded-full',
            status === 'pending'
              ? 'bg-layer1 text-secondary'
              : status === 'failed'
                ? 'bg-error text-primary'
                : 'bg-success text-primary'
          )}
        >
          {status === 'pending' ? (
            value
          ) : status === 'progress' ? (
            <SvgIcon className="size-4 text-current animate-spin" name="progress" />
          ) : (
            <SvgIcon name={status === 'success' ? 'done' : 'close'} className="size-4 text-current" />
          )}
        </div>
        <span
          className={cn(
            'absolute top-1 left-1/2 -translate-x-1/2 bottom-0 -z-10 w-px',
            status === 'success' ? 'bg-success' : status === 'failed' ? 'bg-error' : 'bg-layer1'
          )}
        />
      </div>
      <div>{children}</div>
    </div>
  );
}
