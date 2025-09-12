import { DOMAttributes, ReactNode } from 'react';
import { SvgIcon } from '@components';
import { cn } from '@utils';
import { createRender } from './store';

interface MessageProps extends DOMAttributes<HTMLDivElement> {
  className?: string;
  title?: ReactNode;
  children: ReactNode;
  type: 'error' | 'success' | 'warning';
  onClose?: () => void;
}

export function Message(props: MessageProps) {
  const { children, title, className, type, onClose, ...resets } = props;

  return (
    <div
      className={cn(
        'flex items-start gap-2 px-2 py-2.5 rounded-2 overflow-hidden',
        'bg-black/75 shadow-lg text-white',
        className
      )}
      {...resets}
    >
      {type === 'success' ? (
        <SvgIcon name="check" className="text-primary_brand" />
      ) : type === 'error' ? (
        <SvgIcon name="error" className="text-error" />
      ) : null}

      <div className="flex-1 pt-0.5 text-13 font-600 overflow-hidden">
        {title && <div className="mb-1">{title}</div>}
        <div>{children}</div>
      </div>

      <SvgIcon name="close" className="p-1 shrink-0" onClick={onClose} />
    </div>
  );
}

type MessageOptions =
  | string
  | {
      title?: ReactNode;
      content: ReactNode;
      className?: string;
      duration?: number;
      key?: string | number;
    };

const timerMaps: Record<string | number, NodeJS.Timeout> = {};
function showMessage(options: MessageOptions, type: MessageProps['type']) {
  const {
    title,
    content,
    className,
    duration = 3000,
    key,
  } = typeof options === 'string' ? ({ content: options } as Exclude<MessageOptions, string>) : options;

  const unique = key ? key : typeof content === 'string' ? content : Math.random();
  if (timerMaps[unique]) {
    clearTimeout(timerMaps[unique]);
  }

  const destroy = createRender(
    <Message
      key={unique}
      className={className}
      title={title}
      type={type}
      onClose={clear}
      onMouseEnter={() => {
        clearTimeout(timerMaps[unique]);
      }}
      onMouseLeave={() => {
        clearTimeout(timerMaps[unique]);
        timerMaps[unique] = setTimeout(clear, duration);
      }}
    >
      {content}
    </Message>,
    'message'
  );

  function clear() {
    clearTimeout(timerMaps[unique]);
    delete timerMaps[unique];
    destroy();
  }

  timerMaps[unique] = setTimeout(clear, duration);
}

function error(options: MessageOptions) {
  showMessage(options, 'error');
}

function success(options: MessageOptions) {
  showMessage(options, 'success');
}

function warning(options: MessageOptions) {
  showMessage(options, 'warning');
}

const message = {
  error,
  success,
  warning,
};

export default message;
