import { useHistoryOrders } from '@store/tap';
import { Table } from '@components';
import useOrderFields from './useOrderFields';

export default function HistoryOrders() {
  const { data: orders, isValidating: loading } = useHistoryOrders();
  const columns = useOrderFields();
  return <Table columns={columns} dataSource={orders} loading={loading} />;
}
