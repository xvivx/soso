import { NotificationType } from '@store/notification/type';
import NotifyTab from './NotifyTab';

function InboxMessage() {
  return <NotifyTab type={NotificationType.InboxMessage} />;
}

export default InboxMessage;
