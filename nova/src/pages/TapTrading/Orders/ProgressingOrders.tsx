import { useMemo } from 'react';
import { useProgressingOrders } from '@store/tap';
import { Table } from '@components';
import useOrderFields from './useOrderFields';

export default function ProgressingOrders() {
  const { orders, loading } = useProgressingOrders();
  const commons = useOrderFields();
  const columns = useMemo(() => commons.slice(0, -1), [commons]);
  return <Table columns={columns} dataSource={orders} loading={loading} />;
}
