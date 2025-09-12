import { useTranslation } from 'react-i18next';
import { TransitionStatus } from '../types';

export default function Status(props: { status: TransitionStatus }) {
  const { status } = props;
  const { t } = useTranslation();
  if (status === TransitionStatus.FAILED) {
    return <div className="text-error">{t('Failed')}</div>;
  } else if (status === TransitionStatus.SUCCESS) {
    return <div className="text-success">{t('Completed')}</div>;
  } else {
    return (
      <div className="flex items-center gap-2 text-warn">
        <div className="relative">
          <span className="absolute inset-0 animate-ping size-2 rounded-full bg-warn" />
          <span className="relative z-10 block size-2 rounded-full bg-warn" />
        </div>
        {t('Progressing')}
      </div>
    );
  }
}
