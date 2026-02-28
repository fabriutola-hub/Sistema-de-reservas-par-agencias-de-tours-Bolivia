# Guía de Administrador - Sistema de Reservas de Tours

Bienvenido al manual de usuario para administradores del Sistema de Reservas. Esta guía te ayudará a gestionar todos los aspectos de tu agencia de tours de manera eficiente.

---

## 📋 Índice

1. [Acceso al Panel](#acceso-al-panel)
2. [Dashboard Principal](#dashboard-principal)
3. [Gestión de Tours](#gestión-de-tours)
4. [Gestión de Disponibilidad](#gestión-de-disponibilidad)
5. [Gestión de Reservas](#gestión-de-reservas)
6. [Gestión de Clientes](#gestión-de-clientes)
7. [Reportes](#reportes)
8. [Recordatorios](#recordatorios)
9. [Configuración](#configuración)

---

## Acceso al Panel

### ¿Cómo ingreso al sistema?

1. Abre tu navegador web (Chrome, Firefox, Safari, etc.)
2. Ingresa a la dirección: **tu-sitio.com/admin/login**
3. Introduce tus credenciales:
   - **Email**: tu correo de administrador
   - **Contraseña**: tu contraseña segura
4. Haz click en el botón **"Iniciar Sesión"**

### ¿Olvidaste tu contraseña?

Si olvidaste tu contraseña, contacta al administrador principal del sistema o al equipo técnico que configuró el sistema para que te ayuden a resetearla desde Supabase.

### Seguridad

- **Nunca compartas** tus credenciales de administrador
- Cierra sesión cuando termines de trabajar
- Usa una contraseña segura (mínimo 8 caracteres, con números y símbolos)

---

## Dashboard Principal

El Dashboard es la pantalla principal que verás al iniciar sesión. Aquí encontrarás:

### Métricas Clave

En la parte superior verás tarjetas con información importante:

- **Total de Reservas**: Número total de reservas en el sistema
- **Ingresos Totales**: Suma de todos los pagos confirmados (en bolivianos)
- **Reservas Pendientes**: Reservas que esperan confirmación de pago
- **Próximos Tours**: Tours programados para los próximos días

**Ejemplo**: Si ves "15 Reservas Pendientes", significa que hay 15 clientes esperando que confirmes su pago.

### Gráfico de Reservas

Encontrarás un gráfico de barras que muestra:
- Reservas por mes del año actual
- Te ayuda a identificar temporadas altas y bajas

**Cómo usarlo**: Observa los meses con más reservas para planificar mejor tu disponibilidad y promociones.

### Acciones Rápidas

Botones que te llevan directamente a las secciones más usadas:
- **Nuevo Tour**: Crear un tour nuevo
- **Nueva Reserva**: Registrar una reserva manual
- **Ver Reservas Pendientes**: Revisar pagos por confirmar
- **Reportes**: Generar informes

---

## Gestión de Tours

Aquí gestionas todos los tours que ofrece tu agencia.

### Ver Lista de Tours

1. Haz click en **"Tours"** en el menú lateral
2. Verás una tabla con todos tus tours:
   - Nombre del tour
   - Duración (días)
   - Precio
   - Estado (Activo/Inactivo)
   - Acciones disponibles

### Crear un Nuevo Tour

**Paso a paso:**

1. Click en el botón **"+ Nuevo Tour"** (esquina superior derecha)
2. Completa el formulario con la siguiente información:

   **a) Información Básica:**
   - **Nombre del Tour**: Ej. "Salar de Uyuni 3 Días 2 Noches"
   - **Descripción**: Describe el tour de manera atractiva para tus clientes
   - **Duración**: Número de días (Ej. 3)
   - **Precio**: Monto en bolivianos (Ej. 850)

   **b) Detalles del Tour:**
   - **Incluye**: Marca los servicios incluidos (transporte, hospedaje, comidas, guía, etc.)
   - **No Incluye**: Marca lo que NO está incluido (bebidas, propinas, etc.)
   - **Itinerario**: Describe día por día qué harán (Día 1: ..., Día 2: ..., etc.)

   **c) Imágenes:**
   - **URL de la imagen**: Pega el enlace de una foto del tour
   - Usa imágenes de buena calidad (mínimo 800x600 píxeles)

   **d) Configuración:**
   - **Capacidad Máxima**: Número máximo de personas por tour (Ej. 6)
   - **Estado**: Activo (visible para clientes) o Inactivo (oculto)

3. Click en **"Guardar Tour"**

**Ejemplo práctico:**
```
Nombre: Tour al Salar de Uyuni
Descripción: Descubre el desierto de sal más grande del mundo...
Duración: 3 días
Precio: 850 Bs
Capacidad: 6 personas
```

### Editar un Tour Existente

1. En la lista de tours, busca el tour que quieres modificar
2. Click en el botón **"Editar"** (ícono de lápiz)
3. Modifica los campos que necesites
4. Click en **"Guardar Cambios"**

**Cuándo editar:**
- Cambiar el precio por temporada
- Actualizar la descripción o itinerario
- Modificar servicios incluidos
- Cambiar imágenes

### Activar/Desactivar un Tour

Si quieres que un tour deje de aparecer temporalmente (sin borrarlo):

1. Edita el tour
2. Cambia el **Estado** a "Inactivo"
3. Guarda los cambios

**Nota**: Los tours inactivos no se mostrarán en la página de reservas para clientes, pero conservas toda su información.

### Eliminar un Tour

**⚠️ Precaución**: Solo elimina tours si estás completamente seguro. No se puede deshacer.

1. En la lista de tours, encuentra el tour a eliminar
2. Click en el botón **"Eliminar"** (ícono de basura)
3. Confirma la eliminación en el mensaje que aparece

**Importante**: No puedes eliminar tours que tienen reservas activas.

---

## Gestión de Disponibilidad

Aquí controlas en qué fechas están disponibles tus tours.

### ¿Qué es la disponibilidad?

Son las fechas específicas en las que ofreces un tour, con cupos limitados.

**Ejemplo**: Si el "Tour Salar de Uyuni" tiene capacidad de 6 personas, puedes crear disponibilidad para el 20 de marzo con 6 espacios.

### Ver Disponibilidad de un Tour

1. Ve a **"Tours"** → **"Disponibilidad"** en el menú
2. Selecciona el tour del menú desplegable
3. Verás un calendario con las fechas disponibles
4. Cada fecha muestra:
   - Cupos totales
   - Cupos reservados
   - Cupos disponibles

### Agregar una Fecha Individual

**Paso a paso:**

1. Click en **"+ Agregar Fecha"**
2. Completa el formulario:
   - **Tour**: Selecciona el tour
   - **Fecha de Inicio**: Día en que comienza el tour
   - **Espacios Disponibles**: Número de cupos (máximo: capacidad del tour)
3. Click en **"Guardar"**

**Ejemplo:**
```
Tour: Salar de Uyuni 3 días
Fecha: 15 de Abril, 2026
Espacios: 6
```

### Crear Disponibilidad Masiva

Si ofreces el mismo tour varias veces al mes, usa esta función para ahorrar tiempo:

1. Click en **"Disponibilidad Masiva"**
2. Completa el formulario:
   - **Tour**: Elige el tour
   - **Fecha de Inicio**: Primer día del rango
   - **Fecha de Fin**: Último día del rango
   - **Días de la semana**: Marca los días (Lunes, Miércoles, Viernes, etc.)
   - **Espacios por fecha**: Cupos para cada fecha

3. Click en **"Generar Disponibilidad"**

**Ejemplo práctico:**
```
Tour: City Tour La Paz
Desde: 1 de Mayo, 2026
Hasta: 31 de Mayo, 2026
Días: Martes y Sábado
Espacios: 12 por fecha
```

Esto creará automáticamente disponibilidad todos los martes y sábados de mayo con 12 espacios cada uno.

### Editar Disponibilidad

1. En la lista de disponibilidad, busca la fecha
2. Click en **"Editar"**
3. Modifica los espacios disponibles si necesitas
4. Guarda los cambios

**Cuándo usar**: Si necesitas aumentar o reducir cupos para una fecha específica.

### Cancelar una Fecha

Si necesitas cancelar una salida:

1. Encuentra la fecha en la lista
2. Click en **"Eliminar"**
3. Confirma la acción

**⚠️ Importante**: Si ya hay reservas para esa fecha, deberás cancelarlas primero o contactar a los clientes.

---

## Gestión de Reservas

El corazón del sistema. Aquí manejas todas las reservas de tus clientes.

### Estados de Reserva

Cada reserva pasa por diferentes estados:

| Estado | Significado | Qué hacer |
|--------|-------------|-----------|
| **Pendiente** | El cliente hizo la reserva pero aún no confirmaste el pago | Revisar el comprobante de pago |
| **Confirmada** | Verificaste el pago | Enviar recordatorios y preparar el tour |
| **Pagada** | Confirmación final (opcional, similar a Confirmada) | Tour listo para realizarse |
| **Cancelada** | La reserva fue cancelada | Liberar los espacios |
| **Completada** | El tour ya se realizó | Archivar para reportes |

### Ver Todas las Reservas

1. Click en **"Reservas"** en el menú lateral
2. Verás una tabla con:
   - Código de reserva
   - Cliente
   - Tour
   - Fecha
   - Número de personas
   - Total
   - Estado
   - Acciones

### Filtrar Reservas

Usa los filtros para encontrar reservas específicas:

- **Por Estado**: Pendiente, Confirmada, etc.
- **Por Tour**: Nombre del tour
- **Por Fecha**: Rango de fechas
- **Por Cliente**: Buscar por nombre o email

**Ejemplo**: Para ver solo las reservas pendientes de pago, selecciona "Pendiente" en el filtro de estado.

### Ver Detalles de una Reserva

1. Click en el **código de reserva** o en el botón **"Ver"**
2. Verás una ventana con toda la información:
   - Datos del cliente (nombre, email, teléfono)
   - Tour reservado
   - Fecha y número de personas
   - Total a pagar
   - Comprobante de pago (si lo subieron)
   - Notas especiales del cliente

### Verificar un Pago

**Este es un proceso muy importante:**

1. Ve a **"Reservas"** → filtra por **"Pendiente"**
2. Click en una reserva pendiente
3. En la sección **"Comprobante de Pago"**:
   - Click en **"Ver comprobante"** para abrir la imagen
   - Verifica que el monto coincida con el total
   - Verifica la fecha del pago
   - Confirma que los datos bancarios sean correctos

4. Si el pago es correcto:
   - Click en **"Cambiar Estado"**
   - Selecciona **"Pagada"** o **"Confirmada"**
   - Click en **"Guardar"**

5. Si el pago NO es correcto:
   - Contacta al cliente por email o WhatsApp
   - Explica el problema (monto incorrecto, comprobante ilegible, etc.)
   - NO cambies el estado hasta que se resuelva

**Ejemplo de verificación:**
```
Reserva: #R001234
Total: 850 Bs
Comprobante muestra: 850 Bs pagados el 10/04/2026
✓ Aprobado → Cambiar a "Pagada"
```

### Crear una Reserva Manual

Si un cliente te contacta por teléfono o en persona:

1. Click en **"+ Nueva Reserva"**
2. Completa el formulario:

   **a) Seleccionar Tour:**
   - Elige el tour
   - Elige la fecha disponible
   
   **b) Datos del Cliente:**
   - Busca si el cliente ya existe (por email)
   - Si es nuevo, completa: Nombre, Email, Teléfono, Documento
   
   **c) Detalles de la Reserva:**
   - Número de personas
   - Notas especiales (alergias, preferencias, etc.)
   - Método de pago
   
   **d) Estado:**
   - Si ya pagó en efectivo: "Pagada"
   - Si pagará después: "Pendiente"

3. Click en **"Crear Reserva"**

### Cancelar una Reserva

1. Abre la reserva
2. Click en **"Cambiar Estado"** → **"Cancelada"**
3. Confirma la acción

**Nota importante**: Al cancelar una reserva, los espacios se liberan automáticamente para esa fecha.

### Contactar al Cliente

Desde la vista de detalle de una reserva:
- El **email** y **teléfono** del cliente son clicables
- Click en el email para abrir tu programa de correo
- Click en el teléfono para abrir WhatsApp (si tienes la app instalada)

---

## Gestión de Clientes

Mantén un registro de todos tus clientes.

### Ver Lista de Clientes

1. Click en **"Clientes"** en el menú
2. Verás una tabla con:
   - Nombre completo
   - Email
   - Teléfono
   - Número de reservas realizadas
   - Acciones

### Buscar un Cliente

Usa la barra de búsqueda en la parte superior:
- Busca por nombre, email o teléfono
- Los resultados se filtran automáticamente mientras escribes

**Ejemplo**: Escribe "María" y verás todos los clientes con ese nombre.

### Ver Historial de un Cliente

1. Click en el nombre del cliente
2. Verás su perfil completo:
   - Datos personales
   - Lista de todas sus reservas (pasadas y futuras)
   - Total gastado
   - Fecha de primera reserva

**Uso**: Útil para identificar clientes frecuentes y ofrecerles promociones especiales.

### Editar Datos de un Cliente

1. En el perfil del cliente, click en **"Editar"**
2. Modifica los campos necesarios:
   - Nombre
   - Email
   - Teléfono
   - Documento de identidad
3. Click en **"Guardar Cambios"**

### Exportar Clientes a CSV

Para enviar newsletters o hacer backup:

1. En la página de Clientes, click en **"Exportar CSV"**
2. El archivo se descarga automáticamente
3. Ábrelo con Excel o Google Sheets

**El archivo incluye**: Nombre, Email, Teléfono, Documento, Número de reservas

---

## Reportes

Genera informes para analizar tu negocio.

### Tipos de Reportes Disponibles

1. **Reporte de Reservas**: Lista de reservas con filtros
2. **Reporte de Ingresos**: Ganancias por período
3. **Reporte de Tours Populares**: Tours más vendidos
4. **Reporte de Ocupación**: Porcentaje de cupos vendidos

### Generar un Reporte de Reservas

1. Ve a **"Reportes"** → **"Reservas"**
2. Aplica filtros:
   - **Rango de Fechas**: Ej. Del 01/03/2026 al 31/03/2026
   - **Estado**: Todas, Confirmadas, Pendientes, etc.
   - **Tour**: Todos o un tour específico
3. Click en **"Generar Reporte"**
4. Verás una tabla con los resultados

### Exportar Reportes

Una vez generado el reporte:

- **Exportar PDF**: Click en **"Exportar PDF"** para imprimir o archivar
- **Exportar CSV**: Click en **"Exportar CSV"** para analizar en Excel o Google Sheets

**Ejemplo de uso:**
```
Filtro: Marzo 2026, Estado "Confirmada"
Resultado: 35 reservas, 27,500 Bs en ingresos
Acción: Exportar PDF para contabilidad mensual
```

### Reporte de Ingresos

1. Ve a **"Reportes"** → **"Ingresos"**
2. Selecciona el período:
   - Mes actual
   - Trimestre
   - Año
   - Personalizado
3. Verás gráficos y tablas con:
   - Total de ingresos
   - Ingresos por tour
   - Ingresos por mes
   - Comparación con períodos anteriores

### Reporte de Ocupación

Para saber qué tan bien estás vendiendo:

1. Ve a **"Reportes"** → **"Ocupación"**
2. Selecciona el tour y el período
3. Verás:
   - **Capacidad total**: Espacios ofrecidos
   - **Espacios vendidos**: Reservas confirmadas
   - **Porcentaje de ocupación**: % de ocupación
   - **Ingresos potenciales vs reales**

**Cómo interpretar:**
- Ocupación > 80%: Excelente, considera aumentar precios o frecuencia
- Ocupación 50-80%: Bueno, estado saludable
- Ocupación < 50%: Revisar precio, promoción o disponibilidad

---

## Recordatorios

Envía mensajes automáticos a tus clientes para confirmar sus tours.

### ¿Cómo funcionan los recordatorios?

El sistema envía recordatorios automáticamente (se procesan una vez al día a medianoche):
- **24 horas antes** del tour (por email)
- **2 horas antes** del tour (por email y SMS)
- **Solicitud de feedback** después de completar un tour

### Configurar Textos de Recordatorios

1. Ve a **"Configuración"** → **"Recordatorios"**
2. Configura:
   - Activar/desactivar recordatorios por email
   - Activar/desactivar recordatorios por SMS

**Nota**: Los recordatorios se envían automáticamente a los clientes con reservas confirmadas o pagadas.

### Ver Historial de Recordatorios

1. Ve a **"Recordatorios"** → **"Historial"**
2. Verás una lista de todos los recordatorios enviados:
   - Fecha de envío
   - Cliente
   - Tour
   - Tipo de recordatorio
   - Estado (Enviado/Error)

**Uso**: Verificar que los clientes recibieron sus recordatorios.

### Enviar Recordatorio Manual

Si necesitas enviar un recordatorio fuera del programa automático:

1. Abre la reserva del cliente
2. Click en **"Enviar Recordatorio"**
3. Elige la plantilla
4. Click en **"Enviar"**

---

## Configuración

Personaliza el sistema según tu agencia.

### Datos de la Agencia

1. Ve a **"Configuración"** → **"Agencia"**
2. Completa o edita:
   - **Nombre de la agencia**: Ej. "Bolivia Tours Express"
   - **Logo**: URL de tu logo (se muestra en reportes y emails)
   - **Dirección**: Dirección física de tu oficina
   - **Teléfono**: Número de contacto principal
   - **Email**: Email de contacto de la agencia
   - **WhatsApp**: Número de WhatsApp para consultas
   - **Redes sociales**: Facebook, Instagram, etc.

3. Click en **"Guardar Cambios"**

**Nota**: Esta información se muestra en la página de reservas y en los emails automáticos.

### Gestión de Usuarios Administradores

Si tienes varios empleados que necesitan acceso:

1. Ve a **"Configuración"** → **"Usuarios Admin"**
2. Verás la lista de administradores actuales

**Para agregar un nuevo administrador:**
1. Click en **"+ Nuevo Administrador"**
2. Completa:
   - Email del nuevo admin
   - Nombre completo
   - Rol (Super Admin o Admin)
3. El sistema enviará un email de invitación

**Diferencia entre roles:**
- **Super Admin**: Acceso total, puede agregar/eliminar otros admins
- **Admin**: Puede gestionar tours, reservas y clientes, pero no configuración

**Para eliminar un administrador:**
1. Click en **"Eliminar"** junto al usuario
2. Confirma la acción

### Métodos de Pago con QR

Configura los códigos QR para pagos:

1. Ve a **"Configuración"** → **"Métodos de Pago"**
2. Para cada banco que aceptes:
   
   **a) Subir código QR:**
   - Click en **"+ Agregar Método de Pago"**
   - Nombre del banco (Ej. "Banco Nacional de Bolivia")
   - Sube la imagen del QR
   - Número de cuenta (opcional, para referencia)
   
   **b) Activar/desactivar:**
   - Marca o desmarca **"Activo"**
   - Solo los métodos activos se muestran a los clientes

