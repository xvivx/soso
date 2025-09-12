import { memo, useMemo } from 'react';
import { useMediaQuery } from '@hooks/useResponsive';
import { Image } from '@components';

interface MediaImageProps {
  pcSrc: string;
  mSrc: string;
  /** 是否显示移动端图片, 默认根据屏幕宽度判断, true 则显示移动端图片, 默认根据屏幕宽度判断 */
  toggle?: boolean;
  alt?: string;
  className?: string;
}

function MediaImage(props: MediaImageProps) {
  const { mobile } = useMediaQuery();

  const commonProps = useMemo(
    () => ({
      className: props.className,
      alt: props.alt,
    }),
    [props.alt, props.className]
  );

  const isShowMobilePic = useMemo(() => {
    if (props.toggle) {
      return props.toggle;
    } else {
      return mobile;
    }
  }, [mobile, props.toggle]);

  return <Image {...commonProps} src={isShowMobilePic ? props.mSrc : props.pcSrc} />;
}

export default memo(MediaImage);
