CREATE TYPE "public"."CancelacionOrigen" AS ENUM ('PACIENTE', 'PROFESIONAL');

CREATE TABLE "public"."TurnoCancelacionLog" (
    "id" SERIAL NOT NULL,
    "turnoId" INTEGER NOT NULL,
    "canceladoPorId" INTEGER,
    "solicitadoPor" "public"."CancelacionOrigen" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TurnoCancelacionLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TurnoCancelacionLog_turnoId_key" ON "public"."TurnoCancelacionLog"("turnoId");

ALTER TABLE "public"."TurnoCancelacionLog"
  ADD CONSTRAINT "TurnoCancelacionLog_turnoId_fkey"
  FOREIGN KEY ("turnoId") REFERENCES "public"."Turno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."TurnoCancelacionLog"
  ADD CONSTRAINT "TurnoCancelacionLog_canceladoPorId_fkey"
  FOREIGN KEY ("canceladoPorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
