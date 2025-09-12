import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { useUserInfo } from '@store/user';
import useNavigate from '@hooks/useNavigate';
import { Button, FormItem, Image, Input, message, Modal } from '@components';
import { request } from '@utils';

function EditProfile() {
  const { avatar, nickName } = useUserInfo().data;
  const { t } = useTranslation();
  const [nick, setNick] = useState(nickName);
  const navigate = useNavigate();

  const handleNickChange = (value: string) => {
    setNick(value.trim());
  };

  const handleUpdateNickname = async () => {
    // 验证
    const regex = /[^a-zA-Z0-9]/g;
    if (regex.test(nick)) {
      message.error(t('Do not use special symbols and space bar, otherwise your account may not be supported.'));
      return;
    }

    const exceed = 16;
    if (nick.length > exceed) {
      message.error(t('Cannot exceed {{exceed}} characters', { exceed }));
      return;
    }

    // 使用统一的更新方法
    await request.post('/api/user/update', { nickName: nick });
    // 更新成功后刷新用户信息
    await mutate((key: string[]) => key && key[0] === 'user-info');
    message.success(t('Update Success'));
    Modal.close();
  };

  return (
    <div className="text-12 font-500 space-y-9">
      <div className="size-48 rounded-full relative p-1.5 mx-auto bg-layer7">
        <Image className="w-full h-full overflow-hidden rounded-full" src={avatar} />
        <Button
          onClick={() => navigate('#/profile/edit-avatar')}
          className="absolute bottom-0 -translate-x-1/2 left-1/2"
        >
          {t('Edit your avatar')}
        </Button>
      </div>

      <div>
        <FormItem className="mb-1.5" label={t('Username')}>
          <Input size="lg" value={nick} onChange={handleNickChange} placeholder={t('Enter your name')} />
        </FormItem>

        <div className="mb-4 text-12 font-500 text-secondary">
          {t('Do not use special symbols, otherwise your account may not be supported.')}
        </div>
        <Button size="lg" className="flex w-full" disabled={!nick || nick === nickName} onClick={handleUpdateNickname}>
          {t('Save')}
        </Button>
      </div>
    </div>
  );
}

export default EditProfile;
