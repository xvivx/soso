import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setTapConfig } from '@store/system';
import { useSettings } from '@store/tap';
import { Button, Checkbox, Popover, SvgIcon } from '@components';
import IconAim from '@components/SvgIcon/private/aim.svg';

function ActionTools(props: { gotoCenter: () => void }) {
  const { t } = useTranslation();
  const settings = useSettings();
  const settingOptions = useMemo(() => {
    return [
      {
        key: 'showPublicBets',
        label: t('Show live positions on chart'),
        value: settings.showPublicBets,
      },
      {
        key: 'showMultiplier',
        label: t('Show Multiplier on chart'),
        value: settings.showMultiplier,
      },
    ];
  }, [settings, t]);

  const dispatch = useDispatch();

  return (
    <div className="flex justify-end items-center px-4 s768:px-0 min-h-8 bg-layer3 gap-4">
      <Button
        className="ml-auto s768:ml-0"
        theme="transparent"
        size="free"
        icon={<IconAim className="size-5 text-secondary" />}
        onClick={props.gotoCenter}
      />
      <Popover
        content={
          <div className="w-full space-y-1.5 select-none">
            {settingOptions.map((option) => {
              return (
                <div className="flex items-center p-2 rounded cursor-pointer hover:bg-layer5" key={option.key}>
                  <Checkbox
                    checked={option.value}
                    onCheckedChange={() =>
                      dispatch(setTapConfig({ [option.key]: !settings[option.key as keyof typeof settings] }))
                    }
                  >
                    {option.label}
                  </Checkbox>
                </div>
              );
            })}
          </div>
        }
      >
        <Button theme="transparent" size="free" icon={<SvgIcon name="setting" className="size-5" />} />
      </Popover>
    </div>
  );
}

export default memo(ActionTools);
