import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setMute, useMuted } from '@store/system';
import { Switch } from '@components';
import { Sound, SoundType } from '@utils/sound';
import { Card } from '@pages/components';

export default function SoundToggle() {
  const { t } = useTranslation();
  const muted = useMuted();
  const dispatch = useDispatch();

  useEffect(() => {
    return () => Sound.destroy();
  }, []);
  return (
    <Card className="flex items-center justify-between">
      <div className="text-primary text-14 s768:text-16 font-700">{t('Sound')}</div>
      <Switch
        checked={!muted}
        onCheckedChange={(checked) => {
          dispatch(setMute(!checked));
          if (checked) {
            Sound.getInstance();
            Sound.play(SoundType.CLICK);
          } else {
            Sound.destroy();
          }
        }}
      />
    </Card>
  );
}
