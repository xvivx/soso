/**
 * 获取周活动tickets列表数据
 */
import { useEffect, useState } from 'react';
import { request } from '@utils/axios';

export interface TicketStats {
  activeTicket: number;
  avatar: string;
  coupon: string;
  createTime: number;
  prize: number;
  totalPrizeWon: number;
  totalTicket: number;
  totalWinningTicket: number;
  userId: number;
  username: string;
}

interface Tickets {
  currentAmount: number;
  ticketAmount: number;
  totalTicket: number;
  ticketList: {
    items: TicketStats[];
    total: number;
  };
}

function useTickets(props: {
  activityId?: number;
  page: number;
  pageSize: number;
  code?: string;
  type: 'active' | 'past' | 'result';
}) {
  const [tickets, setTickets] = useState<Tickets>();
  const { activityId, page, pageSize, code, type } = props;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!activityId) return;
      try {
        setLoading(true);
        const res = await request.get<Tickets>('/api/transaction/activity/week/ticket/list', {
          activityId,
          page,
          pageSize,
          code,
          type,
        });
        setTickets(res);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activityId, page, pageSize, code, type]);

  return { tickets, loading };
}

export default useTickets;
