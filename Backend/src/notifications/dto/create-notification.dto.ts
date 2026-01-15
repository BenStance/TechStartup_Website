import { NotificationType } from '../../common/constants/notification-types.constant';

export class CreateNotificationDto {
  userId?: number; // Optional for broadcast notifications
  title: string;
  message: string;
  type: NotificationType;
  broadcast?: boolean; // Flag to indicate if this is a broadcast notification
  targetUsers?: number[]; // Specific user IDs for targeted broadcast
}