/*
  Warnings:

  - You are about to drop the `LikeOnComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LikeOnPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LikeOnComment" DROP CONSTRAINT "LikeOnComment_commentId_fkey";

-- DropForeignKey
ALTER TABLE "LikeOnComment" DROP CONSTRAINT "LikeOnComment_userId_fkey";

-- DropForeignKey
ALTER TABLE "LikeOnPost" DROP CONSTRAINT "LikeOnPost_postId_fkey";

-- DropForeignKey
ALTER TABLE "LikeOnPost" DROP CONSTRAINT "LikeOnPost_userId_fkey";

-- DropTable
DROP TABLE "LikeOnComment";

-- DropTable
DROP TABLE "LikeOnPost";

-- CreateTable
CREATE TABLE "LikeOnComments" (
    "userId" INTEGER NOT NULL,
    "commentId" INTEGER NOT NULL,

    CONSTRAINT "LikeOnComments_pkey" PRIMARY KEY ("userId","commentId")
);

-- CreateTable
CREATE TABLE "LikeOnPosts" (
    "userId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,

    CONSTRAINT "LikeOnPosts_pkey" PRIMARY KEY ("userId","postId")
);

-- AddForeignKey
ALTER TABLE "LikeOnComments" ADD CONSTRAINT "LikeOnComments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeOnComments" ADD CONSTRAINT "LikeOnComments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeOnPosts" ADD CONSTRAINT "LikeOnPosts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeOnPosts" ADD CONSTRAINT "LikeOnPosts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
