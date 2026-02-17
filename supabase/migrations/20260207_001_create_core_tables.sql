-- ============================================================
-- MIGRACIÓN: Tablas principales del sistema de reservas de tours
-- Fecha: 2026-02-07
-- ============================================================

-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM: Estados de reserva
-- ============================================================
CREATE TYPE estado_reserva AS ENUM (
  'pendiente',
  'confirmada', 
  'pagada',
  'cancelada',
  'completada',
  'reembolsada'
);

-- ============================================================
-- ENUM: Métodos de pago
-- ============================================================
CREATE TYPE metodo_pago AS ENUM (
  'efectivo',
  'transferencia',
  'qr',
  'tarjeta'
);

-- ============================================================
-- TABLA: tours
-- Almacena la información de los tours disponibles
-- ============================================================
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  destino VARCHAR(255) NOT NULL,
  duracion_horas DECIMAL(5,2) NOT NULL CHECK (duracion_horas > 0),
  precio_por_persona DECIMAL(10,2) NOT NULL CHECK (precio_por_persona >= 0),
  imagen_url TEXT,
  punto_encuentro TEXT,
  incluye TEXT[] DEFAULT '{}',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para tours
CREATE INDEX idx_tours_destino ON tours(destino);
CREATE INDEX idx_tours_activo ON tours(activo);
CREATE INDEX idx_tours_nombre ON tours USING gin(to_tsvector('spanish', nombre));
CREATE INDEX idx_tours_precio ON tours(precio_por_persona);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tours_updated_at
  BEFORE UPDATE ON tours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLA: disponibilidad
-- Define los horarios y cupos disponibles para cada tour
-- ============================================================
CREATE TABLE disponibilidad (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  hora_salida TIME NOT NULL,
  cupos_disponibles INTEGER NOT NULL CHECK (cupos_disponibles >= 0),
  cupos_totales INTEGER NOT NULL CHECK (cupos_totales > 0),
  precio_especial DECIMAL(10,2), -- Precio especial para esta fecha si aplica
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Restricción única: un tour solo puede tener una disponibilidad por fecha/hora
  CONSTRAINT unique_tour_fecha_hora UNIQUE (tour_id, fecha, hora_salida)
);

-- Índices para disponibilidad
CREATE INDEX idx_disponibilidad_tour ON disponibilidad(tour_id);
CREATE INDEX idx_disponibilidad_fecha ON disponibilidad(fecha);
CREATE INDEX idx_disponibilidad_tour_fecha ON disponibilidad(tour_id, fecha);
CREATE INDEX idx_disponibilidad_cupos ON disponibilidad(cupos_disponibles) WHERE cupos_disponibles > 0;
CREATE INDEX idx_disponibilidad_fecha_futura ON disponibilidad(fecha) WHERE fecha >= CURRENT_DATE;

CREATE TRIGGER update_disponibilidad_updated_at
  BEFORE UPDATE ON disponibilidad
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLA: clientes
-- Almacena la información de los clientes
-- ============================================================
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(50),
  ci VARCHAR(50), -- Cédula de Identidad
  nacionalidad VARCHAR(100) DEFAULT 'Bolivia',
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para clientes
CREATE INDEX idx_clientes_email ON clientes(email) WHERE email IS NOT NULL;
CREATE INDEX idx_clientes_telefono ON clientes(telefono) WHERE telefono IS NOT NULL;
CREATE INDEX idx_clientes_ci ON clientes(ci) WHERE ci IS NOT NULL;
CREATE INDEX idx_clientes_nombre ON clientes USING gin(to_tsvector('spanish', nombre_completo));

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TABLA: reservas
-- Almacena las reservas realizadas
-- ============================================================
CREATE TABLE reservas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE RESTRICT,
  disponibilidad_id UUID REFERENCES disponibilidad(id) ON DELETE SET NULL,
  fecha_tour DATE NOT NULL,
  hora_tour TIME,
  num_personas INTEGER NOT NULL CHECK (num_personas > 0),
  precio_total DECIMAL(10,2) NOT NULL CHECK (precio_total >= 0),
  estado estado_reserva DEFAULT 'pendiente',
  metodo_pago metodo_pago,
  comprobante_url TEXT,
  notas TEXT,
  codigo_reserva VARCHAR(20) UNIQUE, -- Código legible para el cliente
  fecha_pago TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para reservas
CREATE INDEX idx_reservas_cliente ON reservas(cliente_id);
CREATE INDEX idx_reservas_tour ON reservas(tour_id);
CREATE INDEX idx_reservas_disponibilidad ON reservas(disponibilidad_id);
CREATE INDEX idx_reservas_fecha ON reservas(fecha_tour);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_reservas_codigo ON reservas(codigo_reserva);
CREATE INDEX idx_reservas_created ON reservas(created_at DESC);
CREATE INDEX idx_reservas_pendientes ON reservas(fecha_tour, estado) WHERE estado = 'pendiente';
CREATE INDEX idx_reservas_confirmadas ON reservas(fecha_tour) WHERE estado IN ('confirmada', 'pagada');

