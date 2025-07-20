-- CreateEnum
CREATE TYPE "Category" AS ENUM ('NOVEL', 'MUSIC');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'NOVEL';