3. Click en **"Guardar"**

**Importante**: Los clientes verán estos QR al hacer una reserva para que puedan pagar.

### Configuración de Emails

1. Ve a **"Configuración"** → **"Emails"**
2. Configura:
   - **Remitente**: Nombre que aparecerá en los emails
   - **Email de respuesta**: Email donde llegan las respuestas
   - **Plantillas de email**: Personaliza los textos automáticos

**Plantillas disponibles:**
- Confirmación de reserva
- Comprobante de pago recibido
- Pago verificado
- Recordatorios de tours
- Cancelación de reserva

---

## Preguntas Frecuentes

### ¿Qué hago si un cliente dice que no recibió el email de confirmación?

1. Verifica en la reserva que el email esté correcto
2. Pide al cliente que revise su carpeta de spam
3. Si es necesario, puedes reenviar el email desde la vista de la reserva
4. Como alternativa, puedes enviarle los detalles por WhatsApp

### ¿Puedo modificar una reserva después de confirmarla?

Sí, puedes editar:
- Número de personas (si hay disponibilidad)
- Notas especiales
- Fecha (si hay disponibilidad en otra fecha)

No puedes modificar el tour sin cancelar y crear una nueva reserva.

### ¿Qué hago si quiero ofrecer un descuento?

Actualmente, debes:
1. Crear una reserva manual
2. En el campo "Total", ingresar el monto con descuento
3. Agregar una nota explicando el descuento aplicado

