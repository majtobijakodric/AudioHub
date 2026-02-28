-- CreateTable
CREATE TABLE `authors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `channelId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `authors_channelId_key`(`channelId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `songs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `videoId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `authorId` INTEGER NOT NULL,
    `durationSeconds` INTEGER NOT NULL DEFAULT 0,
    `durationTimestamp` VARCHAR(191) NOT NULL DEFAULT '0:00',
    `fileSizeBytes` BIGINT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `thumbnail` VARCHAR(191) NULL,
    `status` ENUM('downloaded', 'notDownloaded') NOT NULL DEFAULT 'downloaded',
    `downloadedAt` DATETIME(3) NULL,
    `lastListenedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `songs_videoId_key`(`videoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `songs` ADD CONSTRAINT `songs_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `authors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
