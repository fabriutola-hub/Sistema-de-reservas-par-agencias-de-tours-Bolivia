-- Migration: add_disponibilidad_column
-- Adds missing disponibilidad_id column and Foreign Key constraint

DO $$
BEGIN
    -- Add column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservas' AND column_name = 'disponibilidad_id'
    ) THEN
        ALTER TABLE reservas
        ADD COLUMN disponibilidad_id UUID REFERENCES disponibilidad(id) ON DELETE SET NULL;
    END IF;

    -- Add index for the new column
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE tablename = 'reservas' AND indexname = 'idx_reservas_disponibilidad'
    ) THEN
        CREATE INDEX idx_reservas_disponibilidad ON reservas(disponibilidad_id);
    END IF;
END $$;
