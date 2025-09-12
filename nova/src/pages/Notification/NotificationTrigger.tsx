import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { markAsRead, setUserId, useReadIds } from '@store/notification';
import { Filters, useNotifyList, useUnreadCount } from '@store/notification/services';
import { NotificationInfo, NotificationType } from '@store/notification/type';
import { useUserInfo } from '@store/user';
import useNavigate from '@hooks/useNavigate';
import { useMediaQuery } from '@hooks/useResponsive';
import { Badge, Button, Empty, Loading, Popover, ScrollArea, SvgIcon } from '@components';
import SvgBell from '@components/SvgIcon/private/bell.svg';
import SvgFlag from '@components/SvgIcon/private/flag.svg';
import SvgLetter from '@components/SvgIcon/private/letter.svg';
import { formatter } from '@utils';

function NotificationPopover() {
  const { mobile } = useMediaQuery();
  const count = useUnreadCount();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const scrollViewRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationInfo[]>([]);
  const [announceReadIds, inboxReadIds, systemReadIds] = useReadIds();
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    pageSize: 10,
  });
  const { data, isLoading } = useNotifyList(filters);

  const hasMoreData = useMemo(() => {
    return notifications.length < data.total;
  }, [notifications.length, data.total]);

  const handleNotificationClick = useCallback(
    (item: NotificationInfo) => {
      dispatch(markAsRead([item.notificationType, item.id]));
      if (item.jumpUrl) {
        navigate(item.jumpUrl);
      }
    },
    [dispatch, navigate]
  );

  const getContent = useCallback((item: NotificationInfo) => {
    // 系统消息, 列表页, 需要截取掉()中的内容
    if (item.notificationType === NotificationType.System) {
      return item.content.replace(/\([^)]*\)/g, '');
    }
    return item.content;
  }, []);

  const renderUnReadIcon = useCallback(
    (item: NotificationInfo) => {
      let readIds: Set<number>;

      switch (item.notificationType) {
        case NotificationType.Announcements:
          readIds = announceReadIds;
          break;
        case NotificationType.InboxMessage:
          readIds = inboxReadIds;
          break;
        case NotificationType.System:
          readIds = systemReadIds;
          break;
        default:
          readIds = new Set();
      }

      return !readIds.has(item.id) ? <div className="w-2 h-2 rounded-full bg-error translate-y-1/2" /> : null;
    },
    [announceReadIds, inboxReadIds, systemReadIds]
  );

  const renderIcon = useCallback((item: NotificationInfo) => {
    switch (item.notificationType) {
      case NotificationType.Announcements:
        return <SvgBell className="size-4" />;
      case NotificationType.InboxMessage:
        return <SvgFlag className="size-4" />;
      case NotificationType.System:
        return <SvgLetter className="size-4" />;
      default:
        return <SvgBell className="size-4" />;
    }
  }, []);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMoreData) return;
    setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
  }, [isLoading, hasMoreData]);

  useEffect(() => {
    const scrollViewDOM = scrollViewRef.current;
    if (!scrollViewDOM) return;

    const handleScroll = () => {
      const threshold = 10;
      const { scrollTop, scrollHeight, clientHeight } = scrollViewDOM as HTMLElement;
      const atBottom = scrollHeight - (scrollTop + clientHeight) < threshold;
      if (atBottom) {
        loadMore();
      }
    };

    scrollViewDOM.addEventListener('scroll', handleScroll);
    return () => scrollViewDOM.removeEventListener('scroll', handleScroll);
  }, [loadMore, mobile]);

  // 监听数据变化，追加或重置通知列表
  useEffect(() => {
    if (data.items.length) {
      setNotifications((prev) => (filters.page === 1 ? data.items : [...prev, ...data.items]));
    }
  }, [data.items, filters.page]);
  return (
    <div className="flex w-80 flex-col gap-1 rounded-2 text-secondary text-12">
      <div className="flex px-4 items-center justify-between bg-layer5 rounded-2">
        <div className="flex gap-1 text-14">
          <span className="text-error">{count}</span>
          <span className="text-primary">{t('New notice')}</span>
        </div>
        <Button className="px-0 s768:px-0" size="md" theme="text" onClick={() => navigate('/dashboard/notification')}>
          <span className="text-12 text-secondary">{t('View more')}</span>
          <SvgIcon className="size-4" name="arrow" />
        </Button>
      </div>
      <ScrollArea className="h-72" ref={scrollViewRef}>
        {/* 首次加载状态 */}
        {isLoading && filters.page === 1 && <Loading />}
        {/* 空状态 */}
        {!isLoading && notifications.length === 0 && <Empty />}
        {notifications.map((item) => (
          <div
            className="flex p-4 gap-2 hover:bg-layer5 rounded-2 mb-1 cursor-pointer"
            key={item.id}
            onClick={() => handleNotificationClick(item)}
          >
            <div className="flex flex-row-reverse gap-2 w-8">
              {renderIcon(item)}
              {renderUnReadIcon(item)}
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-1 text-primary hover:text-brand">
              <div className="font-600">{item.title}</div>
              <div
                className="line-clamp-1 text-secondary font-500"
                dangerouslySetInnerHTML={{ __html: getContent(item) }}
              />
              <div className="text-10 text-secondary">{formatter.time(item.startTime)}</div>
            </div>
          </div>
        ))}
        {/* 加载更多状态 */}
        {isLoading && filters.page > 1 && <div className="flex justify-center text-12 mt-2">{t('loading...')}</div>}
        {/* 没有更多数据提示 */}
        {!isLoading && notifications.length > 0 && !hasMoreData && (
          <div className="flex justify-center text-12 mt-2">{t('No More Data')}</div>
        )}
      </ScrollArea>
    </div>
  );
}

