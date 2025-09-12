import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import QRCode from 'qrcode.react';
import useSWR from 'swr';
import { Button, Image, Modal, SvgIcon } from '@components';
import { formatter, getServerTime, request } from '@utils';
import { getCoinUrl } from '@utils/others';
import CopyButton from '@pages/components/CopyButton';
import { FlexRow, Status, Step } from '../components';
import { FiatDepositOrder, TransitionStatus } from '../types';
import depositSafetyPng from './deposit-safety.png';

function FiatOrderDetail(props: { order: FiatDepositOrder }) {
  const { order: originData } = props;
  const { t } = useTranslation();
  const { data: order } = useSWR(
    ['order-detail', originData.id],
    ([_, orderId]: string[]) => {
      return request.get<FiatDepositOrder>(`/api/account/fiat/payment/deposit/detail?id=${orderId}`);
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
  const [orderExpiresIn, channelExpiredTime] = useMemo(
    () => [
      Math.max(Math.floor(((order.expiredTime - getServerTime()) % (24 * 3600)) / 3600), 0),
      ((order.expiredTime - order.createTime) / 1000 / 3600).toFixed(1),
    ],
    [order]
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

        <FlexRow label={t('Order Amount')}>{`${order.amount} ${order.currency.replace('FIAT', '')}`}</FlexRow>
        <FlexRow label="Create on">{formatter.time(order.createTime)}</FlexRow>

        <FlexRow label={t('Payment Method')}>
          <div className="flex-center gap-2">
            {order.channel}
            <CopyButton value={order.channel} size="sm" />
          </div>
        </FlexRow>

        {order.status === TransitionStatus.PROCESSING &&
          (order.walletUrl ? (
            <Button className="w-full" onClick={() => window.open(order.walletUrl)}>
              {t('Continue Deposit Process')}
            </Button>
          ) : (
            <div className="size-40 p-2 rounded-2 mx-auto bg-white">
              {order.qrCodeContent ? (
                <QRCode value={order.qrCode} size={144} />
              ) : (
                order.qrCode && <Image className="size-36" src={order.qrCode} />
              )}
            </div>
          ))}
      </div>

      {order.status === TransitionStatus.PROCESSING && (
        <div className="detrade-card text-secondary bg-success/10">
          {t(
            "Tips: Usually takes {{hours}} hours to process, may take longer, the specific time depends on the merchant's time limit.",
            { hours: channelExpiredTime }
          )}
        </div>
      )}

      <div>
        <div className="mb-4 text-16 font-700">{t('Order Progress')}</div>
        <Step value={1} status="success">
          <div className="space-y-2 pb-4">
            <div className="text-16">{t('Deposit Order Created')}</div>
            {order.status === TransitionStatus.PROCESSING && (
              <div>
                <Trans i18nKey="If you did not complete this transfer, you can continue the deposit process <0>here</0>.">
                  <span className="text-warn underline cursor-pointer" onClick={() => window.open(order.walletUrl)} />
                </Trans>
              </div>
            )}
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
                ? orderExpiresIn
                  ? t('Pending third-party processing (estimated {{hours}} hours).', {
                      hours: orderExpiresIn,
                    })
                  : t('Pending third-party processing.')
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

export function FiatOrderResult(props: { order: FiatDepositOrder }) {
  const { t } = useTranslation();
  const { order } = props;
  return (
    <div>
      <Image className="block size-20 mx-auto mb-4" src={depositSafetyPng} />

      <div className="space-y-4 text-primary text-14">
        <FlexRow label={t('Payment Method')}>{order.channel}</FlexRow>
        <FlexRow label={t('Order Id')}>
          <div className="flex-center gap-2">
            {order.id}
            <CopyButton value={order.id.toString()} size="sm" />
          </div>
        </FlexRow>
        <FlexRow label={t('Expires in')}>{formatter.countdown(order.expiredTime - getServerTime())}</FlexRow>
        <FlexRow label={t('Deposit Amount')}>{`${order.amount} ${order.currency.replace('FIAT', '')}`}</FlexRow>
      </div>

      <Modal.Footer className="space-y-2">
        <Button
          className="w-full"
          onClick={() => {
            Modal.close();
            Modal.open({
              title: t('Transition details'),
              children: <FiatOrderDetail order={order} />,
              onClose: Modal.closeAll,
              closable: false,
            });
          }}
        >
          {t("I've made deposit")}
        </Button>
        <Button className="w-full" theme="secondary" onClick={() => window.open(order.walletUrl)}>
          {t('Continue deposit process')}
        </Button>
      </Modal.Footer>
    </div>
  );
}
