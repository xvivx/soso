import { NotificationType } from '@store/notification/type';
import NotifyTab from './NotifyTab';

function Announcement() {
  return <NotifyTab type={NotificationType.Announcements} />;
}

export default Announcement;
