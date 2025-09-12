import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Select, SvgIcon } from '@components';
import Pagination from '@components/Pagination';
import { Direction } from '@/type';
import { Filters, Records } from './ClosedBets';

function BetHistoryContent() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<Filters>({ page: 1, pageSize: 20 });
  const [total, setTotal] = useState(0);
  const options = useMemo(() => {
    return [
      {
        label: t('up'),
        value: Direction.BuyRise,
      },
      {
        label: t('down'),
        value: Direction.BuyFall,
      },
    ];
  }, [t]);

  return (
    <>
      <Select
        className="mb-2 min-w-30 s768:w-min"
        options={options}
        value={filters.direction}
        onChange={(value) => setFilters((prev) => ({ ...prev, page: 1, direction: value }))}
        placeholder={t('Direction')}
        compact
      />
      <Records className="detrade-modal-table" filters={filters} onTotalChange={setTotal} />
      {total > filters.pageSize && (
        <Pagination
          className="detrade-modal-footer"
          current={filters.page}
          pageSize={filters.pageSize}
          total={total}
          onChange={(current) => setFilters((prev) => ({ ...prev, page: current }))}
        />
      )}
    </>
  );
}

export default function BetHistory() {
  const { t } = useTranslation();

  return (
    <SvgIcon
      name="history"
      className="size-5 s768:size-6"
      onClick={() => {
        Modal.open({
          size: 'lg',
          title: t('Trade history'),
          children: <BetHistoryContent />,
        });
      }}
    />
  );
}
