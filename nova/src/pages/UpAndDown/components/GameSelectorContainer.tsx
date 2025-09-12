/**
 * @file GameSelectorContainer
 * @description 整合 SymbolSelector 和 GamePeriodSelector 的容器组件
 * 暂时废弃
 */
import { memo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changeUpdown } from '@store/system';
import { useSelectedGameRule, useTradingPairs, useTradingPeriods, useWager } from '@store/upDown';
import { IGameRule } from '@store/upDown/types';
import { useCurrency, useCurrencyExchange } from '@store/wallet';
import { Button, ScrollList } from '@components';
import { cn, formatter } from '@utils';

/**
 * @component GameSelectorContainer
 * @description 游戏选择器容器组件，管理交易对和游戏周期的选择
 */
const GameSelectorContainer = memo(() => {
  const dispatch = useDispatch();
  const { data: pairs } = useTradingPairs();
  const exchange = useCurrencyExchange();
  const selectedGameRule = useSelectedGameRule();
  const [_, setWager] = useWager();
  const currentPair = useSelector((state) => state.system.updown.symbol);
  const currency = useCurrency();
  const { data: periods } = useTradingPeriods(currentPair);

  /**
   * @description 更新预设值和下注金额
   * @param {IGameRule} selectedGameRule - 当前选中的游戏规则
   */
  const updatePresetsAndWager = useCallback(
    (selectedGameRule: IGameRule) => {
      const { minAmount } = selectedGameRule;

      // 更新下注金额为最小值
      setWager(
        formatter
          .amount(minAmount / exchange, currency.name)
          .ceil()
          .toNumber()
          .toString()
      );
    },
    [exchange, currency.name, setWager]
  );

  // 添加新的 useEffect 来处理页面刷新时的预设值和下注金额更新
  useEffect(() => {
    // 确保有游戏规则和汇率
    if (selectedGameRule && exchange) {
      updatePresetsAndWager(selectedGameRule);
    }
  }, [selectedGameRule, exchange, updatePresetsAndWager]);

  /**
   * @description 处理交易对选择
   * @param {ISymbol} symbol - 选中的交易对
   */
  // const handleSymbolSelect = async (tradingPair: SymbolInfo) => {
  //   // 打开弹窗
  //   Modal.open({
  //     title: t('Choose Symbol'),
  //     size: 'lg',
  //     className: 's768:w-auto s768:min-w-100',
  //     children: (
  //       <GamePeriodSelector
  //         tradingPair={tradingPair}
  //         onSelect={(period) => {
  //           // 只有当symbol或gameLabel有变化时才dispatch
  //           if (period.symbol !== currentPair || period.label !== currentLabel) {
  //             dispatch(
  //               changeUpdown({
  //                 symbol: tradingPair.symbol,
  //                 gameLabel: period.label,
  //               })
  //             );
  //             updatePresetsAndWager(period);
  //           }
  //           Modal.close();
  //         }}
  //       />
  //     ),
  //   });
  // };

  return (
    <div className="pb-3 border-b border-thirdly">
      <ScrollList className="space-x-4 s768:space-x-8 h-15 flex" size="md">
        {pairs.map((pair) => (
          <Button
            key={pair.symbol}
            size="free"
            theme="transparent"
            className={cn(
              'shrink-0 flex flex-col items-center p-2 pb-1 rounded-2 hover:bg-layer5',
              pair.symbol === currentPair && 'bg-layer5'
            )}
            // onClick={() => handleSymbolSelect(pair)}
            onClick={() => {
              if (pair.symbol !== currentPair) {
                dispatch(
                  changeUpdown({
                    symbol: pair.symbol,
                    gameLabel: periods[0].label, // 默认取第一个时间组
                  })
                );
              }
            }}
          >
            <img src={pair.assetBaseImage} className="object-cover rounded-full size-7" />
            <span className="font-600 text-secondary mt-1 text-9 s768:text-10">
              {pair.symbol.split('/')[0]}
              <span className="text-secondary">/USDT</span>
            </span>
          </Button>
        ))}
      </ScrollList>
    </div>
  );
});

GameSelectorContainer.displayName = 'GameSelectorContainer';

export default GameSelectorContainer;
