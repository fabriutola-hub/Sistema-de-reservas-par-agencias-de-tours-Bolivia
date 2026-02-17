-- Migration: fix_reservas_fk
-- Adds missing Foreign Key constraint between reservas and disponibilidad

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'reservas_disponibilidad_id_fkey'
    ) THEN
        ALTER TABLE reservas
        ADD CONSTRAINT reservas_disponibilidad_id_fkey
        FOREIGN KEY (disponibilidad_id)
        REFERENCES disponibilidad(id)
        ON DELETE SET NULL;
    END IF;
END $$;
