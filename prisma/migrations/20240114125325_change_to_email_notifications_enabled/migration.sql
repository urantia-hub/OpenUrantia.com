/*
  Warnings:

  - You are about to drop the column `notificationsEnabled` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "notificationsEnabled",
ADD COLUMN     "emailNotificationsEnabled" BOOLEAN DEFAULT false;
