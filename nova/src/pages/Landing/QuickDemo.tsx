import { useTranslation } from 'react-i18next';
import useNavigate from '@hooks/useNavigate';
import { Button } from '@components';
import { PathTradeCenter } from '@/routes/paths';

function QuickDemo() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div
      className="w-full flex-center flex-col gap-6 relative"
      style={{ background: 'linear-gradient(180deg, #031122 0%, #191B27 100%)', height: 365 }}
    >
      <div className="text-white text-center text-32 s768:text-38 font-700 z-10" style={{ maxWidth: 667 }}>
        {t('Quick experience starts here, easy experience without registration')}
      </div>
      <Button
        onClick={() => navigate(PathTradeCenter.futures)}
        className="px-6 py-8 bg-white rounded-6 text-black text-16 z-10"
        theme="transparent"
      >
        {t('Try a quick demo')}
      </Button>
      <div
        className="absolute top-0 bottom-0"
        style={{
          background: 'rgba(113, 170, 254, 0.20)',
          filter: 'blur(202.5px)',
          width: 700,
        }}
      />
    </div>
  );
}
export default QuickDemo;
