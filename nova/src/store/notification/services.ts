import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useSWR from 'swr';
import { request } from '@utils/axios';
import { useReadIds } from '.';
import { NotificationInfo, NotificationType } from './type';

/** 获取横栏公告数据 */
export function useMarquees() {
  const lang = useSelector((state: StoreState) => state.system.lang);
  return useSWR(
    ['notification-marquee', lang],
    async function fetchMarqueeNotifications() {
      return await request.get<NotificationInfo[]>('/api/message/notification/marquee/get');
    },
    { keepPreviousData: true, fallbackData: [] }
  );
}

export function useUnreadMarquee() {
  const closedId = useSelector((state: StoreState) => state.notification.marquee.closedId);
  const { data: marquees } = useMarquees();
  return useMemo(() => {
    return marquees[0] && marquees[0].id === closedId ? undefined : marquees[0];
  }, [marquees, closedId]);
}

/** 获取通知、站内信、系统公告分页 */
export type Filters = {
  page: number;
  pageSize: number;
  notificationType?: NotificationType;
};
export function useNotifyList(filter: Filters) {
  const language = useSelector((state) => state.system.lang);

  return useSWR(
    ['notification-messages-list', filter, language],
    async ([_, params]) => {
      return await request.get<{ items: NotificationInfo[]; total: number }>(
        '/api/message/notification/messages',
        params
      );
    },
    {
      fallbackData: { items: [], total: 0 },
    }
  );
}

/** 获取通知、站内信、系统公告分页详情 */
export function useNotifyDetail(messageId: string) {
  const language = useSelector((state) => state.system.lang);

  return useSWR(['notification-messages-detail', messageId, language], async ([_, messageId]) => {
    return await request.get<NotificationInfo>(`/api/message/notification/messages/${messageId}`);
  });
}

/** 获取未读数 */
export function useUnreadCount() {
  const { data: totalCount } = useSWR(
    ['notification-messages-count'],
    async ([]) => {
      const { messageCount } = await request.get<{ messageCount: number }>(`/api/message/notification/messages/count`);
      return messageCount;
    },
    { fallbackData: 0, dedupingInterval: 0, revalidateOnMount: true, refreshInterval: 300 * 1000 }
  );
  const [announceReadIds, inboxReadIds, systemReadIds] = useReadIds();
  const unreadCount = useMemo(() => {
    return totalCount - announceReadIds.size - inboxReadIds.size - systemReadIds.size;
  }, [announceReadIds.size, inboxReadIds.size, systemReadIds.size, totalCount]);

  return unreadCount;
}
