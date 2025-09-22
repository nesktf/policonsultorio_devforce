-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('MESA_ENTRADA', 'PROFESIONAL', 'GERENTE');

-- CreateEnum
CREATE TYPE "public"."EstadoObraSocial" AS ENUM ('ACTIVA', 'INACTIVA');

-- CreateEnum
CREATE TYPE "public"."EstadoTurno" AS ENUM ('CANCELADO', 'CONFIRMADO');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" "public"."Role" NOT NULL DEFAULT 'MESA_ENTRADA',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ObraSocial" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "estado" "public"."EstadoObraSocial" NOT NULL,

    CONSTRAINT "ObraSocial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Profesional" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "dni" VARCHAR(9) NOT NULL,
    "especialidad" TEXT NOT NULL,
    "telefono" VARCHAR(14) NOT NULL,

    CONSTRAINT "Profesional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProfesionalObraSocial" (
    "id" SERIAL NOT NULL,
    "id_obra_social" INTEGER NOT NULL,
    "id_profesional" INTEGER NOT NULL,

    CONSTRAINT "ProfesionalObraSocial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Paciente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" VARCHAR(9) NOT NULL,
    "direccion" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "telefono" VARCHAR(14) NOT NULL,
    "id_obra_social" INTEGER,
    "num_obra_social" TEXT,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HistoriaClinica" (
    "id" SERIAL NOT NULL,
    "id_paciente" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "detalle" TEXT NOT NULL,

    CONSTRAINT "HistoriaClinica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Turno" (
    "id" SERIAL NOT NULL,
    "id_profesional" INTEGER NOT NULL,
    "id_paciente" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "estado" "public"."EstadoTurno" NOT NULL,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."ProfesionalObraSocial" ADD CONSTRAINT "ProfesionalObraSocial_id_profesional_fkey" FOREIGN KEY ("id_profesional") REFERENCES "public"."Profesional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProfesionalObraSocial" ADD CONSTRAINT "ProfesionalObraSocial_id_obra_social_fkey" FOREIGN KEY ("id_obra_social") REFERENCES "public"."ObraSocial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Paciente" ADD CONSTRAINT "Paciente_id_obra_social_fkey" FOREIGN KEY ("id_obra_social") REFERENCES "public"."ObraSocial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistoriaClinica" ADD CONSTRAINT "HistoriaClinica_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "public"."Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Turno" ADD CONSTRAINT "Turno_id_paciente_fkey" FOREIGN KEY ("id_paciente") REFERENCES "public"."Paciente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Turno" ADD CONSTRAINT "Turno_id_profesional_fkey" FOREIGN KEY ("id_profesional") REFERENCES "public"."Profesional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
