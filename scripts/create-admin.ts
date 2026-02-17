import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function createAdmin() {
    const email = 'admin@tourreservas.bo'
    const password = 'adminPassword123!'

    console.log(`Creating user ${email}...`)

    // 1. Check if user exists
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const existingUser = users.find(u => u.email === email)

    let userId = existingUser?.id

    if (!userId) {
        // 2. Create user if not exists
        const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { nombre_completo: 'Administrador Principal' }
        })

        if (createError) {
            console.error('Error creating user:', createError.message)
            return
        }
        userId = user?.id
        console.log(`User created with ID: ${userId}`)
    } else {
        console.log(`User already exists with ID: ${userId}`)
        // Reset password just in case
        const { error: updateError } = await supabase.auth.admin.updateUserById(userId, { password })
        if (updateError) console.error('Error resetting password:', updateError.message)
        else console.log('Password reset to default.')
    }

    if (!userId) return

    // 3. Assign admin role
    const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: 'admin', activo: true }, { onConflict: 'user_id' })

    if (roleError) {
        console.error('Error assigning role:', roleError.message)
    } else {
        console.log('Admin role assigned successfully.')
    }
}

createAdmin()
