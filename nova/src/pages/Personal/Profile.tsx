import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash-es';
import { useUserInfo } from '@store/user';
import { Input, message, SvgIcon, Switch, Tooltip, VerifyCodeButton } from '@components';
import { request } from '@utils/axios';
import { Card } from '@pages/components';
import { VerifyEmailType } from '@/type';
// import KYC from '../KYC';
import MyProfile from './MyProfile';

function Profile() {
  const { t } = useTranslation();
  const { data: userInfo, mutate } = useUserInfo();
  const [email, setEmail] = useState(userInfo.email || '');
  const { privateHide } = userInfo;
  const [switchValue, setSwitchValue] = useState(privateHide);

  // 这里用useMemo去替代useCallback, 解决useCallback包裹debounce警告expects an inline function.
  const updatePrivateHide = useMemo(
    () =>
      debounce(async (newValue) => {
        if (newValue !== privateHide) {
          await request.post('/api/user/privateHide/update', { privateHide: newValue });
          mutate();

          if (newValue) {
            message.success(t('Your profile is now private'));
          } else {
            message.success(t('Your profile is now public'));
          }
        }
      }, 500),
    [mutate, t, privateHide]
  );

  return (
    <div className="[&>.detrade-card]:s768:px-8 [&>.detrade-card]:s768:py-4 space-y-3">
      {/* 个人信息 */}
      <div className="font-600 text-14 text-secondary">{t('Personal info')}</div>
      <MyProfile />
      {/* 隐私账户 */}
      <Card>
        <Card.Title className="mb-2 s768:mb-4">
          <div className="flex items-center gap-2 s768:gap-2.5">
            <span className="text-14 s768:text-16 font-700">{t('Private profile')}</span>
            <Tooltip
              side="right"
              content={t(
                'After setting your personal information private, other users will not be able to see your username and information.'
              )}
            >
              <SvgIcon name="attention" />
            </Tooltip>
          </div>
          <Switch
            checked={switchValue}
            onCheckedChange={(value) => {
              setSwitchValue(value);
              updatePrivateHide(value);
            }}
          />
        </Card.Title>
        <p className="text-12 s768:text-14">
          {t(
            'After setting your personal information private, other users will not be able to see your username and information.'
          )}
        </p>
      </Card>
      {/* 验证-[暂时隐藏] */}
      {/* <KYC /> */}
      {/* 用户详情 */}
      <div className="font-600 text-14 text-secondary">{t('Account details')}</div>
      <Card>
        <div className="flex items-center flex-wrap gap-2 s768:gap-0">
          <div className="text-14 s768:text-16 text-primary font-700 w-full s768:w-48">{t('Email')}</div>
          {userInfo.email ? (
            <div className="text-14 s768:text-16 font-600 w-full s768:w-64 truncate normal-case">{email}</div>
          ) : (
            <Input
              className="bg-layer2 w-full s768:w-64"
              size="lg"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="off"
              disabled={!!userInfo.email}
              placeholder={t('Enter your email')}
            />
          )}
          <VerifyCodeButton
            className="w-[92px] s768:w-28 ml-auto shrink-0 bg-layer7"
            theme="secondary"
            businessType={VerifyEmailType.emailVerify}
            to={email}
            disabled={!!email}
          >
            {email ? t('Verified') : t('Bind')}
          </VerifyCodeButton>
        </div>
      </Card>
    </div>
  );
}

export default Profile;
