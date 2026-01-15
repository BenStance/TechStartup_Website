import { NotificationType } from '../../common/constants/notification-types.constant';

export class Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
}