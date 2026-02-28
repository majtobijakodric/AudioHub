/*
  Warnings:

  - You are about to drop the column `channelId` on the `authors` table. All the data in the column will be lost.
  - You are about to drop the column `fileSizeBytes` on the `songs` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `authors_channelId_key` ON `authors`;

-- AlterTable
ALTER TABLE `authors` DROP COLUMN `channelId`;

-- AlterTable
ALTER TABLE `songs` DROP COLUMN `fileSizeBytes`;
