-- Drop default constraint if exists
ALTER TABLE "Turno" ALTER COLUMN "estado" DROP DEFAULT;

-- Create new enum with desired values
CREATE TYPE "EstadoTurno_new" AS ENUM ('PROGRAMADO', 'ASISTIO', 'NO_ASISTIO', 'CANCELADO');

-- Update existing values and change column type
ALTER TABLE "Turno"
  ALTER COLUMN "estado" TYPE "EstadoTurno_new"
  USING (
    CASE "estado"
      WHEN 'CONFIRMADO' THEN 'PROGRAMADO'
      WHEN 'CANCELADO' THEN 'CANCELADO'
      ELSE 'PROGRAMADO'
    END::"EstadoTurno_new"
  );

-- Replace old enum type
DROP TYPE "EstadoTurno";
ALTER TYPE "EstadoTurno_new" RENAME TO "EstadoTurno";

-- Set default value for new state
ALTER TABLE "Turno" ALTER COLUMN "estado" SET DEFAULT 'PROGRAMADO';
