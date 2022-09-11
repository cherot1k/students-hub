-- CreateTable
CREATE TABLE "UserReadMessage" (
    "userId" INTEGER NOT NULL,
    "messageId" INTEGER NOT NULL,

    CONSTRAINT "UserReadMessage_pkey" PRIMARY KEY ("userId","messageId")
);

-- AddForeignKey
ALTER TABLE "UserReadMessage" ADD CONSTRAINT "UserReadMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReadMessage" ADD CONSTRAINT "UserReadMessage_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
