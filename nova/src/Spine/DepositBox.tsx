import { useEffect, useRef, useState } from 'react';
import { type SpinePlayer } from '@esotericsoftware/spine-player';
import { SvgIcon } from '@components';
import { cn } from '@utils';

export default function DepositBox(props: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let player: SpinePlayer;
    import('@esotericsoftware/spine-player').then(({ SpinePlayer }) => {
      const container = containerRef.current!;
      container.innerHTML = '';
      player = new SpinePlayer(container, {
        skeleton: '/spine/box_dc.skel',
        atlasUrl: '/spine/box_dc.atlas',
        animation: 'animation',
        preserveDrawingBuffer: true,
        alpha: true,
        showControls: false,
        premultipliedAlpha: false,
        success() {
          player.animationState!.addListener({
            start() {
              setLoading(false);
            },
          });
        },
        viewport: {
          padBottom: 0,
          padLeft: 0,
          padRight: 0,
          padTop: 0,
          debugRender: false,
          transitionTime: 0,
        },
        showLoading: false,
        backgroundColor: '#00000000',
      });
    });
    return () => {
      player && player.dispose();
    };
  }, []);
  return (
    <div className={cn('relative size-5 pointer-events-none', props.className)}>
      {loading && <SvgIcon className="size-4 abs-center" name="loading" />}
      <div className="abs-center" style={{ width: '220%', height: '275%' }} ref={containerRef}></div>
    </div>
  );
}
