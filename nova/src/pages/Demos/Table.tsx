import { useEffect, useMemo, useReducer, useState } from 'react';
import { mock } from 'mockjs';
import { Button, Column, Modal, Table } from '@components';

type Order = { id: string; name: string; avatar: string; bet: number; time: number };
const template = {
  id: '@uuid',
  avatar: '@image(100x100, @color)',
  name: '@name',
  'bet|100-10000.2': 1,
  age: '@integer(18, 50)',
  time: '@datetime',
};
const data = mock({
  'data|9-9': [template],
}).data as Order[];

export default function TableDemo() {
  const [dataSource, setDataSource] = useState(() => data);
  const [auto, toggleAuto] = useReducer((auto) => !auto, false);
  const columns = useMemo<Column<Order>[]>(() => {
    return [
      {
        title: 'ID',
        dataIndex: 'id',
        width: 340,
      },
      {
        title: 'Name',
        dataIndex: 'name',
        width: 180,
      },
      {
        title: 'Avatar',
        dataIndex: 'avatar',
        width: 180,
        render(order) {
          return <img src={order.avatar} className="size-6 rounded-full" />;
        },
      },
      {
        title: 'Bet',
        dataIndex: 'bet',
        width: 150,
      },
      {
        title: 'Time',
        dataIndex: 'time',
        width: 150,
        type: 'time',
      },
    ];
  }, []);

  useEffect(() => {
    if (!auto) return;

    const timer = setInterval(() => {
      setDataSource((prev) => [createUser()].concat(prev));
    }, 1000);
    return () => clearInterval(timer);
  }, [auto]);

  const columnsWithFixed = useMemo(
    () =>
      columns.map((it, index) => {
        if (index === columns.length - 1) {
          return { ...it, fixed: 'right' } as typeof it;
        } else {
          return it;
        }
      }),
    [columns]
  );

  return (
    <div>
      <div className="flex gap-2">
        <Button onClick={() => setDataSource((prev) => [createUser()].concat(prev).slice(0, 10))}>添加订单</Button>
        <Button theme="secondary" onClick={toggleAuto}>
          自动添加
        </Button>
      </div>
      <Table size="lg" className="bg-layer2" rowKey="id" columns={columns} dataSource={dataSource} />
      <br />
      <h3>固定列最右侧列</h3>
      <Table className="bg-layer2" rowKey="id" columns={columnsWithFixed} dataSource={dataSource} />

      <br />
      <Button
        onClick={() => {
          Modal.open({
            title: '弹窗中的表格',
            children: (
              <div>
                <p>弹窗中的表格滚动区域会发生在表格部分, 弹窗不再发生是滚动</p>
                <Table className="bg-layer2" rowKey="id" columns={columnsWithFixed} dataSource={dataSource} />
              </div>
            ),
            size: 'lg',
          });
        }}
      >
        弹窗中的表格
      </Button>
    </div>
  );
}

function createUser() {
  return mock(template) as Order;
}
