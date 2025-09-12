import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BinaryOrderInfo } from '@store/binary/types';
import { SpreadOrderInfo } from '@store/spread/types';
import Table, { Column } from '@components/Table';
import Player from '@pages/components/TablePlayer';
import { useBinarySpreadContext } from '../BinarySpreadProvider';
import useTableCommonColumns from './useTableCommonColumns';

function PublicBets<T extends BinaryOrderInfo | SpreadOrderInfo>() {
  const { t } = useTranslation();
  const { usePublicOrders } = useBinarySpreadContext<T>();
  const { data, isLoading } = usePublicOrders();
  const commons = useTableCommonColumns<T>();
  const displayData = useMemo(() => {
    return data.slice(0, 20);
  }, [data]);

  const columns = useMemo<Column<T>[]>(() => {
    return [
      {
        title: t('Trader'),
        dataIndex: 'nickName',
        render: (row) => <Player {...row} />,
      },
      ...commons,
    ];
  }, [commons, t]);

  return <Table<T> columns={columns} dataSource={displayData} loading={isLoading} />;
}

export default memo(PublicBets);
