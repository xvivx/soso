import { memo, useEffect, useMemo, useState } from 'react';
import { Annotation, HtmlLabel } from '@visx/annotation';
import { useActivePrice } from '@store/symbol';
import { OrderStatus, TapOrder, useLiveOrders } from '@store/tap';
import useMemoCallback from '@hooks/useMemoCallback';
import { Avatar } from '@components';
import { useGridSize } from './hooks';
import { Scale, ViewBounding } from './utils';

type OrderMapItem = { x: number; y: number; orders: TapOrder[] };
type OrderMap = Map<string, OrderMapItem>;

interface GridTraderOrderProps {
  xScale: Scale;
  yScale: Scale;
  bounding: ViewBounding;
  yDomain: [number, number];
}

function GridTraderOrder(props: GridTraderOrderProps) {
  const { xScale, yScale, bounding, yDomain } = props;
  const { data: orders } = useLiveOrders();
  const [orderMap, setOrderMap] = useState<OrderMap>(new Map());
  const GSize = useGridSize(bounding);
  const { time } = useActivePrice();

  const showOrders = useMemo(() => {
    return [...orderMap.values()].filter((it) => it.x >= time);
  }, [orderMap, time]);

  const avatarSize = useMemo(() => Math.floor(GSize / 3), [GSize]);

  const renderAvatar = useMemoCallback((orders: TapOrder[]) => {
    if (!orders.length) return null;

    if (orders.length === 1) {
      return (
        <div className="text-10 text-white flex items-center justify-center" style={{ width: GSize, height: GSize }}>
          <Avatar
            className="border border-white"
            style={{ width: GSize * 0.6, height: GSize * 0.6 }}
            src={orders[0].avatar}
            size="sm"
          />
        </div>
      );
    } else {
      return (
        <div className="text-10 text-white flex flex-wrap content-end pl-2.5" style={{ width: GSize, height: GSize }}>
          {orders.slice(0, 15).map((order) => (
            <Avatar
              key={order.id}
              style={{ width: avatarSize, height: avatarSize, marginLeft: -Math.ceil(avatarSize / 2) }}
              src={order.avatar}
              size="sm"
            />
          ))}
        </div>
      );
    }
  });

  useEffect(() => {
    const domainOrders = orders.filter(
      (order) =>
        order.status === OrderStatus.Progressing &&
        order.lowerPriceLimit >= yDomain[0] &&
        order.lowerPriceLimit <= yDomain[1]
    );

    setOrderMap((prev) => {
      const map: OrderMap = new Map();

      domainOrders.forEach((itemOrder) => {
        const orderTPKey = `${itemOrder.lowerTimeLimit}-${itemOrder.lowerPriceLimit}`;

        if (map.has(orderTPKey)) {
          const existingItem = map.get(orderTPKey)!;

          if (existingItem.orders.every((order) => order.id !== itemOrder.id && order.userId !== itemOrder.userId)) {
            existingItem.orders.push(itemOrder);
          }
        } else if (prev.has(orderTPKey)) {
          const prevItem = prev.get(orderTPKey)!;
          const orders = [...prevItem.orders];

          if (orders.every((order) => order.id !== itemOrder.id && order.userId !== itemOrder.userId)) {
            orders.push(itemOrder);
          }
          map.set(orderTPKey, {
            x: itemOrder.lowerTimeLimit,
            y: itemOrder.lowerPriceLimit,
            orders,
          });
        } else {
          map.set(orderTPKey, {
            x: itemOrder.lowerTimeLimit,
            y: itemOrder.lowerPriceLimit,
            orders: [itemOrder],
          });
        }
      });

      return map;
    });
  }, [orders, yDomain]);

  return showOrders.map((item) => {
    return (
      <Annotation key={`${item.x}-${item.y}`} x={xScale(item.x)} y={yScale(item.y)} dy={-GSize}>
        <HtmlLabel
          showAnchorLine={false}
          horizontalAnchor="start"
          verticalAnchor="start"
          className="tap-trader-avatar-mask"
        >
          {renderAvatar(item.orders)}
        </HtmlLabel>
      </Annotation>
    );
  });
}

export default memo(GridTraderOrder);
