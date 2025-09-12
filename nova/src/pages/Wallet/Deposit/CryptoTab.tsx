import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode.react';
import useSWR from 'swr';
import { useCurrency } from '@store/wallet';
import useMemoCallback from '@hooks/useMemoCallback';
import { FormItem, Image, Input, Select } from '@components';
import { useInPortal } from '@components/FunctionRender';
import { cn, formatter, request } from '@utils';
import CopyButton from '@pages/components/CopyButton';
import TransactionDetails, { DescriptionItem } from '../components/TransactionDetails';
import { CryptoCurrencyDetail } from '../types';
import useSearchHistory from './useSearchHistory';

function useDepositCurrencies() {
  return useSWR(
    ['crypto-deposit-list'],
    async () => {
      const details = await request.get<CryptoCurrencyDetail[]>(`/api/account/token/v2/listByChangeType`, {
        changeType: 'DEPOSIT_CHANGE_TYPE',
      });
      return details
        .map((item) => ({
          ...item,
          networks: Object.entries(item.networks).map(([_, info]) => info),
        }))
        .filter((item) => item.networks.length > 0);
    },
    { suspense: true }
  );
}

type ArrayItem<A> = A extends readonly (infer T)[] ? T : never;

export default function CryptoDeposit() {
  const { t } = useTranslation();
  const { name: defaultCurrency } = useCurrency();
  const { data: cryptos } = useDepositCurrencies();
  const inPortal = useInPortal();
  const [addressError, setAddressError] = useState('');
  const { onHistoryCancel, onHistoryUpdate, searchHistories } = useSearchHistory<ArrayItem<typeof cryptos>>({
    values: cryptos,
    filter: (searchHistoryCaches, values) => {
      return searchHistoryCaches
        .filter((historySymbol) => values.some((crypto) => crypto.symbol === historySymbol))
        .map((symbol) => {
          const _cryptoInfo = values.find((crypto) => crypto.symbol === symbol);
          return {
            logoUrl: _cryptoInfo!.logoUrl,
            value: _cryptoInfo!.symbol,
          };
        });
    },
  });

  const [formFields, setFormFields] = useState(() => {
    const isFiat = defaultCurrency.endsWith('FIAT');
    return {
      currency: isFiat ? cryptos[0].symbol : defaultCurrency,
      network: isFiat
        ? cryptos[0].networks[0].chain
        : cryptos.find((crypto) => crypto.symbol === defaultCurrency)!.networks[0].chain,
    };
  });

  useEffect(() => {
    setFormFields((prev) => {
      if (cryptos.some((crypto) => crypto.symbol === prev.currency)) {
        return prev;
      } else {
        return {
          ...prev,
          currency: cryptos[0].symbol,
          network: cryptos[0].networks[0].chain,
        };
      }
    });
  }, [cryptos]);

  const cryptoOptions = useMemo(() => {
    return cryptos.map((crypto) => {
      const symbol = crypto.symbol;
      return {
        label: (
          <div className="flex items-center gap-1.5">
            <Image className="rounded-full size-5" src={crypto.logoUrl} />
            <div className="space-y-1 text-14">
              <div>{`${crypto.coinFullName}(${symbol})`}</div>
            </div>
          </div>
        ),
        value: symbol,
        filter(filter: string) {
          return symbol.toUpperCase().indexOf(filter.toUpperCase()) > -1;
        },
      };
    });
  }, [cryptos]);

  const cryptoInfo = useMemo(
    () => cryptos.find((token) => token.symbol === formFields.currency)!,
    [cryptos, formFields.currency]
  );

  const networkOptions = useMemo(() => {
    return cryptoInfo.networks.map((network) => {
      return {
        value: network.chain,
        label: (inValue?: boolean) => {
          const { chain: currency, confirmationTime, minimumDepositAmount, chainFullName, logoUrl } = network;
          const time = formatter.time(confirmationTime, 'duration');
          return (
            <div className="flex items-center gap-1.5">
              <Image className="rounded-full size-6" src={logoUrl} />
              <div className="space-y-1 text-14 text-primary leading-none">
                <div className="font-500">{`${chainFullName}(${currency})`}</div>
                {!inValue && (time || minimumDepositAmount) ? (
                  <div className="text-11 s768:text-12 text-secondary font-400">
                    {minimumDepositAmount > 0 &&
                      t('Minimum deposit: {{amount}} {{currency}}', {
                        amount: minimumDepositAmount,
                        currency,
                      })}
                    {!!time &&
                      t(`Est arrival in ≈{{time}}`, {
                        time,
                      })}
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
          );
        },
        filter(filter: string) {
          return network.chain.toUpperCase().indexOf(filter.toUpperCase()) > -1;
        },
      };
    });
  }, [cryptoInfo, t]);

  const transactionsDescriptions = useMemo(() => {
    const _info = cryptoInfo.networks.find((network) => network.chain === formFields.network)!;
    const { minimumDepositAmount, confirmationTime = 0 } = _info;
    return [
      {
        label: t('Minimum deposit'),
        value: `${minimumDepositAmount} ${formFields.currency}`,
        type: 'text',
        hidden: Boolean(minimumDepositAmount),
      },
      {
        label: t('Deposit arrival time'),
        type: 'time',
        value: confirmationTime,
      },
    ].filter((item) => ('hidden' in item ? item.hidden : Boolean(item.value))) as DescriptionItem[];
  }, [cryptoInfo, formFields, t]);

  const { data: networkInfo, isValidating: addressFetching } = useSWR(
    ['deposit-network-info', formFields.network],
    async ([_, network]: string[]) => {
      const rawData = await request.get<{ memo: string; address: string }>(
        `/api/account/payment/v2/getAddress/${network}`
      );
      return rawData ?? { memo: '', address: '' };
    },
    {
      fallbackData: { memo: '', address: '' },
      keepPreviousData: true,
    }
  );

  const addressValidate = useMemoCallback(() => {
    /**
     * 这里只关注一些异常状态
     */
    const CoinStatusMap = {
      Maintain: t('Withdrawal suspended'),
      'Pre-delisting': t('Deposit suspended'),
      Delisted: t('Deposit/withdrawal suspended'),
      Default: t('Failed to get address'),
    };

    if (!networkInfo.address) {
      const coinStatus = cryptoInfo.status as keyof typeof CoinStatusMap;
      const errorMsg = CoinStatusMap[coinStatus] || CoinStatusMap.Default;
      setAddressError(errorMsg);
    } else {
      setAddressError('');
    }
  });

  useEffect(() => {
    addressValidate();
  }, [networkInfo, addressValidate]);

  return (
    <div className={cn('space-y-4', inPortal ? '' : 's768:px-50')}>
      <div className="space-y-4">
        <FormItem className="grow basis-40" label={<span className="font-600 s768:text-14">{t('Currency')}</span>}>
          <Select
            value={formFields.currency}
            options={cryptoOptions}
            onChange={(value) => {
              setFormFields({
                currency: value,
                network: cryptos.find((crypto) => crypto.symbol === value)!.networks[0].chain,
              });
              onHistoryUpdate(value);
            }}
            searchable
            searchHistory={{
              onCancel: onHistoryCancel,
              histories: searchHistories,
              onItemClick: (value) => {
                setFormFields({
                  currency: value,
                  network: cryptos.find((crypto) => crypto.symbol === value)!.networks[0].chain,
                });
              },
            }}
            className="font-500"
            overlayClassName="s768:w-100"
          />
        </FormItem>
        <FormItem className="grow basis-40" label={<span className="font-600 s768:text-14">{t('Network')}</span>}>
          <Select
            value={formFields.network}
            options={networkOptions}
            onChange={(value) => setFormFields((prev) => ({ ...prev, network: value }))}
            searchable
            className="font-500"
          />
        </FormItem>
        <FormItem label={null} error={addressError}>
          <div className={cn('py-8 px-4 s768:p-4 bg-layer7 rounded-2', !inPortal && 's768:flex s768:items-center')}>
            <div
              className={cn(
                'relative size-40 p-2 mx-auto bg-white rounded-2 mb-4',
                addressFetching && 'opacity-50',
                !inPortal && 's768:mx-0 s768:mr-6 s768:mb-0'
              )}
            >
              <QRCode value={networkInfo.address} size={144} />
            </div>
            <div className="space-y-1.5 flex-1">
              <FormItem
                className="grow basis-100 overflow-hidden"
                label={<span className="font-600">{t('Deposit address')}</span>}
              >
                <Input
                  className={cn('gap-2 font-500 h-auto min-h-10 max-h-12', addressFetching && 'opacity-50')}
                  size="lg"
                  type="hidden"
                  prefix={
                    <Address
                      className="grow text-14 font-500 line-clamp-2 break-all"
                      value={networkInfo.address}
                      split={5}
                    />
                  }
                  suffix={<CopyButton className="shrink-0" value={networkInfo.address} />}
                />
              </FormItem>
              <div className="text-11 s768:text-12 text-secondary">
                {t('Only send {{crypto}} to this address, {{confirmations}} confirmations required.', {
                  crypto: cryptoInfo.symbol,
                  confirmations: 2,
                })}
              </div>
            </div>
          </div>
        </FormItem>
      </div>

      {networkInfo.memo && (
        <FormItem className="text-12 text-secondary" label={<span className="font-600">{t('Memo/Tag')}</span>}>
          <Input
            className="mb-1 font-500"
            size="lg"
            readOnly
            value={networkInfo.memo}
            suffix={<CopyButton value={networkInfo.memo} />}
          />
          <div>{t('* Both a memo/tag and an address are required')}</div>
          <div>
            {t(
              '* Please confirm if the receiving address requires a MEMO/ Tag. If it is not filled or filled incorrectly, the asset will be lost'
            )}
          </div>
        </FormItem>
      )}
      <TransactionDetails title={t('Transaction details')} descriptions={transactionsDescriptions} />
    </div>
  );
}

function Address(props: { value: string; split: number; className?: string }) {
  const { className, value, split } = props;
  const start = value.substring(0, split);
  const middle = value.substring(split, value.length - split);
  const end = value.substring(value.length - split);
  return (
    <div className={className}>
      <span className="text-brand">{start}</span>
      <span className="text-primary">{middle}</span>
      <span className="text-brand">{end}</span>
    </div>
  );
}
