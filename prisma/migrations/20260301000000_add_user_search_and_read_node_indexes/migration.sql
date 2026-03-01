-- CreateTable
CREATE TABLE "user_searches" (
    "id" TEXT NOT NULL,
    "searchQuery" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_searches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_searches_userId_createdAt_idx" ON "user_searches"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "user_searches_createdAt_idx" ON "user_searches"("createdAt");

-- CreateIndex
CREATE INDEX "read_nodes_userId_createdAt_idx" ON "read_nodes"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "read_nodes_userId_paperId_idx" ON "read_nodes"("userId", "paperId");

-- AddForeignKey
ALTER TABLE "user_searches" ADD CONSTRAINT "user_searches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
