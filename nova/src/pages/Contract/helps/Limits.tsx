import { useCallback, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useTradingPairs } from '@store/contract';
import { Accordion, AmountInput, Button, FormItem, Image, Modal, SvgIcon, Table, type Column } from '@components';

export default function Limits() {
  const { data: tradingPairs } = useTradingPairs();
  const { t } = useTranslation();
  const limitAmount = '$1,000,000';

  const openIncrease = useCallback(
    (row?: SymbolInfo) => {
      Modal.open({
        title: row ? (
          <div className="flex items-center">
            <Image src={row.assetBaseImage} className="mr-2 size-7 rounded-full" />
            {t('Increase Limit')}
          </div>
        ) : (
          t('Increase aggregate limit')
        ),
        children: <Increase chosenParis={row} limitAmount={limitAmount} onClose={() => Modal.close()} />,
        size: 'sm',
        scrollable: false,
      });
    },
    [t]
  );

  const columns = useMemo<Column<SymbolInfo>[]>(() => {
    return [
      {
        title: t('Crypto'),
        dataIndex: 'crypto',
        width: 120,
        render: (cell) => {
          const [name] = cell.s?.split('-') || [];

          return (
            <div className="flex items-center text-13">
              <Image src={cell.assetBaseImage} className="mr-2 rounded-full size-6" />
              <div>{name}</div>
            </div>
          );
        },
      },
      {
        title: t('PnL fee limit'),
        dataIndex: 'pnl fee',
        width: 120,
        align: 'right',
        render() {
          return limitAmount;
        },
      },
      {
        title: t('Fixed fee limit'),
        dataIndex: 'fixed fee',
        width: 120,
        align: 'right',
        render() {
          return limitAmount;
        },
      },
      {
        title: t('Increase limit'),
        dataIndex: 'action',
        width: 120,
        align: 'right',
        render: (cell) => {
          return (
            <Button
              className="size-8"
              size="free"
              onClick={() => openIncrease(cell)}
              icon={<SvgIcon className="size-4 text-current" name="plus" />}
            />
          );
        },
      },
    ];
  }, [t, openIncrease]);

  return (
    <div>
      <div className="mb-6 text-secondary text-12">
        <Trans
          i18nKey="The aggregate limit for your long/short positions across all cryptocurrencies is capped at <0>{{limitAmount}}</0>"
          values={{ limitAmount }}
        >
          <strong className="text-primary" />
        </Trans>
      </div>
      <Button className="w-full mb-6" size="lg" onClick={() => openIncrease()}>
        {t('Increase aggregate limit')}
      </Button>
      <div className="mb-6 text-secondary text-12">
        {t('This is in conjunction with the specific limits per cryptocurrency, which are detailed below.')}
      </div>
      <Table<SymbolInfo> columns={columns} dataSource={tradingPairs} rowKey="symbol" className="no-scrollbar" />
    </div>
  );
}

interface IncreaseProps {
  chosenParis?: SymbolInfo;
  limitAmount: string;
  onClose: () => void;
}

function Increase(props: IncreaseProps) {
  const { chosenParis, limitAmount, onClose } = props;
  const { t } = useTranslation();

  const [shouldValidate, setShouldValidate] = useState(false);
  const [limit, setLimit] = useState('');
  const [submitSuccessFul, setSubmitSuccessFul] = useState(false);

  const submit = useCallback(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, Math.min(1000 * (Math.random() + 0.2), 600));
    });

    setSubmitSuccessFul(true);
  }, []);
  const LimitErrorTips = {
    empty: t('This field is required'),
    tooLess: t('Must be at least {{less}}', { less: '1,000,001' }),
    tooLarge: t('Must be at most {{large}}', { large: '5,000,000' }),
  };

  const validate = useCallback(() => {
    const value = Number(limit) || 0;

    if (limit === '') return LimitErrorTips.empty;
    if (value < 1000001) return LimitErrorTips.tooLess;
    if (value > 5000000) return LimitErrorTips.tooLarge;
  }, [LimitErrorTips.empty, LimitErrorTips.tooLarge, LimitErrorTips.tooLess, limit]);

  const errorMsg = useMemo(() => {
    if (!shouldValidate) return '';

    return validate();
  }, [validate, shouldValidate]);

  return (
    <div>
      <div className="mb-4 text-12">
        {chosenParis
          ? t('Your current limits are: PnL Fee - {{pnl}}, Fixed Fee - {{Fixed}}', {
              pnl: limitAmount,
              Fixed: limitAmount,
            })
          : t('Your current limit is {{limit}}', { limit: limitAmount })}
      </div>

      <FormItem className="mb-4" label={t('Limits')} required error={errorMsg}>
        <AmountInput
          value={limit}
          onChange={(value) => {
            setShouldValidate(true);
            setLimit(value);
          }}
        />
      </FormItem>

      <div className="mb-4 text-12">{t('What would you like your new limit to be? (max 500% of current limit)')}</div>

      <Accordion.Collapse defaultOpen={submitSuccessFul}>
        <div className="pb-4 text-12 text-up">
          {t('Thank you for your request, it should generally be reviewed within 24 hours')}
        </div>
      </Accordion.Collapse>

      <div className="gap-5 flex-center">
        {!submitSuccessFul && (
          <Button className="flex-1" onClick={onClose} theme="secondary" size="lg">
            {t('Cancel')}
          </Button>
        )}
        <Button
          className="flex-1"
          size="lg"
          onClick={() => {
            if (submitSuccessFul) {
              Modal.close();
              return;
            }

            setShouldValidate(true);

            if (!validate()) {
              return submit();
            }
          }}
        >
          {submitSuccessFul ? t('Got it') : t('Submit request')}
        </Button>
      </div>
    </div>
  );
}
