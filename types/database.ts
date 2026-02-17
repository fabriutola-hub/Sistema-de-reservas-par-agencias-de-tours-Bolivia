// Generated TypeScript types for TourReservas Bolivia
// Auto-generated from Supabase schema

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            admin_users: {
                Row: {
                    created_at: string | null
                    email: string
                    id: string
                    role: Database["public"]["Enums"]["rol_admin"] | null
                }
                Insert: {
                    created_at?: string | null
                    email: string
                    id?: string
                    role?: Database["public"]["Enums"]["rol_admin"] | null
                }
                Update: {
                    created_at?: string | null
                    email?: string
                    id?: string
                    role?: Database["public"]["Enums"]["rol_admin"] | null
                }
                Relationships: []
            }
            clientes: {
                Row: {
                    ci: string | null
                    created_at: string | null
                    email: string | null
                    id: string
                    nombre_completo: string
                    telefono: string
                }
                Insert: {
                    ci?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    nombre_completo: string
                    telefono: string
                }
                Update: {
                    ci?: string | null
                    created_at?: string | null
                    email?: string | null
                    id?: string
                    nombre_completo?: string
                    telefono?: string
                }
                Relationships: []
            }
            disponibilidad: {
                Row: {
                    created_at: string | null
                    cupos_disponibles: number
                    fecha: string
                    hora_salida: string | null
                    id: string
                    tour_id: string
                }
                Insert: {
                    created_at?: string | null
                    cupos_disponibles?: number
                    fecha: string
                    hora_salida?: string | null
                    id?: string
                    tour_id: string
                }
                Update: {
                    created_at?: string | null
                    cupos_disponibles?: number
                    fecha?: string
                    hora_salida?: string | null
                    id?: string
                    tour_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "disponibilidad_tour_id_fkey"
                        columns: ["tour_id"]
                        isOneToOne: false
                        referencedRelation: "tours"
                        referencedColumns: ["id"]
                    }
                ]
            }
            recordatorios_enviados: {
                Row: {
                    enviado_at: string | null
                    id: string
                    metodo: Database["public"]["Enums"]["canal_envio"]
                    reserva_id: string
                    tipo: Database["public"]["Enums"]["tipo_recordatorio"]
                }
                Insert: {
                    enviado_at?: string | null
                    id?: string
                    metodo: Database["public"]["Enums"]["canal_envio"]
                    reserva_id: string
                    tipo: Database["public"]["Enums"]["tipo_recordatorio"]
                }
                Update: {
                    enviado_at?: string | null
                    id?: string
                    metodo?: Database["public"]["Enums"]["canal_envio"]
                    reserva_id?: string
                    tipo?: Database["public"]["Enums"]["tipo_recordatorio"]
                }
                Relationships: [
                    {
                        foreignKeyName: "recordatorios_enviados_reserva_id_fkey"
                        columns: ["reserva_id"]
                        isOneToOne: false
                        referencedRelation: "reservas"
                        referencedColumns: ["id"]
                    }
                ]
            }
            reservas: {
                Row: {
                    canal_reserva: string | null
                    cliente_id: string
                    comprobante_url: string | null
                    created_at: string | null
                    estado: Database["public"]["Enums"]["estado_reserva"] | null
                    fecha_tour: string
                    hora_tour: string | null
                    id: string
                    metodo_pago: Database["public"]["Enums"]["metodo_pago"] | null
                    notas: string | null
                    num_personas: number
                    precio_total: number | null
                    tour_id: string
                    updated_at: string | null
                    user_id: string | null
                }
                Insert: {
                    canal_reserva?: string | null
                    cliente_id: string
                    comprobante_url?: string | null
                    created_at?: string | null
                    estado?: Database["public"]["Enums"]["estado_reserva"] | null
                    fecha_tour: string
                    hora_tour?: string | null
                    id?: string
                    metodo_pago?: Database["public"]["Enums"]["metodo_pago"] | null
                    notas?: string | null
                    num_personas: number
                    precio_total?: number | null
                    tour_id: string
                    updated_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    canal_reserva?: string | null
                    cliente_id?: string
                    comprobante_url?: string | null
                    created_at?: string | null
                    estado?: Database["public"]["Enums"]["estado_reserva"] | null
                    fecha_tour?: string
                    hora_tour?: string | null
                    id?: string
                    metodo_pago?: Database["public"]["Enums"]["metodo_pago"] | null
                    notas?: string | null
                    num_personas?: number
                    precio_total?: number | null
                    tour_id?: string
                    updated_at?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "reservas_cliente_id_fkey"
                        columns: ["cliente_id"]
                        isOneToOne: false
                        referencedRelation: "clientes"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "reservas_tour_id_fkey"
                        columns: ["tour_id"]
                        isOneToOne: false
                        referencedRelation: "tours"
                        referencedColumns: ["id"]
                    }
                ]
            }
            tours: {
                Row: {
                    activo: boolean | null
                    created_at: string | null
                    cupo_maximo: number | null
                    descripcion: string | null
                    destino: string | null
                    duracion_horas: number | null
                    galeria: string[] | null
                    id: string
                    imagen_url: string | null
                    incluye: string[] | null
                    itinerario: Json | null
                    nombre: string
                    precio_por_persona: number | null
                }
                Insert: {
                    activo?: boolean | null
                    created_at?: string | null
                    cupo_maximo?: number | null
                    descripcion?: string | null
                    destino?: string | null
                    duracion_horas?: number | null
                    galeria?: string[] | null
                    id?: string
                    imagen_url?: string | null
                    incluye?: string[] | null
                    itinerario?: Json | null
                    nombre: string
                    precio_por_persona?: number | null
                }
                Update: {
                    activo?: boolean | null
                    created_at?: string | null
                    cupo_maximo?: number | null
                    descripcion?: string | null
                    destino?: string | null
                    duracion_horas?: number | null
                    galeria?: string[] | null
                    id?: string
                    imagen_url?: string | null
                    incluye?: string[] | null
                    itinerario?: Json | null
                    nombre?: string
                    precio_por_persona?: number | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            is_admin: { Args: Record<string, never>; Returns: boolean }
        }
        Enums: {
            canal_envio: "email" | "sms" | "whatsapp"
            estado_reserva: "pendiente" | "confirmada" | "pagada" | "cancelada" | "completada"
            metodo_pago: "yape" | "altoke" | "efectivo" | "otro" | "qr"
            rol_admin: "admin" | "staff"
            tipo_recordatorio: "confirmacion" | "24h" | "2h" | "feedback"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Convenient type aliases
export type Tour = Tables<'tours'>
export type TourInsert = TablesInsert<'tours'>
export type TourUpdate = TablesUpdate<'tours'>

export type Disponibilidad = Tables<'disponibilidad'>
export type DisponibilidadInsert = TablesInsert<'disponibilidad'>

export type Cliente = Tables<'clientes'>
export type ClienteInsert = TablesInsert<'clientes'>

export type Reserva = Tables<'reservas'>
export type ReservaInsert = TablesInsert<'reservas'>
export type ReservaUpdate = TablesUpdate<'reservas'>

export type RecordatorioEnviado = Tables<'recordatorios_enviados'>
export type AdminUser = Tables<'admin_users'>

export type EstadoReserva = Enums<'estado_reserva'>
export type MetodoPago = Enums<'metodo_pago'>
export type TipoRecordatorio = Enums<'tipo_recordatorio'>
export type CanalEnvio = Enums<'canal_envio'>
export type RolAdmin = Enums<'rol_admin'>
