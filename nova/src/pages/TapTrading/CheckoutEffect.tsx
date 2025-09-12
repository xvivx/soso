import { useRef } from 'react';
import { Trans } from 'react-i18next';
import { TapOrder, updateLiveOrders, updateProgressingOrders } from '@store/tap';
import { useUserInfo } from '@store/user';
import { useOnMessage } from '@store/ws';
import { message } from '@components';
import { formatter } from '@utils';
import Confetti, { ConfettiAnimation } from '@/Spine/Confetti';
import { usePlaySound } from './hooks';

export default function CheckoutEffect() {
  const sound = usePlaySound();
  const { data: user } = useUserInfo();
  const confettiRef = useRef<ConfettiAnimation>(null);

  useOnMessage((wsData) => {
    if (wsData.cmd === '/tapOrder/end') {
      const order = wsData.resp as TapOrder;
      if (order.userId !== user.id) {
        return updateLiveOrders(order);
      }

      updateProgressingOrders(order, 'cash-out');
      if (order.profit <= 0) return;
      confettiRef.current!.play();
      sound.success();
      message.success({
        content: (
          <Trans
            i18nKey="You won <0>{{award}}</0>"
            values={{ award: formatter.amount(order.profit, order.currency).floor().toText() }}
          >
            <span className="text-up" />
          </Trans>
        ),
      });
    }
  });

  return (
    // Confetti很宽, 要锁住它, 不然外层会有滚动条
    <div className="absolute inset-0 top-0 z-30 overflow-hidden pointer-events-none" style={{ height: 578 }}>
      <Confetti ref={confettiRef} className="abs-center" />
    </div>
  );
}
