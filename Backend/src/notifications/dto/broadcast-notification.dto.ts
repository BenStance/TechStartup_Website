import { NotificationType } from '../../common/constants/notification-types.constant';

export class BroadcastNotificationDto {
  title: string;
  message: string;
  type: NotificationType;
  targetUsers?: number[]; // Optional: specific user IDs for targeted broadcast, if not provided broadcast to all
}