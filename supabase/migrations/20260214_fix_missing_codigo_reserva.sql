-- ============================================================
-- MIGRACIÓN: Fix missing codigo_reserva column and triggers
-- Fecha: 2026-02-14
-- Desc: 
-- 1. Agregar columna codigo_reserva si no existe
-- 2. Crear funcion y trigger para generar codigo de reserva
-- 3. Generar codigos para reservas existentes
-- ============================================================

-- 1. Agregar columna codigo_reserva
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reservas' 
        AND column_name = 'codigo_reserva'
    ) THEN
        ALTER TABLE reservas ADD COLUMN codigo_reserva VARCHAR(20) UNIQUE;
    END IF;
END $$;

-- 2. Crear índice
CREATE INDEX IF NOT EXISTS idx_reservas_codigo ON reservas(codigo_reserva);

-- 3. Función para generar código de reserva único (copiado de 001_create_core_tables.sql)
CREATE OR REPLACE FUNCTION generate_codigo_reserva()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT;
  random_part TEXT;
  new_code TEXT;
BEGIN
  IF NEW.codigo_reserva IS NULL THEN
    prefix := 'TR';
    random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));
    new_code := prefix || '-' || random_part;
    
    -- Asegurar unicidad
    WHILE EXISTS (SELECT 1 FROM reservas WHERE codigo_reserva = new_code) LOOP
      random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));
      new_code := prefix || '-' || random_part;
    END LOOP;
    
    NEW.codigo_reserva := new_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Recrear trigger
DROP TRIGGER IF EXISTS generate_reserva_codigo ON reservas;
CREATE TRIGGER generate_reserva_codigo
  BEFORE INSERT ON reservas
  FOR EACH ROW
  EXECUTE FUNCTION generate_codigo_reserva();

-- 5. Generar códigos para reservas existentes que no lo tengan
DO $$
DECLARE
    r RECORD;
    prefix TEXT := 'TR';
    random_part TEXT;
    new_code TEXT;
BEGIN
    FOR r IN SELECT id FROM reservas WHERE codigo_reserva IS NULL LOOP
        -- Generar código único
        LOOP
            random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));
            new_code := prefix || '-' || random_part;
            EXIT WHEN NOT EXISTS (SELECT 1 FROM reservas WHERE codigo_reserva = new_code);
        END LOOP;
        
        -- Actualizar reserva
        UPDATE reservas SET codigo_reserva = new_code WHERE id = r.id;
    END LOOP;
END $$;
