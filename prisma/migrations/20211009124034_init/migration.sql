-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "university" VARCHAR(255) NOT NULL,
    "group" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "ticket" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_ticket_key" ON "User"("ticket");

-- CreateIndex
CREATE UNIQUE INDEX "User_profileId_key" ON "User"("profileId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
