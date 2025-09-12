import { useTranslation } from 'react-i18next';
import { ContractOrderInfo, usePositionOrders } from '@store/contract';
import useMemoCallback from '@hooks/useMemoCallback';
import { message, Modal } from '@components';
import { request } from '@utils/axios';
import AutoTakeProfitAndLLossPriceEditor from '../components/AutoTakeProfitAndLLossPriceEditor';

export default function useUpdateProfitAndLoss() {
  const { t } = useTranslation();
  const [modal, contextHolder] = Modal.useModal();
  const { mutate } = usePositionOrders();
  const handleEditOrder = useMemoCallback(async (order: ContractOrderInfo) => {
    const detail = await request.get<ContractOrderInfo>(`/api/transaction/contractOrder/${order.id}`);
    modal.open({
      title: t('TP/SL'),
      closable: false,
      children: (
        <AutoTakeProfitAndLLossPriceEditor
          order={detail}
          onConfirm={async ({ takeAtProfit, closeAtProfit }) => {
            const params = {
              id: detail.id,
              stopLossAmount: -1 * Number(closeAtProfit) || null,
              stopProfitAmount: Number(takeAtProfit) || null,
            };

            // 只有改变了止盈止损才去更新
            const fields = ['stopLossPrice', 'stopProfitPrice'];
            if (fields.find((field) => detail[field as keyof typeof detail] !== params[field as keyof typeof params])) {
              await request.post(`/api/transaction/contractOrder/updateStopProfitOrLoss`, params);
              message.success(t('Update Success'));
              mutate();
            }
            modal.close();
          }}
        />
      ),
    });
  });

  return [handleEditOrder, contextHolder] as const;
}
