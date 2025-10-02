/*
  Warnings:

  - Added the required column `diagnostico` to the `HistoriaClinica` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."HistoriaClinica" ADD COLUMN     "diagnostico" TEXT NOT NULL,
ADD COLUMN     "estudios" JSONB,
ADD COLUMN     "indicaciones" TEXT,
ADD COLUMN     "medicamentos" JSONB,
ADD COLUMN     "observaciones" TEXT,
ADD COLUMN     "proximo_control" TIMESTAMP(3),
ADD COLUMN     "tratamiento" TEXT;
