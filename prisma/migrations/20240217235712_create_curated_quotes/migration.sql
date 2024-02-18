-- CreateTable
CREATE TABLE "curated_quotes" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "globalId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curated_quotes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "curated_quotes" ADD CONSTRAINT "curated_quotes_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
