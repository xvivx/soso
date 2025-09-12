import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import copy from 'copy-to-clipboard';
import { Button, ButtonProps, message, SvgIcon } from '@components';

function CopyButton(props: { value: string | number } & Omit<ButtonProps, 'children' | 'icon'>) {
  const { value, theme = 'secondary', ...rest } = props;
  const { t } = useTranslation();

  return (
    <Button
      theme={theme}
      icon={<SvgIcon className="size-4 s768:size-6" name="copy" />}
      onClick={() => {
        copy(String(value));
        message.success(t('Copy Success'));
      }}
      {...rest}
    />
  );
}

export default memo(CopyButton);
