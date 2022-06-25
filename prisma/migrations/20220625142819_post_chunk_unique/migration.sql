/*
  Warnings:

  - A unique constraint covering the columns `[postId]` on the table `PostChunk` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PostChunk_postId_key" ON "PostChunk"("postId");
