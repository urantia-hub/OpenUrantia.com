/*
  Warnings:

  - Added the required column `paperId` to the `saved_nodes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paperSectionId` to the `saved_nodes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paperSectionParagraphId` to the `saved_nodes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SharedNodePlatform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'WHATSAPP', 'X');

-- AlterTable
ALTER TABLE "saved_nodes" ADD COLUMN     "paperId" TEXT NOT NULL,
ADD COLUMN     "paperSectionId" TEXT NOT NULL,
ADD COLUMN     "paperSectionParagraphId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "node_references" (
    "authors" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "globalId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "link" TEXT,
    "page" TEXT,
    "paperId" TEXT NOT NULL,
    "paperSectionId" TEXT NOT NULL,
    "paperSectionParagraphId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "title" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "node_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_nodes" (
    "count" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "globalId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "paperSectionId" TEXT NOT NULL,
    "paperSectionParagraphId" TEXT NOT NULL,
    "platform" "SharedNodePlatform" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "shared_nodes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "shared_nodes" ADD CONSTRAINT "shared_nodes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
