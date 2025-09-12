import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Image, SvgIcon } from '@components';
import { formatter, request } from '@utils';
import { getCoinUrl } from '@utils/others';
import CopyButton from '@pages/components/CopyButton';
import { FlexRow, Status, Step } from '../components';
import { FiatWithdrawOrder, TransitionStatus } from '../types';

function FiatOrderDetail(props: { order: FiatWithdrawOrder }) {
  const { order: originData } = props;
  const { t } = useTranslation();
  const { data: order } = useSWR(
    ['order-withdraw-detail', originData.id],
    ([_, orderId]: string[]) => {
      return request.get<FiatWithdrawOrder>(`/api/account/fiat/payment/withdraw/detail?id=${orderId}`);
    },
    {
      fallbackData: originData,
      refreshInterval: (data = originData) => {
        if (data.status !== TransitionStatus.PROCESSING) {
          return 0;
        } else {
          return 10 * 1000;
        }
      },
      revalidateOnMount: false,
    }
  );

  return (
    <div className="space-y-6 text-primary text-14">
      <div className="flex-center gap-2 text-20 s768:text-24 font-700">
        <Image className="size-6" src={getCoinUrl(order.currency)} />
        <span>{formatter.amount(order.amount, order.currency).sign().toText()}</span>
      </div>

      <div className="detrade-card space-y-4">
        <FlexRow label={t('Status')}>
          <Status status={order.status} />
        </FlexRow>
        <FlexRow label={t('Order Id')}>
          <div className="flex-center gap-2">
            {order.id}
            <CopyButton value={order.id} size="sm" />
          </div>
        </FlexRow>

        <FlexRow label={t('Order Amount')}>{`${order.amount} ${order.currency.replace(/FIAT$/, '')}`}</FlexRow>
        <FlexRow label={t('Withdraw Fee')}>{`${order.fee} ${order.currency.replace(/FIAT$/, '')}`}</FlexRow>
        <FlexRow label="Create on">{formatter.time(order.createTime)}</FlexRow>

        <FlexRow label={t('Payment Method')}>
          <div className="flex-center gap-2">
            {order.channel}
            <CopyButton value={order.channel} size="sm" />
          </div>
        </FlexRow>
      </div>

      <div>
        <div className="mb-4 text-16 font-700">{t('Order Progress')}</div>
        <Step value={1} status="success">
          <div className="space-y-2 pb-4">
            <div className="text-16">{t('Withdraw Order Created')}</div>
            <div className="flex items-center gap-1 text-secondary">
              <SvgIcon className="size-4" name="history" />
              <div>{t('Updated at {{time}}', { time: formatter.time(order.createTime) })}</div>
            </div>
          </div>
        </Step>

        <Step
          value={2}
          status={
            order.status === TransitionStatus.PROCESSING
              ? 'progress'
              : order.status === TransitionStatus.FAILED
                ? 'failed'
                : 'success'
          }
        >
          <div className="space-y-2 pb-4">
            <div className="text-16">{t('3rd Merchant Processing')}</div>
            <div className={order.status === TransitionStatus.FAILED ? 'text-error' : 'text-secondary'}>
              {order.status === TransitionStatus.PROCESSING
                ? t('Pending third-party processing.')
                : order.status === TransitionStatus.FAILED
                  ? t('The order has expired')
                  : t('Completed')}
            </div>
            <div className="flex items-center gap-1 text-secondary">
              <SvgIcon className="size-4" name="history" />
              <div>{t('Updated at {{time}}', { time: formatter.time(order.updateTime) })}</div>
            </div>
          </div>
        </Step>
        <Step value={3} status={order.status === TransitionStatus.SUCCESS ? 'success' : 'pending'}>
          <div className="text-16">{t('Transaction Completed')}</div>
        </Step>
      </div>
    </div>
  );
}
export default FiatOrderDetail;
