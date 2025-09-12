import { memo, ReactNode, useMemo, useState } from 'react';
import useMemoCallback from '@hooks/useMemoCallback';
import { cn, formatter } from '@utils';
import Empty from './Empty';
import { ScrollArea } from './ScrollArea';
import SvgIcon from './SvgIcon';

export type Column<T> = {
  /** header里标题 */
  title: ReactNode;
  /** 单元格取值的key */
  dataIndex: string;
  /** 每列宽度按设计稿指定 */
  width?: number;
  /** 单元格对齐方式 */
  align?: 'left' | 'right' | 'center';
  /** 自定义渲染函数 */
  render?: (row: T, index: number) => ReactNode;
  /** 固定布局 */
  fixed?: 'left' | 'right' | 'width';
  /** 会传给th做为class */
  th?: string;
  /** 会传给td做为class */
  td?: string;
  /** 时间会被格式化 */
  type?: 'time';
  /** 是否排序 */
  sort?: 'asc' | 'desc' | 'all';
};

interface TableProps<T> {
  className?: string;
  rowKey?: keyof T | 'index';
  columns: Column<T>[];
  dataSource?: T[];
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  onRowClick?: (row: T, index: number) => void;
  onSort?: (sortState: { key: string | null; order: SortOrder }) => void;
}

type SortOrder = 'asc' | 'desc' | null;
export type SortState = { key: string | null; order: SortOrder };

