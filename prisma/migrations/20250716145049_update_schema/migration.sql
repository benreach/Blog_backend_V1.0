/*
  Warnings:

  - You are about to drop the column `userType` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "userType",
ADD COLUMN     "lastProfileUpdate" TIMESTAMP(3);

-- DropEnum
DROP TYPE "UserType";
