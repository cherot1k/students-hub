/*
  Warnings:

  - The `role` column on the `RoleOnChat` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "RoleOnChat" DROP COLUMN "role",
ADD COLUMN     "role" "Role" DEFAULT E'USER';
