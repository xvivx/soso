import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { useKYCInfo } from '@store/user';
import useMemoCallback from '@hooks/useMemoCallback';
import { useMediaQuery } from '@hooks/useResponsive';
import { Accordion, Button, Empty, SvgIcon } from '@components';
import { request } from '@utils/axios';
import { Card } from '@pages/components';

export default function Deposit() {
  const { t } = useTranslation();
  const { mobile } = useMediaQuery();
  const { data: KYCInfo, verified, isValidating: loading } = useKYCInfo();
  const [levelMap, descMap, statusMap] = useMemo(() => {
    const levelMap = {
      BASIC: t('Basic'),
      ADVANCED: t('Advanced'),
    };
    const descMap = {
      BASIC: t('basic information verification'),
      ADVANCED: t('ID verification'),
    };
    const statusMap = {
      INIT: t('init'),
      PENDING: t('pending'),
      APPROVED: t('approved'),
      REJECTED: t('rejected'),
      TEMPORARY_REJECTED: t('temporary rejected'),
    };
    return [levelMap, descMap, statusMap];
  }, [t]);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'INIT':
        return <SvgIcon name="remind" className="text-primary" />;
      case 'PENDING':
        return <SvgIcon name="progress" className="text-primary" />;
      case 'APPROVED':
        return <SvgIcon name="checkCircle" className="text-primary" />;
      case 'REJECTED':
      case 'TEMPORARY_REJECTED':
        return <SvgIcon name="error" className="text-error" />;
      default:
        return null;
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'INIT':
      case 'PENDING':
        return 'text-primary';
      case 'APPROVED':
        return 'text-success';
      case 'REJECTED':
      case 'TEMPORARY_REJECTED':
        return 'text-error';
      default:
        return 'text-secondary';
    }
  }, []);

  const handleVerify = useMemoCallback(async (level) => {
    const { verificationUrl } = await request.post<{ level: string; status: string; verificationUrl: string }>(
      `/api/user/kyc/initiate/${level}`
    );
    mutate(['user-kyc-status']);
    if (verificationUrl && mobile) {
      window.location.href = verificationUrl;
    }
    if (verificationUrl && !mobile) {
      verificationUrl && window.open(verificationUrl, '_blank');
    }
  });

  return (
    <Card>
      <Card.Title>
        <div className="flex items-center gap-2.5 text-14 s768:text-16 font-600">{t('KYC Verification')}</div>
        <div className="flex gap-2 items-center">
          {verified ? (
            <>
              <SvgIcon name="checkCircle" className="text-primary" />
              <span className="text-12 s768:text-14">{t('Account Verified')}</span>
            </>
          ) : (
            <>
              <SvgIcon name="error" className="text-error hover:text-error" />
              <span className="text-12 s768:text-14">{t('Account Not Verified')}</span>
            </>
          )}
        </div>
      </Card.Title>
      {loading ? (
        <Empty />
      ) : (
        <div className="space-y-3 mt-4">
          <Accordion type="single">
            {KYCInfo?.map((item) => (
              <Accordion.Item key={item.level} value={item.level}>
                <Accordion.Title className="bg-layer7 p-4 rounded-2 hover:bg-layer5 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-20 s768:w-24 font-600 text-12 s768:text-14 text-primary">
                      {levelMap[item.level]}
                    </span>
                    {getStatusIcon(item.status)}
                    <span className={`text-12 s768:text-14 font-medium ${getStatusColor(item.status)}`}>
                      {statusMap[item.status]}
                    </span>
                  </div>
                </Accordion.Title>

                <Accordion.Content className="bg-layer3 px-4 pb-4 rounded-b-2">
                  <p className="pt-3 border-t border-layer4 text-14 text-secondary mb-4">{descMap[item.level]}</p>

                  {['INIT', 'REJECTED', 'TEMPORARY_REJECTED'].includes(item.status) && (
                    <Button size="md" theme="primary" onClick={() => handleVerify(item.level)}>
                      {t('Submit')}
                    </Button>
                  )}
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      )}
    </Card>
  );
}
