import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { keyBy } from 'lodash-es';
import useSWR, { mutate } from 'swr';
import { useUserInfo } from '@store/user';
import { useCurrency, useRealAssetsWithLocaleAmount } from '@store/wallet';
import {
  Accordion,
  AmountInput,
  Button,
  FormItem,
  Image,
  Input,
  InputOtp,
  message,
  Modal,
  Select,
  VerifyCodeButton,
} from '@components';
import { request } from '@utils';
import { getCoinUrl, maskEmail } from '@utils/others';
import { VerifyEmailType } from '@/type';
import TransactionDetails, { DescriptionItem } from '../components/TransactionDetails';
import { CryptoCurrencyDetail } from '../types';
import AddressInput from './AddressInput';
import CurrencySelector from './BalanceSelector';
import { WithdrawButton } from './WithdrawHelp';

const VerificationModal = ({ onSuccess }: { onSuccess: (emailCode: string, mfaCode: string) => void }) => {
  const { t } = useTranslation();
  const { email } = useUserInfo().data;
  const initial = useMemo(
    () => ({
      emailCode: { value: '', error: '' },
      mfaCode: { value: '', error: '' },
    }),
    []
  );
  const [formFields, setFormFields] = useState(initial);
  type Field = keyof typeof formFields;
  function updateFormField(field: Field, value: string) {
    setFormFields((prev) => ({ ...prev, [field]: { value, error: '' } }));
  }

  function validate() {
    const errors: [Field, string][] = [];
    if (formFields.emailCode.value.length !== 6) {
      errors.push(['emailCode', t("Email verification code's length is not right")]);
    }
    if (formFields.mfaCode.value.length !== 6) {
      errors.push(['mfaCode', t("2FA Code's length is not right")]);
    }

    if (errors.length) {
      setFormFields((prev) => {
        const fields = { ...prev };
        errors.forEach(([key, error]) => {
          fields[key] = { ...fields[key], error };
        });

        return fields;
      });

      return false;
    } else {
      return true;
    }
  }

  return (
    <div className="space-y-4">
      <FormItem
        label={
          <div className="flex items-center justify-between gap-2 w-screen mb-1">
            {t('A verification will be sent to {{email}}', { email: maskEmail(email) })}
            <VerifyCodeButton auth size="sm" businessType={VerifyEmailType.withdraw} />
          </div>
        }
        error={formFields.emailCode.error}
      >
        <InputOtp
          size="md"
          value={formFields.emailCode.value}
          onChange={(value) => updateFormField('emailCode', value)}
        />
      </FormItem>

      <FormItem label={t('Please enter an 2FA code')} error={formFields.mfaCode.error}>
        <InputOtp size="md" value={formFields.mfaCode.value} onChange={(value) => updateFormField('mfaCode', value)} />
      </FormItem>

      <Modal.Footer>
        <Button
          className="w-full"
          size="lg"
          onClick={() => {
            return validate() && onSuccess(formFields.emailCode.value, formFields.mfaCode.value);
          }}
        >
          {t('Withdraw')}
        </Button>
      </Modal.Footer>
    </div>
  );
};

function useWithdrawCurrencies() {
  const assets = useRealAssetsWithLocaleAmount();
  const { data: supports } = useSWR(
    ['crypto-withdraw-list'],
    async () => {
      const details = await request.get<CryptoCurrencyDetail[]>(`/api/account/token/v2/listByChangeType`, {
        changeType: 'WITHDRAW_CHANGE_TYPE',
      });
      return keyBy(
        details
          .map((item) => ({
            ...item,
            networks: Object.entries(item.networks).map(([_, info]) => info),
          }))
          .filter((item) => item.networks.length > 0),
        'symbol'
      );
    },
    { suspense: true }
  );
  return useMemo(() => {
    return assets
      .filter((asset) => supports[asset.currency])
      .map((asset) => ({ ...asset, detail: supports[asset.currency] }))
      .sort((curr, next) => {
        return next.localeAmount - curr.localeAmount || curr.currency.localeCompare(next.currency);
      });
  }, [assets, supports]);
}

type WithdrawCurrencyInfo = ReturnType<typeof useWithdrawCurrencies>[number];

