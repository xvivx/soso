import { memo, useEffect } from 'react';
import { ContractOrderInfo, useActiveTradingPair, useLever, useTradingPairParam } from '@store/contract';
import { ContractSetting } from '@store/system';
import { useGameContext } from '@pages/components/GameProvider';
import MultiplierInput from './MultiplierInput';

function LeverInput() {
  const { onSettingsChange } = useGameContext<ContractSetting, ContractOrderInfo>();
  const lever = useLever();
  const activeTradingPair = useActiveTradingPair();
  const { max_multiplier: maxMultiplier = 1000 } = useTradingPairParam(activeTradingPair?.symbol) || {};
  useEffect(() => {
    if (lever > maxMultiplier) {
      onSettingsChange({ lever: maxMultiplier });
    }
  }, [lever, maxMultiplier, onSettingsChange]);

  return (
    <MultiplierInput
      className="w-50 flex-1"
      value={String(lever)}
      onChange={(value) => onSettingsChange({ lever: Number(value) })}
    />
  );
}

export default memo(LeverInput);
