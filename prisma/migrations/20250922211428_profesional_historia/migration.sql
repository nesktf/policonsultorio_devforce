/*
  Warnings:

  - Added the required column `id_profesional` to the `HistoriaClinica` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."HistoriaClinica" ADD COLUMN     "id_profesional" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."HistoriaClinica" ADD CONSTRAINT "HistoriaClinica_id_profesional_fkey" FOREIGN KEY ("id_profesional") REFERENCES "public"."Profesional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
