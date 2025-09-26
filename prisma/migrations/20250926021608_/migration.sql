/*
  Warnings:

  - A unique constraint covering the columns `[dni]` on the table `Paciente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dni]` on the table `Profesional` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Paciente_dni_key" ON "public"."Paciente"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Profesional_dni_key" ON "public"."Profesional"("dni");
