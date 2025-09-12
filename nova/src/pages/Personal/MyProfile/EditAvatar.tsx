import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { Button, message, Modal, UploadImage } from '@components';
import { request } from '@utils/axios';

function EditAvatar() {
  const [avatar, setAvatar] = useState<File>();
  const { t } = useTranslation();

  return (
    <div>
      <UploadImage className="w-48" onChange={setAvatar} />
      <Button
        className="flex w-full mx-auto mt-9"
        size="lg"
        disabled={!avatar}
        onClick={async () => {
          const data = new FormData();
          data.append('file', avatar!);
          const headImage = await request.post<string>('/api/user/avatar/upload', data, {
            headers: {
              'Content-Type': 'multipart/form-data;charset=UTF-8',
            },
          });
          await request.post('/api/user/update', { avatar: headImage });
          await mutate((key: string[]) => key && key[0] === 'user-info');
          message.success(t('Update Success'));
          Modal.close();
        }}
      >
        {t('Submit')}
      </Button>
    </div>
  );
}

export default EditAvatar;
