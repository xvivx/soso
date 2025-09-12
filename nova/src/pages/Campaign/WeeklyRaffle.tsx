import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useUserInfo } from '@store/user';
import useCountDownTimeByUTC from '@hooks/useCountDownTimeByUTC';
import { useMediaQuery } from '@hooks/useResponsive';
import { AnimateNumber, Button, Column, Image, Pagination, Select, SvgIcon, Table, Tabs } from '@components';
import { cn, formatter } from '@utils';
import { request } from '@utils/axios';
import { Card } from '@pages/components';
import weekly from './assets/weeklyDraw.png';
import useActivity from './hooks/useActivity';
import useTickets, { TicketStats } from './hooks/useTickets';
import TimeCountDown from './TimeCountDown';

function WeeklyRaffle() {
  const { isTemporary } = useUserInfo().data;
  const activity = useActivity('weekly');

  return (
    <div className="space-y-3">
      <LuckyPool endTime={activity?.endTime} prizePool={activity?.prizePool} currentCount={activity?.currentCount} />
      <WeeklyDraw prizePool={activity?.prizePool} ticketQuota={activity?.ticketQuota} />
      {!isTemporary && <MyTickets activityId={activity?.id} />}
      <Result activityId={activity?.id} />
    </div>
  );
}

export default WeeklyRaffle;

function LuckyPool(props: { endTime?: number; prizePool?: number; currentCount?: number }) {
  const { t } = useTranslation();
  const { endTime, prizePool, currentCount = 0 } = props;

  const time = useCountDownTimeByUTC(endTime);

  return (
    <div className="flex flex-col gap-3 s768:flex-row s768:items-center">
      <div
        className="flex flex-col items-center py-4 s768:flex-1 rounded-3 s768:py-6"
        style={{
          backgroundImage: 'linear-gradient(90deg, rgba(36, 238, 137, 0.2) 2.38%, rgba(159, 232, 113, 0.2) 101.26%)',
        }}
      >
        <div className="uppercase text-14 s768:text-16 font-700 text-success">{t('lucky poll')}</div>
        <div className="my-3 text-32 font-700 text-brand_alt">
          <span>$</span>
          <AnimateNumber value={prizePool} as="span" precision={0} />
        </div>
        <Button theme="primary" size="lg">
          {t('earn ticket')}
        </Button>
        <div className="mt-4 leading-3 text-12 s768:text-14 text-secondary">
          <Trans
            i18nKey="<0>[{{count}}]</0> tickets have been sent this round!"
            values={{
              count: currentCount,
            }}
          >
            <span className="text-brand" />
          </Trans>
        </div>
      </div>
      <div className="gap-3 py-6 flex-center flex-col s768:self-stretch s768:flex-1 bg-layer4 rounded-3">
        <div className="text-14 s768:text-16 font-700 text-success">{t('Next Draw Starts in')}</div>
        <TimeCountDown time={time} showDay />
      </div>
    </div>
  );
}

function WeeklyDraw(props: { prizePool?: number; ticketQuota?: number }) {
  const { t } = useTranslation();
  const { prizePool, ticketQuota = 0 } = props;
  const currency = 'USDFIAT';

  return (
    <div className="detrade-card s768:px-8 s768:py-7 flex flex-col items-center justify-between gap-8 s768:flex-row">
      <div className="space-y-2 max-w-[600px]">
        <div className="text-16 font-700">{t('Detrade weekly draw')}</div>
        <div className="text-primary">
          <Trans
            i18nKey="Join our weekly random lottery and share <0>${{amount}}</1>!"
            values={{
              amount: formatter.amount(prizePool || 0, currency).toText(),
            }}
          >
            <span className="text-brand" />
          </Trans>
        </div>
        <div className="text-12 s768:text-14 text-secondary">
          <Trans
            i18nKey="For every ${{ticketQuota}} trade on our <0>high low spread</0>, you will automatically receive a raffle ticket. So make sure to win the best opportunity for yourself by earning as many tickets as possible!"
            values={{
              ticketQuota: ticketQuota,
            }}
          >
            <span className="text-brand_alt" />
          </Trans>
        </div>
        <div className="text-12 s768:text-14 text-secondary">
          {t(
            'The winners will be announced on the current page every Sunday at 10 PM (UTC), and the next draw will start 2 hours after the last draw.'
          )}
        </div>
        <div className="inline-flex items-center cursor-pointer text-14">
          <span className="text-brand">{t('Winning prize details')}</span>
          <SvgIcon name="arrow" />
        </div>
      </div>
      <Image className="h-56 w-[266px] shrink-0" src={weekly} />
    </div>
  );
}

function MyTickets(props: { activityId?: number }) {
  const { t } = useTranslation();
  const { activityId } = props;
  const [stats, setStats] = useState<TicketStats>();

  useEffect(() => {
    if (!activityId) return;
    (async () => {
      try {
        const res = await request.get<TicketStats>('/api/transaction/activity/week/ticket/stats', {
          activityId,
        });
        setStats(res);
      } catch (error) {
        console.error('Failed to fetch ticket stats:', error);
      }
    })();
  }, [activityId]);

  return (
    <Card className="s768:p-8 s768:pt-4" title={t('my tickets')}>
      <div className="grid grid-cols-2 p-4 capitalize s768:grid-cols-4 bg-success/10 rounded-2">
        <Description label={t('Active tickets')} className="border-b border-r s768:border-b-0">
          {formatter.price(stats?.activeTicket || 0, 0).toText()}
        </Description>
        <Description label={t('Total tickets')} className="border-b s768:border-r s768:border-b-0">
          {formatter.price(stats?.totalTicket || 0, 0).toText()}
        </Description>
        <Description label={t('Winning Tickets')} className="border-r">
          {formatter.price(stats?.totalWinningTicket || 0, 0).toText()}
        </Description>
        <Description label={t('Total prize won')} className="s768:border-l-0">
          <div className="text-up">{formatter.price(stats?.totalPrizeWon || 0, 0).toText()}</div>
        </Description>
      </div>
      <Tabs className="my-3" direction="horizontal">
        <Tabs.Header className="bg-layer8">
          <Tabs.Item>{t('Active')}</Tabs.Item>
          <Tabs.Item>{t('Past')}</Tabs.Item>
        </Tabs.Header>

        <div>
          <Tabs.Panel>
            <TicketsTable type="active" activityId={activityId} />
          </Tabs.Panel>
          <Tabs.Panel>
            <TicketsTable type="past" activityId={activityId} />
          </Tabs.Panel>
        </div>
      </Tabs>
    </Card>
  );
}

