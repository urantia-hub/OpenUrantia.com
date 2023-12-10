-- CreateTable
CREATE TABLE "node_comments" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "globalId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "paperSectionId" TEXT NOT NULL,
    "paperSectionParagraphId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "node_comments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "node_comments" ADD CONSTRAINT "node_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
