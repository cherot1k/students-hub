/*
  Warnings:

  - You are about to drop the column `universityId` on the `Faculty` table. All the data in the column will be lost.
  - You are about to drop the column `facultyId` on the `Group` table. All the data in the column will be lost.
  - Added the required column `facultyId` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `universityId` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Faculty" DROP CONSTRAINT "Faculty_universityId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_facultyId_fkey";

-- AlterTable
ALTER TABLE "Faculty" DROP COLUMN "universityId";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "facultyId";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "facultyId" INTEGER NOT NULL,
ADD COLUMN     "universityId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
