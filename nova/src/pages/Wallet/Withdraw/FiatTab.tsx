import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency, useFiatMethodForm, useFiatMethods, useRealAssetsWithLocaleAmount } from '@store/wallet';
import useMemoCallback from '@hooks/useMemoCallback';
import { AmountInput, Empty, FormItem, Input, Modal, Select } from '@components';
import { cn, request } from '@utils';
import { getCoinUrl } from '@utils/others';
import { Help } from '@pages/KYC/Help';
import i18n from '@/i18n';
import { FiatWithdrawOrder } from '../types';
import CurrencySelector from './BalanceSelector';
import FiatOrderDetail from './FiatOrderDetail';
import { WithdrawButton } from './WithdrawHelp';

function useFiatCurrencies() {
  const assets = useRealAssetsWithLocaleAmount();
  return useMemo(
    () =>
      assets
        .filter((asset) => asset.currency.endsWith('FIAT'))
        .sort((curr, next) => {
          return next.localeAmount - curr.localeAmount || curr.currency.localeCompare(next.currency);
        }),
    [assets]
  );
}

function Withdraw() {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const currencies = useFiatCurrencies();
  const walletCurrency = useCurrency();
  const [withdrawFiat, setWithdrawFiat] = useState(() =>
    walletCurrency.name.endsWith('FIAT') ? walletCurrency.name : ''
  );
  useLayoutEffect(() => {
    if (!currencies.length) return;
    setWithdrawFiat((selectedFiat) => {
      // 钱包里的币不支持提现时用取第一个
      const detail = currencies.find((asset) => asset.currency === selectedFiat);
      return detail ? selectedFiat : currencies[0].currency;
    });
  }, [currencies]);

  const { data: withdrawMethods, isValidating: methodFetching } = useFiatMethods('withdraw', withdrawFiat);
  const [selectedMethod, setSelectedMethod] = useState(withdrawMethods[0]);
  useLayoutEffect(() => {
    setSelectedMethod(
      (prev) => withdrawMethods.find((method) => prev && prev.channelId === method.channelId) || withdrawMethods[0]
    );
  }, [withdrawMethods]);

  type Field = NonNullable<typeof fields>[number];

  const validate = useMemoCallback((field: Field, value: string) => {
    let error = '';
    if (field.validPatterns) {
      field.validPatterns.find((pattern) => {
        if (!new RegExp(pattern.validRule).test(value)) {
          error = pattern.validMessage;
          return true;
        }
      });
    }
    return error;
  });

  const [amount, setAmount] = useState({ value: '', error: '' });
  const { minLimit: withdrawMinAmount = 0, maxLimit: withdrawMaxAmount = 0, channelId } = selectedMethod || {};
  useLayoutEffect(() => {
    setAmount({ value: withdrawMinAmount ? withdrawMinAmount.toString() : '', error: '' });
  }, [withdrawMinAmount]);

  const [formValues, setFormValues] = useState<{ field: Field; value: string; error: string }[]>([]);
  const { data: fields, isValidating: fieldFetching } = useFiatMethodForm('withdraw', withdrawFiat, channelId);
  useEffect(() => {
    setFormValues(fields.map((field) => ({ field, value: '', error: '' })));
  }, [fields]);

  const withdrawFee = useMemo(() => {
    const withdrawAmount = Number(amount.value);
    if (!withdrawAmount || !selectedMethod) return 0;
    return withdrawAmount * selectedMethod.feePercent + selectedMethod.feeFixed;
  }, [amount.value, selectedMethod]);

  return (
    <form
      className="space-y-3 s768:px-50"
      onSubmit={async (event) => {
        event.preventDefault();
        const balance = currencies.find((asset) => asset.currency === withdrawFiat)!;

        if (Number(amount.value) > balance.amount) {
          setAmount({ value: amount.value, error: t('Balance is not enough') });
          return;
        }

        let block = false;
        const validateValues = formValues.map((item) => {
          const error = validate(item.field, item.value);
          block = block || Boolean(error);
          return { ...item, error };
        });

        setFormValues(validateValues);
        if (block) return;

        try {
          setSubmitting(true);
          const withdrawOrder = await request.post<FiatWithdrawOrder>('/api/account/fiat/payment/withdraw/create', {
            amount: Number(amount.value),
            channelId: selectedMethod.channelId,
            currency: withdrawFiat,
            kycItem: formValues.reduce(
              (values, field) => {
                values[field.field.commonKey] = field.value;
                return values;
              },
              {} as Record<string, string>
            ),
          });

          Modal.open({
            title: i18n.ts('Withdraw is in progress'),
            children: <FiatOrderDetail order={withdrawOrder} />,
            onClose: Modal.closeAll,
            closable: false,
          });
        } catch (error) {
          if (error.code === 11006) {
            Modal.closeAll();
            Modal.open({
              title: t('Verification'),
              children: <Help />,
              onClose: Modal.closeAll,
            });
          }
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <FormItem label="currency">
        <CurrencySelector currencies={currencies} value={withdrawFiat} onChange={setWithdrawFiat} />
      </FormItem>

      <div className={cn('grid col-min-36 gap-4', methodFetching && 'opacity-50')}>
        {withdrawMethods.map((method) => {
          return (
            <div
              key={method.category + method.channelId}
              className={cn(
                'detrade-card cursor-pointer text-12 text-secondary outline outline-black/10 hover:outline-up/30 transition-all',
                method === selectedMethod && 'outline-success hover:outline-success'
              )}
              onClick={() => setSelectedMethod(method)}
            >
              <img className="w-full h-12 px-2 mb-2 object-contain rounded" src={method.icon} alt="channel" />
              <div className="text-primary text-14 font-600">{method.category}</div>
              <div className="break-all">{method.displayName}</div>
              <div>{`${method.minLimit}-${method.maxLimit}`}</div>
            </div>
          );
        })}
        {withdrawMethods.length === 0 && <Empty className="min-h-40" />}
      </div>

      {selectedMethod && (
        <div className={cn('grid col-min-50 gap-4', fieldFetching && 'opacity-50')}>
          <FormItem label={t('Amount')} error={amount.error}>
            <AmountInput
              size="lg"
              value={amount.value}
              onChange={(value) => setAmount({ value, error: '' })}
              min={withdrawMinAmount}
              max={withdrawMaxAmount}
              logo={getCoinUrl(withdrawFiat)}
              disabled={!withdrawFiat}
              onMax={() => {
                setAmount({
                  value: currencies.find((asset) => asset.currency === withdrawFiat)!.amount.toString(),
                  error: '',
                });
              }}
            />
          </FormItem>

          {formValues.map(({ field, value, error }) => {
            const onChange = (value: string) => {
              setFormValues((values) => {
                return values.map((item) => {
                  if (item.field === field) {
                    return { ...item, value, error: validate(field, value) };
                  } else {
                    return item;
                  }
                });
              });
            };
            return (
              <FormItem key={field.commonKey} label={field.label} error={error}>
                {field.type === 'map_select' ? (
                  <Select
                    size="lg"
                    value={value}
                    options={field.mapOptions.map(([label, value]) => ({ label, value }))}
                    onChange={onChange}
                    placeholder={field.label}
                  />
                ) : field.type === 'select' ? (
                  <Select
                    size="lg"
                    value={value}
                    options={field.options.map((value) => ({ label: value, value }))}
                    onChange={onChange}
                    placeholder={field.label}
                  />
                ) : (
                  <Input type={field.type} value={value} onChange={onChange} size="lg" placeholder={field.label} />
                )}
              </FormItem>
            );
          })}
        </div>
      )}

      {selectedMethod && (
        <WithdrawButton
          className="min-w-50 w-full s768:w-min flex gap-1 mx-auto"
          size="lg"
          type="submit"
          loading={submitting}
        >
          <span>{t('Withdraw')}</span>
          <span className="text-14">{`(${t('Fee')}: ${withdrawFee})`}</span>
        </WithdrawButton>
      )}
    </form>
  );
}

export default Withdraw;
