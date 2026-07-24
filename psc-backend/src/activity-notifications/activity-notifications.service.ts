import { Injectable } from '@nestjs/common';
import { MODULES } from 'src/common/constants/modules.constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { RealtimeGateway } from 'src/realtime/realtime.gateway';

type ActivityPayload = {
  module: string;
  eventType: string;
  title: string;
  message: string;
  deepLink?: string;
  entityType?: string;
  entityId?: string | number;
  actorName?: string;
  metadata?: Record<string, any>;
};

const hasAnyModulePermission = (permissions: any, moduleName: string) => {
  if (Array.isArray(permissions)) return permissions.includes(moduleName);
  if (!permissions || typeof permissions !== 'object') return false;

  const modules = permissions.modules;
  if (!modules || typeof modules !== 'object' || Array.isArray(modules)) return false;
  const modulePerms = modules[moduleName];
  if (!modulePerms || typeof modulePerms !== 'object' || Array.isArray(modulePerms)) return false;
  return Object.values(modulePerms).some((value) => value === true);
};

@Injectable()
export class ActivityNotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async createForModule(payload: ActivityPayload) {
    if (!payload.module || !payload.eventType) return null;

    const admins = await this.prisma.admin.findMany({
      where: {
        OR: [
          { role: 'SUPER_ADMIN' as any },
          { role: 'ADMIN' as any },
        ],
      },
      select: { id: true, role: true, permissions: true },
    });

    const recipientIds = admins
      .filter((admin) => admin.role === 'SUPER_ADMIN' || hasAnyModulePermission(admin.permissions, payload.module))
      .map((admin) => admin.id);

    if (!recipientIds.length) return null;

    const notification = await (this.prisma as any).activityNotification.create({
      data: {
        module: payload.module,
        eventType: payload.eventType,
        title: payload.title,
        message: payload.message,
        deepLink: payload.deepLink,
        entityType: payload.entityType,
        entityId: payload.entityId == null ? undefined : String(payload.entityId),
        actorName: payload.actorName,
        metadata: payload.metadata || undefined,
        recipients: {
          createMany: {
            data: recipientIds.map((adminId) => ({ adminId })),
            skipDuplicates: true,
          },
        },
      },
      include: { recipients: true },
    });

    for (const recipient of notification.recipients) {
      this.realtimeGateway.emitActivityNotification(recipient.adminId, this.toClientNotification(notification, recipient));
    }

    return notification;
  }

  async notifyBookingEvent(input: {
    module: string;
    eventType: 'created' | 'cancellation_requested' | 'cancelled' | 'closed' | 'payment_recorded';
    bookingId: string | number;
    actorName?: string;
    memberLabel?: string;
    resourceLabel?: string;
    deepLink: string;
    metadata?: Record<string, any>;
  }) {
    const eventLabels: Record<string, string> = {
      created: 'New booking',
      cancellation_requested: 'Cancellation requested',
      cancelled: 'Booking cancelled',
      closed: 'Booking closed',
      payment_recorded: 'Payment recorded',
    };
    const title = `${eventLabels[input.eventType]} - ${input.module}`;
    const parts = [
      input.memberLabel ? `Member: ${input.memberLabel}` : undefined,
      input.resourceLabel,
      input.actorName ? `By: ${input.actorName}` : undefined,
    ].filter(Boolean);

    return this.createForModule({
      module: input.module,
      eventType: input.eventType,
      title,
      message: parts.length ? parts.join(' | ') : `${eventLabels[input.eventType]} #${input.bookingId}`,
      deepLink: input.deepLink,
      entityType: 'booking',
      entityId: input.bookingId,
      actorName: input.actorName,
      metadata: input.metadata,
    });
  }

  async notifyFeedbackEvent(input: {
    eventType: 'created' | 'updated';
    feedbackId: string | number;
    actorName?: string;
    memberLabel?: string;
    deepLink: string;
    metadata?: Record<string, any>;
  }) {
    const title = input.eventType === 'created' ? 'New feedback' : 'Feedback updated';
    return this.createForModule({
      module: MODULES.FEEDBACK,
      eventType: input.eventType,
      title,
      message: [input.memberLabel ? `Member: ${input.memberLabel}` : undefined, input.actorName ? `By: ${input.actorName}` : undefined]
        .filter(Boolean)
        .join(' | ') || `${title} #${input.feedbackId}`,
      deepLink: input.deepLink,
      entityType: 'feedback',
      entityId: input.feedbackId,
      actorName: input.actorName,
      metadata: input.metadata,
    });
  }

  async getForAdmin(adminId: number, filters: { from?: string; to?: string; limit?: number }) {
    const where: any = { adminId, deletedAt: null };
    const createdAt: any = {};
    if (filters.from) {
      const from = new Date(filters.from);
      from.setHours(0, 0, 0, 0);
      createdAt.gte = from;
    }
    if (filters.to) {
      const to = new Date(filters.to);
      to.setHours(23, 59, 59, 999);
      createdAt.lte = to;
    }
    if (Object.keys(createdAt).length) where.notification = { createdAt };

    const recipients = await (this.prisma as any).activityNotificationRecipient.findMany({
      where,
      take: Math.min(Math.max(filters.limit || 50, 1), 200),
      orderBy: { notification: { createdAt: 'desc' } },
      include: { notification: true },
    });

    const unreadCount = await (this.prisma as any).activityNotificationRecipient.count({
      where: { adminId, deletedAt: null, isRead: false },
    });

    return {
      data: recipients.map((recipient) => this.toClientNotification(recipient.notification, recipient)),
      unreadCount,
    };
  }

  async markRead(adminId: number, recipientId: number) {
    await (this.prisma as any).activityNotificationRecipient.updateMany({
      where: { id: recipientId, adminId, deletedAt: null },
      data: { isRead: true, readAt: new Date() },
    });

    const recipient = await (this.prisma as any).activityNotificationRecipient.findFirst({
      where: { id: recipientId, adminId, deletedAt: null },
      include: { notification: true },
    });

    if (!recipient) return { ok: false };
    return { ok: true, notification: this.toClientNotification(recipient.notification, recipient) };
  }

  async markAllRead(adminId: number) {
    await (this.prisma as any).activityNotificationRecipient.updateMany({
      where: { adminId, deletedAt: null, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { ok: true };
  }

  async softDelete(adminId: number, recipientId: number) {
    await (this.prisma as any).activityNotificationRecipient.updateMany({
      where: { id: recipientId, adminId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return { ok: true };
  }

  async softDeleteMany(adminId: number, recipientIds: number[]) {
    const safeIds = recipientIds.map(Number).filter(Number.isInteger);
    if (!safeIds.length) return { ok: true, count: 0 };
    const result = await (this.prisma as any).activityNotificationRecipient.updateMany({
      where: { id: { in: safeIds }, adminId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return { ok: true, count: result.count };
  }

  private toClientNotification(notification: any, recipient: any) {
    return {
      id: recipient.id,
      notificationId: notification.id,
      module: notification.module,
      eventType: notification.eventType,
      title: notification.title,
      message: notification.message,
      deepLink: notification.deepLink,
      entityType: notification.entityType,
      entityId: notification.entityId,
      actorName: notification.actorName,
      metadata: notification.metadata,
      isRead: recipient.isRead,
      readAt: recipient.readAt,
      createdAt: notification.createdAt,
    };
  }
}
