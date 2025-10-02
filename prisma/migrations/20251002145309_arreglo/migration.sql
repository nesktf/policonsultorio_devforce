/*
  Warnings:

  - The `userId` column on the `Profesional` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "public"."Profesional" DROP CONSTRAINT "Profesional_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Profesional" DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "public"."User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Profesional_userId_key" ON "public"."Profesional"("userId");

-- AddForeignKey
ALTER TABLE "public"."Profesional" ADD CONSTRAINT "Profesional_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
