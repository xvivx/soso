import { memo, useMemo } from 'react';
import { useTheme } from '@store/system';
import { Image } from '@components';
import { cn } from '@utils';
/**================== darken ==================== */
import badge_vip_dark_1 from '@/assets/vip/badge_vip_dark_1.png';
import badge_vip_dark_2 from '@/assets/vip/badge_vip_dark_2.png';
import badge_vip_dark_3 from '@/assets/vip/badge_vip_dark_3.png';
import badge_vip_dark_4 from '@/assets/vip/badge_vip_dark_4.png';
import badge_vip_dark_5 from '@/assets/vip/badge_vip_dark_5.png';
import badge_vip_dark_6 from '@/assets/vip/badge_vip_dark_6.png';
import badge_vip_dark_7 from '@/assets/vip/badge_vip_dark_7.png';
/**================== darken ==================== */

/**================== lighten ==================== */
import badge_vip_light_1 from '@/assets/vip/badge_vip_light_1.png';
import badge_vip_light_2 from '@/assets/vip/badge_vip_light_2.png';
import badge_vip_light_3 from '@/assets/vip/badge_vip_light_3.png';
import badge_vip_light_4 from '@/assets/vip/badge_vip_light_4.png';
import badge_vip_light_5 from '@/assets/vip/badge_vip_light_5.png';
import badge_vip_light_6 from '@/assets/vip/badge_vip_light_6.png';
import badge_vip_light_7 from '@/assets/vip/badge_vip_light_7.png';

/**================== lighten ==================== */

interface LevelBadgeProps {
  level: number;
  className?: string;
}

function LevelBadge(props: LevelBadgeProps) {
  const { level } = props;
  const theme = useTheme();
  const memoBadgeSrc = useMemo(() => {
    const badgeVips =
      theme === 'lighten'
        ? [
            badge_vip_light_1,
            badge_vip_light_2,
            badge_vip_light_3,
            badge_vip_light_4,
            badge_vip_light_5,
            badge_vip_light_6,
            badge_vip_light_7,
          ]
        : [
            badge_vip_dark_1,
            badge_vip_dark_2,
            badge_vip_dark_3,
            badge_vip_dark_4,
            badge_vip_dark_5,
            badge_vip_dark_6,
            badge_vip_dark_7,
          ];
    return badgeVips[level - 1];
  }, [level, theme]);

  return memoBadgeSrc ? <Image className={cn('h-3.5 w-10', props.className)} src={memoBadgeSrc} /> : null;
}

export default memo(LevelBadge);
