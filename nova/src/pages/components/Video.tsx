import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button, Image, SvgIcon } from '@components';
import { cn } from '@utils';

export interface VideoProps {
  src: string;
  poster?: string;
  className?: string;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  onStart?: () => void;
  onEnd?: () => void;
}

export type VideoHandle = HTMLVideoElement;

const Video = forwardRef<VideoHandle, VideoProps>(function Video(
  { src, poster, className, muted = false, controls = false, loop = false, preload = 'metadata', onStart, onEnd },
  ref
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // 当提供 poster 时，初始不要附加 src，避免加载视频资源
  const [attachedSrc, setAttachedSrc] = useState<string | null>(() => (poster ? null : src));

  // 返回非空的 video element（调用端需注意可能在首次渲染前为 null）
  useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlaying = () => {
      setIsPlaying(true);
      onStart?.();
    };
    const onPause = () => {
      setIsPlaying(false);
    };

    const onEnded = () => {
      setIsPlaying(false);
      onEnd?.();
    };

    v.addEventListener('playing', onPlaying);
    v.addEventListener('pause', onPause);
    v.addEventListener('ended', onEnded);

    return () => {
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('ended', onEnded);
    };
  }, [onStart, onEnd]);

  const handlePlayClick = async () => {
    const v = videoRef.current;
    if (!v) return;

    try {
      // 如果还未附加 src（显示 poster），先附加然后尝试播放
      if (!attachedSrc) {
        setAttachedSrc(src);
        // 等待 DOM 更新并让浏览器开始加载再调用 play
        await new Promise((res) => setTimeout(res, 50));
      }

      // 浏览器策略可能阻止自动播放（非用户触发时），播放失败时会抛出
      await v.play();
      // play 的成功会触发 playing 事件，onStart 在 playing 里调用
    } catch (_) {
      setIsPlaying(false);
    }
  };

  return (
    <div className={cn('relative inline-block overflow-auto', className)}>
      <video
        ref={videoRef}
        src={attachedSrc ?? undefined}
        muted={muted}
        controls={controls}
        loop={loop}
        preload={attachedSrc ? preload : 'none'}
        className={cn(isPlaying ? 'block' : 'hidden', 'h-full w-full object-cover')}
      />

      {!isPlaying && (
        <div className="absolute top-0 left-0 right-0 bottom-0">
          <Image src={poster} className="w-full h-full [&>img]:object-contain" />

          <div className="abs-center">
            <Button
              onClick={handlePlayClick}
              theme="transparent"
              icon={<SvgIcon name="playVideo" className="size-10" />}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default memo(Video);
