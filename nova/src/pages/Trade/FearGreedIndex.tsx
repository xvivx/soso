import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HtmlLabel } from '@visx/annotation';
import { Group } from '@visx/group';
import { Pie } from '@visx/shape';
import useSWR from 'swr';
import { useMediaQuery } from '@hooks/useResponsive';
import { Accordion, AnimateNumber, Image, Loading, Tooltip } from '@components';
import { request } from '@utils';
import { useGameContext } from '@pages/components/GameProvider';
import coinMarketCap from './coinMarketCap.png';

interface DataPoint {
  value: number;
  color: string;
}

const FearGreedIndex = () => {
  const { selectedSymbolPair } = useGameContext();
  const { data, isLoading } = useFearGreedIndex(selectedSymbolPair);
  const { value: percent } = data;
  const { t } = useTranslation();

  const pieData: DataPoint[] = useMemo(() => {
    return [
      { value: 20, color: '#EA3943' },
      { value: 20, color: '#EA8C01' },
      { value: 20, color: '#F3D42F' },
      { value: 20, color: '#93D900' },
      { value: 20, color: '#14C784' },
    ];
  }, []);

  const totalValue = 100;

  return (
    <div className="relative h-36 space-y-3 detrade-card">
      <Tooltip side="bottom" align="start" content={<Description />}>
        <span className="text-12 text-secondary underline decoration-dashed underline-offset-4">
          {t('Fear & Greed Index')}
        </span>
      </Tooltip>

      {isLoading && <Loading />}
      {!isLoading && (
        <>
          <svg width="100%" height="55" viewBox="0 0 300 55">
            {/* 数据圆弧 */}
            <Group top={55} left={150}>
              {pieData.map((segment, index) => {
                // 定义间隔角度（以弧度为单位）
                const gapAngle = (Math.PI / 180) * 1; // 设置默认间隔为1度

                // 计算累积值
                const previousValue = pieData.slice(0, index).reduce((sum, item) => sum + item.value, 0);

                // 计算起始和结束角度;第一个圆弧不需要前面的间隔
                const startAngle = -Math.PI / 2 + (Math.PI * previousValue) / totalValue + (index > 0 ? gapAngle : 0);
                // 最后一个圆弧不需要后面的间隔
                const endAngle =
                  -Math.PI / 2 +
                  (Math.PI * (previousValue + segment.value)) / totalValue -
                  (index < pieData.length - 1 ? gapAngle : 0);

                return (
                  <Pie
                    key={index}
                    data={[segment]}
                    pieValue={(d) => d.value}
                    outerRadius={50}
                    innerRadius={45}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    cornerRadius={5}
                    fill={segment.color}
                  />
                );
              })}
            </Group>

            {/* 指针 */}
            <Group top={68} left={150}>
              <circle
                cx={0}
                cy={-60}
                r={6}
                className="fill-current text-primary"
                transform={`rotate(${-90 + (180 * percent) / totalValue})`}
              />
            </Group>

            {/* 中心文本 */}
            <Group top={25} left={150}>
              <HtmlLabel y={20} horizontalAnchor="middle" verticalAnchor="middle">
                <div className="text-14">
                  <AnimateNumber value={percent} as="span" precision={0} />
                  <span>%</span>
                </div>
              </HtmlLabel>
            </Group>
          </svg>
          <div className="flex items-center justify-end gap-1.5">
            <div className="text-10 text-secondary">{t('Powered by')}</div>
            <Image src={coinMarketCap} className="h-3 w-18" />
          </div>
        </>
      )}
    </div>
  );
};

export default memo(FearGreedIndex);

/**
 * 获取恐惧贪婪指数
 *
 */
export function useFearGreedIndex(pair: SymbolInfo) {
  return useSWR(
    ['fear-greed-index', pair.symbol],
    async () => await request.get<{ value: number }>('/api/data/fear-greed/current'),
    {
      fallbackData: { value: 0 },
    }
  );
}

function Description() {
  const { t } = useTranslation();
  const { mobile } = useMediaQuery();

  const description1 = t(
    'The CMC Fear and Greed Index is a proprietary tool developed by CoinMarketCap that measures the prevailing sentiment in the cryptocurrency market.'
  );
  const description2 = t(
    'This index ranges from 0 to 100, where a lower value indicates extreme fear, and a higher value indicates extreme greed.'
  );
  const description3 = t(
    'It helps investors understand the emotional state of the market, which can influence buying and selling behaviors.'
  );
  const description4 = t(
    'The index provides insights into whether the market may be undervalued (extreme fear) or overvalued (extreme greed).'
  );

  if (mobile) {
    return (
      <div className="space-y-2">
        {[description1, description2, description3, description4].map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2">{description1}</p>

      <Accordion.Collapse
        content={
          <div className="space-y-2 text-primary">
            {[description2, description3, description4].map((paragraph, index) => (
              <p key={index} className="mb-2">
                {paragraph}
              </p>
            ))}
          </div>
        }
      >
        {t('more')}
      </Accordion.Collapse>
    </div>
  );
}
