-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "igUserId" TEXT,
ADD COLUMN     "pageId" TEXT,
ADD COLUMN     "pageAccessToken" TEXT,
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Account_igUserId_key" ON "Account"("igUserId");
