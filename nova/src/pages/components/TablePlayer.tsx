/**
 * table内玩家信息
 */
import { memo, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import bridge from '@store/bridge';
import { Loading, Modal, SvgIcon, Tooltip } from '@components';
import Image from '@components/image';
import { cn } from '@utils';
import PersonalStatistics from './PersonalStatistics';

type PlayerProps = {
  avatar: string;
  nickName: string;
  userId: string;
  privateHide: boolean;
  platformName: string;
  className?: string;
};

const Player = memo(({ avatar, nickName, userId, privateHide, platformName, className }: PlayerProps) => {
  const { t } = useTranslation();

  if (privateHide) {
    return (
      <Tooltip side="top" align="start" disabled={bridge.get().micro} content={t('Profile is not publicly available')}>
        <div className="flex items-center gap-1.5">
          <Tooltip.Anchor>
            <SvgIcon
              name="privateUser"
              className="pointer-events-none shrink-0 size-6 s768:size-7 rounded-2 bg-layer2"
            />
          </Tooltip.Anchor>
          <div>***</div>
        </div>
      </Tooltip>
    );
  }

  return (
    <div
      className={cn('flex items-center max-w-20 s1366:max-w-50 gap-1.5', className)}
      onClick={() => {
        if (platformName !== 'default' || bridge.get().micro) return;
        Modal.open({
          title: t('Statistics'),
          children: (
            <Suspense
              fallback={
                <div className="h-72 relative">
                  <Loading />
                </div>
              }
            >
              <PersonalStatistics isSameTipsId userId={userId} platformName={platformName} />
            </Suspense>
          ),
        });
      }}
    >
      <Image src={avatar} className="shrink-0 size-6 s768:size-7 rounded-2" />
      <div className="truncate">{nickName}</div>
    </div>
  );
});

export default Player;
