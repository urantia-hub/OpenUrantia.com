-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lastAskedNotificationsAt" TIMESTAMP(3),
ADD COLUMN     "notificationsEnabled" BOOLEAN DEFAULT false;
