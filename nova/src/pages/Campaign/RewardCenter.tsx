import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import { useUserInfo } from '@store/user';
import useNavigate from '@hooks/useNavigate';
import { Button, Empty, FormItem, Input, Loading, message, Modal, SvgIcon, Tabs } from '@components';
import { cn, formatter, request } from '@utils';
import { Card } from '@pages/components';

interface Coupon {
  id: string;
  userId: string;
  openId: string;
  platform: string;
  amount: number;
  currency: string;
  status: CouponStatus;
  createTime: string;
  expireTime: string;
  availableTime: string;
}

enum CouponStatus {
  PENDING = 'PENDING',
  PENDING_TASK = 'PENDING_TASK',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  USED = 'USED',
  CANCEL = 'CANCEL',
}

function RewardCenter() {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { data: userInfo } = useUserInfo();
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (location.state && location.state.tab) {
      setTabIndex(location.state.tab as number);
    }
  }, [location.state]);

  const { data, isLoading } = useSWR(
    ['promotion-coupon-list', userInfo.id],
    () => {
      return request.get<Coupon[]>('/api/promotion/coupon/list');
    },
    { fallbackData: [] }
  );

  const [onGoings, pasts] = useMemo(() => {
    const active: Coupon[] = [];
    const inactive: Coupon[] = [];
    data.forEach((coupon) => {
      if (coupon.status === 'PENDING' || coupon.status === 'ACTIVE') {
        active.push(coupon);
      } else {
        inactive.push(coupon);
      }
    });
    return [active, inactive];
  }, [data]);

  const tabs = useMemo(() => {
    return [
      {
        title: t('On going'),
        dataSource: onGoings,
      },
      {
        title: t('Past'),
        dataSource: pasts,
      },
    ];
  }, [onGoings, pasts, t]);

  return (
    <Card
      className="s768:p-8 s768:pt-4"
      title={
        <div className="w-full flex justify-between items-center">
          <div className="text-16 flex gap-2 items-center">
            <span className="font-600">{t('My vouchers')}</span>
            <Button
              onClick={() => navigate('/deposit-bonus-guide')}
              className="size-4"
              theme="transparent"
              icon={<SvgIcon name="book" />}
            />
          </div>
          <Button onClick={() => setModalVisible(true)} size="sm" theme="primary">
            {t('Voucher code')}
          </Button>
        </div>
      }
    >
      <Tabs selectedIndex={tabIndex} onChange={setTabIndex}>
        <Tabs.Header>
          {tabs.map((tab) => (
            <Tabs.Item key={tab.title}>{tab.title}</Tabs.Item>
          ))}
        </Tabs.Header>

        {tabs.map((tab) => {
          return (
            <Tabs.Panel key={tab.title} className="relative">
              {isLoading && <Loading />}
              {tab.dataSource.length === 0 ? (
                <Empty />
              ) : (
                <div className="grid grid-cols-1 s768:grid-cols-2 s1024:grid-cols-3 gap-4">
                  {tab.dataSource.map((item) => {
                    return <CardItem key={item.id} data={item}></CardItem>;
                  })}
                </div>
              )}
            </Tabs.Panel>
          );
        })}
      </Tabs>

      {/* 手动兑换券 */}
      <Modal visible={modalVisible} title={t('Claim Voucher')} onClose={setModalVisible} size="sm">
        <FormItem label={t('Enter Code')}>
          <Input value={code} onChange={setCode} />
        </FormItem>
        <div className="text-14 font-400 text-secondary mt-3">
          {t('Each voucher code can only be claimed once per user. Once it is claimed, the reward cannot be reversed.')}
        </div>
        <Button
          onClick={() => {
            if (!code) return;
            message.error(t('The coupon code is invalid or expired'));
          }}
          className="w-full mt-5"
          size="lg"
        >
          {t('Claim Voucher')}
        </Button>
      </Modal>
    </Card>
  );
}

export default RewardCenter;

function CardItem({ data }: { data: Coupon }) {
  const { t } = useTranslation();

  return (
    <div
      className="rounded-3"
      style={{
        background:
          data.status === CouponStatus.PENDING
            ? 'linear-gradient(90deg, rgb(var(--success) / 0.2) 2.38%, rgba(159, 232, 113, 0.20) 101.26%)'
            : data.status === CouponStatus.ACTIVE
              ? 'linear-gradient(106deg, rgb(var(--warn) / 0.2) 3.21%, rgb(var(--warn) / 0.1) 101.01%)'
              : 'var(--bg-layer7)',
      }}
    >
      <div className="px-6 border-b border-dashed border-white/20">
        <div className="h-18 flex items-center justify-between relative">
          <div
            className={cn(
              'text-24 font-700',
              data.status === CouponStatus.ACTIVE
                ? 'text-warn'
                : data.status === CouponStatus.PENDING
                  ? 'text-brand_alt'
                  : 'text-secondary'
            )}
          >
            {data.amount} {data.currency}
          </div>
          {data.status === CouponStatus.PENDING && (
            <Button
              onClick={async () => {
                await request.put(`/api/promotion/coupon/active/${data.id}`);
                mutate((key: string[]) => key && key[0] === 'promotion-coupon-list');
              }}
              size="sm"
            >
              {t('Activate')}
            </Button>
          )}
          {data.status === CouponStatus.ACTIVE && (
            <StatusBadge className="bg-warn/10 text-warn">{t('Active')}</StatusBadge>
          )}
          {data.status === CouponStatus.EXPIRED && <StatusBadge>{t('Expired')}</StatusBadge>}
          {data.status === CouponStatus.USED && <StatusBadge>{t('Used')}</StatusBadge>}
        </div>
      </div>
      <div className="py-5 px-6">
        <div className="text-12 text-secondary mb-3">
          <span className="text-16 font-700 text-primary mr-4">{t('Trading bonus trial')}</span>
          {data.status === CouponStatus.PENDING && (
            <span className="bg-white/5 rounded px-2 py-1 ">{t('Not activated')}</span>
          )}
        </div>
        <div className="text-12">
          {t('Activation expiry time')}: {formatter.time(data.expireTime)}
        </div>
        <div className="text-12">{t('Validity period: within 14 days after activation')}</div>
      </div>
    </div>
  );
}

function StatusBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-2 absolute top-0 -right-6 bg-layer5 text-secondary rounded-bl-3 rounded-tr-3', className)}>
      {children}
    </div>
  );
}
