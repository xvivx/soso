import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Fiat, useCurrency, useFiatMethodForm, useFiatMethods, useSupportList } from '@store/wallet';
import useMemoCallback from '@hooks/useMemoCallback';
import { AmountInput, Button, Empty, FormItem, Image, Input, Modal, Select, SvgIcon } from '@components';
import { useInPortal } from '@components/FunctionRender';
import { cn, request } from '@utils';
import { getCoinUrl } from '@utils/others';
import { Help } from '@pages/KYC/Help';
import i18n from '@/i18n';
import { FiatDepositOrder } from '../types';
import { FiatOrderResult } from './FiatOrderDetail';
import useSearchHistory from './useSearchHistory';

function FiatDeposit() {
  const inPortal = useInPortal();
  const currency = useCurrency().name;
  const { data: fiatList } = useSupportList();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiat, setSelectedFiat] = useState(() => (currency.endsWith('FIAT') ? currency : ''));
  const { data: depositMethods, isValidating: methodFetching } = useFiatMethods('deposit', selectedFiat);
  const [selectedMethod, setSelectedMethod] = useState(depositMethods[0]);
  const [amount, setAmount] = useState('');
  const fiatOptions = useMemo(() => {
    return fiatList.map((fiat) => {
      const short = fiat.currency.replace(/FIAT$/, '');
      const full = `${short} - ${fiat.fullName}`;
      return {
        value: fiat.currency,
        label: (inValue?: boolean) => (
          <div className="flex items-center gap-2.5">
            <Image className="rounded-full size-5" src={getCoinUrl(fiat.currency)} />
            <div>{inValue ? short : full}</div>
          </div>
        ),
        filter(filter: string) {
          return full.toUpperCase().indexOf(filter.toUpperCase()) > -1;
        },
      };
    });
  }, [fiatList]);

  const { onHistoryCancel, onHistoryUpdate, searchHistories } = useSearchHistory<Fiat>({
    values: fiatList,
    filter: (searchHistoryCaches, values) => {
      return searchHistoryCaches
        .filter((historySymbol) => values.some((fiat) => fiat.currency === historySymbol))
        .map((symbol) => {
          const _fiatInfo = values.find((fiat) => fiat.currency === symbol);
          return {
            logoUrl: getCoinUrl(_fiatInfo!.currency),
            value: _fiatInfo!.currency,
            label: _fiatInfo!.currency.replace(/FIAT$/, ''),
          };
        });
    },
    cacheKey: 'fiatDepositHistory',
  });

  useLayoutEffect(() => {
    if (!fiatList.length) return;
    setSelectedFiat((selectedFiat) => {
      const detail = fiatList.find((fiat) => fiat.currency === selectedFiat);
      return detail ? selectedFiat : fiatList[0].currency;
    });
  }, [fiatList]);

  useLayoutEffect(() => {
    setSelectedMethod((prev) => {
      return depositMethods.find((method) => prev && prev.channelId === method.channelId) || depositMethods[0];
    });
  }, [depositMethods]);

  const { minLimit: depositMinAmount = 0, maxLimit: depositMaxAmount = 0 } = selectedMethod || {};
  useLayoutEffect(() => {
    setAmount(depositMinAmount ? depositMinAmount.toString() : '');
  }, [depositMinAmount]);

  const { data: fields, isValidating: fieldFetching } = useFiatMethodForm(
    'deposit',
    selectedFiat,
    selectedMethod && selectedMethod.currency === selectedFiat ? selectedMethod.channelId : undefined
  );
  type Field = NonNullable<typeof fields>[number];
  const [formValues, setFormValues] = useState<{ field: Field; value: string; error: string }[]>([]);
  useEffect(() => {
    setFormValues(fields.map((field) => ({ field, value: '', error: '' })));
  }, [fields]);

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

  return (
    <form
      className={cn('space-y-4', inPortal ? '' : 's768:px-50')}
      onSubmit={async (event) => {
        event.preventDefault();
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
          const depositOrder = await request.post<FiatDepositOrder>('/api/account/fiat/payment/deposit/create', {
            amount: Number(amount),
            channelId: selectedMethod.channelId,
            currency: selectedFiat,
            kycItem: formValues.reduce(
              (values, field) => {
                values[field.field.commonKey] = field.value;
                return values;
              },
              {} as Record<string, string>
            ),
          });

          depositOrder.walletUrl && window.open(depositOrder.walletUrl, '_blank');
          Modal.open({
            title: i18n.ts('Deposit is in progress'),
            children: <FiatOrderResult order={depositOrder} />,
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
      <FormItem label={t('Currency')}>
        <Select
          size="lg"
          value={selectedFiat}
          onChange={(value) => {
            setSelectedFiat(value);
            onHistoryUpdate(value);
          }}
          options={fiatOptions}
          searchable
          searchHistory={{
            onCancel: onHistoryCancel,
            histories: searchHistories,
            onItemClick: (value) => {
              setSelectedFiat(value);
            },
          }}
          className="text-14 s768:text-16 font-500"
        />
      </FormItem>

      <div className={cn('grid col-min-36 gap-4', methodFetching && 'opacity-50')}>
        {depositMethods.map((method) => {
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
        {depositMethods.length === 0 && <Empty className="min-h-40" />}
      </div>

      {selectedMethod && (
        <div className={cn('grid col-min-50 gap-4', fieldFetching && 'opacity-50')}>
          <FormItem label={t('Amount')}>
            <AmountInput size="lg" value={amount} onChange={setAmount} min={depositMinAmount} max={depositMaxAmount} />
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

      {selectedMethod && !inPortal && (
        <SubmitButton
          className="min-w-50 w-full s768:w-auto flex gap-1 mx-auto"
          loading={submitting}
          channel={selectedMethod.displayName}
        />
      )}

      <ol className="detrade-card bg-success/10 text-12 list-decimal list-inside">
        <li>{t('Your transfer amount has to MATCH the submission amount.')}</li>
        <li>{t('Each Order ID can ONLY be used once to avoid duplicates.')}</li>
        <li>{t('Please follow the deposit guideline to make deposit, otherwise your deposit will be missing.')}</li>
      </ol>

      {selectedMethod && inPortal && (
        <Modal.Footer>
          <SubmitButton className="w-full gap-1" loading={submitting} channel={selectedMethod.displayName} />
        </Modal.Footer>
      )}
    </form>
  );
}

export default FiatDeposit;

function SubmitButton(props: { loading: boolean; className: string; channel: string }) {
  const { loading, channel, className } = props;
  const { t } = useTranslation();
  return (
    <Button className={className} size="lg" type="submit" loading={loading}>
      {t('Deposit Via {{depositChannel}}', { depositChannel: channel })}
      <SvgIcon className="size-4 text-current" name="link" />
    </Button>
  );
}