function Result(props: { activityId?: number }) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [codeList, setCodeList] = useState<string[]>([]);
  const [tableData, setTableData] = useState<TicketStats[]>([]);
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);
  const { activityId } = props;
  const { tickets, loading } = useTickets({ ...filters, activityId, type: 'result', code });
  const { mobile } = useMediaQuery();
  const currency = 'USDFIAT';

  useEffect(() => {
    if (!activityId) return;
    (async () => {
      try {
        const res = await request.get<{ items: string[]; total: number }>(
          '/api/transaction/activity/week/ticket/code/list',
          {
            activityId,
          }
        );
        setCodeList(res.items);
        if (res.total > 0) {
          setCode(res.items[0]);
        }
      } catch (error) {
        console.error('Failed to fetch ticket code list:', error);
      }
    })();
  }, [activityId]);

  useEffect(() => {
    if (!tickets) return;
    setTableData(tickets.ticketList.items);
    setTotal(tickets.ticketList.total);
  }, [tickets]);

  const columns = useMemo<Column<TicketStats>[]>(() => {
    return [
      {
        title: t('no') + '.',
        dataIndex: 'userId',
        width: mobile ? 40 : 100,
        render: (_, index) => index + 1,
      },
      {
        title: t('trader'),
        dataIndex: 'username',
        width: 200,
        render: (row) => {
          return (
            <div className="flex items-center gap-2">
              <Image src={row.avatar} className="size-6 rounded-2 shrink-0" />
              <div className="truncate">{row.username}</div>
            </div>
          );
        },
      },
      {
        title: t('tickets number'),
        dataIndex: 'coupon',
        width: 150,
      },
      {
        title: t('prize'),
        dataIndex: 'prize',
        width: 100,
        render: ({ prize }) => {
          return <div className="text-up">{formatter.amount(prize, currency).toText()}</div>;
        },
      },
    ];
  }, [t, mobile, currency]);

  return (
    <Card className="s768:p-8 s768:pt-4" title={t('results')}>
      <div className="flex flex-col gap-3 s768:flex-row s768:items-center s768:justify-between">
        {Boolean(codeList.length) && (
          <Select
            className="w-50 s768:w-auto"
            options={codeList.map((code) => ({ label: code, value: code }))}
            value={code}
            onChange={setCode}
          />
        )}
        <div className="text-1 text-12 s768:text-16 text-secondary s768:ml-auto">
          <Trans
            i18nKey="Total participated tickets for this round <0>{{total}}</0>"
            values={{
              total: tickets?.totalTicket || 0,
            }}
          >
            <span className="text-primary" />
          </Trans>
        </div>
      </div>
      <Table rowKey="coupon" dataSource={tableData} columns={columns} loading={loading} />
      {total > filters.pageSize && (
        <Pagination
          current={filters.page}
          pageSize={filters.pageSize}
          total={total}
          onChange={(current) => setFilters((prev) => ({ ...prev, page: current }))}
        />
      )}
    </Card>
  );
}

function TicketsTable(props: { type: 'active' | 'past'; activityId?: number }) {
  const { type } = props;
  const { t } = useTranslation();
  const [tableData, setTableData] = useState<TicketStats[]>([]);
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);
  const { activityId } = props;
  const { tickets, loading } = useTickets({ ...filters, activityId, type });
  const currency = 'USDFIAT';

  useEffect(() => {
    if (!tickets) return;
    setTableData(tickets.ticketList.items);
    setTotal(tickets.ticketList.total);
  }, [tickets]);

  const columns = useMemo<Column<TicketStats>[]>(() => {
    return [
      {
        title: t('tickets number'),
        dataIndex: 'coupon',
        width: 180,
      },
      {
        title: t('time'),
        dataIndex: 'createTime',
        width: 150,
        type: 'time',
      },
      {
        title: t('prize'),
        dataIndex: 'prize',
        width: 80,
        render: ({ prize }) => {
          return <div className="text-up">{formatter.amount(prize, currency).toText()}</div>;
        },
      },
    ];
  }, [t, currency]);

  return (
    <div>
      <Table rowKey="coupon" dataSource={tableData} columns={columns} loading={loading} />
      {total > filters.pageSize && (
        <Pagination
          current={filters.page}
          pageSize={filters.pageSize}
          total={total}
          onChange={(current) => setFilters((prev) => ({ ...prev, page: current }))}
        />
      )}
    </div>
  );
}

function Description(props: { label: string; children: ReactNode; className?: string }) {
  const { label, children, className } = props;
  return (
    <div className={cn('flex flex-col items-center flex-1 gap-1 border-thirdly py-2', className)}>
      <div className="text-14 s768:text-16 font-600">{label}</div>
      <div className="text-18 s768:text-20 font-700 text-brand_alt">{children}</div>
    </div>
  );
}
