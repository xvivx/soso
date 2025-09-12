import { memo } from 'react';
import { useChatVisible } from '@store/chat';
import useMemoCallback from '@hooks/useMemoCallback';
import useNavigate from '@hooks/useNavigate';
import { useMediaQuery } from '@hooks/useResponsive';
import { Button, SvgIcon } from '@components';

function ChatTrigger() {
  const [visible, changeVisible] = useChatVisible();
  const navigate = useNavigate();
  const { mobile } = useMediaQuery();
  const handleClick = useMemoCallback(() => {
    if (mobile) {
      navigate('#/chat');
    } else {
      changeVisible(!visible);
    }
  });

  return (
    <Button
      className="size-9"
      theme="secondary"
      icon={<SvgIcon className="size-5" name="chat" />}
      onClick={handleClick}
    />
  );
}

export default memo(ChatTrigger);
