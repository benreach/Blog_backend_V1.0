/*
  Warnings:

  - You are about to drop the column `type` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "type",
ADD COLUMN     "category" "Category",
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SiteStats" ALTER COLUMN "id" SET DEFAULT 'global';

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");
