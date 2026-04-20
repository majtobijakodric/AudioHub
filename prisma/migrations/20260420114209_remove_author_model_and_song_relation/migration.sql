/*
  Warnings:

  - You are about to drop the column `authorId` on the `songs` table. All the data in the column will be lost.
  - You are about to drop the `authors` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `songs` DROP FOREIGN KEY `songs_authorId_fkey`;

-- DropIndex
DROP INDEX `songs_authorId_fkey` ON `songs`;

-- AlterTable
ALTER TABLE `songs` DROP COLUMN `authorId`;

-- DropTable
DROP TABLE `authors`;
