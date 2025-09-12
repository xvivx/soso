import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgIcon } from '@components';
import { cn } from '@utils';
import loadingGif from './loading.gif';

function Loading(props: BaseProps) {
  const { className, ...rest } = props;
  return (
    <div className={cn('abs-center z-10 size-10 text-primary', className)} {...rest}>
      <SvgIcon className="size-full" name="loading" />
    </div>
  );
}

function LoadingSvg(props: Omit<BaseProps, 'children'>) {
  return <SvgIcon {...props} name="loading" />;
}

function LoadingScreen({ className, showLogo = true }: { className?: string; showLogo?: boolean }) {
  const { t } = useTranslation();

  return (
    <div className={cn('flex-center flex-col gap-2 h-screen detrade-screen-loading', className)}>
      <img src={loadingGif} alt="" style={{ width: 400, aspectRatio: '400/225' }} />
      <div className="p-2 -mt-12 text-white rounded light:text-primary">{t('Trading Smarter, Earning Better')}</div>

      {showLogo && <SvgIcon.Logo className="text-primary" />}
    </div>
  );
}

export default Object.assign(memo(Loading), {
  Svg: LoadingSvg,
  Screen: LoadingScreen,
});
