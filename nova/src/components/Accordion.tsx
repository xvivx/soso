import { ComponentPropsWithoutRef, memo, PropsWithChildren, ReactNode, useState } from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { AnimatePresence, motion } from 'framer-motion';
import { SvgIcon } from '@components';
import { cn } from '@utils';

type Props = ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> & {
  items?: {
    value?: string;
    title: ReactNode;
    content: ReactNode;
  }[];
  children?: ReactNode;
};

function Accordion(props: Props) {
  const { items = [], className, children, ...primitives } = props;

  if (primitives.type === 'single') {
    // 默认single时collapsible为true
    primitives.collapsible = primitives.collapsible !== false;
  }

  return (
    <AccordionPrimitive.Root className={cn('accordion space-y-4', className)} {...primitives}>
      {children ||
        items.map((it, index) => {
          return (
            <AccordionPrimitive.Item key={it.value || index} value={it.value || String(index)}>
              <Title>{it.title}</Title>
              <Content>{it.content}</Content>
            </AccordionPrimitive.Item>
          );
        })}
    </AccordionPrimitive.Root>
  );
}

function Title({ className, children }: PropsWithChildren & { className?: string }) {
  return (
    <AccordionPrimitive.Trigger
      className={cn(
        'flex items-center justify-between w-full gap-1 p-3 pr-1 overflow-hidden text-left rounded-2 text-16 font-600 text-primary bg-layer3',
        className
      )}
    >
      {children}
      <SvgIcon name="arrow" className="transition-transform accordion-icon shrink-0" />
    </AccordionPrimitive.Trigger>
  );
}

function Content({ className, children }: PropsWithChildren & { className?: string }) {
  return (
    <AccordionPrimitive.Content className="overflow-hidden accordion-content">
      <div className={cn('py-6 text-secondary', className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

type CollapseProps = {
  className?: string;
  defaultOpen?: boolean;
  orientation?: Props['orientation'];
} & (
  | { children: ReactNode }
  | { children: ReactNode; content: ReactNode; collapsible?: boolean; orientation?: Props['orientation'] }
);
function Collapse(props: CollapseProps) {
  const { className, children, defaultOpen } = props;
  const [value, setValue] = useState(defaultOpen ? '1' : '');
  if ('content' in props) {
    const { content, children, ...rests } = props;
    return (
      <AccordionPrimitive.Root
        className={cn('accordion accordion-collapse', className)}
        type="single"
        value={value}
        onValueChange={setValue}
        asChild
        collapsible
        {...rests}
      >
        <AccordionPrimitive.Item value="1">
          <AccordionPrimitive.Trigger className="flex items-center gap-1 overflow-hidden text-12 font-500">
            {children}
            <SvgIcon
              name="arrow"
              className={cn(
                'transition-transform accordion-icon size-5 shrink-0 hover:text-current',
                value ? '-rotate-90' : 'rotate-90'
              )}
            />
          </AccordionPrimitive.Trigger>
          <AccordionPrimitive.Content className="overflow-hidden accordion-content text-12 text-secondary">
            <div className="pt-2">{content}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      </AccordionPrimitive.Root>
    );
  } else {
    const { orientation } = props;
    return (
      <AnimatePresence initial={false}>
        {defaultOpen && (
          <motion.div
            className={cn('overflow-hidden', className)}
            initial={orientation === 'horizontal' ? { width: 0 } : { height: 0 }}
            animate={orientation === 'horizontal' ? { width: 'auto' } : { height: 'auto' }}
            exit={orientation === 'horizontal' ? { width: 0 } : { height: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
}

export default Object.assign(memo(Accordion), {
  displayName: 'Accordion',
  Item: AccordionPrimitive.Item,
  Title,
  Content,
  Collapse: memo(Collapse),
});
