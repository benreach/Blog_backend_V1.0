-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "content" DROP NOT NULL;
