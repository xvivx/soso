import { memo, useEffect } from 'react';
import { usePlaceAmount, usePlaceLimit } from '@store/tap';
import { FormItem } from '@components';
import PlaceInput from '@pages/components/PlaceInput';

function PlacePanel() {
  const {
    data: { minAmount, maxAmount, currency },
  } = usePlaceLimit();
  const [amount, setAmount] = usePlaceAmount();

  useEffect(() => {
    minAmount && setAmount(String(minAmount));
  }, [setAmount, minAmount]);

  return (
    <FormItem id="tap-trading-available-balance" className="detrade-card s768:w-96" label={null}>
      <PlaceInput
        value={amount}
        onChange={setAmount}
        min={minAmount}
        max={maxAmount}
        limitCurrency={currency}
        shortcuts
        presets={[5, 10, 50, 100, 500, 1000]}
      />
    </FormItem>
  );
}

export default memo(PlacePanel);
