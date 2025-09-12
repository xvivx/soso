import { NotificationType } from '@store/notification/type';
import NotifyTab from './NotifyTab';

function SystemNotification() {
  return <NotifyTab type={NotificationType.System} />;
}

export default SystemNotification;