CREATE TRIGGER update_reservas_updated_at
  BEFORE UPDATE ON reservas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para generar código de reserva único
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

CREATE TRIGGER generate_reserva_codigo
  BEFORE INSERT ON reservas
  FOR EACH ROW
  EXECUTE FUNCTION generate_codigo_reserva();

-- ============================================================
-- TABLA: configuracion
-- Almacena configuraciones clave-valor de la agencia
-- ============================================================
CREATE TABLE configuracion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT,
  descripcion TEXT,
  tipo VARCHAR(50) DEFAULT 'text', -- text, number, boolean, json
  categoria VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para configuración
CREATE INDEX idx_configuracion_clave ON configuracion(clave);
CREATE INDEX idx_configuracion_categoria ON configuracion(categoria);

CREATE TRIGGER update_configuracion_updated_at
  BEFORE UPDATE ON configuracion
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar configuraciones iniciales
INSERT INTO configuracion (clave, valor, descripcion, tipo, categoria) VALUES
  ('nombre_agencia', 'Tour Bolivia', 'Nombre de la agencia de viajes', 'text', 'general'),
  ('telefono_contacto', '+591 70000000', 'Teléfono principal de contacto', 'text', 'contacto'),
  ('email_contacto', 'info@tourbolivia.com', 'Email principal de contacto', 'text', 'contacto'),
  ('whatsapp', '+591 70000000', 'Número de WhatsApp para reservas', 'text', 'contacto'),
  ('direccion', 'La Paz, Bolivia', 'Dirección física de la agencia', 'text', 'contacto'),
  ('moneda', 'BOB', 'Moneda principal (BOB, USD)', 'text', 'pagos'),
  ('porcentaje_anticipo', '50', 'Porcentaje requerido como anticipo', 'number', 'pagos'),
  ('mensaje_confirmacion', 'Gracias por su reserva. Le contactaremos pronto para confirmar los detalles.', 'Mensaje mostrado al confirmar reserva', 'text', 'mensajes'),
  ('horario_atencion', '08:00 - 20:00', 'Horario de atención al cliente', 'text', 'general'),
  ('politica_cancelacion', 'Cancelación gratuita hasta 24 horas antes del tour.', 'Política de cancelación', 'text', 'politicas');

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS PARA TOURS
-- ============================================================

-- Tours activos son visibles públicamente
CREATE POLICY "Tours activos son visibles públicamente"
  ON tours FOR SELECT
  USING (activo = true);

-- Usuarios autenticados pueden ver todos los tours
CREATE POLICY "Usuarios autenticados ven todos los tours"
  ON tours FOR SELECT
  TO authenticated
  USING (true);

-- Solo usuarios autenticados pueden insertar tours
CREATE POLICY "Usuarios autenticados pueden insertar tours"
  ON tours FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Solo usuarios autenticados pueden actualizar tours
CREATE POLICY "Usuarios autenticados pueden actualizar tours"
  ON tours FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Solo usuarios autenticados pueden eliminar tours
CREATE POLICY "Usuarios autenticados pueden eliminar tours"
  ON tours FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- POLÍTICAS PARA DISPONIBILIDAD
-- ============================================================

-- Disponibilidad de tours activos es visible públicamente
CREATE POLICY "Disponibilidad publica visible"
  ON disponibilidad FOR SELECT
  USING (
    activo = true 
    AND fecha >= CURRENT_DATE
    AND EXISTS (SELECT 1 FROM tours WHERE tours.id = disponibilidad.tour_id AND tours.activo = true)
  );

-- Usuarios autenticados pueden ver toda la disponibilidad
CREATE POLICY "Usuarios autenticados ven toda disponibilidad"
  ON disponibilidad FOR SELECT
  TO authenticated
  USING (true);

-- Solo usuarios autenticados pueden gestionar disponibilidad
CREATE POLICY "Usuarios autenticados gestionan disponibilidad"
  ON disponibilidad FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- POLÍTICAS PARA CLIENTES
-- ============================================================

-- Solo usuarios autenticados pueden ver clientes
CREATE POLICY "Solo autenticados ven clientes"
  ON clientes FOR SELECT
  TO authenticated
  USING (true);

-- Anónimos pueden insertar clientes (para reservas públicas)
CREATE POLICY "Cualquiera puede insertar clientes"
  ON clientes FOR INSERT
  WITH CHECK (true);

-- Solo usuarios autenticados pueden actualizar clientes
CREATE POLICY "Autenticados actualizan clientes"
  ON clientes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Solo usuarios autenticados pueden eliminar clientes
CREATE POLICY "Autenticados eliminan clientes"
  ON clientes FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- POLÍTICAS PARA RESERVAS
-- ============================================================

