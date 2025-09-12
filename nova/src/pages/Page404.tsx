import { useTranslation } from 'react-i18next';
import useNavigate from '@hooks/useNavigate';
import { Button } from '@components';
import { cn } from '@utils';

export default function Page404(props: { theme?: 'darken' | 'lighten' }) {
  const navigate = useNavigate();
  const { theme = 'darken' } = props;
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'flex-center flex-col gap-8 h-full text-secondary p-4 min-h-100',
        theme === 'lighten' && 'bg-[#EFF2F6]'
      )}
    >
      <div className="text-24">{t('Sorry, page not found!')}</div>

      <div className="text-center text-14">
        {t(
          `Sorry, we couldn't find the page you're looking for. Perhaps you've mistyped the URL? Be sure to check your spelling.`
        )}
      </div>

      <Button onClick={() => navigate('/')} size="lg">
        {t('Go to home')}
      </Button>
    </div>
  );
}
