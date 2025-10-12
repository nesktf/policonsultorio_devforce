DO $$
BEGIN
  -- HistoriaClinica columns
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'HistoriaClinica'
      AND column_name = 'diagnostico'
  ) THEN
    ALTER TABLE "public"."HistoriaClinica" ADD COLUMN "diagnostico" TEXT;
    UPDATE "public"."HistoriaClinica" SET "diagnostico" = '' WHERE "diagnostico" IS NULL;
    ALTER TABLE "public"."HistoriaClinica" ALTER COLUMN "diagnostico" SET NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'HistoriaClinica'
      AND column_name = 'estudios'
  ) THEN
    ALTER TABLE "public"."HistoriaClinica" ADD COLUMN "estudios" JSONB;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'HistoriaClinica'
      AND column_name = 'indicaciones'
  ) THEN
    ALTER TABLE "public"."HistoriaClinica" ADD COLUMN "indicaciones" TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'HistoriaClinica'
      AND column_name = 'medicamentos'
  ) THEN
    ALTER TABLE "public"."HistoriaClinica" ADD COLUMN "medicamentos" JSONB;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'HistoriaClinica'
      AND column_name = 'observaciones'
  ) THEN
    ALTER TABLE "public"."HistoriaClinica" ADD COLUMN "observaciones" TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'HistoriaClinica'
      AND column_name = 'proximo_control'
  ) THEN
    ALTER TABLE "public"."HistoriaClinica" ADD COLUMN "proximo_control" TIMESTAMP(3);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'HistoriaClinica'
      AND column_name = 'tratamiento'
  ) THEN
    ALTER TABLE "public"."HistoriaClinica" ADD COLUMN "tratamiento" TEXT;
  END IF;

  -- Paciente column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Paciente'
      AND column_name = 'antecedentes'
  ) THEN
    ALTER TABLE "public"."Paciente" ADD COLUMN "antecedentes" TEXT;
  END IF;
END;
$$;
