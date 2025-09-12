import { useParams } from 'react-router-dom';
import { useNotifyDetail } from '@store/notification/services';
import { Loading } from '@components';
import { cn } from '@utils';

function NotifyDetail() {
  const { id: messageId } = useParams<{ id: string }>();

  const { data, isLoading } = useNotifyDetail(messageId);

  return (
    <div className={cn('break-all relative', isLoading && 'h-72')}>
      {!isLoading && data && (
        <>
          <div className="text-24 s768:text-32 font-600">{data.title}</div>
          <hr className="my-4 border-thirdly" />
          <div className="text-14" dangerouslySetInnerHTML={{ __html: data.content }} />
        </>
      )}
      {isLoading && <Loading className="mt-5 pointer-events-none" />}
    </div>
  );
}

export default NotifyDetail;
