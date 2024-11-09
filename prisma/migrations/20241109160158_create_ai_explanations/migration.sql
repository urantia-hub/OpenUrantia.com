-- CreateTable
CREATE TABLE "ai_explanations" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "globalId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_explanations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_explanations_globalId_key" ON "ai_explanations"("globalId");

-- CreateIndex
CREATE INDEX "ai_explanations_paperId_idx" ON "ai_explanations"("paperId");
