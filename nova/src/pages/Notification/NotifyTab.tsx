import { memo, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { markAsRead, useReadIds } from '@store/notification';
import { Filters, useNotifyList } from '@store/notification/services';
import { NotificationInfo, NotificationType } from '@store/notification/type';
import useNavigate from '@hooks/useNavigate';
import { Accordion, Button, Empty, Loading, Pagination, SvgIcon } from '@components';
import { ButtonClickEvent } from '@components/Button';
import { cn, formatter } from '@utils';

interface NotifyTabProps {
  type: NotificationType;
}

const LINE_CLAMP_COUNT = 2;

function NotifyTab({ type }: NotifyTabProps) {
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    pageSize: 10,
    notificationType: type,
  });
  const { data, isLoading } = useNotifyList(filters);
  const [announceReadIds, inboxReadIds, systemReadIds] = useReadIds();

  // 根据通知类型获取对应的已读ID集合
  const getReadIds = useCallback(() => {
    switch (type) {
      case NotificationType.Announcements:
        return announceReadIds;
      case NotificationType.InboxMessage:
        return inboxReadIds;
      case NotificationType.System:
        return systemReadIds;
      default:
        return new Set<number>();
    }
  }, [type, announceReadIds, inboxReadIds, systemReadIds]);

  const renderUnReadIcon = useCallback(
    (item: NotificationInfo) => {
      const readIds = getReadIds();
      return !readIds.has(item.id) ? <div className="w-2 h-2 rounded-full bg-error shrink-0" /> : null;
    },
    [getReadIds]
  );

  const onPageChange = useCallback((current: number) => {
    setFilters((prev) => ({ ...prev, page: current }));
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 0);
  }, []);

  return (
    <NotifyContainer>
      {Boolean(data.items.length) && (
        <Accordion type="single">
          {data.items.map((item) => (
            <NotifyItem key={item.id} data={item} unreadIcon={renderUnReadIcon(item)} />
          ))}
        </Accordion>
      )}
      {data.total > filters.pageSize && (
        <Pagination
          className="mt-2.5"
          current={filters.page}
          pageSize={filters.pageSize}
          total={data.total}
          onChange={onPageChange}
        />
      )}
      {!data.items.length && <Empty />}
      {isLoading && <Loading />}
    </NotifyContainer>
  );
}

export default memo(NotifyTab);

function NotifyContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('relative bg-layer3 rounded-2 p-2 s768:px-8 s768:py-4', className)}>{children}</div>;
}

function NotifyItem(props: { key: number; data: NotificationInfo; unreadIcon?: ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data, unreadIcon } = props;
  const { id, title, content, startTime, jumpUrl, notificationType } = data;
  const [collapsed, setCollapsed] = useState({ visible: false, value: true });
  const contentRef = useRef<HTMLDivElement>(null);
  const isAnnouncements = notificationType === NotificationType.Announcements;

  const htmlContent = useMemo(() => {
    return notificationType === NotificationType.System ? content.replace(/\([^)]*\)/g, '') : content;
  }, [content, notificationType]);

  const handleViewMore = useCallback(
    (e: ButtonClickEvent) => {
      e.stopPropagation();
      dispatch(markAsRead([notificationType, id]));
      jumpUrl && navigate(jumpUrl);
    },
    [dispatch, id, jumpUrl, navigate, notificationType]
  );

  const handleClick = useCallback(() => {
    dispatch(markAsRead([notificationType, id]));
    if (isAnnouncements) {
      navigate(`/dashboard/messages/${id}`);
    } else {
      setCollapsed((pre) => ({ ...pre, value: !pre.value }));
    }
  }, [dispatch, id, isAnnouncements, navigate, notificationType]);

  useEffect(() => {
    const el = contentRef.current;
    if (el && !isAnnouncements) {
      // 临时展开测量
      const prevDisplay = el.style.display;
      const prevLineClamp = el.style.webkitLineClamp;
      const prevBoxOrient = el.style.webkitBoxOrient;
      const prevOverflow = el.style.overflow;
      const prevMaxHeight = el.style.maxHeight;

      el.style.display = '-webkit-box';
      el.style.webkitLineClamp = 'unset';
      el.style.webkitBoxOrient = 'vertical';
      el.style.overflow = 'visible';
      el.style.maxHeight = 'none';

      const style = getComputedStyle(el);
      const lineHeight = parseFloat(style.lineHeight);
      const maxHeight = lineHeight * LINE_CLAMP_COUNT;
      const actualHeight = el.scrollHeight;

      // 恢复原样式
      el.style.display = prevDisplay;
      el.style.webkitLineClamp = prevLineClamp;
      el.style.webkitBoxOrient = prevBoxOrient;
      el.style.overflow = prevOverflow;
      el.style.maxHeight = prevMaxHeight;
      if (actualHeight > maxHeight) {
        setCollapsed({ visible: true, value: true });
      }
    }
  }, [isAnnouncements]);

  return (
    <div className="text-secondary text-14 font-medium border-b border-solid border-thirdly pt-2 pb-6">
      <div
        className={cn(
          'flex pb-2 justify-between items-center',
          (isAnnouncements || collapsed.visible) && 'cursor-pointer'
        )}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 shrink-0">{unreadIcon}</div>
          <div className="text-primary font-700 font-bold break-all line-clamp-1">{title}</div>
        </div>
        {collapsed.visible && (
          <Button
            size="sm"
            theme="text"
            icon={
              <SvgIcon
                className={cn(
                  'size-4 text-tertiary transition-all duration-200 ease-in-out rotate-90',
                  collapsed.value && 'rotate-0'
                )}
                name="arrow"
              />
            }
          />
        )}
      </div>
      <div
        className={cn(
          'px-4 font-500 transition-all duration-200 ease-in-out break-words',
          isAnnouncements && 'line-clamp-2',
          collapsed.visible && collapsed.value && 'line-clamp-2'
        )}
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
      <div className="flex pt-2 justify-between items-center w-full pl-4">
        <div className="leading-5">{formatter.time(startTime)}</div>
        {!isAnnouncements && jumpUrl && (
          <Button className="underline" size="sm" theme="text" onClick={handleViewMore}>
            {t('View more')}
          </Button>
        )}
      </div>
    </div>
  );
}
