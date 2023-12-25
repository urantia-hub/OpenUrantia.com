-- CreateTable
CREATE TABLE "read_nodes" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "globalId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "paperSectionId" TEXT NOT NULL,
    "paperSectionParagraphId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "read_nodes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "read_nodes" ADD CONSTRAINT "read_nodes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
