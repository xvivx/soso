import {
  ComponentPropsWithoutRef,
  createContext,
  ElementRef,
  forwardRef,
  memo,
  ReactNode,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import useMemoCallback from '@hooks/useMemoCallback';
import { cn } from '@utils';
import Button from './Button';
import ScrollList from './ScrollList';

interface TabsProps {
  className?: string;
  defaultIndex?: number;
  children?: ReactNode;
  tabs?: { title: ReactNode; content?: ReactNode }[];
  onChange?: (index: number) => void;
  selectedIndex?: number;
  theme?: 'flat' | 'chip';
  direction?: 'vertical' | 'horizontal';
}

const TabsContext = createContext<
  Pick<TabsProps, 'theme' | 'direction'> & { value: string } & {
    manager: {
      header: Manager;
      content: Manager;
    };
  }
>();

const TabsHeader = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const { theme, direction } = useContext(TabsContext);
  const tabsList = (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'relative text-14 leading-4 text-secondary font-500 rounded-none bg-inherit',
        direction === 'horizontal'
          ? [
              'min-h-9 s768:min-h-12',
              theme === 'flat'
                ? 'inline-flex gap-1 p-1 rounded-2 bg-layer7'
                : 'flex grow justify-between s768:justify-start gap-2 border-b border-layer5',
            ]
          : 'block shrink-0 w-56 p-2 space-y-1 rounded-3 bg-layer7',
        className
      )}
      {...props}
    />
  );

  if (theme === 'flat') return tabsList;
  return (
    <ScrollList className="rounded-none bg-inherit" size="md">
      {tabsList}
    </ScrollList>
  );
});
TabsHeader.displayName = TabsPrimitive.List.displayName;

type TriggerProps = Omit<ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>, 'value' | 'className'> & {
  selectedClassName?: string;
  className?: string | ((selected: boolean) => string);
};
const TabsTrigger = forwardRef<ElementRef<typeof TabsPrimitive.Trigger>, TriggerProps>((props, ref) => {
  const { className, children, selectedClassName, ...rests } = props;
  const { theme, direction, value: tabsValue, manager } = useContext(TabsContext);
  const value = useRegistValue(manager.header);
  const selected = value === tabsValue;

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      {...rests}
      value={value}
      asChild
      className={cn(
        'relative px-3 py-2 s768:py-3 outline-none transition-colors duration-300',
        theme === 'flat' && 'whitespace-normal',
        direction === 'vertical' && 'w-full block text-left',
        selected ? 'z-10 text-primary font-700' : 'z-20 font-500',
        typeof className === 'function' ? className(selected) : className
      )}
    >
      {rests.disabled ? (
        <div>{children}</div>
      ) : (
        <Button size="free" theme="transparent" hoverable={false}>
          {selected && (
            <div
              className={cn(
                'absolute',
                theme === 'chip'
                  ? '-bottom-px z-10 inset-x-0 h-0.5 bg-brand'
                  : 'inset-0 -z-10 rounded-1.5 bg-tab_selected',
                selectedClassName
              )}
            />
          )}
          {children}
        </Button>
      )}
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

type TabsContentProps = Omit<ComponentPropsWithoutRef<typeof TabsPrimitive.Content>, 'value'>;
const TabsContent = forwardRef<ElementRef<typeof TabsPrimitive.Content>, TabsContentProps>((props, ref) => {
  const { manager } = useContext(TabsContext);
  const value = useRegistValue(manager.content);
  return <TabsPrimitive.Content ref={ref} value={value} {...props} />;
});
TabsContent.displayName = TabsPrimitive.Content.displayName;

export default Object.assign(memo(Tabs), {
  Item: TabsTrigger,
  Header: TabsHeader,
  Panel: TabsContent,
});

function Tabs(props: TabsProps) {
  const {
    className,
    defaultIndex = 0,
    selectedIndex,
    onChange,
    tabs,
    children,
    theme = 'flat',
    direction = 'horizontal',
  } = props;
  const [localValue, setLocalValue] = useState(() => (selectedIndex === undefined ? defaultIndex : selectedIndex));
  const value = String(selectedIndex === undefined ? localValue : selectedIndex);
  const onValueChange = useMemoCallback((value: string) => {
    (onChange || setLocalValue)(Number(value));
  });

  const manager = useMemo(
    () => ({
      header: new Manager(),
      content: new Manager(),
    }),
    []
  );

  const context = useMemo(
    () => ({ theme, direction, value: value.toString(), manager }),
    [theme, direction, value, manager]
  );

  return (
    <TabsContext.Provider value={context}>
      <TabsPrimitive.Root
        className={cn('space-y-3', direction === 'vertical' && 'flex items-start gap-3', className)}
        value={value}
        onValueChange={onValueChange}
        orientation={direction}
      >
        {children || [
          <TabsHeader key="heder">
            {tabs?.map((it, index) => (
              <TabsTrigger className="flex-1 break-words" key={index}>
                {it.title}
              </TabsTrigger>
            ))}
          </TabsHeader>,
          tabs?.map((it, index) => <TabsContent key={index}>{it.content}</TabsContent>),
        ]}
      </TabsPrimitive.Root>
    </TabsContext.Provider>
  );
}

class Manager {
  values: string[];
  constructor() {
    this.values = [];
  }
  add() {
    const value = String(this.values.length);
    this.values.push(value);
    return value;
  }
  del(value: string) {
    this.values = this.values.filter((item) => item !== value);
  }
}

function useRegistValue(manager: Manager) {
  const [value, setValue] = useState('');

  useLayoutEffect(() => {
    const value = manager.add();
    setValue(value);
    return () => {
      manager.del(value);
    };
  }, [manager]);

  return value;
}
