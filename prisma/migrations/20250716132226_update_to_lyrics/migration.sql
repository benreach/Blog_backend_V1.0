/*
  Warnings:

  - You are about to drop the column `lyrice` on the `Music` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,postId]` on the table `Playlist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,musicId]` on the table `Playlist` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Playlist_userId_postId_musicId_key";

-- AlterTable
ALTER TABLE "Music" DROP COLUMN "lyrice",
ADD COLUMN     "lyrics" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_userId_postId_key" ON "Playlist"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_userId_musicId_key" ON "Playlist"("userId", "musicId");
