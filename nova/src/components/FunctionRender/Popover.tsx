import {
  cloneElement,
  ForwardedRef,
  forwardRef,
  memo,
  ReactElement,
  ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import useMemoCallback from '@hooks/useMemoCallback';
import usePortalRootElement from '@hooks/usePortalRootElement';
import { cn } from '@utils';
import { createRender, render } from './store';
import useContextHolder from './useContextHolder';
// eslint-disable-next-line no-restricted-imports
import useDevice from './useDevice';

export interface PopoverProps extends Omit<PopoverPrimitive.PopoverContentProps, 'content' | 'asChild'> {
  className?: string;
  overlayClassName?: string;
  children: ReactElement;
  content: ((close: () => void, open: boolean) => ReactNode) | ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  trigger?: 'hover' | 'click';
  showArrow?: boolean;
}
type InnerProps = PopoverProps & { onOpenChange: NonNullable<PopoverProps['onOpenChange']> };
/**
 * 其他类似组件如Popover, 移动端的Select, Tooltip这类组件的交互都以Popover为基础
 *
 * 由于弹窗不需要trigger触发, 而且位置可预测, 所以可以做成函数式调用的组件调用会比较方便
 **/
function Popover(props: PopoverProps) {
  const { defaultOpen, open: visible, onOpenChange, ...rests } = props;
  const [open, setOpen] = useState(defaultOpen);
  const { mobile } = useDevice();
  const PopoverComponent = mobile ? MobilePopover : PcPopover;
  return <PopoverComponent {...rests} open={visible || open} onOpenChange={onOpenChange || setOpen} />;
}
Popover.displayName = 'Popover';

function MobilePopover(props: InnerProps) {
  const key = useId();
  const [contextHolder, contextWrapper] = useContextHolder();

  useEffect(() => {
    if (props.disabled) return;
    const { overlayClassName, open, onOpenChange, content } = props;
    const closeDropdown = () => onOpenChange(false);

    if (open) {
      createRender(
        contextWrapper(
          <div
            key={key}
            className={cn(
              'safe-bottom-area w-full flex max-h-[70vh] min-h-36 p-4 rounded-t-3 bg-layer4 border-layer4 overflow-hidden',
              overlayClassName
            )}
          >
            {typeof content === 'function' ? content(closeDropdown, open) : content}
          </div>
        ),
        {
          onClose: closeDropdown,
          closable: true,
        }
      );
    } else {
      render.delete(key);
    }
  }, [key, props, contextWrapper]);

  useEffect(() => {
    return () => {
      // 卸载时清除掉节点, 比如页面跳转时;
      render.delete(key);
    };
  }, [key]);

  const { onOpenChange, children, className, content } = props;
  if (!content) return children;
  return (
    <>
      <Trigger className={className} triggerType="click" onOpenChange={onOpenChange}>
        {children}
      </Trigger>
      {contextHolder}
    </>
  );
}

function PcPopover(props: InnerProps) {
  const {
    className,
    overlayClassName,
    children,
    content,
    defaultOpen,
    align = 'center',
    sideOffset = 8,
    open,
    onOpenChange,
    trigger = 'click',
    showArrow,
    ...rests
  } = props;
  const closePopover = useMemoCallback(() => onOpenChange(false));
  const element = usePortalRootElement();
  const contentRender = typeof content === 'function' ? content(closePopover, open || false) : content;
  const timerRef = useRef<NodeJS.Timeout>();
  const debounceChangeVisible = useMemoCallback((open: boolean, immediate?: boolean) => {
    clearTimeout(timerRef.current);
    if (open || immediate) {
      onOpenChange(open);
    } else {
      timerRef.current = setTimeout(closePopover, 150);
    }
  });
  const events = useMemo(() => {
    if (trigger === 'click') return;
    return {
      onMouseOver: () => clearTimeout(timerRef.current),
      onMouseLeave: () => debounceChangeVisible(false, true),
    };
  }, [trigger, debounceChangeVisible]);
  useEffect(() => () => clearTimeout(timerRef.current), []);
  // 在打开状态下再次点击会关闭popover, 类似开关效果
  const toggleOpenClick = useMemoCallback(() => onOpenChange(!open));

  if (!contentRender) return children;

  return (
    <PopoverPrimitive.Root defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger
        asChild
        className={cn('detrade-popover-trigger cursor-pointer', props.disabled && 'pointer-events-none', className)}
      >
        <Trigger triggerType={trigger} onOpenChange={trigger === 'click' ? toggleOpenClick : debounceChangeVisible}>
          {children}
        </Trigger>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal container={element}>
        <PopoverPrimitive.Content
          align={align}
          sideOffset={sideOffset}
          {...rests}
          {...events}
          className={cn(
            'flex max-h-100 max-w-100 p-3 rounded-3 bg-layer4 shadow-normal',
            'detrade-popover-content relative z-30 focus-visible:outline-none',
            overlayClassName
          )}
        >
          {contentRender}
          {showArrow && <PopoverPrimitive.Arrow key="arrow" className="fill-layer4 h-1.5" />}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

interface TriggerProps {
  className?: string;
  children: ReactElement;
  onOpenChange: (open: boolean) => void;
  triggerType: PopoverProps['trigger'];
}
const Trigger = forwardRef<HTMLElement, TriggerProps>(function (props, ref) {
  const triggerRef = useRef<HTMLElement>(null);
  const { triggerType, onOpenChange, children, className } = props;

  useEffect(() => {
    if (!triggerRef.current) return;

    const show = () => onOpenChange(true);
    const hide = () => onOpenChange(false);
    const trigger = triggerRef.current;
    if (triggerType === 'hover') {
      trigger.addEventListener('mouseenter', show, false);
      trigger.addEventListener('mouseleave', hide, false);
    } else {
      trigger.addEventListener('click', show, false);
    }
    return () => {
      trigger.removeEventListener('mouseenter', show);
      trigger.removeEventListener('mouseleave', hide);
      trigger.removeEventListener('click', show);
    };
  }, [triggerType, onOpenChange]);

  return (
    <AutoForwardRef className={className} refs={[ref, triggerRef]}>
      {children}
    </AutoForwardRef>
  );
});

type AutoForwardRefProps = {
  className?: string;
  children: ReactElement;
  refs: ForwardedRef<HTMLElement> | ForwardedRef<HTMLElement>[];
};
const AutoForwardRef = function AutoRef(props: AutoForwardRefProps) {
  const unique = useMemo(() => 'auto-ref' + Math.random().toString(32).slice(2), []);
  const { className, children, refs } = props;
  const setRefs = useMemoCallback((element: HTMLElement) => {
    (Array.isArray(refs) ? refs : [refs]).forEach((ref) => {
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    });
  });

  useEffect(() => {
    const element = document.body.querySelector(`.${unique}`) as HTMLElement;
    if (import.meta.env.MODE === 'development' && !element && !unique) {
      throw new Error("Popover or tooltip component's children must receive className prop");
    }
    setRefs(element);
  }, [unique, setRefs]);

  return cloneElement(children, {
    className: cn(unique, className, children.props.className),
  });
};

const ForwardAnchorRef = forwardRef<HTMLElement, { className?: string; children: ReactElement }>(function (props, ref) {
  const { className, children } = props;
  return (
    <AutoForwardRef className={className} refs={ref}>
      {children}
    </AutoForwardRef>
  );
});

function Anchor(props: { children: ReactElement }) {
  const { children } = props;
  const { mobile } = useDevice();

  if (mobile) return children;
  return (
    <PopoverPrimitive.Anchor asChild>
      <ForwardAnchorRef>{children}</ForwardAnchorRef>
    </PopoverPrimitive.Anchor>
  );
}

export default Object.assign(memo(Popover), { Anchor });
