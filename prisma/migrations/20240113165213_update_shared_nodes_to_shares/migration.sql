/*
  Warnings:

  - You are about to drop the `node_comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `node_references` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `shared_nodes` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SharePlatform" AS ENUM ('COPY_LINK', 'COPY_TEXT', 'FACEBOOK', 'INSTAGRAM', 'WHATSAPP', 'X');

-- DropForeignKey
ALTER TABLE "node_comments" DROP CONSTRAINT "node_comments_userId_fkey";

-- DropForeignKey
ALTER TABLE "shared_nodes" DROP CONSTRAINT "shared_nodes_userId_fkey";

-- DropTable
DROP TABLE "node_comments";

-- DropTable
DROP TABLE "node_references";

-- DropTable
DROP TABLE "shared_nodes";

-- DropEnum
DROP TYPE "SharedNodePlatform";

-- CreateTable
CREATE TABLE "notes" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "globalId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "paperSectionId" TEXT NOT NULL,
    "paperSectionParagraphId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shares" (
    "count" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "globalId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "paperSectionId" TEXT NOT NULL,
    "paperSectionParagraphId" TEXT NOT NULL,
    "platform" "SharePlatform" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "shares_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shares" ADD CONSTRAINT "shares_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
