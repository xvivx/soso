import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { OrderStatus, TapOrder, useLiveOrders } from '@store/tap';
// import { useUserInfo } from '@store/user';
import { Column, Table } from '@components';
import { formatter } from '@utils';
import TablePlayer from '@pages/components/TablePlayer';

function ProgressingPublicOrders(props: BaseProps) {
  const { t } = useTranslation();
  const { data: orders } = useLiveOrders();

  // progress有可能没数据, 这里用finished数据兜底
  const dataSource = useMemo(() => {
    const progress = orders.filter((order) => order.status === OrderStatus.Progressing);
    const finished = orders.filter((order) => order.status === OrderStatus.Finished);
    return [...progress, ...finished].slice(0, 8);
  }, [orders]);

  const columns: Column<TapOrder>[] = [
    {
      title: t('Trader'),
      dataIndex: 'symbol',
      render(cell) {
        return <TablePlayer {...cell} className="!max-w-36 text-secondary" />;
      },
    },
    {
      title: t('Multiplier'),
      dataIndex: 'odds',
      render: ({ odds }) => <span className="text-secondary">{`${odds}x`}</span>,
      align: 'right',
    },
    {
      title: t('Amount'),
      dataIndex: 'amount',
      render: ({ amount, currency }) => (
        <span className="text-secondary">{formatter.amount(amount, currency).floor().toText()}</span>
      ),
      align: 'right',
    },
  ];

  return <Table columns={columns} dataSource={dataSource} className={props.className} />;
}

export default memo(ProgressingPublicOrders);
