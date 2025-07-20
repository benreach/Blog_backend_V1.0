-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('STUDENT', 'TEACHER', 'VISITOR', 'WORKER', 'USER', 'ADMIN');

-- AlterTable
ALTER TABLE "AdminProfile" ADD COLUMN     "userType" "UserType" DEFAULT 'USER';

SELECT * FROM USER;