### ¿Cómo sé cuántos espacios me quedan para una fecha?

1. Ve a **"Tours"** → **"Disponibilidad"**
2. Selecciona el tour
3. Busca la fecha en el calendario
4. Verás: Espacios totales, Reservados, Disponibles

### ¿Puedo cancelar una fecha si ya tiene reservas?

No directamente. Primero debes:
1. Contactar a todos los clientes con reservas para esa fecha
2. Cancelar cada reserva individualmente
3. Luego podrás eliminar la fecha de disponibilidad

---

## Consejos y Mejores Prácticas

### Para una gestión eficiente:

1. **Revisa las reservas pendientes diariamente**: No dejes que los clientes esperen mucho por la confirmación
2. **Actualiza tu disponibilidad con anticipación**: Carga fechas para los próximos 2-3 meses
3. **Usa los reportes semanalmente**: Ten claro cómo va tu negocio
4. **Mantén los datos de clientes actualizados**: Facilita el contacto futuro
5. **Haz backup mensual**: Protege tu información

### Para mejorar las ventas:

1. **Responde rápido**: Confirma pagos el mismo día
2. **Personaliza tus tours**: Usa buenas fotos y descripciones detalladas
3. **Analiza la ocupación**: Si un tour no se vende, ajusta precio o promoción
4. **Fideliza clientes**: Usa el historial para ofrecer descuentos a clientes recurrentes

### Seguridad:

1. **Verifica siempre los comprobantes de pago**: No confíes solo en lo que dice el cliente
2. **No compartas tu contraseña**: Crea usuarios separados para cada empleado
3. **Cierra sesión**: Especialmente si usas computadoras compartidas

---

## Soporte Técnico

Si tienes problemas técnicos con el sistema:

1. **Problemas de inicio de sesión**: Contacta al administrador principal
2. **Errores o bugs**: Anota qué estabas haciendo cuando ocurrió el error y contacta a soporte
3. **Dudas sobre uso**: Consulta nuevamente esta guía o contacta a tu equipo

---

**¡Felicitaciones!** Ahora conoces todas las funcionalidades del sistema de administración. Con esta guía y la práctica diaria, podrás gestionar tu agencia de tours de manera profesional y eficiente.

**Última actualización**: Febrero 2026  
**Versión del sistema**: 1.0