function Withdraw() {
  const { t } = useTranslation();
  const { name: walletCurrency } = useCurrency();
  const cryptoAssets = useWithdrawCurrencies();
  const [formFields, setFormFields] = useState(() => {
    const isFiat = walletCurrency.endsWith('FIAT');
    return {
      ...initialFields,
      currency: isFiat ? cryptoAssets[0].currency : walletCurrency,
      network: {
        value: isFiat
          ? cryptoAssets[0].detail.networks[0].chain
          : cryptoAssets.find((item) => item.currency === walletCurrency)!.detail.networks[0].chain,
        error: '',
      },
    };
  });

  useEffect(() => {
    setFormFields((prev) => {
      if (cryptoAssets.some((item) => item.currency === prev.currency)) {
        return prev;
      } else {
        return {
          ...prev,
          currency: cryptoAssets[0].currency,
          network: { value: cryptoAssets[0].detail.networks[0].chain, error: '' },
        };
      }
    });
  }, [cryptoAssets]);

  const selectedAsset = useMemo(
    () => cryptoAssets.find((asset) => asset.currency === formFields.currency)!,
    [cryptoAssets, formFields.currency]
  );
  const netWorkInfo = useMemo(
    () => selectedAsset.detail.networks.find(({ chain }) => chain === formFields.network.value)!,
    [formFields.network.value, selectedAsset]
  );

  function validate() {
    const errors: [FieldKey, string][] = [];

    const amount = Number(formFields.amount.value);
    if (amount <= 0) {
      errors.push(['amount', t('Amount is required')]);
    } else if (amount > selectedAsset.amount) {
      errors.push(['amount', t('Balance is not enough')]);
    }

    if (!formFields.address.value) {
      errors.push(['address', t('Address is required')]);
    }

    if (netWorkInfo.isSupportMemo && !formFields.memo.value) {
      errors.push(['memo', t('Memo is required')]);
    }

    if (errors.length) {
      setFormFields((prev) => {
        const fields = { ...prev };
        errors.forEach(([key, error]) => {
          fields[key] = { ...fields[key], error };
        });
        return fields;
      });

      return false;
    } else {
      return true;
    }
  }

  type FieldKey = Exclude<keyof typeof formFields, 'currency'>;
  function updateFormField(field: FieldKey, value: string, error = '') {
    return setFormFields((prev) => ({ ...prev, [field]: { value, error: error } }));
  }
  const {
    isValidating,
    data: { gasFee, withdrawFee, actualAmount },
  } = useWithdrawFee(formFields.amount.value, netWorkInfo.chain, formFields.currency);

  const transactionsDescriptions: DescriptionItem[] = useMemo(() => {
    return [
      {
        label: t('Gas fee'),
        value: gasFee,
        type: 'amount',
        ceil: true,
        currency: formFields.currency,
      },
      {
        label: t('Withdrawal fee'),
        type: 'amount',
        value: withdrawFee,
        currency: formFields.currency,
      },
      {
        label: t('Arrival amount'),
        value: Math.max(actualAmount, 0),
        type: 'amount',
        currency: formFields.currency,
        ceil: true,
      },
    ];
  }, [formFields, gasFee, withdrawFee, actualAmount, t]);

  return (
    <form
      className="space-y-4 s768:px-50"
      onSubmit={async (event) => {
        event.preventDefault();
        if (formFields.address.error || !validate()) return;

        Modal.open({
          title: t('Verification'),
          children: <VerificationModal onSuccess={onSuccess} />,
          size: 'md',
        });

        enum WithdrawStatus {
          Pass = 0,
          Wait = -2,
        }

        async function onSuccess(emailCode: string, mfaCode: string) {
          const { status } = await request.post<{ status: WithdrawStatus }>('/api/account/payment/v2/withdraw', {
            address: formFields.address.value,
            amount: formFields.amount.value,
            chain: formFields.network.value,
            mfaCode,
            emailCode,
            memo: formFields.memo.value,
            currency: formFields.currency,
          });

          if (status === WithdrawStatus.Wait) {
            message.success(t('Withdraw Processing'));
          } else {
            message.success(t('Withdraw Success'));
          }
          mutate((key: string[]) => key && key[0] === 'wallet-assets-list');
          Modal.close();
        }
      }}
    >
      <div className="space-y-4">
        <FormItem
          className="text-14 s768:text-16"
          label={<span className="font-600 s768:text-14">{t('Currency')}</span>}
        >
          <CurrencySelector
            value={formFields.currency}
            currencies={cryptoAssets}
            onChange={(value) => {
              setFormFields({
                ...initialFields,
                currency: value,
                network: {
                  value: cryptoAssets.find((asset) => asset.currency === value)!.detail.networks[0].chain,
                  error: '',
                },
              });
            }}
            searchable
          />
        </FormItem>
        <FormItem
          label={<span className="font-600 s768:text-14">{t('Network')}</span>}
          error={formFields.network.error}
          className="text-14 s768:text-16"
        >
          <NetworkSelector
            currency={selectedAsset}
            value={formFields.network.value}
            onChange={(value) => updateFormField('network', value)}
          />
        </FormItem>
        <FormItem
          label={<span className="font-600 s768:text-14">{t('Amount to withdraw')}</span>}
          error={formFields.amount.error}
        >
          <AmountInput
            size="lg"
            required
            value={formFields.amount.value}
            onChange={(value) => updateFormField('amount', value)}
            placeholder="0.00"
            logo={getCoinUrl(formFields.currency)}
            onMax={() => {
              updateFormField(
                'amount',
                cryptoAssets.find((asset) => asset.currency === formFields.currency)!.amount.toString()
              );
            }}
            className="text-14 s768:text-16 font-500"
          />
        </FormItem>
        <FormItem
          label={<span className="font-600 s768:text-14">{t('Withdraw to')}</span>}
          error={formFields.address.error}
        >
          <AddressInput
            chain={netWorkInfo.chain}
            value={formFields.address.value}
            onChange={(value, error) => {
              updateFormField('address', value, error);
            }}
            className="text-14 s768:text-16 font-500"
          />
        </FormItem>
      </div>
      <Accordion.Collapse defaultOpen={netWorkInfo.isSupportMemo}>
        <FormItem
          className="text-12 text-secondary"
          label={<span className="font-600 text-14">{t('Memo')} </span>}
          error={formFields.memo.error}
        >
          <Input
            className="mb-1 text-14 s768:text-16 font-500"
            size="lg"
            value={formFields.memo.value}
            onChange={(value) => updateFormField('memo', value)}
            inputMode="numeric"
            required
            placeholder={t('Memo')}
          />
          <div>{t('* Both a memo/tag and an address are required')}</div>
          <div>
            {t(
              '* Please confirm if the receiving address requires a MEMO/ Tag. If it is not filled or filled incorrectly, the asset will be lost'
            )}
          </div>
        </FormItem>
      </Accordion.Collapse>
      <TransactionDetails
        title={t('Transaction details')}
        descriptions={transactionsDescriptions}
        isValidating={isValidating}
      />

      <WithdrawButton className="flex w-full min-w-50 s768:w-min mx-auto !mt-8" size="lg" type="submit">
        {t('Withdraw')}
      </WithdrawButton>
    </form>
  );
}

