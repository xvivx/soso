import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { type SpinePlayer } from '@esotericsoftware/spine-player';
import { cn, Systems } from '@utils';

export interface ConfettiAnimation {
  play: () => void;
}

const Confetti = forwardRef<ConfettiAnimation, { className?: string }>(function Confetti(props, ref) {
  const { className } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [player, setPlayer] = useState<SpinePlayer>();
  useEffect(() => {
    import('@esotericsoftware/spine-player').then(({ SpinePlayer }) => {
      const container = containerRef.current!;
      container.innerHTML = '';
      const player = new SpinePlayer(container, {
        skeleton: Systems.PublicPath + 'spine/confetti/skeleton.skel?v=1',
        atlasUrl: Systems.PublicPath + 'spine/confetti/skeleton.atlas',
        preserveDrawingBuffer: true,
        alpha: true,
        showControls: false,
        premultipliedAlpha: false,
        success() {
          setReady(true);
          player.speed = 3;
          container.style.display = 'none';
          player.animationState!.addListener({
            complete: () => {
              player.pause();
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

      setPlayer(player);
    });
  }, []);

  useEffect(() => {
    return () => player && player.dispose();
  }, [player]);

  useImperativeHandle(ref, () => {
    return {
      play() {
        if (!ready || !player || !player.paused) return;
        player.animationState!.clearTracks();
        containerRef.current!.style.display = 'block';
        player.setAnimation('animation', false);
        player.play();
      },
    };
  });

  return (
    <div
      className={cn('relative pointer-events-none', className)}
      ref={containerRef}
      style={{ width: 1600, height: 578 }}
    />
  );
});

export default Confetti;
