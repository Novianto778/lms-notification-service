export enum NotificationType {
  COURSE_CREATED = 'COURSE_CREATED',
  COURSE_UPDATED = 'COURSE_UPDATED',
  ENROLLMENT_CONFIRMED = 'ENROLLMENT_CONFIRMED',
  NEW_COMMENT = 'NEW_COMMENT',
  ASSIGNMENT_POSTED = 'ASSIGNMENT_POSTED',
  GRADE_POSTED = 'GRADE_POSTED',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
}

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface UpdateNotificationDto {
  status?: NotificationStatus;
}

export interface NotificationFilters {
  status?: NotificationStatus;
  type?: NotificationType;
  startDate?: Date;
  endDate?: Date;
}
