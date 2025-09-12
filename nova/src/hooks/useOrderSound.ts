import { useMuted } from '@store/system';
import { useUserInfo } from '@store/user';
import { useOnMessage } from '@store/ws';
import { Sound, SoundType } from '@utils/sound';

export function useOrderSound() {
  const muted = useMuted();
  const { data: user } = useUserInfo();

  // 使用 useOnMessage 订阅消息
  useOnMessage((message) => {
    if (muted) return;

    const { resp, cmd } = message;
    if (user.id !== resp.userId) return;
    if (cmd.endsWith('Order/create')) {
      Sound.play(SoundType.CLICK);
    } else if (cmd.endsWith('Order/end')) {
      Sound.play(resp.profit > 0 ? SoundType.SUCCESS : SoundType.FAIL);
    }
  });
}
