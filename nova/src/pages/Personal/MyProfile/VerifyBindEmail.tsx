import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import useNavigate from '@hooks/useNavigate';
import { Button, Modal } from '@components';
import { request } from '@utils/axios';
import { PathTradeCenter } from '@/routes/paths';

function VerifyBindEmail() {
  const { code } = useParams<{ code: string }>();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      if (!code) return;
      try {
        await request.post('/api/user/email/bind/verify', { bindCode: code });
        navigate('/dashboard/personal', { replace: true });
      } catch {
        setShowErrorModal(true);
      }
    })();
  }, [code, navigate, t]);

  return (
    <Modal title={t('Page error')} visible={showErrorModal} onClose={setShowErrorModal} closable={false}>
      <div className="text-primary text-16">{t('Please refresh the page or jump to the trading center')}</div>
      <Modal.Footer className="flex gap-2 mt-8">
        <Button
          onClick={() => navigate(PathTradeCenter.futures, { replace: true })}
          theme="secondary"
          size="lg"
          className="flex-1"
        >
          {t('To trading center')}
        </Button>
        <Button onClick={() => window.location.reload()} theme="primary" size="lg" className="flex-1">
          {t('Refresh page')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default VerifyBindEmail;
