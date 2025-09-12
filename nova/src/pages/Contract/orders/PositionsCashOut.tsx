import { ContractOrderInfo, optimisticUpdatePositionOrder, useSettings } from '@store/contract';
import { Settings } from '@store/system';
import useMemoCallback from '@hooks/useMemoCallback';
import { Button, Checkbox, message, Modal } from '@components';
import { getServerTime, request } from '@utils/axios';
import { createOrderToken } from '@utils/others';
import { useGameContext } from '@pages/components/GameProvider';
import i18n from '@/i18n';

async function closeContractOrder(order: ContractOrderInfo): Promise<void>;
async function closeContractOrder(closeAll: true): Promise<void>;
async function closeContractOrder(data: ContractOrderInfo | true): Promise<void> {
  const headers = { ['X-Token']: createOrderToken(getServerTime()) };
  if (data === true) {
    await request.post('/api/transaction/contractOrder/close/all', {}, { headers });
    optimisticUpdatePositionOrder(true);
  } else {
    await request.post('/api/transaction/contractOrder/close', { id: data.id }, { headers });
    optimisticUpdatePositionOrder(data, 'cash');
  }

  message.success(i18n.t('Closed successfully!'));
}

const openCashOutModal = (order: ContractOrderInfo, onSettingsChange: (params: Partial<Settings>) => void) => {
  let noConfirmCashOut: boolean = false;
  Modal.confirm({
    title: i18n.t('Close the order'),
    scrollable: false,
    children: (
      <div className="flex flex-col gap-4">
        <div className="text-primary text-16">{i18n.t('Confirm to close the order?')}</div>
        <Checkbox
          className="text-secondary text-12"
          onCheckedChange={(checked) => (noConfirmCashOut = checked as boolean)}
        >
          {i18n.t('Always close in one click')}
        </Checkbox>
      </div>
    ),
    async onConfirm() {
      await closeContractOrder(order);
      noConfirmCashOut && onSettingsChange({ confirmCashOut: false });
      Modal.closeAll();
    },
    size: 'sm',
  });
};

const openCashAllModal = () => {
  Modal.open({
    title: i18n.t('Cash All'),
    scrollable: false,
    children: (
      <>
        <div className="text-primary text-16 mb-8">{i18n.t('Confirm settlement of all orders?')}</div>
        <Modal.Footer className="flex gap-2">
          <Button className="bg-layer4 flex-1" size="lg" theme="secondary" onClick={() => Modal.close()}>
            {i18n.t('Cancel')}
          </Button>
          <Button
            className="flex-1"
            size="lg"
            theme="primary"
            onClick={async () => {
              await closeContractOrder(true);
              Modal.close();
            }}
          >
            {i18n.t('Confirm')}
          </Button>
        </Modal.Footer>
      </>
    ),
    size: 'sm',
  });
};

export function useCashOut() {
  const settings = useSettings();
  const { onSettingsChange } = useGameContext();
  async function cashOut(order: ContractOrderInfo): Promise<void>;
  async function cashOut(closeAll: true): Promise<void>;
  async function cashOut(data: ContractOrderInfo | true): Promise<void> {
    // 传入true执行一键全平
    if (data === true) {
      openCashAllModal();
      return;
    }
    // 如果传入了订单, 根据设置-是否需要关闭订单确认决定打开弹窗或直接关闭
    if (settings.confirmCashOut) {
      openCashOutModal(data, onSettingsChange);
    } else {
      await closeContractOrder(data);
      Modal.close();
    }
  }
  return useMemoCallback(cashOut);
}
