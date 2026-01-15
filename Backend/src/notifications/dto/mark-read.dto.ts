export class MarkReadDto {
  isRead?: boolean;
}

export class MarkAllReadDto {
  userId?: number; // Optional: for admin to mark all notifications for a specific user
}