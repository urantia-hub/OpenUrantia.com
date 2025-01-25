-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailChangelogEnabled" BOOLEAN DEFAULT true,
ADD COLUMN     "emailContinueReadingEnabled" BOOLEAN DEFAULT true,
ADD COLUMN     "emailDailyQuoteEnabled" BOOLEAN DEFAULT true;
