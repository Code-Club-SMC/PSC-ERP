ALTER TABLE `hallbooking`
  ADD COLUMN `local_sync` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `local_sync_id` VARCHAR(191) NULL,
  ADD COLUMN `local_sync_status` INTEGER NULL,
  ADD COLUMN `sync_datetime` DATETIME(3) NULL,
  ADD COLUMN `local_sync_message` TEXT NULL;

ALTER TABLE `lawnbooking`
  ADD COLUMN `local_sync` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `local_sync_id` VARCHAR(191) NULL,
  ADD COLUMN `local_sync_status` INTEGER NULL,
  ADD COLUMN `sync_datetime` DATETIME(3) NULL,
  ADD COLUMN `local_sync_message` TEXT NULL;

ALTER TABLE `photoshootbooking`
  ADD COLUMN `local_sync` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `local_sync_id` VARCHAR(191) NULL,
  ADD COLUMN `local_sync_status` INTEGER NULL,
  ADD COLUMN `sync_datetime` DATETIME(3) NULL,
  ADD COLUMN `local_sync_message` TEXT NULL;

ALTER TABLE `affclubbooking`
  ADD COLUMN `local_sync` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `local_sync_id` VARCHAR(191) NULL,
  ADD COLUMN `local_sync_status` INTEGER NULL,
  ADD COLUMN `sync_datetime` DATETIME(3) NULL,
  ADD COLUMN `local_sync_message` TEXT NULL;

CREATE INDEX `hallbooking_local_sync_idx` ON `hallbooking`(`local_sync`);
CREATE INDEX `lawnbooking_local_sync_idx` ON `lawnbooking`(`local_sync`);
CREATE INDEX `photoshootbooking_local_sync_idx` ON `photoshootbooking`(`local_sync`);
CREATE INDEX `affclubbooking_local_sync_idx` ON `affclubbooking`(`local_sync`);
CREATE INDEX `roombooking_local_sync_idx` ON `roombooking`(`local_sync`);
