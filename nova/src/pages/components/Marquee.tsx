/**
 * 首页通知栏
 */
import { useDispatch } from 'react-redux';
import { setMarqueeClosedId } from '@store/notification';
import { useUnreadMarquee } from '@store/notification/services';
import { Accordion, Button, SvgIcon } from '@components';
import { cn } from '@utils';

function Marquee(props: { className?: string }) {
  const dispatch = useDispatch();
  const marquee = useUnreadMarquee();

  return (
    <Accordion.Collapse defaultOpen={Boolean(marquee)} className={cn('bg-layer2', props.className)}>
      <div className="bg-warn/10 text-12 s768:text-14 py-2 s768:py-3 px-4 flex items-start gap-1">
        <div className="flex-1 break-all text-warn">{marquee ? marquee.content : ''}</div>
        <Button
          size="free"
          theme="transparent"
          icon={
            <SvgIcon
              name="close"
              className="size-5"
              onClick={() => {
                dispatch(setMarqueeClosedId(marquee!.id));
              }}
            />
          }
        />
      </div>
    </Accordion.Collapse>
  );
}

export default Marquee;
