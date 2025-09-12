import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { CommissionType, ContractOrderInfo, useTradingPairsParams } from '@store/contract';
import { Modal, SvgIcon } from '@components';
import { cn, formatter } from '@utils';
import { request } from '@utils/axios';
import { showRoiHelp } from '../helps/RoiHelp';
import { calcFlatFee } from '../ROI';

interface ProfitAndLossProps {
  className?: string;
  order: ContractOrderInfo;
  profit: number;
}
function ProfitAndLoss({ order, profit, className }: ProfitAndLossProps) {
  const { t } = useTranslation();
  return (
    <div className={cn('flex justify-end items-center gap-1', profit < 0 ? 'text-down' : 'text-up', className)}>
      <div>{formatter.amount(profit, order.currency).sign().toText(true)}</div>
      <SvgIcon
        name="attention"
        className="size-5"
        onClick={() =>
          Modal.open({
            title: t('P&L'),
            children: <Detail order={order} />,
          })
        }
      />
    </div>
  );
}

export default ProfitAndLoss;

function Detail(props: { order: ContractOrderInfo }) {
  const { t } = useTranslation();
  const { order } = props;
  const position = order.amount * order.lever;
  const { data: tradingPairParams } = useTradingPairsParams();
  const symbolPrice = tradingPairParams[order.symbol];
  const { data: exchange } = useSWR(
    order.commissionType === CommissionType.FLAT ? ['currency-exchange', order.currency] : null,
    async ([_, currency]) => {
      return await request.get<{ rate: string; currency: string }>('/api/account/exchange/rate', {
        currencyPair: `${currency}-USD`,
      });
    },
    { fallbackData: { rate: '', currency: order.currency } }
  );

  const feePercent = useMemo(() => {
    if (order.commissionType !== CommissionType.FLAT || !exchange.rate) return 0;
    return calcFlatFee(symbolPrice, position * Number(exchange.rate));
  }, [position, symbolPrice, exchange, order.commissionType]);

  return (
    <div className="text-left text-primary text-13">
      {order.commissionType === CommissionType.PNL && (
        <div>{t('A variable fee was charged as a fraction of profits upon closing the trade')}</div>
      )}
      {order.commissionType === CommissionType.FLAT && (
        <div className="mb-3">
          <div className="mb-3">
            {t(
              'A flat fee of {{feeAmount}} ({{commission}}) was charged upon opening the trade (position:{{position}})',
              {
                feeAmount: formatter.percent(feePercent),
                commission: order.commission,
                position: formatter.amount(position, order.currency).toText(),
              }
            )}
          </div>
          <div>
            <Trans i18nKey="With a flat fee enabled, you receive 100% of your profits but prepay a <0>flat fee that covers your entry, exit, and slippage</0> before entering the trade, like on a regular exchange">
              <span className="underline" />
            </Trans>
          </div>
        </div>
      )}
      <div>
        <Trans i18nKey="Check <0>ROI calculator</0> for more details">
          <span className="mx-1 cursor-pointer hover:underline text-brand" onClick={showRoiHelp} />
        </Trans>
      </div>
    </div>
  );
}
