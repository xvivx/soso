import { memo } from 'react';
import { cn } from '@utils';
import Popover, { PopoverProps } from './FunctionRender/Popover';

const Tooltip = memo(function Tooltip(props: Omit<PopoverProps, 'showArrow'>) {
  const { side = 'top', overlayClassName, ...resets } = props;
  return (
    <Popover
      {...resets}
      side={side}
      showArrow
      sideOffset={4}
      overlayClassName={cn(
        's768:max-w-64 p-3 bg-layer4 cursor-text select-text text-12 text-primary font-500',
        overlayClassName
      )}
    />
  );
});

export default Object.assign(Tooltip, { Anchor: Popover.Anchor });
