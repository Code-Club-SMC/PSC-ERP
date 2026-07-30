-- CreateTable
CREATE TABLE `admin_request_log` (
  `reqid` INTEGER NOT NULL AUTO_INCREMENT,
  `madeBy` INTEGER NOT NULL,
  `requestTo` VARCHAR(120) NOT NULL,
  `madeAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `responseStatus` ENUM('SUCCEED', 'FAILED') NOT NULL,

  INDEX `admin_request_log_madeAt_idx`(`madeAt`),
  INDEX `admin_request_log_madeBy_idx`(`madeBy`),
  INDEX `admin_request_log_madeBy_requestTo_madeAt_idx`(`madeBy`, `requestTo`, `madeAt`),
  PRIMARY KEY (`reqid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `member_request_log` (
  `reqid` INTEGER NOT NULL AUTO_INCREMENT,
  `madeBy` VARCHAR(191) NOT NULL,
  `requestTo` VARCHAR(120) NOT NULL,
  `madeAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `responseStatus` ENUM('SUCCEED', 'FAILED') NOT NULL,

  INDEX `member_request_log_madeAt_idx`(`madeAt`),
  INDEX `member_request_log_madeBy_idx`(`madeBy`),
  INDEX `member_request_log_madeBy_requestTo_madeAt_idx`(`madeBy`, `requestTo`, `madeAt`),
  PRIMARY KEY (`reqid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin_request_log` ADD CONSTRAINT `admin_request_log_madeBy_fkey` FOREIGN KEY (`madeBy`) REFERENCES `admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `member_request_log` ADD CONSTRAINT `member_request_log_madeBy_fkey` FOREIGN KEY (`madeBy`) REFERENCES `member`(`Membership_No`) ON DELETE RESTRICT ON UPDATE CASCADE;
