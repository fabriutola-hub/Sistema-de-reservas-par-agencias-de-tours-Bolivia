# Configuración de Supabase

Esta guía contiene instrucciones importantes para configurar tu proyecto de Supabase de manera segura.

---

## Habilitar Protección de Contraseñas Filtradas

> [!CAUTION]
> **CRÍTICO PARA LA SEGURIDAD**: Sin esta configuración, los usuarios pueden registrarse con contraseñas comprometidas conocidas (como "password123"), haciéndolos extremadamente vulnerables a ataques.

### Pasos para activar la protección

1. Accede al **Dashboard de Supabase** → Navega a tu proyecto
2. Ve a **Authentication** → **Policies** (en el menú lateral)
3. Busca la sección **"Password Protection"** o **"Leaked Password Detection"**
4. Activa la opción **"Have I Been Pwned" protection**

### ¿Qué hace esta protección?

- Verifica las contraseñas contra la base de datos de [Have I Been Pwned](https://haveibeenpwned.com/)
- Rechaza contraseñas que han sido expuestas en filtraciones de datos conocidas
- Protege a tus usuarios de usar credenciales comprometidas
- No almacena ni transmite las contraseñas en texto plano (usa k-anonymity)

### Comportamiento esperado

- ✅ Los usuarios **no podrán** registrarse con contraseñas filtradas
- ✅ Recibirán un mensaje de error pidiendo una contraseña más segura
- ✅ Se bloquean contraseñas comunes como "password123", "qwerty", etc.

---

## Otras Configuraciones de Seguridad Recomendadas

### 1. Políticas de Contraseña

En **Authentication** → **Policies**:

- **Longitud mínima**: Recomendado mínimo 8 caracteres (idealmente 12+)
- **Complejidad**: Considera requerir mayúsculas, números y caracteres especiales
- **Expiración**: Opcional, pero puede ser útil para aplicaciones empresariales

### 2. Autenticación Multi-Factor (MFA)

En **Authentication** → **Settings**:

- Habilita **MFA/TOTP** para cuentas de administrador
- Considera hacerlo obligatorio para roles sensibles

### 3. Rate Limiting

En **Authentication** → **Rate Limits**:

- Configura límites para prevenir ataques de fuerza bruta
- Valores recomendados:
  - Login attempts: 5-10 por minuto
  - Password recovery: 3-5 por hora

### 4. Email Confirmación

En **Authentication** → **Email**:

- ✅ Asegúrate de que **"Confirm email"** esté habilitado
- Esto previene registro con emails falsos

### 5. Row Level Security (RLS)

- ✅ **Verifica que RLS esté habilitado** en todas tus tablas
- ✅ Crea políticas apropiadas para cada tabla
- ✅ Nunca deshabilites RLS en tablas con datos sensibles

Ejemplo básico:
```sql
ALTER TABLE public.reservas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reservations"
ON public.reservas FOR SELECT
USING (auth.uid() = user_id);
```

---

## Verificación de Configuración

Después de aplicar estos cambios, verifica:

- [ ] Protección de contraseñas filtradas activada
- [ ] RLS habilitado en todas las tablas
- [ ] Confirmación de email activada
- [ ] Rate limiting configurado
- [ ] MFA disponible para administradores

---

## Recursos Adicionales

- [Supabase Authentication Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Have I Been Pwned About](https://haveibeenpwned.com/About)
