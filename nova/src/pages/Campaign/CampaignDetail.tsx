import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Image, Loading } from '@components';
import { cn, formatter } from '@utils';
import { useActivityDetail } from './hooks/useActivity';

function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data, isLoading } = useActivityDetail(id);
  return (
    <div className={cn('break-all relative', isLoading && 'h-72')}>
      {!isLoading && data && (
        <>
          <Image src={data.banner} className="h-52 w-full rounded-3 mb-3" />
          <div className="text-18 font-600 mb-2">{data.name}</div>
          <div className="text-12 text-secondary font-500 mb-3">
            {t('Event time: {{ startTime }} - {{ endTime }}', {
              startTime: formatter.time(data.startTime),
              endTime: formatter.time(data.endTime),
            })}
          </div>
          <div className="text-14 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: data.rule }} />
        </>
      )}
      {isLoading && <Loading className="mt-5 pointer-events-none" />}
    </div>
  );
}

export default CampaignDetail;
