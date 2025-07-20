/*
  Warnings:

  - You are about to drop the column `userType` on the `AdminProfile` table. All the data in the column will be lost.
  - Made the column `displayName` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AdminProfile" DROP COLUMN "userType",
ADD COLUMN     "linkedIn" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userType" "UserType" DEFAULT 'USER',
ALTER COLUMN "displayName" SET NOT NULL;
