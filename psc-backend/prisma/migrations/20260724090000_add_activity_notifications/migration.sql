CREATE TABLE `activitynotification` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `module` VARCHAR(120) NOT NULL,
  `eventType` VARCHAR(80) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `deepLink` VARCHAR(500) NULL,
  `entityType` VARCHAR(80) NULL,
  `entityId` VARCHAR(80) NULL,
  `actorName` VARCHAR(120) NULL,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `activitynotification_module_idx`(`module`),
  INDEX `activitynotification_eventType_idx`(`eventType`),
  INDEX `activitynotification_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `activitynotificationrecipient` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `notificationId` INTEGER NOT NULL,
  `adminId` INTEGER NOT NULL,
  `isRead` BOOLEAN NOT NULL DEFAULT false,
  `readAt` DATETIME(3) NULL,
  `deletedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `activitynotificationrecipient_notificationId_adminId_key`(`notificationId`, `adminId`),
  INDEX `activitynotificationrecipient_adminId_deletedAt_createdAt_idx`(`adminId`, `deletedAt`, `createdAt`),
  INDEX `activitynotificationrecipient_adminId_isRead_deletedAt_idx`(`adminId`, `isRead`, `deletedAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `activitynotificationrecipient`
  ADD CONSTRAINT `activitynotificationrecipient_notificationId_fkey`
  FOREIGN KEY (`notificationId`) REFERENCES `activitynotification`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `activitynotificationrecipient`
  ADD CONSTRAINT `activitynotificationrecipient_adminId_fkey`
  FOREIGN KEY (`adminId`) REFERENCES `admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
