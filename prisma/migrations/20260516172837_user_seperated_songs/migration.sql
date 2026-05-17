/*
  Warnings:

  - You are about to drop the column `uploadDate` on the `Song` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Song` DROP COLUMN `uploadDate`;

-- CreateTable
CREATE TABLE `UserSong` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `songId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UserSong_userId_songId_key`(`userId`, `songId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserSong` ADD CONSTRAINT `UserSong_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSong` ADD CONSTRAINT `UserSong_songId_fkey` FOREIGN KEY (`songId`) REFERENCES `Song`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
