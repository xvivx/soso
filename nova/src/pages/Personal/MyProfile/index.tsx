import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserInfo } from '@store/user';
import useNavigate from '@hooks/useNavigate';
import { Button, Image, StarRating } from '@components';
import { Card } from '@pages/components';
import CopyButton from '@pages/components/CopyButton';
import LevelBadge from '@pages/Personal/Vip/components/LevelBadge';
import { useVipInfo } from '@pages/Personal/Vip/useVipInfo';

function MyProfile() {
  const { nickName, avatar, id: userId } = useUserInfo().data;
  const navigate = useNavigate();
  const { data: vipInfo } = useVipInfo();
  const { t } = useTranslation();
  const levelNames = useMemo(
    () => [
      t('Bronze'),
      t('Silver'),
      t('Gold'),
      t('Platinum'),
      `${t('Platinum')}+`,
      t('Diamond'),
      `${t('Diamond')}+ (${t('Invite only')})`,
    ],
    [t]
  );

  const levelName = useMemo(() => {
    return levelNames[vipInfo.level - 1];
  }, [levelNames, vipInfo]);

  return (
    <Fragment>
      <Card>
        <div className="flex flex-row items-center text-primary gap-3 s768:gap-6">
          <Image className="size-10 s768:size-17 rounded-5" src={avatar} />
          <div className="space-y-1 text-14 font-400">
            <div className="font-700">{nickName}</div>
            <div className="flex justify-start text-12 s768:text-14 text-secondary font-400 flex-wrap">
              <div className="mr-0.5 s768:mr-1 font-600">{t('User ID')}:</div>
              <div className="s768:w-auto w-15 truncate">{userId}</div>
              <CopyButton value={userId} theme="transparent" className="h-5 s768:h-5 w-5 s768:w-5" />
            </div>
          </div>
          <Button className="w-[92px] s768:w-28 ml-auto shrink-0" onClick={() => navigate('#/profile/edit-profile')}>
            {t('Change')}
          </Button>
        </div>
      </Card>
      <Card>
        <div className="flex items-center flex-wrap">
          <div className="text-14 s768:text-16 text-primary font-700 w-full s768:w-48">{t('VIP')}</div>
          <div className="flex items-center gap-2">
            <LevelBadge level={vipInfo.level || 0} />
            <div className="text-12 s768:text-14">{levelName}</div>
            <div className="flex">
              <StarRating value={vipInfo.level} max={vipInfo.levelCount} />
            </div>
          </div>
          <Button className="w-[92px] s768:w-28 ml-auto shrink-0" onClick={() => navigate('/dashboard/personal/vip')}>
            {t('View details')}
          </Button>
        </div>
      </Card>
    </Fragment>
  );
}
export default MyProfile;
