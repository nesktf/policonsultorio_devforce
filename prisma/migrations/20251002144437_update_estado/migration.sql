/*
  Warnings:

  - The values [CONFIRMADO] on the enum `EstadoTurno` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Profesional` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."EstadoTurno_new" AS ENUM ('PROGRAMADO', 'EN_SALA_ESPERA', 'ASISTIO', 'NO_ASISTIO', 'CANCELADO');
ALTER TABLE "public"."Turno" ALTER COLUMN "estado" TYPE "public"."EstadoTurno_new" USING ("estado"::text::"public"."EstadoTurno_new");
ALTER TYPE "public"."EstadoTurno" RENAME TO "EstadoTurno_old";
ALTER TYPE "public"."EstadoTurno_new" RENAME TO "EstadoTurno";
DROP TYPE "public"."EstadoTurno_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."HistoriaClinica" ADD COLUMN     "examen_fisico" TEXT,
ADD COLUMN     "signos_vitales" JSONB;

-- AlterTable
ALTER TABLE "public"."Paciente" ADD COLUMN     "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Profesional" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "public"."Turno" ADD COLUMN     "duracion_minutos" INTEGER NOT NULL DEFAULT 30;

-- CreateIndex
CREATE UNIQUE INDEX "Profesional_userId_key" ON "public"."Profesional"("userId");

-- AddForeignKey
ALTER TABLE "public"."Profesional" ADD CONSTRAINT "Profesional_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
