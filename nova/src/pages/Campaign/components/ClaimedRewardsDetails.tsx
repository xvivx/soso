import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Column, Modal, Pagination, Table } from '@components';
import { formatter } from '@utils';
import i18n from '@/i18n';
import { RewardRecordItem, useRewardRecord } from '../hooks/useReward';

function openClaimedRewardsDetails() {
  return Modal.open({
    title: i18n.t('Claimed rewards details'),
    children: <ClaimedRewardsDetails />,
  });
}

function ClaimedRewardsDetails() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
  });
  const { data, isLoading } = useRewardRecord(filters);
  const columns = useMemo<Column<RewardRecordItem>[]>(() => {
    return [
      {
        title: t('Type'),
        align: 'left',
        dataIndex: 'type',
      },
      {
        title: t('Amount'),
        align: 'right',
        dataIndex: 'amount',
      },
      {
        title: t('Time'),
        align: 'right',
        dataIndex: 'time',
        render: ({ time }) => {
          return <span>{formatter.time(time)}</span>;
        },
      },
    ];
  }, [t]);
  return (
    <>
      <Table<RewardRecordItem> columns={columns} dataSource={data.items} rowKey="time" loading={isLoading} />
      <Pagination
        className="my-4"
        current={filters.page}
        pageSize={filters.pageSize}
        total={data.total}
        onChange={(current) => setFilters((prev) => ({ ...prev, page: current }))}
      />
    </>
  );
}

export default {
  openClaimedRewardsDetails,
};
