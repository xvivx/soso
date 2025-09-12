import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@hooks/useResponsive';
import { Column, Table } from '@components';
import { request } from '@utils/axios';

interface History {
  countryCode: string;
  createTime: string;
  loginMethod: string;
  ip: string;
}
function LoginHistory() {
  const { t } = useTranslation();
  const [dataSource, setDataSource] = useState<History[]>([]);
  const { mobile } = useMediaQuery();

  useEffect(() => {
    (async () => {
      const res = await request.get<History[]>('/api/user/auth/history/list');
      setDataSource(res);
    })();
  }, []);

  const columns: Column<History>[] = useMemo(() => {
    return [
      {
        title: t('Device'),
        dataIndex: 'device',
        width: mobile ? 270 : 180,
      },
      {
        title: t('Date'),
        dataIndex: 'createTime',
        width: 150,
        type: 'time',
      },
      {
        title: t('Login method'),
        dataIndex: 'loginMethod',
        width: 120,
        render(row) {
          return <div className="capitalize">{row.loginMethod}</div>;
        },
      },
      {
        title: t('Country'),
        dataIndex: 'countryCode',
        width: 80,
      },
      {
        title: t('Ip'),
        dataIndex: 'ip',
        width: mobile ? 270 : 180,
      },
    ];
  }, [t, mobile]);

  return <Table rowKey="createTime" columns={columns} dataSource={dataSource} />;
}

export default LoginHistory;
