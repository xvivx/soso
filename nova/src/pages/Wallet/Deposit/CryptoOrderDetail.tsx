import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Image, SvgIcon } from '@components';
import { formatter, request } from '@utils';
import { getCoinUrl } from '@utils/others';
import CopyButton from '@pages/components/CopyButton';
import { FlexRow, Status, Step } from '../components';
import { CryptoOrder, TransitionStatus } from '../types';

export interface BlockHeight {
  chain: string;
  txBlockHeight: number;
  currBlockHeight: number;
  reqConfirmations: number;
}

function CryptoDepositDetail(props: { order: CryptoOrder }) {
  const { t } = useTranslation();
  const { order: originData } = props;
  const { data: order } = useSWR(
    ['order-detail', originData.id],
    async ([_, orderId]: string[]) => {
      return request.get<CryptoOrder>(`/api/account/fiat/payment/crypto/detail?orderId=${orderId}`);
    },
    {
      fallbackData: originData,
      refreshInterval: (data = originData) => {
        if (data.status === TransitionStatus.PROCESSING) {
          return 10 * 1000;
        } else {
          return 0;
        }
      },
      revalidateOnMount: false,
    }
  );

  const { data: blockNumbers } = useSWR(
    ['crypto-order-block-height', originData.id],
    async ([_, orderId]: string[]) => {
      const blockHeight = await request.get<BlockHeight>(`/api/account/payment/v2/height/${orderId}`);
      const { currBlockHeight, txBlockHeight, reqConfirmations } = blockHeight;
      const diff = (currBlockHeight - txBlockHeight).toFixed(0);
      if (Number(diff) > reqConfirmations) return { left: reqConfirmations, total: reqConfirmations, completed: true };
      return { left: diff, total: reqConfirmations, completed: false };
    },
    {
      refreshInterval: order.status === TransitionStatus.PROCESSING ? 10 * 1000 : 0,
      revalidateOnMount: order.status === TransitionStatus.PROCESSING,
      fallbackData: { left: 0, total: 1, completed: false },
    }
  );

  return (
    <div className="space-y-6 text-primary text-14">
      <div className="flex-center gap-2 mb-5 text-20 s768:text-24 font-700">
        <Image className="size-6" src={getCoinUrl(order.currency)} />
        <div>{formatter.amount(order.amount, order.currency).sign().toText()}</div>
      </div>
      <div className="detrade-card space-y-4">
        <FlexRow label={t('Status')}>
          <Status status={order.status} />
        </FlexRow>
        <FlexRow label={t('Txid')}>
          <div className="flex flex-1 items-center gap-2">
            <div className="flex-1 break-all text-right">{order.txId}</div>
            <CopyButton size="sm" value={order.txId} />
          </div>
        </FlexRow>
        <FlexRow label={t('Order Id')}>
          <div className="flex items-center gap-2">
            <div className="flex-1 break-all text-right">{order.id}</div>
            <CopyButton size="sm" value={order.id} />
          </div>
        </FlexRow>
        <FlexRow label={t('Time')}>{formatter.time(order.createTime)}</FlexRow>
        <FlexRow label={t('Gas fee')}>
          <div className="flex gap-1 items-center">
            <span>{order.gasFee}</span>
            <Image src={order.icon} className="size-4 rounded-full" />
          </div>
        </FlexRow>
        <FlexRow label={t('Withdrawal fee')}>
          <div className="flex gap-1 items-center">
            <span>{order.withdrawFee}</span>
            <Image src={order.icon} className="size-4 rounded-full" />
          </div>
        </FlexRow>
        <FlexRow label={t('Arrival amount')}>
          <div className="flex gap-1 items-center">
            <span>{order.amount}</span>
            <Image src={order.icon} className="size-4 rounded-full" />
          </div>
        </FlexRow>
      </div>

      <div>
        <div className="mb-4 text-16 font-700">{t('Order Progress')}</div>
        <Step
          value={1}
          status={
            order.status === TransitionStatus.PROCESSING
              ? 'progress'
              : order.status === TransitionStatus.FAILED
                ? 'failed'
                : 'success'
          }
        >
          <div className="space-y-2 pb-4">
            <div className="text-16">{t('Blockchain Processing')}</div>
            {order.status === TransitionStatus.PROCESSING && (
              <div>
                {t('Confirmations')} ({blockNumbers.left}/{blockNumbers.total})
              </div>
            )}
            <div className="flex items-center gap-1 text-secondary">
              <SvgIcon className="size-4" name="history" />
              <div>{t('Updated at {{time}}', { time: formatter.time(order.createTime) })}</div>
            </div>
          </div>
        </Step>

        <Step value={2} status={order.status === TransitionStatus.SUCCESS ? 'success' : 'pending'}>
          <div className="text-16">{t('Transaction Completed')}</div>
        </Step>
      </div>
    </div>
  );
}
export default CryptoDepositDetail;
