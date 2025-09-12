import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { setTheme, useTheme } from '@store/system';
import { SvgIcon, Tabs } from '@components';
import { Card } from '@pages/components';
import I18nSelector from '@/layouts/I18nSelector';
import CurrencySelect from './CurrencySelect';
import SoundToggle from './SoundToggle';

function Settings() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  return (
    <div className="[&>.detrade-card]:s768:px-8 [&>.detrade-card]:s768:py-4 space-y-3">
      <SoundToggle />

      {/* 多语言 */}
      <Card className="text-12 s768:text-14 font-600 text-primary">
        <Card.Title>
          <span className="text-14 s768:text-16 font-700">{t('Language')}</span>
          <I18nSelector size="md" align="end" />
        </Card.Title>
        <p className="text-secondary font-500">
          {t(
            "Your language selection applies to Detrade emails, SMS, in-app notifications, and all devices you're logged into."
          )}
        </p>
      </Card>

      {/* 主题 */}
      <Card className="text-12 s768:text-14">
        <Card.Title>
          <span className="text-14 s768:text-16 font-700">{t('Theme')}</span>
          <Tabs
            selectedIndex={theme === 'darken' ? 0 : 1}
            onChange={(index) => dispatch(setTheme(index === 0 ? 'darken' : 'lighten'))}
          >
            <Tabs.Header className="flex bg-layer2">
              <Tabs.Item className="flex-1">
                <div className="gap-1 flex-center whitespace-nowrap text-12 s768:text-14 text-primary">
                  <SvgIcon name="dark" className="size-4 text-primary" />
                  <span className="text-primary font-600">{t('Dark')}</span>
                </div>
              </Tabs.Item>
              <Tabs.Item className="flex-1">
                <div className="gap-1 flex-center whitespace-nowrap text-12 s768:text-14">
                  <SvgIcon name="light" className="size-4" />
                  <span className="text-secondary font-500">{t('Light')}</span>
                </div>
              </Tabs.Item>
            </Tabs.Header>
          </Tabs>
        </Card.Title>
        {t('Switch Dark or Light mode according to your preference')}
      </Card>

      {/* 国家码本地化设置 */}
      <Card className="flex items-center justify-between">
        <div className="capitalize text-primary text-14 s768:text-16 font-700">{t('Currency')}</div>
        <CurrencySelect />
      </Card>
      {/* 图表上涨下跌颜色设置 */}
      {/* <Card className="space-y-3 s768:space-y-4">
        <div className="text-primary text-14 s768:text-16 font-700">{t('Chart colors')}</div>
        <Radio.Group value={value} onValueChange={setValue} orientation="vertical">
          {options.map((item) => (
            <Radio
              key={item.value}
              value={item.value}
              className="capitalize font-600 text-primary text-14 s768:text-16 gap-3"
            >
              <div className="flex gap-1">
                <div className={cn('w-8 rounded-DEFAULT', item.value === 'green-up' ? 'bg-brand' : 'bg-error')}></div>
                <span>{item.label}</span>
              </div>
            </Radio>
          ))}
        </Radio.Group>
      </Card> */}
      {/* 图表时区调整 */}
      {/* <Card>
        <div className="flex items-center justify-between">
          <div className="text-primary text-14 s768:text-16 font-700 flex-wrap w-[152px]">
            24h change & chart timezone
          </div>
          <div>utf-8</div>
        </div>
      </Card> */}
    </div>
  );
}

export default Settings;
