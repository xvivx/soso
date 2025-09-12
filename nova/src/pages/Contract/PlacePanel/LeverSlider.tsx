import { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ContractOrderInfo, useActiveTradingPair, useLever, useTradingPairParam } from '@store/contract';
import { ContractSetting } from '@store/system';
import useMemoCallback from '@hooks/useMemoCallback';
import { useGameContext } from '@pages/components/GameProvider';
import Slider from '@pages/components/Slider';

function LeverSlider() {
  const { onSettingsChange } = useGameContext<ContractSetting, ContractOrderInfo>();
  const lever = useLever();
  const activeTradingPair = useActiveTradingPair();
  const { max_multiplier: maxMultiplier } = useTradingPairParam(activeTradingPair.symbol);
  const { t } = useTranslation();
  const draggingRef = useRef(false);
  const [x, setX] = useState<number>(0);

  useEffect(() => {
    if (lever > maxMultiplier) {
      onSettingsChange({ lever: maxMultiplier });
    }
  }, [lever, maxMultiplier, onSettingsChange]);

  const handleDragStart = useMemoCallback((offsetX?: number) => {
    offsetX && setX(offsetX);
  });

  const handleDragEnd = useMemoCallback(() => {
    draggingRef.current = false;
    setX(0);
  });

  return (
    <div className="relative">
      {x > 0 && (
        <motion.div
          className="absolute z-10  bg-layer5 py-1 px-2 rounded-2 inline-block -translate-x-1/2 shadow-lg"
          style={{ left: x + 6, top: -44 }}
        >
          <div className="relative">
            <span className="text-primary text-12">{`${lever}X`}</span>
            <div className="absolute -bottom-[7px] left-1/2 -translate-x-[2px] w-0 h-0 text-layer5">
              <span className="border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></span>
            </div>
          </div>
        </motion.div>
      )}
      <Slider
        value={lever}
        onChange={(value, offsetX?: number) => {
          onSettingsChange({ lever: Math.round(value) });
          if (offsetX) {
            setX(offsetX);
          }
        }}
        max={maxMultiplier}
        onDragStart={handleDragStart}
        onDragend={handleDragEnd}
      />
      <div className="flex items-center justify-between text-12 text-secondary font-500">
        <div className="flex gap-1">
          <div>1X</div>
          <div className="text-success text-12">{t('Safe')}</div>
        </div>
        <div className="flex gap-1">
          <div className="text-error text-12">{t('Wild')}</div>
          <div>{`${maxMultiplier}X`}</div>
        </div>
      </div>
    </div>
  );
}

export default memo(LeverSlider);