function Table<T = object>(props: TableProps<T>) {
  const { className, rowKey = 'id', columns, dataSource, size = 'md', loading, onRowClick, onSort } = props;
  const [sortState, setSortState] = useState<SortState>({ key: null, order: null });
  /**
   * asc/desc 只做选中/取消; all做三态切换
   */
  const handleSort = useMemoCallback((column: Column<T>) => {
    if (!column.sort) return;
    let newSortState: SortState;
    if (column.sort === 'all') {
      if (sortState.key !== column.dataIndex) {
        newSortState = { key: column.dataIndex, order: 'asc' };
      } else {
        let nextOrder: SortOrder;
        switch (sortState.order) {
          case 'asc':
            nextOrder = 'desc';
            break;
          case 'desc':
            nextOrder = null;
            break;
          default:
            nextOrder = 'asc';
        }
        newSortState = { key: nextOrder ? column.dataIndex : null, order: nextOrder };
      }
    } else {
      if (sortState.key === column.dataIndex) {
        newSortState = { key: null, order: null };
      } else {
        newSortState = { key: column.dataIndex, order: column.sort };
      }
    }
    setSortState(newSortState);
    onSort && onSort(newSortState);
  });
  const renderSortIcon = useMemoCallback((column: Column<T>) => {
    switch (column.sort) {
      case 'asc':
        return (
          <SvgIcon
            name="sort"
            className={cn('size-2', sortState.key === column.dataIndex && 'text-brand hover:text-brand')}
          />
        );
      case 'desc':
        return (
          <SvgIcon
            name="sort"
            className={cn('size-2', sortState.key === column.dataIndex && 'text-brand hover:text-brand rotate-180')}
          />
        );
      case 'all':
        return (
          <div className="flex flex-col justify-center items-center">
            <SvgIcon
              name="sort"
              className={cn(
                'size-2',
                sortState.key === column.dataIndex && sortState.order === 'asc' && 'text-brand hover:text-brand'
              )}
            />
            <SvgIcon
              name="sort"
              className={cn(
                'size-2 rotate-180',
                sortState.key === column.dataIndex && sortState.order === 'desc' && 'text-brand hover:text-brand'
              )}
            />
          </div>
        );
      default:
        break;
    }
  });
  // 如果所有的列都指定了宽度使用fixed布局
  const fixedLayout = useMemo(() => !columns.find((it) => !it.width), [columns]);
  const cellPaddings = useMemo(
    () => [
      size === 'sm' && 'py-1 first:pl-1 last:pr-1',
      size === 'md' && 'py-2 first:pl-2 last:pr-2',
      size === 'lg' && 'py-3 first:pl-3 last:pr-3',
    ],
    [size]
  );
  const gaps = useMemo(() => {
    const leftAndRightArray = columns.map((it, index) => it.align || (index === columns.length - 1 ? 'right' : 'left'));
    return leftAndRightArray.map((it, index) => {
      if (it === 'left') {
        if (leftAndRightArray[index - 1] === 'right') return '';
        return 'pl-3';
      } else {
        if (leftAndRightArray[index - 1] === 'left') return 'px-3';
        return 'pr-3';
      }
    });
  }, [columns]);
  const dataRows = dataSource || [];
  return (
    // 多套一层为了滚动时loading保持居中
    <ScrollArea
      className={cn(
        'detrade-table overflow-auto overscroll-auto',
        dataRows.length === 0 && 'min-h-72',
        loading && 'opacity-50',
        className
      )}
      enableX
      enableY
    >
      <table
        className={cn(
          'w-full text-primary font-500',
          dataRows.length > 0 && fixedLayout && 'table-fixed',
          size === 'sm' && 'text-12 leading-7',
          size === 'md' && 'text-13 leading-6',
          size === 'lg' && 'text-14 leading-6'
        )}
      >
        <thead className="relative z-10 bg-inherit">
          <tr className="text-secondary normal-case whitespace-nowrap">
            {columns.map((it, index) => {
              if (dataRows.length === 0 && !it.title) return null;

              const width = (dataRows.length > 0 && it.width) || 1;
              return (
                <th
                  className={cn(
                    'font-600',
                    cellPaddings,
                    gaps[index],
                    it.fixed && it.fixed !== 'width' && 'sticky z-10 bg-layer3',
                    dataRows.length > 0 && it.fixed === 'left' && 'left-0 fixed-left-cell',
                    dataRows.length > 0 && it.fixed === 'right' && 'right-0 fixed-right-cell',
                    it.th
                  )}
                  key={it.dataIndex}
                  align={it.align || (index === columns.length - 1 ? 'right' : 'left')}
                  // fixed时需要指定minWidth, 否则文字过少时宽度会达不到width, 比如显示日期时会换行导致实际宽度达不到fixed的宽度
                  style={fixedLayout ? { width } : it.fixed ? { width: width, minWidth: width } : { minWidth: width }}
                >
                  <div
                    className={cn('items-center gap-1 inline-flex', it.sort && 'cursor-pointer')}
                    onClick={() => handleSort(it)}
                  >
                    {it.title}
                    {renderSortIcon(it)}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className="bg-inherit">
          {dataRows.map((row, rowIndex) => {
            return (
              <tr
                key={rowKey === 'index' ? rowIndex : (row[rowKey as keyof T] as string)}
                className={cn('bg-inherit', onRowClick && 'cursor-pointer hoverable')}
                onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
              >
                {columns.map((it, columnIndex) => {
                  const cell = tdRender(it, row, rowIndex);
                  return (
                    <td
                      key={it.dataIndex}
                      align={it.align || (columnIndex === columns.length - 1 ? 'right' : 'left')}
                      className={cn(
                        cellPaddings,
                        gaps[columnIndex],
                        size === 'sm' ? 'first:rounded-l last:rounded-r' : 'first:rounded-l-2 last:rounded-r-2',
                        it.fixed && it.fixed !== 'width' ? 'sticky z-10 px-3 bg-layer3 !rounded-none' : 'truncate',
                        it.fixed === 'left' && 'left-0 fixed-left-cell',
                        it.fixed === 'right' && 'right-0 fixed-right-cell',
                        it.td
                      )}
                    >
                      {cell === undefined ? '--' : cell}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {!dataRows.length && <Empty className="absolute inset-0 min-h-0 pointer-events-none" />}
    </ScrollArea>
  );
}

export default memo(Table) as typeof Table;

function tdRender<T>(column: Column<T>, row: T, index: number) {
  if (column.render) return column.render(row, index);
  if (column.type === 'time') return formatter.time(row[column.dataIndex as keyof T] as string | number);
  return row[column.dataIndex as keyof T] as ReactNode;
}