-- Usuarios autenticados pueden ver todas las reservas
CREATE POLICY "Autenticados ven todas las reservas"
  ON reservas FOR SELECT
  TO authenticated
  USING (true);

-- Cualquiera puede crear reservas (formulario público)
CREATE POLICY "Cualquiera puede crear reservas"
  ON reservas FOR INSERT
  WITH CHECK (true);

-- Solo usuarios autenticados pueden actualizar reservas
CREATE POLICY "Autenticados actualizan reservas"
  ON reservas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Solo usuarios autenticados pueden eliminar reservas
CREATE POLICY "Autenticados eliminan reservas"
  ON reservas FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- POLÍTICAS PARA CONFIGURACIÓN
-- ============================================================

-- Configuración pública puede ser leída por todos
CREATE POLICY "Configuracion publica visible"
  ON configuracion FOR SELECT
  USING (categoria IN ('general', 'contacto', 'mensajes'));

-- Usuarios autenticados pueden ver toda la configuración
CREATE POLICY "Autenticados ven toda configuracion"
  ON configuracion FOR SELECT
  TO authenticated
  USING (true);

-- Solo usuarios autenticados pueden modificar configuración
CREATE POLICY "Autenticados modifican configuracion"
  ON configuracion FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- FUNCIÓN HELPER: Actualizar cupos al crear reserva
-- ============================================================
CREATE OR REPLACE FUNCTION actualizar_cupos_reserva()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.disponibilidad_id IS NOT NULL THEN
    -- Reducir cupos disponibles
    UPDATE disponibilidad 
    SET cupos_disponibles = cupos_disponibles - NEW.num_personas
    WHERE id = NEW.disponibilidad_id
    AND cupos_disponibles >= NEW.num_personas;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'No hay suficientes cupos disponibles';
    END IF;
  ELSIF TG_OP = 'UPDATE' AND OLD.estado != 'cancelada' AND NEW.estado = 'cancelada' THEN
    -- Restaurar cupos si se cancela
    IF NEW.disponibilidad_id IS NOT NULL THEN
      UPDATE disponibilidad 
      SET cupos_disponibles = cupos_disponibles + NEW.num_personas
      WHERE id = NEW.disponibilidad_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_cupos
  AFTER INSERT OR UPDATE ON reservas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_cupos_reserva();

-- ============================================================
-- VISTAS ÚTILES
-- ============================================================

-- Vista: Resumen de reservas por tour
CREATE OR REPLACE VIEW vista_reservas_resumen AS
SELECT 
  t.id AS tour_id,
  t.nombre AS tour_nombre,
  r.fecha_tour,
  COUNT(r.id) AS total_reservas,
  SUM(r.num_personas) AS total_personas,
  SUM(r.precio_total) AS total_ingresos,
  COUNT(CASE WHEN r.estado = 'pendiente' THEN 1 END) AS pendientes,
  COUNT(CASE WHEN r.estado = 'confirmada' THEN 1 END) AS confirmadas,
  COUNT(CASE WHEN r.estado = 'pagada' THEN 1 END) AS pagadas,
  COUNT(CASE WHEN r.estado = 'cancelada' THEN 1 END) AS canceladas
FROM tours t
LEFT JOIN reservas r ON t.id = r.tour_id
GROUP BY t.id, t.nombre, r.fecha_tour
ORDER BY r.fecha_tour DESC;

-- Vista: Tours con disponibilidad actual
CREATE OR REPLACE VIEW vista_tours_disponibles AS
SELECT 
  t.*,
  d.id AS disponibilidad_id,
  d.fecha,
  d.hora_salida,
  d.cupos_disponibles,
  d.cupos_totales,
  COALESCE(d.precio_especial, t.precio_por_persona) AS precio_final
FROM tours t
INNER JOIN disponibilidad d ON t.id = d.tour_id
WHERE t.activo = true 
  AND d.activo = true
  AND d.fecha >= CURRENT_DATE
  AND d.cupos_disponibles > 0
ORDER BY d.fecha, d.hora_salida;

-- ============================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ============================================================
COMMENT ON TABLE tours IS 'Catálogo de tours disponibles';
COMMENT ON TABLE disponibilidad IS 'Fechas y horarios disponibles para cada tour';
COMMENT ON TABLE clientes IS 'Registro de clientes que han realizado reservas';
COMMENT ON TABLE reservas IS 'Reservas realizadas por los clientes';
COMMENT ON TABLE configuracion IS 'Configuraciones generales de la agencia';

COMMENT ON COLUMN reservas.estado IS 'Estados: pendiente, confirmada, pagada, cancelada, completada, reembolsada';
COMMENT ON COLUMN reservas.metodo_pago IS 'Métodos: efectivo, transferencia, qr, tarjeta';
COMMENT ON COLUMN tours.incluye IS 'Array de servicios incluidos en el tour';
COMMENT ON COLUMN disponibilidad.precio_especial IS 'Precio especial para fechas específicas (promociones, temporada alta)';