function NotificationTrigger() {
  const { mobile } = useMediaQuery();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: userId } = useUserInfo().data;
  const count = useUnreadCount();
  useEffect(() => {
    dispatch(setUserId(userId));
  }, [dispatch, userId]);

  return (
    <>
      {mobile ? (
        <Button
          theme="secondary"
          className="size-9 s768:size-10"
          onClick={() => navigate('/dashboard/notification')}
          icon={
            <Badge className="top-1 right-1" count={count} size="small">
              <svg
                className="detrade-icon size-9"
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
              >
                <path
                  d="M11.7778 22.2222H24.2222V16.0276C24.2222 12.576 21.4364 9.77778 18 9.77778C14.5636 9.77778 11.7778 12.576 11.7778 16.0276V22.2222ZM18 8C22.4178 8 26 11.5938 26 16.0276V24H10V16.0276C10 11.5938 13.5822 8 18 8ZM15.7778 24.8889H20.2222C20.2222 25.4783 19.9881 26.0435 19.5713 26.4602C19.1546 26.877 18.5894 27.1111 18 27.1111C17.4106 27.1111 16.8454 26.877 16.4287 26.4602C16.0119 26.0435 15.7778 25.4783 15.7778 24.8889V24.8889Z"
                  fill="currentColor"
                />
              </svg>
            </Badge>
          }
        />
      ) : (
        <Popover
          trigger="click"
          overlayClassName="z-40 bg-layer4 y-max-80 overflow-y-auto"
          content={<NotificationPopover />}
        >
          <Button
            theme="secondary"
            className="size-9 s768:size-10"
            icon={
              <Badge className="top-1 right-1" count={count} size="small">
                <svg
                  className="detrade-icon size-9"
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  fill="none"
                >
                  <path
                    d="M11.7778 22.2222H24.2222V16.0276C24.2222 12.576 21.4364 9.77778 18 9.77778C14.5636 9.77778 11.7778 12.576 11.7778 16.0276V22.2222ZM18 8C22.4178 8 26 11.5938 26 16.0276V24H10V16.0276C10 11.5938 13.5822 8 18 8ZM15.7778 24.8889H20.2222C20.2222 25.4783 19.9881 26.0435 19.5713 26.4602C19.1546 26.877 18.5894 27.1111 18 27.1111C17.4106 27.1111 16.8454 26.877 16.4287 26.4602C16.0119 26.0435 15.7778 25.4783 15.7778 24.8889V24.8889Z"
                    fill="currentColor"
                  />
                </svg>
              </Badge>
            }
          />
        </Popover>
      )}
    </>
  );
}

export default memo(NotificationTrigger);
