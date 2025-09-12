import { forwardRef, Key, memo, ReactElement, ReactNode, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Input, Popover, PopoverProps, ScrollArea, SvgIcon } from '@components';
import { cn } from '@utils';

function Select<ValueType extends string | number>(props: SelectProps<ValueType>) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const {
    value,
    onChange,
    size = 'lg',
    className,
    overlayClassName,
    compact,
    options,
    children,
    align = 'start',
    side,
  } = props;
  const valueOptionsMatched = useMemo(() => {
    const flatOptions = options.reduce(
      (current, next) => (next.children ? current.concat(next.children) : current.concat(next)),
      [] as SelectProps<ValueType>['options']
    );
    return flatOptions.find((option) => option.value === value);
  }, [options, value]);
  return (
    <Popover
      overlayClassName={cn('p-0', overlayClassName)}
      open={dropdownVisible}
      onOpenChange={setDropdownVisible}
      align={align}
      side={side}
      content={(closeDropdown) => (
        <SelectCore<ValueType>
          {...props}
          className={cn('font-500', compact ? 'min-w-40' : 'w-80')}
          onChange={(value) => {
            onChange(value);
            closeDropdown();
          }}
          closeDropdown={closeDropdown}
        />
      )}
    >
      {children || (
        <Trigger
          className={cn(valueOptionsMatched ? 'text-primary' : 'text-secondary', className)}
          active={dropdownVisible}
          size={size}
        >
          {valueRender(props, valueOptionsMatched)}
        </Trigger>
      )}
    </Popover>
  );
}
export default memo(Select) as typeof Select;

interface TriggerProps {
  className?: string;
  active: boolean;
  onClick?: () => void;
  children: ReactNode;
  size: 'lg' | 'md' | 'xl';
}
const Trigger = forwardRef<HTMLDivElement, TriggerProps>(function Trigger(props, ref) {
  const { className, size, children, active, onClick } = props;
  return (
    <div
      ref={ref}
      className={cn(
        'detrade-select flex justify-between items-center gap-2 pl-3 pr-1.5',
        'rounded-2 bg-layer3 border border-input select-none overflow-hidden font-600',
        size === 'xl' && 'h-13 text-16',
        size === 'lg' && 'h-10 text-12 s768:h-12 s768:text-14',
        size === 'md' && 'h-8 text-12 s768:h-10 s768:text-14',
        className
      )}
      onClick={onClick}
    >
      <div className="flex-1 truncate">{children}</div>
      <SvgIcon
        name="arrow"
        className={cn(
          'transition-all hover:text-current size-5',
          size === 'xl' && 'size-7',
          active ? '-rotate-90' : 'rotate-90'
        )}
      />
    </div>
  );
});

