import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { OrderStatus, TapOrder, useLiveOrders } from '@store/tap';
import { Column, Table } from '@components';
import Player from '@pages/components/TablePlayer';
import useOrderFields from './useOrderFields';

export default function LiveOrders() {
  const { t } = useTranslation();
  const { data: orders, isValidating: loading } = useLiveOrders();

  const dataSource = useMemo(() => {
    return orders.filter((order) => order.status === OrderStatus.Finished).slice(0, 20);
  }, [orders]);
  const commons = useOrderFields();
  const columns = useMemo<Column<TapOrder>[]>(() => {
    return [
      {
        title: t('Trader'),
        dataIndex: 'user',
        render(order) {
          return <Player {...order} />;
        },
      },
      ...commons,
    ];
  }, [t, commons]);

  return <Table columns={columns} dataSource={dataSource} loading={loading} />;
}
