import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FeedbackStatus } from '@prisma/client';
import { AddFeedbackRemarkDto, CreateFeedbackCategoryDto, CreateFeedbackDto, CreateFeedbackSubCategoryDto } from './dtos/feedback.dto';
import { NotificationService } from 'src/notification/notification.service';
import { ActivityNotificationsService } from 'src/activity-notifications/activity-notifications.service';

@Injectable()
export class FeedbackService {
    constructor(
        private prisma: PrismaService,
        private notificationService: NotificationService,
        private activityNotifications: ActivityNotificationsService,
    ) { }

    async findAll() {
        return this.prisma.feedback.findMany({
            include: {
                member: {
                    select: {
                        Name: true,
                        Membership_No: true,
                        Contact_No: true,
                        Email: true,
                    },
                },
                category: true,
                subCategory: true,
                remarks: {
                    orderBy: { createdAt: 'desc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateStatus(id: number, status: FeedbackStatus, adminName = 'system') {
        const feedback = await this.prisma.feedback.findUnique({ where: { id } });
        if (!feedback) throw new NotFoundException('Feedback not found');

        const updatedFeedback = await this.prisma.feedback.update({
            where: { id },
            data: { status },
        });

        // Send notification to member
        await this.notificationService.notifyMember(
            feedback.memberNo,
            'Feedback Status Updated',
            `Your feedback "${feedback.subject}" status has been updated to ${status.replace(/_/g, ' ')}.`
        );
        await this.activityNotifications.notifyFeedbackEvent({
            eventType: 'updated',
            feedbackId: id,
            actorName: adminName,
            memberLabel: feedback.memberNo,
            deepLink: `/feedback?id=${id}`,
            metadata: { status },
        });

        return updatedFeedback;
    }

    async addRemark(id: number, dto: AddFeedbackRemarkDto, adminName = dto.adminName || 'system') {
        const feedback = await this.prisma.feedback.findUnique({ where: { id } });
        if (!feedback) throw new NotFoundException('Feedback not found');

        const remark = await this.prisma.feedbackRemark.create({
            data: {
                feedbackId: id,
                adminName: dto.adminName,
                remark: dto.remark,
            },
        });

        // Send notification to member
        await this.notificationService.notifyMember(
            feedback.memberNo,
            'New Remark on Feedback',
            `A new remark has been added to your feedback "${feedback.subject}" by ${dto.adminName}: ${dto.remark}`
        );
        await this.activityNotifications.notifyFeedbackEvent({
            eventType: 'updated',
            feedbackId: id,
            actorName: adminName,
            memberLabel: feedback.memberNo,
            deepLink: `/feedback?id=${id}`,
            metadata: { action: 'remark_added' },
        });

        return remark;
    }

    // Categories
    async findAllCategories() {
        return this.prisma.feedbackCategory.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async createCategory(dto: CreateFeedbackCategoryDto) {
        return this.prisma.feedbackCategory.create({
            data: { name: dto.name },
        });
    }

    async deleteCategory(id: number) {
        return this.prisma.feedbackCategory.delete({
            where: { id },
        });
    }

    // SubCategories
    async findAllSubCategories() {
        return this.prisma.feedbackSubCategory.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async createSubCategory(dto: CreateFeedbackSubCategoryDto) {
        return this.prisma.feedbackSubCategory.create({
            data: { name: dto.name },
        });
    }

    async deleteSubCategory(id: number) {
        return this.prisma.feedbackSubCategory.delete({
            where: { id },
        });
    }

    async assignCategory(feedbackId: number, categoryId: number | null) {
        return this.prisma.feedback.update({
            where: { id: feedbackId },
            data: { categoryId },
        });
    }

    async assignSubCategory(feedbackId: number, subCategoryId: number | null, otherSubCategory?: string) {
        return this.prisma.feedback.update({
            where: { id: feedbackId },
            data: {
                subCategoryId,
                otherSubCategory: subCategoryId === null ? otherSubCategory || null : null
            },
        });
    }

    async createFeedback(dto: CreateFeedbackDto, Membership_No: string) {
        const feedback = await this.prisma.feedback.create({
            data: {
                memberNo: Membership_No,
                subject: dto.subject,
                categoryId: dto.categoryId,
                subCategoryId: dto.subCategoryId,
                message: dto.message,
            },
        });
        await this.activityNotifications.notifyFeedbackEvent({
            eventType: 'created',
            feedbackId: feedback.id,
            actorName: Membership_No,
            memberLabel: Membership_No,
            deepLink: `/feedback?id=${feedback.id}`,
            metadata: { subject: dto.subject },
        });
        return feedback;
    }
}
