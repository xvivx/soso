import { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Column, Image, Table } from '@components';
import { formatter } from '@utils';
import { request } from '@utils/axios';
import { Card } from '@pages/components';
import airDrop from './assets/airdrop.png';

function AirdropRewards() {
  return (
    <div className="space-y-3 ">
      <Banner />
      <Explanation />
      <RewardsList />
      <TermsAndConditions />
    </div>
  );
}

function Banner() {
  const { t } = useTranslation();
  return (
    <div
      className="s768:h-50 relative flex flex-col s768:flex-row s768:justify-between items-center gap-6 px-2 py-5 s768:py-0 s768:pl-10 s768:pr-2.5 overflow-hidden rounded-3"
      style={{
        backgroundImage: 'linear-gradient(268deg, rgba(36, 238, 137, 0.2) 1.14%, rgba(159, 232, 113, 0.2) 94.86%)',
      }}
    >
      <div className="px-2 space-y-4 s768:px-0">
        <div>
          <span className="py-1.5 pl-3 pr-5 s768:-mr-3 text-secondary rounded bg-layer1 font-700">
            {t('Tap trading airdrop')}
          </span>
          <Button theme="primary" className="h-9 text-18 rounded px-4 py-1 -skew-x-[20deg]" size="free">
            {t('Airdrop plan')}
          </Button>
        </div>
        <div className="text-14 s768:text-16 s768:w-80 s1024:w-[534px] light:text-black">
          <Trans
            i18nKey="During the event period, new users who participate in Tap Trading transactions will have the platform randomly select 100 lucky users to share a <0>{{amount}} USDT</0> airdrop, with each receiving {{receive}} USDT."
            values={{
              amount: formatter.stringify(1000),
              receive: formatter.stringify(10),
            }}
          >
            <span className="text-brand" />
          </Trans>
        </div>
      </div>
      <Image src={airDrop} className="relative h-56 s768:h-44 s1024:h-56 s1024:-top-6" />
    </div>
  );
}

function Explanation() {
  const { t } = useTranslation();

  return (
    <Card className="s768:p-8 s768:pt-4" title={t('Explanation')}>
      <div className="text-12 s768:text-14 font-500 text-secondary leading-normal space-y-2">
        <div>
          1.
          {t(
            'Only users registered during the event period are eligible to participate in this event; existing users cannot join.'
          )}
        </div>
        <div>2.{t('Complete 3 Tap Trading transactions during the period.')}</div>
        <div>
          3.
          {t(
            'Winning users will be displayed on the list, and the system will automatically distribute the rewards to their platform accounts.'
          )}
        </div>
      </div>
    </Card>
  );
}

interface Reward {
  amount: number;
  currency: string;
  status: number;
  userId: number;
  username: string;
  avatar: string;
  createTime: number;
}
function RewardsList() {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState<Reward[]>();
  const [loading, setLoading] = useState(false);

  const columns = useMemo<Column<Reward>[]>(() => {
    return [
      {
        title: t('time'),
        dataIndex: 'createTime',
        width: 150,
        type: 'time',
      },
      {
        title: t('name'),
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
        title: t('token') + '/' + t('currency'),
        dataIndex: 'currency',
        width: 125,
      },
      {
        title: t('rewards'),
        dataIndex: 'amount',
        width: 100,
        render: (row) => {
          return <div className="text-up">{row.amount}</div>;
        },
      },
    ];
  }, [t]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await request.get<{ items: Reward[]; total: number }>(
          '/api/promotion/activity/airdrop/reward/list',
          {
            page: 1,
            pageSize: 10,
          }
        );
        setTableData(res.items);
      } catch (error) {
        console.error('Failed to fetch airdrop reward list:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card className="s768:p-8 s768:pt-4" title={t('Rewards list')}>
      <Table rowKey="index" dataSource={tableData} columns={columns} loading={loading} />
    </Card>
  );
}

function TermsAndConditions() {
  const { t } = useTranslation();
  return (
    <Card className="s768:p-8 s768:pt-4" title={t('Terms and conditions')}>
      <div className="text-12 s768:text-14 font-500 text-secondary space-y-2">
        <div>
          1.
          {t(
            'To ensure fairness on the platform, Detrade will conduct risk control monitoring on all accounts participating in the first deposit bonus activity, including but not limited to device fingerprinting, IP address, and trading behavior.'
          )}
        </div>
        <div>
          2.
          {t(
            'If any of the following behaviors are detected, the platform reserves the right to cancel the bonus and any related profits:'
          )}
        </div>
        <div className="indent-2.5">
          2.1
          {t('Multiple account registrations or bonus exploitation')}
        </div>
        <div className="indent-2.5">
          2.2
          {t('Triggering rewards through fake deposits, money laundering, or other malicious methods')}
        </div>
        <div className="indent-2.5">
          2.3
          {t('Profiting by exploiting system loopholes')}
        </div>
        <div>
          3.
          {t(
            'If you have any doubts about your eligibility for rewards, please contact official customer support to appeal.'
          )}
        </div>
      </div>
    </Card>
  );
}
export default AirdropRewards;
