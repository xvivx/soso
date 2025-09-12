import { memo, useMemo } from 'react';
import { useCollectSymbolsMap, useSymbolPricesMap } from '@store/symbol';
import { Accordion, Image, ScrollList, SvgIcon } from '@components';
import { cn, formatter } from '@utils';

function CollectSymbols({
  symbols,
  selectedSymbol,
  onSelectSymbol,
}: {
  symbols: SymbolInfo[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}) {
  const collects = useCollectSymbolsMap();
  const prices = useSymbolPricesMap();
  const merges = useMemo(() => {
    return symbols
      .filter((it) => collects[it.symbol])
      .map((it) => {
        const { c: change, p: price } = prices[it.symbol] || { c: 0, p: 0 };
        return {
          ...it,
          price: { change, value: formatter.price(price, it.decimalPlaces).toText() },
        };
      });
  }, [symbols, collects, prices]);

  return (
    <Accordion.Collapse defaultOpen={merges.length > 0}>
      <ScrollList className="h-10 items-center rounded-2" size="sm">
        <SvgIcon name="star" className="shrink-0 size-4 ml-3 text-warn hover:text-warn cursor-default" />
        {merges.map((pair) => {
          const name = pair.symbol.split('/')[0];
          return (
            <div
              key={pair.symbol}
              className="px-3 border-r border-layer5 last-of-type:border-none text-12 font-500"
              onClick={() => onSelectSymbol(pair.symbol)}
            >
              <div
                className={cn(
                  'flex items-center flex-nowrap gap-2 px-2 py-1 cursor-pointer rounded-1.5',
                  selectedSymbol === pair.symbol && 'bg-layer5'
                )}
              >
                <Image className="size-3.5 rounded-full" src={pair.assetBaseImage} />
                <span>{name}</span>
                <span className={pair.price.change > 0 ? 'text-up' : 'text-down'}>
                  {(pair.price.change * 100).toFixed(2)}%
                </span>
                <span className="text-primary">{pair.price.value}</span>
              </div>
            </div>
          );
        })}
      </ScrollList>
    </Accordion.Collapse>
  );
}

export default memo(CollectSymbols);
