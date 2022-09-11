-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "last_message" DROP NOT NULL;

-- CreateTable
CREATE TABLE "RoleOnChat" (
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,

    CONSTRAINT "RoleOnChat_pkey" PRIMARY KEY ("chatId","userId")
);

-- AddForeignKey
ALTER TABLE "RoleOnChat" ADD CONSTRAINT "RoleOnChat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleOnChat" ADD CONSTRAINT "RoleOnChat_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
