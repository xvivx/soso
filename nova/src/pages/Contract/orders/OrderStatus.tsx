import { useTranslation } from 'react-i18next';
import { ContractEndType, ContractOrderInfo } from '@store/contract';
import { cn } from '@utils';

export default function OrderStatus({ order, className }: { order: ContractOrderInfo; className?: string }) {
  const { t } = useTranslation();
  let text: string;
  if (order.endType === ContractEndType.Systemic) {
    text = t('System');
  } else if (order.endType === ContractEndType.Busted) {
    text = t('Liquidated');
  } else if (order.endType === ContractEndType.CashedOut) {
    text = t('Manual');
  } else if (order.endType === ContractEndType.StopLoss) {
    text = t('Stop Loss');
  } else if (order.endType === ContractEndType.StopProfit) {
    text = t('Take Profit');
  } else if (order.endType === ContractEndType.NotEnd) {
    text = t('Open');
  } else {
    text = '';
  }
  return (
    <div className={cn('text-12', order.endType === ContractEndType.Systemic && 'text-down', className)}>{text}</div>
  );
}
