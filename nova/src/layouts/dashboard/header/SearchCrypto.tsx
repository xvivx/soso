import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useActiveTradingPair, useTradingPairs } from '@store/contract';
import { setLeverageConfig } from '@store/system';
import useNavigate from '@hooks/useNavigate';
import { Input, Popover } from '@components';
import TradingPair from '@pages/components/TradingPair';

function SearchCrypto() {
  const { data: symbols } = useTradingPairs();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // 这里使用手动触发开关，为了保持Input作为Trigger时处于焦点状态
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  // 合约玩法当前货币对
  const selectedSymbolPair = useActiveTradingPair();
  const { t } = useTranslation();

  const options = useMemo(() => {
    const keyText = filterText.trim();
    if (!keyText) return symbols;
    // 根据搜索过滤option
    return symbols.filter((symbol) => {
      const [currency] = symbol.symbol.split('/');
      return currency.toUpperCase().includes(keyText.toUpperCase());
    });
  }, [symbols, filterText]);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      onOpenAutoFocus={(event) => event.preventDefault()}
      overlayClassName="flex flex-col s768:w-[360px] text-12 font-500"
      content={
        <TradingPair.List
          inPopover
          data={options}
          selectedSymbolName={selectedSymbolPair.symbol}
          onChange={(pairs) => {
            dispatch(setLeverageConfig({ symbol: pairs }));
            navigate('/trade-center/futures');
            setOpen(false);
          }}
        />
      }
    >
      <Input.Search
        className="w-36 s768:text-12 bg-layer3"
        placeholder={t('Search crypto')}
        value={filterText}
        onChange={setFilterText}
        onClick={() => setOpen(true)}
      />
    </Popover>
  );
}

export default SearchCrypto;
