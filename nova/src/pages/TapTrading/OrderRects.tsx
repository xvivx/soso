import { memo, useMemo } from 'react';
import { Annotation, HtmlLabel } from '@visx/annotation';
import { motion, Variants } from 'framer-motion';
import { useExchanges } from '@store/wallet';
import { AnimateNumber } from '@components';
import { cn, Systems } from '@utils';
import { useGridSize, useMixinOrdersRects } from './hooks';
import { Scale, ViewBounding } from './utils';

function Orders(props: { xScale: Scale; yScale: Scale; bounding: ViewBounding }) {
  const { xScale, yScale, bounding } = props;
  const GridSize = useGridSize(bounding);
  const orderRects = useMixinOrdersRects();
  const exchanges = useExchanges();
  const mergeRects = useMemo(() => {
    return orderRects.map((item) => {
      const last = item.orders[item.orders.length - 1];
      return {
        ...item,
        amount: item.orders.reduce((curr, next) => (curr += next.amount * exchanges[next.currency]), 0),
        checkoutOrder: item.orders.find((order) => order.profit !== 0),
        odds: last ? last.odds : 0,
      };
    });
  }, [orderRects, exchanges]);

  const annOptions = useMemo(() => {
    if (Systems.browser.isChrome) {
      return {
        whileTap: { scale: 1.1 },
        variants: {
          initial: { scale: 0.2, borderRadius: GridSize, opacity: 0.2 },
          animate: { scale: 1, borderRadius: 0, opacity: 1 },
        } as Variants,
      };
    }
  }, [GridSize]);

  return mergeRects.map((merge) => {
    const x = xScale(merge.x);
    const y = yScale(merge.y);
    return (
      <Annotation key={merge.key} x={x} y={y} dy={-GridSize}>
        <HtmlLabel
          className={cn(
            'pointer-events-auto text-0',
            merge.checkoutOrder && merge.checkoutOrder.profit > 0 && 'tap-profit-rect'
          )}
          showAnchorLine={false}
          horizontalAnchor="start"
          verticalAnchor="start"
        >
          <motion.div
            className={cn(
              'flex-center flex-col truncate bg-colorful1 border-input border-dashed border text-primary_brand transition-colors',
              merge.checkoutOrder && (merge.checkoutOrder.profit > 0 ? 'bg-up' : 'bg-down/20 text-secondary')
            )}
            style={{ width: GridSize, height: GridSize, fontSize: 9 }}
            initial="initial"
            animate="animate"
            {...annOptions}
          >
            {merge.amount > 0 && <AnimateNumber value={merge.amount} currency="USDFIAT" immediate={false} />}
            {merge.amount > 0 && `${merge.odds}x`}
          </motion.div>
        </HtmlLabel>
      </Annotation>
    );
  });
}

export default memo(Orders);
