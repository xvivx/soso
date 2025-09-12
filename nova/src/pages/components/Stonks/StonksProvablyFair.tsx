import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Column, Image, Table } from '@components';
import { cn } from '@utils';
import { request } from '@utils/axios';
import Stonks from './stonks.png';

function StonksProvablyFair() {
  const [tableData, setTableData] = useState<Ticks[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const columns = useMemo<Column<Ticks>[]>(() => {
    return [
      {
        title: t('date') + '/' + t('time'),
        dataIndex: 'timestamp',
        width: 140,
        type: 'time',
      },
      {
        title: t('ticks'),
        dataIndex: 'ticks',
        width: 60,
      },
      {
        title: t('seed'),
        dataIndex: 'seed',
        width: 520,
        align: 'left',
      },
    ];
  }, [t]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await request.get<Ticks[]>(`/api/coin/detrade/stonks/seed/history`);
        setTableData(res);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    })();
  }, []);

  const code = `import pyblake2
import statistics

price = 1000.0
seed = 27b09e4584511c4939dd3ab054a8424d3ada1b367ed99f42f023627e14820688
volatility = 0.001

print(f'Price at time 0: {price}')
for tick in range(4):
    combined_value = bytes(seed + str(tick), encoding='ascii')
    hash = pyblake2.blake2b(combined_value, digest_size=32).digest()
    unsigned_int = int.from_bytes(hash[:8], byteorder='little', signed=False)
    unit_range_float = float(unsigned_int) / float(2**64 - 1)
    normal_return = statistics.NormalDist(mu=0.0, sigma=volatility).inv_cdf(unit_range_float)
    price = price * (1.0 + normal_return)
    print(f'Price at time {tick + 1}: {round(price, 2)}')`;

  return (
    <div>
      <div className="gap-10 mb-12 s768:flex">
        <Image src={Stonks} className="size-34" />
        <div className="flex-1">
          <div className="mb-4 text-14 font-600">{t('What does it mean?')}</div>
          <Content>
            {t(
              `All prices for the 24-hour trading round are predetermined using a randomly drawn seed, which is revealed at the end of each trading round. With this published seed, anyone can verify that we adhered to the algorithm detailed below and did not alter any prices after the round started. Notably, it is impossible for us to change prices based on your trading.`
            )}
          </Content>
        </div>
      </div>
      <Title>{t('Stonks')}</Title>
      <Table<Ticks> rowKey="seed" columns={columns} dataSource={tableData} loading={loading} />
      <Title>{t('Algorithm')}</Title>
      <Content>
        <p className="mb-4">
          {t(
            `At the start of each trading round (00:00 UTC), a new 32-byte seed is randomly chosen. The entire round's prices can be reproduced by combining this seed with an incrementing integer tick counter.`
          )}
        </p>
        <p className="mb-4">
          {t(
            `The seed is encoded into a 64-character lowercase hexadecimal string and concatenated with the string representation of the current tick counter value. A hash of the combined string is then calculated using the BLAKE2b hash function with a 256-bit digest size. By using a cryptographic hash function, we ensure that price changes are random and unpredictable before the seed is revealed, but fully reproducible once the seed is known.`
          )}
        </p>
        <p className="mb-4">
          {t(
            `The first 8 bytes of the hash are converted to an unsigned 64-bit integer using little-endian encoding. This integer is then converted to a uniformly distributed floating point number. Using the inverse cumulative distribution function with the market's configured tick volatility (0.1%) as its standard deviation, we convert the floating point value to a normally distributed return and use it to update the market's price.`
          )}
        </p>
      </Content>
      <Title>{t('Verification Example')}</Title>
      <Content className="mb-4">
        {t(
          `Once the seed is revealed, anyone can verify the prices from a trading round. The following Python code calculates the first 100 prices of a round given its seed:`
        )}
      </Content>
      <pre className="p-3 mb-4 overflow-x-auto rounded-2 text-12 bg-layer1 text-secondary">{code}</pre>
    </div>
  );
}

export default StonksProvablyFair;

function Title({ children }: { children: ReactNode }) {
  return <div className="font-800 my-4 h-8 pl-3 pr-1.5 py-1.5 bg-layer3 rounded-2">{children}</div>;
}

function Content({ children, className }: BaseProps) {
  return <div className={cn('leading-6 text-secondary', className)}>{children}</div>;
}

type Ticks = {
  timestamp: number;
  ticks: number;
  seed: string;
};
