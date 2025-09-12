import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useNavigate from '@hooks/useNavigate';
import { Button, Image, Popover, Progress, StarRating, SvgIcon } from '@components';
import { cn, formatter } from '@utils';
import Vip1 from '@/assets/vip/vip_1.png';
import Vip2 from '@/assets/vip/vip_2.png';
import Vip3 from '@/assets/vip/vip_3.png';
import Vip4 from '@/assets/vip/vip_4.png';
import Vip5 from '@/assets/vip/vip_5.png';
import Vip6 from '@/assets/vip/vip_6.png';
import Vip7 from '@/assets/vip/vip_7.png';
import { useLevelColor } from '../hooks';
import { VIPInfo } from '../types';

interface VipCardProps {
  vipInfo: VIPInfo;
  levelName?: string;
  levelNames: string[];
}

function VipCard(props: VipCardProps) {
  const { t } = useTranslation();
  const { vipInfo } = props;
  const { levelLinearColor } = useLevelColor(vipInfo.level || 0);
  const navigate = useNavigate();

  const vipLevelIcon = useMemo(() => {
    return [Vip1, Vip2, Vip3, Vip4, Vip5, Vip6, Vip7][vipInfo.level - 1];
  }, [vipInfo.level]);

  const handleLevelClick = useCallback(() => {
    navigate('/trade-center');
  }, [navigate]);

  return (
    <div className={cn('rounded-3 h-40 flex items-center px-4 s1024:px-8 gap-8 bg-gradient-to-br', levelLinearColor)}>
      <Image className="w-16 h-auto" src={vipLevelIcon} />
      <div className="flex flex-col gap-2.5 flex-1">
        <div className="flex items-center gap-3 h-6">
          <span className="text-primary text-16 font-600 uppercase">{props.levelName}</span>
          <div className="flex gap-1">
            <StarRating value={vipInfo.level} max={vipInfo.levelCount} />
          </div>
        </div>
        <div>
          <span className="text-primary text-12">Valid until {formatter.time(vipInfo.expirationTime, 'date')}</span>
          <Progress
            className="w-full h-1.5 mt-1.5 bg-white/10 light:bg-black/10"
            progressCn="bg-warn"
            value={vipInfo.numerator}
            max={vipInfo.denominator}
            showTag={vipInfo.level !== 1 && vipInfo.level !== 7}
            tagValue={vipInfo.previousDenominator}
            customTag={
              <Popover
                content={
                  <span className="text-9 text-secondary">Level Secured {props.vipInfo.previousDenominator}</span>
                }
                side="bottom"
                trigger="hover"
              >
                <div className="rounded-full size-3 bg-white hover:shadow-[0_4px_8px_rgba(0,0,0,0.27)]" />
              </Popover>
            }
          />
          <div className="text-secondary flex justify-between mt-0.5">
            <span className="text-9">0</span>
            <span className="text-9">
              {props.levelNames[props.vipInfo.nextLevel - 1]} {props.vipInfo.denominator}
            </span>
          </div>
        </div>
        <Button
          theme="transparent"
          className="flex p-1.5 justify-between bg-white/5 light:bg-black/5"
          onClick={handleLevelClick}
        >
          <div className="text-12">
            <span className="text-primary">{props.vipInfo.numerator}</span>
            <span className="text-secondary">/{props.vipInfo.denominator}</span>
          </div>
          <div className="flex gap-1 items-center">
            <span className="text-primary text-12">{t('Trade for prestige')}</span>
            <SvgIcon name="arrow" className="size-3.5 text-secondary" />
          </div>
        </Button>
      </div>
    </div>
  );
}

export default memo(VipCard);
