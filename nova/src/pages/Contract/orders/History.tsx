import { memo, useRef } from 'react';
import { ContractOrderInfo, usePositionOrderActions } from '@store/contract';
import { useHistoryOrders } from '@store/contract/services';
import useMemoCallback from '@hooks/useMemoCallback';
import { useMediaQuery } from '@hooks/useResponsive';
import { Empty, Loading } from '@components';
import Table from '@components/Table';
import { HistoryOrder as MobileHistoryOrder } from './MobileOrderCard';
import useCommonColumns from './useCommonColumns';

function HistoryOrders() {
  const { mobile } = useMediaQuery();
  const Component = mobile ? MobileHistoryOrders : PcHistoryOrders;
  return <Component />;
}

export default memo(HistoryOrders);

function MobileHistoryOrders() {
  const { data: orders, isLoading: loading } = useHistoryOrders();
  return (
    <>
      {loading && <Loading />}
      {orders.length === 0 ? (
        <Empty />
      ) : (
        <div className="space-y-6 divide-y divide-thirdly">
          {orders.map((order) => (
            <MobileHistoryOrder key={order.id} order={order} />
          ))}
        </div>
      )}
    </>
  );
}

function PcHistoryOrders() {
  const selectedOrderRef = useRef<ContractOrderInfo>();
  const { data: orders, isLoading: loading } = useHistoryOrders();
  const { onPositionOrder } = usePositionOrderActions();
  // 点击行的处理函数
  const handleRowClick = useMemoCallback((order: ContractOrderInfo) => {
    onPositionOrder({
      ...order,
      show: selectedOrderRef.current?.id !== order.id,
    });
    selectedOrderRef.current = order;
  });

  // 表格列配置
  const columns = useCommonColumns();

  return <Table columns={columns} dataSource={orders} size="md" loading={loading} onRowClick={handleRowClick} />;
}
