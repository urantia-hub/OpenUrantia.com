-- CreateTable
CREATE TABLE "sent_quotes" (
    "globalId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "sent_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sent_quotes_userId_globalId_key" ON "sent_quotes"("userId", "globalId");

-- AddForeignKey
ALTER TABLE "sent_quotes" ADD CONSTRAINT "sent_quotes_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "papers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sent_quotes" ADD CONSTRAINT "sent_quotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
