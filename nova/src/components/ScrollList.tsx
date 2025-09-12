import {
  Children,
  forwardRef,
  memo,
  MouseEvent,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { scroll } from 'framer-motion';
import { cn, mergeRefs } from '@utils';
import Button from './Button';
import SvgIcon from './SvgIcon';

interface ScrollListProps extends PropsWithChildren {
  className?: string;
  size: 'sm' | 'md' | 'lg';
}

const ScrollList = forwardRef<HTMLDivElement, ScrollListProps>(function ScrollList(props, ref) {
  const { className, children, size } = props;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [disableLeftButton, setDisableLeftButton] = useState(true);
  const [disableRightButton, setDisableRightButton] = useState(true);
  const childrenCount = Children.count(children);
  useEffect(() => {
    return scroll(
      (_, { x }) => {
        setDisableLeftButton(x.current < 10);
        setDisableRightButton(x.scrollLength - x.current < 10);
      },
      { container: scrollContainerRef.current!, axis: 'x' }
    );
  }, [childrenCount]);

  const onClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    (event.target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, []);

  return (
    <div
      className={cn('detrade-scroll-list relative flex overflow-x-auto no-scrollbar bg-layer3 select-none', className)}
      ref={mergeRefs(scrollContainerRef, ref)}
      onClick={onClick}
    >
      {children}
      <ScrollButton className="left-0 rotate-180 -order-1" size={size} disabled={disableLeftButton} />
      <ScrollButton className="right-0" size={size} disabled={disableRightButton} />
    </div>
  );
});

export default memo(ScrollList);

function ScrollButton(props: { className?: string; disabled?: boolean; size: ScrollListProps['size'] }) {
  const { className, disabled, size } = props;
  return (
    <Button
      className={cn(
        'sticky z-30 w-8 shrink-0 self-stretch !-ml-8 bg-inherit shadow-r rounded-none',
        disabled && 'opacity-0 pointer-events-none',
        className
      )}
      theme="transparent"
      size="free"
      hoverable={false}
    >
      <SvgIcon name="arrow" className={size === 'sm' ? 'size-4' : 'size-7'} />
    </Button>
  );
}
