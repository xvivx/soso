import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ContractOrderInfo, usePublicOrders } from '@store/contract';
import Table, { Column } from '@components/Table';
import Player from '@pages/components/TablePlayer';
import useCommonColumns from './useCommonColumns';

function PublicOrders() {
  const { t } = useTranslation();
  const { data: orders, isLoading: loading } = usePublicOrders();
  const commonColumns = useCommonColumns();
  const displayData = useMemo(() => {
    return orders.slice(0, 20);
  }, [orders]);
  const columns = useMemo<Column<ContractOrderInfo>[]>(() => {
    return [
      {
        title: t('Trader'),
        dataIndex: 'user',
        render(row) {
          return <Player {...row} />;
        },
      },
      ...commonColumns.filter((columns) => columns.dataIndex !== 'startTime'),
    ];
  }, [commonColumns, t]);

  return <Table columns={columns} dataSource={displayData} size="md" loading={loading} />;
}

export default memo(PublicOrders);