export default Withdraw;

const initialFields = {
  amount: { value: '', error: '' },
  address: { value: '', error: '' },
  memo: { value: '', error: '' },
  network: { value: '', error: '' },
  currency: '',
};

function useWithdrawFee(amount: string, chain: string, currency: string) {
  const fallbackData = useMemo(() => ({ gasFee: 0, withdrawFee: 0, actualAmount: 0 }), []);
  const swr = useSWR(
    ['crypto-withdraw-fee', chain, currency],
    async () => {
      if (!Number(amount)) return fallbackData;
      const data = await request.post<typeof fallbackData>('/api/account/payment/v2/getFee', {
        chain,
        currency,
        withdrawAmount: amount,
      });
      data.actualAmount = Number(amount) - data.gasFee - data.withdrawFee;
      return data;
    },
    {
      revalidateOnMount: false,
      revalidateOnFocus: true,
      fallbackData: fallbackData,
      refreshInterval: 10 * 1000,
    }
  );

  useEffect(() => {
    const timer = setTimeout(swr.mutate, 300);
    return () => clearTimeout(timer);
  }, [amount, swr.mutate]);

  return swr;
}

function NetworkSelector(props: { value: string; onChange: (value: string) => void; currency: WithdrawCurrencyInfo }) {
  const { currency, value, onChange } = props;
  const { t } = useTranslation();
  const options = useMemo(
    () =>
      currency.detail.networks.map((network) => ({
        value: network.chain,
        label: (inValue?: boolean) => (
          <div className="flex items-center gap-1.5 leading-none">
            <Image className="rounded-full size-6" src={network.logoUrl} />
            <div className="space-y-1 text-14">
              <div>{`${network.chainFullName}(${network.chain})`}</div>
              {!inValue && network.minimumWithdrawAmount ? (
                <div className="text-11 s768:text-12 text-secondary font-400">
                  {network.minimumWithdrawAmount > 0 &&
                    t('Minimum withdraw: {{amount}} {{currency}}', {
                      amount: currency.detail.minWithdrawAmount, // 这里提现是在我们平台，所以不依据第三方cc的返回
                      currency: currency.detail.symbol,
                    })}
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        ),
        filter(filter: string) {
          return network.chain.toUpperCase().indexOf(filter.toUpperCase()) > -1;
        },
      })),
    [currency, t]
  );
  return <Select size="lg" value={value} options={options} onChange={onChange} className="font-500" searchable />;
}
