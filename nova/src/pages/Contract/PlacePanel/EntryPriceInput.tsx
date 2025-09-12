import { memo, useEffect, useRef } from 'react';
import { useActivePrice } from '@store/symbol';
import { AmountInput } from '@components';
import { formatter } from '@utils';
import { useGameTradingPairsMap } from '@pages/components/GameProvider';

function EntryPriceInput(props: { value: string; onChange: (value: string) => void }) {
  const { value, onChange } = props;
  const { price: tickPrice, symbol } = useActivePrice();
  const tradingPairsMap = useGameTradingPairsMap();
  const tradingPairPrecision = tradingPairsMap[symbol]?.decimalPlaces || 2;
  const tickPriceRef = useRef(tickPrice);
  tickPriceRef.current = tickPrice;

  useEffect(() => {
    onChange(formatter.price(tickPriceRef.current, tradingPairPrecision).toNumber().toString());
  }, [tradingPairPrecision, onChange, symbol]);
  return (
    <AmountInput className="bg-layer2" value={value} onChange={onChange} precision={tradingPairPrecision} size="lg" />
  );
}

export default memo(EntryPriceInput);