function SearchHistoryItem<ValueType>(props: {
  item: HistoryItemType<ValueType>;
  itemRender: SearchHistoryProps<ValueType>['itemRender'];
  onItemClick: SearchHistoryProps<ValueType>['onItemClick'];
}) {
  const { item, itemRender, onItemClick } = props;
  if (itemRender && typeof itemRender === 'function') {
    return itemRender(item);
  }
  return (
    <div
      className="gap-1.5 bg-layer5 rounded-[38px] px-2 py-1 flex items-center cursor-pointer hover:darkness"
      onClick={() => onItemClick(item.value)}
    >
      <Image className="rounded-full size-5" src={item.logoUrl} />
      <span className="text-primary font-500 truncate text-14 s768:max-w-20">{String(item.label || item.value)}</span>
    </div>
  );
}
function SearchHistoryPanel<ValueType>(props: SearchHistoryProps<ValueType>) {
  const { histories, onCancel, onItemClick, itemRender, closeDropdown } = props;
  const { t } = useTranslation();
  if (!histories.length) return null;
  return (
    <div className="p-3 space-y-1">
      <div className="flex items-center justify-between text-tertiary text-12 font-500 space-y-3">
        <span>{t('Recent')}</span>
        <SvgIcon name="remove" className="size-4" onClick={onCancel} />
      </div>
      <div className="gap-3 flex">
        {histories.map((historyItem) => (
          <SearchHistoryItem<ValueType>
            item={historyItem}
            itemRender={itemRender}
            key={historyItem.value as Key}
            onItemClick={(value) => {
              onItemClick(value);
              closeDropdown?.();
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SelectCore<ValueType>(props: SelectProps<ValueType>) {
  const { options: originOptions, searchable, className, searchHistory, onSearch, closeDropdown } = props;
  const [filterText, setFilterText] = useState('');
  const options = useMemo(() => {
    const keyText = filterText.trim();
    if (!keyText) return originOptions;
    // 根据搜索过滤option
    return (
      originOptions
        // 如果有分组就保留因为不知道children里有没有匹配的, 暂时进入下一层过滤
        .filter(
          (group) => (group.children && group.children.length) || filterOption<ValueType>(keyText, group, onSearch)
        )
        .map((group) => ({
          ...group,
          // 过滤掉children不匹配的
          children: group.children?.filter((option) => filterOption(keyText, option, onSearch)),
        }))
    );
  }, [originOptions, filterText, onSearch]);

  if (searchable) {
    return (
      <div className={cn('flex-1 flex flex-col py-4 s768:py-3 gap-3', className)}>
        <Input.Search className="mx-4 s768:mx-3 bg-layer3" value={filterText} onChange={setFilterText} />
        {searchHistory ? <SearchHistoryPanel<ValueType> {...searchHistory} closeDropdown={closeDropdown} /> : null}
        <SelectPanel {...props} options={options} className="px-4 s768:px-3" />
      </div>
    );
  } else {
    return <SelectPanel {...props} options={options} className={cn('p-4 s768:p-3', className)} />;
  }
}

function SelectPanel<ValueType>(props: SelectProps<ValueType>) {
  const { t } = useTranslation();
  const { options, value, onChange, placeholder, className } = props;
  const valueTypeIsString = typeof value === 'string';
  const placeholderOption = useMemo<Option<ValueType>[]>(
    // 如果传入的value是字符串类型就用空值当默认值, 目前不打算用0做为数字类型的默认值, 0可能做为枚举值有业务含义
    () => (placeholder ? [{ label: placeholder, value: (valueTypeIsString ? '' : undefined) as ValueType }] : []),
    [placeholder, valueTypeIsString]
  );

  if (options.reduce((count, group) => count + (group.children ? group.children.length : 1), 0) === 0) {
    return <div className="p-10 flex-center text-secondary text-14">{t('No data available')}</div>;
  }
  const concatOptions = placeholderOption.concat(options);
  return (
    /* 要让滚动容器有边距, 不然滚动条会压在内容上 */
    <ScrollArea className={cn('flex-1 text-14', className)}>
      {concatOptions.map((group, index) => {
        if (group.children) {
          return (
            <div className={index === concatOptions.length - 1 ? '' : 'mb-3'} key={group.value as Key}>
              <div
                className={cn(
                  'sticky top-0 z-10 px-3 py-1 text-secondary text-12 font-500 bg-layer4 truncate',
                  group.className
                )}
              >
                {typeof group.label === 'function' ? group.label() : group.label}
              </div>
              <div className="space-y-1">
                {group.children.map((option) => (
                  <OptionItem
                    key={option.value as Key}
                    option={option}
                    selected={option.value === value}
                    onSelect={onChange}
                  />
                ))}
              </div>
            </div>
          );
        } else {
          return (
            <OptionItem<ValueType>
              className={cn(
                index === concatOptions.length - 1 ? '' : 'mb-1',
                group === placeholderOption[0] && 'text-secondary'
              )}
              key={(group === placeholderOption[0] ? 'placeholder' : group.value) as Key}
              option={group}
              selected={group.value === value}
              onSelect={onChange}
            />
          );
        }
      })}
    </ScrollArea>
  );
}

function OptionItem<ValueType>(props: {
  className?: string;
  option: Option<ValueType>;
  selected: boolean;
  onSelect: (value: ValueType) => void;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const { className, option, selected, onSelect } = props;

  useLayoutEffect(() => {
    if (!selected || !divRef.current) return;

    let scrollView: HTMLElement | null = divRef.current.parentElement;
    // 这里不要使用scrollIntoView来做滚动, 这个方法会带动FunctionRender里的遮罩层里的100% + 1px元素滚动, 导致失效动画不是从最底部开始
    while (scrollView) {
      if (!scrollView.hasAttribute('data-radix-scroll-area-viewport')) {
        scrollView = scrollView.parentElement;
      } else {
        const diffTop =
          divRef.current.offsetTop +
          divRef.current.clientHeight / 2 -
          (scrollView.scrollTop + scrollView.clientHeight / 2);

        const animateFrameId = window.requestAnimationFrame(() => {
          scrollView!.scroll({ left: 0, top: diffTop });
        });
        return () => {
          window.cancelAnimationFrame(animateFrameId);
        };
      }
    }
  }, [selected]);

  return (
    <div
      ref={divRef}
      className={cn(
        'flex items-center justify-between gap-4 pl-3 pr-2 py-2.5 rounded-2 cursor-pointer overflow-hidden hover:darkness',
        selected ? 'darkness' : '',
        className,
        option.className
      )}
      onClick={() => onSelect(option.value)}
    >
      <div className="flex-1 overflow-hidden leading-5 truncate">
        {typeof option.label === 'function' ? option.label() : option.label}
      </div>
      {selected && <div className="size-5 border-[6px] border-success rounded-full" />}
    </div>
  );
}

function filterOption<ValueType>(key: string, option: Option<ValueType>, filter: SelectProps<ValueType>['onSearch']) {
  if (option.filter) {
    return option.filter(key, option);
  } else if (typeof filter === 'function') {
    return filter(key, option);
  } else if (typeof option.label === 'string') {
    return option.label.toLowerCase().indexOf(key.toLowerCase()) > -1;
  } else {
    console.error(option);
    throw new Error('Option Type Error');
  }
}

function valueRender<ValueType>(props: SelectProps<ValueType>, valueMatched?: Option<ValueType>) {
  // 未选择时渲染placeholder
  if (!valueMatched) return props.placeholder;
  if (typeof valueMatched.label === 'function') {
    return valueMatched.label(true);
  } else {
    return valueMatched.label;
  }
}

type Option<ValueType> = {
  label: ReactNode | ((inValue?: boolean) => ReactNode);
  value: ValueType;
  /** 有搜索功能时根据字段内容进行搜索, 如果不提供将回退到label字段 */
  filter?: (key: string, option: Option<ValueType>) => boolean;
  children?: Option<ValueType>[];
  className?: string;
};

export type HistoryItemType<ValueType> = {
  logoUrl: string;
  value: ValueType;
  label?: string;
  [key: string]: any;
};

export interface SearchHistoryProps<ValueType> {
  /** 清空历史回调 */
  onCancel: () => void;
  /** 选中单个项的回调 */
  onItemClick: (value: ValueType) => void;
  /** 历史记录 */
  histories: HistoryItemType<ValueType>[];
  /** 自定义渲染单个记录项 */
  itemRender?: (item: HistoryItemType<ValueType>) => ReactElement;
  /** 选中单个历史，关闭弹窗 */
  closeDropdown?: () => void;
}

export interface SelectProps<ValueType> {
  /** 目前value只支持字符串和数字 */
  value?: ValueType;
  onChange: (value: ValueType) => void;
  /** 启用搜索功能时如果传入会执行, 优先级次于option中的filter */
  onSearch?: (search: string, option: Option<ValueType>) => boolean;
  options: Option<ValueType>[];
  /** 默认是lg, 高48 */
  size?: 'md' | 'lg' | 'xl';
  /** 未选择时显示的内容 */
  placeholder?: ReactNode;
  /** 启用搜索功能 */
  searchable?: boolean;
  /** 搜索历史，当开启搜索且该属性激活 */
  searchHistory?: SearchHistoryProps<ValueType>;
  className?: string;
  overlayClassName?: string;
  /** 较窄的下拉框方式, 不提供定制dropdown的样式防止开发滥用 */
  compact?: boolean;
  children?: ReactElement;
  /** 下拉框的对齐方式 */
  align?: PopoverProps['align'];
  side?: PopoverProps['side'];
  /** 关闭弹窗 */
  closeDropdown?: () => void;
}
