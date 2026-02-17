-- Migration: create_recordatorios_enviados_table
-- Run this in your Supabase SQL editor

-- Table to track sent reminders and avoid duplicates
CREATE TABLE recordatorios_enviados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reserva_id UUID NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    canal VARCHAR(20) NOT NULL DEFAULT 'email',
    destinatario VARCHAR(255) NOT NULL,
    enviado_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    estado VARCHAR(20) NOT NULL DEFAULT 'enviado',
    error_mensaje TEXT,
    intentos INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT tipo_valido CHECK (tipo IN ('confirmacion', 'recordatorio_24h', 'recordatorio_2h', 'feedback')),
    CONSTRAINT canal_valido CHECK (canal IN ('email', 'sms', 'whatsapp')),
    CONSTRAINT estado_valido CHECK (estado IN ('enviado', 'fallido', 'pendiente'))
);

-- Index for efficient querying
CREATE INDEX idx_recordatorios_reserva ON recordatorios_enviados(reserva_id);
CREATE INDEX idx_recordatorios_tipo ON recordatorios_enviados(tipo);
CREATE INDEX idx_recordatorios_enviado_at ON recordatorios_enviados(enviado_at);

-- Unique constraint to prevent duplicate reminders
CREATE UNIQUE INDEX idx_recordatorios_unique ON recordatorios_enviados(reserva_id, tipo, canal);

-- Enable RLS
ALTER TABLE recordatorios_enviados ENABLE ROW LEVEL SECURITY;

-- Policy for service role (API routes)
CREATE POLICY "Service role full access" ON recordatorios_enviados
    FOR ALL 
    USING (true)
    WITH CHECK (true);
