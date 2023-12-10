-- CreateTable
CREATE TABLE "saved_nodes" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "globalId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "saved_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_nodes_globalId_userId_key" ON "saved_nodes"("globalId", "userId");

-- AddForeignKey
ALTER TABLE "saved_nodes" ADD CONSTRAINT "saved_nodes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
