import { useTranslation } from 'react-i18next';
import { ContractOrderInfo } from '@store/contract';
import useMemoCallback from '@hooks/useMemoCallback';
import { Button, SvgIcon, Table } from '@components';
import Modal from '@components/FunctionRender/Modal';
import { request } from '@utils/axios';

// import { openRiskWarning } from '../helps/RiskyWarning';

// 定义 FundingHourType 枚举
enum FundingHourType {
  add = 2, // 补贴
  reduce = 1, // 扣费
}

// 定义 FundingHistory 接口
interface FundingHistory {
  id: string;
  type: number;
  symbol: string;
  currency: string;
  fee: number;
  chargeTime: number;
}

// 定义 History 接口
interface History {
  chargeTime: number;
  currency: string;
  fee: number;
  id: string;
  symbol: string;
  type: number;
}

const FundingCol = ({ order }: { order: ContractOrderInfo }) => {
  const { t } = useTranslation();

  const handleOpenFundingH = useMemoCallback(() => {
    Modal.open({
      title: t('Funding/h'),
      children: (
        <div className="text-13 text-primary font-400">
          <div className="mb-3">
            {!order.capitalCost && <div>{t('No funding within 60 minutes for this order')}</div>}
            {order.capitalCost && order.nextCapitalCost! > 0 && (
              <div>
                {t(
                  'You will receive approximately {nextCapitalCost} subsidy in the next hour, and the specific amount is subject to the funding rate at that time',
                  { nextCapitalCost: String(order.nextCapitalCost) }
                )}
              </div>
            )}
            {order.capitalCost && order.nextCapitalCost! < 0 && (
              <div>
                {t(
                  'Approximately {{nextCapitalCost}} will be charged in the next hour, and the specific amount is subject to the funding rate at that time.',
                  { nextCapitalCost: String(order.nextCapitalCost) }
                )}
              </div>
            )}
          </div>
          <div className="mb-3">
            {t(
              'If your position remains open for more than 8 hours, hourly funding fees will apply based on market conditions. These fees are deducted directly from your account balance. If your balance is insufficient to cover the funding fees, your position will be forcibly closed by the system.'
            )}
          </div>
          <div className="flex gap-2">
            {/* <Button
              className="text-13 text-brand font-400"
              size="free"
              theme="text"
              onClick={() => openRiskWarning(false)}
            >
              {t('Learn More')}
            </Button> */}
            <Button
              className="text-13 text-brand font-400"
              theme="text"
              size="free"
              onClick={async () => {
                const { items: histories } = await request.get<{
                  items: History[];
                  total: number;
                }>('/api/transaction/contractOrder/fee/list', {
                  contractId: order.id,
                  page: 1,
                  pageSize: 999,
                });

                Modal.open({
                  title: t('Funding fee history'),
                  children: <FundingFeeHistory histories={histories} />,
                });
              }}
            >
              {t('Record')}
            </Button>
          </div>
        </div>
      ),
    });
  });

  return (
    <SvgIcon
      name="attention"
      className="size-5"
      onClick={(event) => {
        event.stopPropagation();
        handleOpenFundingH();
      }}
    />
  );
};

function FundingFeeHistory(props: { histories: History[] }) {
  const { histories } = props;
  const { t } = useTranslation();
  const columns = [
    {
      title: t('Time'),
      dataIndex: 'chargeTime',
      type: 'time' as const,
    },
    {
      title: t('Funding/h'),
      dataIndex: 'fee',
      render: ({ type, fee }: FundingHistory) => (
        <>
          {type === FundingHourType.add ? '+' : '-'}
          {fee}
        </>
      ),
    },
  ];

  return <Table className="detrade-modal-table" columns={columns} dataSource={histories} />;
}

export default FundingCol;
