# Sistema de Reservas para Agencias de Tours - Bolivia

## Descripción

Sistema web completo de reservas diseñado para agencias de tours en Bolivia. Permite a los clientes explorar y reservar tours online, realizar pagos mediante códigos QR (Yape, Altoke, Banco), y r[...]

## Características Principales

### Para Clientes
- **Catálogo de Tours**: Navegación intuitiva con disponibilidad en tiempo real
- **Reservas Online**: Sistema de reservas con selección de fechas y número de personas
- **Pago por QR**: Soporte para Yape, Altoke y transferencias bancarias
- **Upload de Comprobantes**: Los clientes pueden subir sus comprobantes de pago directamente
- **Recordatorios Automáticos**: Notificaciones por email 24 horas y 2 horas antes del tour
- **Sistema de Reseñas**: Los clientes pueden calificar y reseñar los tours realizados

### Para Administradores
- **Gestión de Tours**: Crear, editar y administrar tours con imágenes y disponibilidad
- **Gestión de Reservas**: Ver, confirmar y actualizar el estado de las reservas
- **Gestión de Clientes**: Base de datos de clientes con historial de reservas
- **Reportes**: Dashboard con estadísticas de ventas, tours más populares y análisis de ingresos
- **Gestión de Comprobantes**: Visualizar y validar comprobantes de pago subidos por clientes
- **Configuración de Pagos**: Administrar métodos de pago y códigos QR

## Stack Tecnológico

- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Base de Datos**: Supabase (PostgreSQL + Authentication + Storage)
- **Estilos**: Tailwind CSS 4
- **Notificaciones**: 
  - Resend (emails)
  - Twilio (SMS - opcional)
- **Deploy**: Vercel

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18 o superior
- Una cuenta en [Supabase](https://supabase.com)
- Una cuenta en [Resend](https://resend.com) para envío de emails
- (Opcional) Una cuenta en [Twilio](https://twilio.com) para envío de SMS

## Instalación Rápida

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd tour-reservas-bolivia
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus credenciales:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales reales. Ver el archivo `.env.example` para más detalles sobre cada variable.

### 4. Configurar Base de Datos

Sigue las instrucciones detalladas en [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) para:
- Crear las tablas necesarias
- Configurar Row Level Security (RLS)
- Crear los buckets de Storage
- Configurar las políticas de acceso

### 5. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Despliegue a Producción

### Despliegue en Vercel (Recomendado)

1. **Conecta tu repositorio a Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Next.js

2. **Configura las Variables de Entorno**:
   - En el dashboard de Vercel, ve a Settings → Environment Variables
   - Agrega todas las variables de tu archivo `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `RESEND_API_KEY`
     - `FROM_EMAIL`
     - `CRON_SECRET`
     - `NEXT_PUBLIC_SITE_URL`
     - (Opcional) Variables de Twilio si usas SMS

3. **Despliega**:
   - Haz clic en "Deploy"
   - Vercel construirá y desplegará automáticamente tu aplicación

4. **Configura Cron Jobs (Recordatorios Automáticos)**:
   - Vercel ejecutará automáticamente los cron jobs definidos en `vercel.json`
   - Asegúrate de que `CRON_SECRET` esté configurado correctamente
   - Los recordatorios se ejecutarán cada hora

5. **Actualiza la URL del Sitio**:
   - Una vez desplegado, actualiza `NEXT_PUBLIC_SITE_URL` con tu dominio de producción
   - Actualiza también esta URL en la configuración de Supabase:
     - Ve a Authentication → URL Configuration
     - Agrega tu dominio de producción a las URLs permitidas

### Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build de producción (para probar localmente)
npm run build
npm run start

# Linting
npm run lint
```

## Estructura del Proyecto

```
tour-reservas-bolivia/
├── app/                    # App Router de Next.js
│   ├── (admin)/           # Rutas protegidas del panel admin
│   ├── (public)/          # Rutas públicas (catálogo, reservas)
│   ├── api/               # API Routes (webhooks, cron jobs)
│   └── auth/              # Rutas de autenticación
├── components/            # Componentes React reutilizables
│   ├── admin/            # Componentes específicos del admin
│   └── ui/               # Componentes de UI base
├── lib/                   # Utilidades y configuraciones
│   ├── supabase/         # Cliente de Supabase
│   ├── email/            # Servicios de email (Resend)
│   └── utils/            # Funciones de utilidad
├── supabase/              # Migraciones y configuración de Supabase
│   └── migrations/       # Scripts SQL de migración
├── types/                 # Definiciones de tipos TypeScript compartidos
├── public/                # Archivos estáticos
└── scripts/               # Scripts de utilidad
```

### Carpetas Principales

- **`app/`**: Contiene todas las rutas de la aplicación usando el App Router de Next.js 16
- **`components/`**: Componentes React organizados por funcionalidad
- **`lib/`**: Lógica de negocio, configuraciones y servicios externos
- **`supabase/migrations/`**: Scripts SQL para crear y actualizar la base de datos
- **`types/`**: Definiciones de tipos TypeScript compartidos

## Documentación Adicional

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**: Guía completa para configurar la base de datos, tablas, RLS policies y buckets de Storage en Supabase
- **[.env.example](./.env.example)**: Plantilla con todas las variables de entorno necesarias y su descripción

## Características Técnicas

### Seguridad
- Autenticación mediante Supabase Auth
- Row Level Security (RLS) en todas las tablas
- Políticas de acceso granulares para admin y clientes
- Validación de roles en middleware

### Notificaciones Automáticas
- Cron jobs que se ejecutan cada hora para verificar reservas próximas
- Emails automáticos 24h y 2h antes del tour
- Template de emails personalizados con información del tour

### Almacenamiento
- Bucket seguro para comprobantes de pago
- Bucket público para imágenes de tours
- Políticas RLS para control de acceso

## Soporte

Para preguntas o problemas relacionados con el sistema, contacta al equipo de desarrollo.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Para más detalles, consulta el archivo `LICENSE` en la raíz del repositorio.

---

Desarrollado con ❤️ para agencias de tours en Bolivia
