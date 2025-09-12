import { memo, useMemo } from 'react';
import { BinaryOrderInfo } from '@store/binary/types';
import { SpreadOrderInfo } from '@store/spread/types';
import Table, { Column } from '@components/Table';
import { useBinarySpreadContext } from '../BinarySpreadProvider';
import useTableCommonColumns from './useTableCommonColumns';

function ClosedBets<T extends BinaryOrderInfo | SpreadOrderInfo>() {
  const { useHistoryOrders } = useBinarySpreadContext<T>();
  const { data, isLoading } = useHistoryOrders();
  const commons = useTableCommonColumns<T>();
  const columns = useMemo<Column<T>[]>(() => {
    return [...commons];
  }, [commons]);

  return <Table<T> columns={columns} dataSource={data} loading={isLoading} />;
}

export default memo(ClosedBets);
