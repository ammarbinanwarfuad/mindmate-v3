import { connectDB } from '@/lib/db/mongodb';
import NotificationModel, { NotificationType } from '@/lib/db/models/Notification';

interface CreateNotificationOptions {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    fromUserId?: string;
    fromUserName?: string;
    metadata?: any;
}

export async function createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    options?: {
        fromUserId?: string;
        fromUserName?: string;
        metadata?: any;
    }
) {
    try {
        await connectDB();

        // Don't create notification for the user's own actions
        if (options?.fromUserId && options.fromUserId === userId) {
            return null;
        }

        const notification = await NotificationModel.create({
            userId,
            type,
            title,
            message,
            link,
            read: false,
            fromUserId: options?.fromUserId,
            fromUserName: options?.fromUserName,
            metadata: options?.metadata,
        });

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

export async function getNotifications(userId: string, limit = 20) {
    await connectDB();

    const notifications = await NotificationModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    return notifications;
}

export async function getUnreadCount(userId: string): Promise<number> {
    await connectDB();

    const count = await NotificationModel.countDocuments({
        userId,
        read: false,
    });

    return count;
}

export async function markAsRead(notificationId: string) {
    await connectDB();

    const notification = await NotificationModel.findByIdAndUpdate(
        notificationId,
        { read: true },
        { new: true }
    );

    return notification;
}

export async function markAllAsRead(userId: string) {
    await connectDB();

    await NotificationModel.updateMany(
        { userId, read: false },
        { read: true }
    );

    return { success: true };
}

export async function deleteNotification(notificationId: string) {
    await connectDB();

    await NotificationModel.findByIdAndDelete(notificationId);

    return { success: true };
}

