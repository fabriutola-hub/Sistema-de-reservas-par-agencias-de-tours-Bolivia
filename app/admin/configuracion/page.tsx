'use client'

import { useState, useEffect } from 'react'
import { Building, Bell, Users, Save, CheckCircle, XCircle, Loader2, UserPlus, Trash2, Shield, ShieldCheck, X, AlertTriangle } from 'lucide-react'
import { getMultipleConfig, saveMultipleConfig } from '@/lib/actions/config'
import { getAdminUsers, inviteAdmin, removeAdmin, updateAdminRole, getCurrentUserRole, bootstrapFirstAdmin, AdminUser, AdminRole } from '@/lib/actions/users'

interface AgencySettings {
    nombre: string
    direccion: string
    telefono: string
    email: string
    whatsapp: string
}

interface ReminderSettings {
    activoEmail: boolean
    activoSms: boolean
    diasAntes: number
    textoEmail: string
    textoSms: string
}

type FeedbackType = 'success' | 'error' | null

export default function ConfiguracionPage() {
    const [activeTab, setActiveTab] = useState('agencia')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [feedback, setFeedback] = useState<{ type: FeedbackType; message: string } | null>(null)

    const [agencySettings, setAgencySettings] = useState<AgencySettings>({
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        whatsapp: ''
    })

    const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
        activoEmail: true,
        activoSms: false,
        diasAntes: 1,
        textoEmail: '',
        textoSms: ''
    })

    // Admin users state
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
    const [currentUserRole, setCurrentUserRole] = useState<{ role: AdminRole | null; isSuperAdmin: boolean }>({ role: null, isSuperAdmin: false })
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState<AdminRole>('admin')
    const [inviteName, setInviteName] = useState('')
    const [inviting, setInviting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; email: string } | null>(null)
    const [deleting, setDeleting] = useState(false)

    // Load configuration on mount
    useEffect(() => {
        async function loadConfig() {
            try {
                setLoading(true)

                // Load settings config
                const config = await getMultipleConfig([
                    // Agency
                    'nombre_agencia',
                    'direccion',
                    'telefono_contacto',
                    'email_contacto',
                    'whatsapp',
                    // Reminders
                    'recordatorio_email_activo',
                    'recordatorio_sms_activo',
                    'recordatorio_dias_antes',
                    'recordatorio_texto_email',
                    'recordatorio_texto_sms'
                ])

                setAgencySettings({
                    nombre: config.nombre_agencia || 'TourReservas Bolivia',
                    direccion: config.direccion || 'Av. 16 de Julio #1234, La Paz, Bolivia',
                    telefono: config.telefono_contacto || '+591 2 1234567',
                    email: config.email_contacto || 'info@tourreservas.bo',
                    whatsapp: config.whatsapp || '+591 71234567'
                })

                setReminderSettings({
                    activoEmail: config.recordatorio_email_activo === 'true',
                    activoSms: config.recordatorio_sms_activo === 'true',
                    diasAntes: parseInt(config.recordatorio_dias_antes || '1'),
                    textoEmail: config.recordatorio_texto_email || 'Estimado(a) {nombre},\n\nLe recordamos que su tour "{tour}" está programado para mañana {fecha}.\n\nPunto de encuentro: {lugar}\nHora: {hora}\n\n¡Gracias por elegir TourReservas Bolivia!',
                    textoSms: config.recordatorio_texto_sms || 'TourReservas: Recordatorio - Su tour {tour} es mañana {fecha} a las {hora}.'
                })

                // Bootstrap first admin if needed
                await bootstrapFirstAdmin()

                // Load admin users
                try {
                    const [users, role] = await Promise.all([
                        getAdminUsers(),
                        getCurrentUserRole()
                    ])
                    setAdminUsers(users)
                    setCurrentUserRole(role)
                } catch (userError) {
                    console.error('Error loading admin users:', userError)
                    setFeedback({ type: 'error', message: 'Error al cargar la lista de administradores' })
                }
            } catch (error) {
                console.error('Error loading config:', error)
                setFeedback({ type: 'error', message: 'Error al cargar la configuración' })
            } finally {
                setLoading(false)
            }
        }

        loadConfig()
    }, [])

    async function handleSave() {
        setSaving(true)
        setFeedback(null)

        try {
            const configToSave: Record<string, string> = {}

            // Agency settings
            if (activeTab === 'agencia' || activeTab === 'all') {
                configToSave['nombre_agencia'] = agencySettings.nombre
                configToSave['direccion'] = agencySettings.direccion
                configToSave['telefono_contacto'] = agencySettings.telefono
                configToSave['email_contacto'] = agencySettings.email
                configToSave['whatsapp'] = agencySettings.whatsapp
            }

            // Reminder settings
            if (activeTab === 'recordatorios' || activeTab === 'all') {
                configToSave['recordatorio_email_activo'] = reminderSettings.activoEmail.toString()
                configToSave['recordatorio_sms_activo'] = reminderSettings.activoSms.toString()
                configToSave['recordatorio_dias_antes'] = reminderSettings.diasAntes.toString()
                configToSave['recordatorio_texto_email'] = reminderSettings.textoEmail
                configToSave['recordatorio_texto_sms'] = reminderSettings.textoSms
            }

            await saveMultipleConfig(configToSave)
            setFeedback({ type: 'success', message: 'Configuración guardada correctamente' })

            // Auto-hide success message after 3 seconds
            setTimeout(() => setFeedback(null), 3000)
        } catch (error) {
            console.error('Error saving config:', error)
            setFeedback({ type: 'error', message: 'Error al guardar la configuración' })
        } finally {
            setSaving(false)
        }
    }

    // Admin user management functions
    async function handleInvite() {
        if (!inviteEmail.trim()) {
            setFeedback({ type: 'error', message: 'Ingresa un email válido' })
            return
        }

        setInviting(true)
        setFeedback(null)

        try {
            const result = await inviteAdmin(inviteEmail.trim().toLowerCase(), inviteRole, inviteName.trim() || undefined)

            if (result.success) {
                setFeedback({ type: 'success', message: 'Invitación enviada correctamente' })
                setShowInviteModal(false)
                setInviteEmail('')
                setInviteName('')
                setInviteRole('admin')

                // Refresh users list
                const users = await getAdminUsers()
                setAdminUsers(users)
            } else {
                setFeedback({ type: 'error', message: result.error || 'Error al enviar invitación' })
            }
        } catch (error) {
            console.error('Error inviting admin:', error)
            setFeedback({ type: 'error', message: 'Error al enviar la invitación' })
        } finally {
            setInviting(false)
        }
    }

    async function handleDelete(userId: string) {
        setDeleting(true)
        setFeedback(null)

        try {
            const result = await removeAdmin(userId)

            if (result.success) {
                setFeedback({ type: 'success', message: 'Administrador eliminado correctamente' })
                setDeleteConfirm(null)

                // Refresh users list
                const users = await getAdminUsers()
                setAdminUsers(users)
            } else {
                setFeedback({ type: 'error', message: result.error || 'Error al eliminar administrador' })
            }
        } catch (error) {
            console.error('Error removing admin:', error)
            setFeedback({ type: 'error', message: 'Error al eliminar el administrador' })
        } finally {
            setDeleting(false)
        }
    }

    async function handleRoleChange(userId: string, newRole: AdminRole) {
        setFeedback(null)

        try {
            const result = await updateAdminRole(userId, newRole)

            if (result.success) {
                setFeedback({ type: 'success', message: 'Rol actualizado correctamente' })

                // Refresh users list
                const users = await getAdminUsers()
                setAdminUsers(users)
            } else {
                setFeedback({ type: 'error', message: result.error || 'Error al actualizar rol' })
            }
        } catch (error) {
            console.error('Error updating role:', error)
            setFeedback({ type: 'error', message: 'Error al actualizar el rol' })
        }
    }

    const tabs = [
        { id: 'agencia', label: 'Datos de Agencia', icon: Building },
        { id: 'recordatorios', label: 'Recordatorios', icon: Bell },
        { id: 'usuarios', label: 'Usuarios Admin', icon: Users },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-3 text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Cargando configuración...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>
                <p className="text-gray-500">Administra la configuración del sistema</p>
            </div>

            {/* Feedback Toast */}
            {feedback && (
                <div className={`flex items-center gap-2 p-4 rounded-lg ${feedback.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                    {feedback.type === 'success'
                        ? <CheckCircle className="h-5 w-5" />
                        : <XCircle className="h-5 w-5" />
                    }
                    <span>{feedback.message}</span>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-100">
                    <div className="flex overflow-x-auto">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-rose-600 text-rose-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {/* Agency Settings */}
                    {activeTab === 'agencia' && (
                        <div className="space-y-6 max-w-2xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Agencia</label>
                                <input
                                    type="text"
                                    value={agencySettings.nombre}
                                    onChange={(e) => setAgencySettings({ ...agencySettings, nombre: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                <input
                                    type="text"
                                    value={agencySettings.direccion}
                                    onChange={(e) => setAgencySettings({ ...agencySettings, direccion: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input
                                        type="text"
                                        value={agencySettings.telefono}
                                        onChange={(e) => setAgencySettings({ ...agencySettings, telefono: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                    <input
                                        type="text"
                                        value={agencySettings.whatsapp}
                                        onChange={(e) => setAgencySettings({ ...agencySettings, whatsapp: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={agencySettings.email}
                                    onChange={(e) => setAgencySettings({ ...agencySettings, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* Reminder Settings */}
                    {activeTab === 'recordatorios' && (
                        <div className="space-y-6 max-w-2xl">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <h3 className="font-medium text-gray-800">Recordatorios por Email</h3>
                                    <p className="text-sm text-gray-500">Enviar recordatorios automáticos por correo</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={reminderSettings.activoEmail}
                                        onChange={(e) => setReminderSettings({ ...reminderSettings, activoEmail: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <h3 className="font-medium text-gray-800">Recordatorios por SMS</h3>
                                    <p className="text-sm text-gray-500">Enviar recordatorios automáticos por mensaje</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={reminderSettings.activoSms}
                                        onChange={(e) => setReminderSettings({ ...reminderSettings, activoSms: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Días antes del tour</label>
                                <select
                                    value={reminderSettings.diasAntes}
                                    onChange={(e) => setReminderSettings({ ...reminderSettings, diasAntes: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                >
                                    <option value={1}>1 día antes</option>
                                    <option value={2}>2 días antes</option>
                                    <option value={3}>3 días antes</option>
                                    <option value={7}>1 semana antes</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Plantilla de Email</label>
                                <textarea
                                    value={reminderSettings.textoEmail}
                                    onChange={(e) => setReminderSettings({ ...reminderSettings, textoEmail: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 font-mono text-sm"
                                />
                                <p className="text-xs text-gray-500 mt-1">Variables: {'{nombre}'}, {'{tour}'}, {'{fecha}'}, {'{hora}'}, {'{lugar}'}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Plantilla de SMS</label>
                                <textarea
                                    value={reminderSettings.textoSms}
                                    onChange={(e) => setReminderSettings({ ...reminderSettings, textoSms: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 font-mono text-sm"
                                />
                            </div>
                        </div>
                    )}

                    {/* Admin Users */}
                    {activeTab === 'usuarios' && (
                        <div className="space-y-6 max-w-4xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-800">Usuarios Administradores</h3>
                                    <p className="text-sm text-gray-500 mt-1">Gestiona quién tiene acceso al panel de administración.</p>
                                </div>
                                {currentUserRole.isSuperAdmin && (
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        Invitar Admin
                                    </button>
                                )}
                            </div>

                            {!currentUserRole.isSuperAdmin && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-blue-800">
                                    <Shield className="h-5 w-5 shrink-0" />
                                    <p className="text-sm">
                                        Solo los Super Administradores pueden invitar nuevos usuarios o eliminar cuentas.
                                        Tu rol actual es: <strong>{currentUserRole.role}</strong>
                                    </p>
                                </div>
                            )}

                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <ul className="divide-y divide-gray-100">
                                    {adminUsers.map((user) => (
                                        <li key={user.id} className="p-4 hover:bg-gray-50 transition flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                    {user.role === 'super_admin' ? <ShieldCheck className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-gray-900">{user.email}</span>
                                                        {user.nombre && <span className="text-gray-500 text-sm">({user.nombre})</span>}
                                                        {!user.activo && (
                                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Pendiente</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                                        <span>{user.role === 'super_admin' ? 'Super Admin' : 'Administrador'}</span>
                                                        <span>•</span>
                                                        <span>Agregado el {new Date(user.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {currentUserRole.isSuperAdmin && (
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {user.email !== 'admin@tourreservas.bo' && ( // Prevent modifying restricted accounts if needed
                                                        <>
                                                            <select
                                                                value={user.role}
                                                                onChange={(e) => handleRoleChange(user.id, e.target.value as AdminRole)}
                                                                className="text-sm border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                                                                disabled={!user.activo} // Disable for pending invites
                                                            >
                                                                <option value="admin">Admin</option>
                                                                <option value="super_admin">Super Admin</option>
                                                            </select>

                                                            <button
                                                                onClick={() => setDeleteConfirm({ id: user.id, email: user.email })}
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                title="Eliminar acceso"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                    {adminUsers.length === 0 && (
                                        <li className="p-8 text-center text-gray-500">
                                            No se encontraron usuarios administradores.
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Save Button (only show on tabs where config can be saved) */}
                    {activeTab !== 'usuarios' && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Invitar Administrador</h3>
                            <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                    placeholder="usuario@ejemplo.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (Opcional)</label>
                                <input
                                    type="text"
                                    value={inviteName}
                                    onChange={(e) => setInviteName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                    placeholder="Nombre del usuario"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                                >
                                    <option value="admin">Administrador</option>
                                    <option value="super_admin">Super Administrador</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    {inviteRole === 'super_admin'
                                        ? 'Tiene acceso total, incluyendo gestión de usuarios.'
                                        : 'Tiene acceso a gestionar reservas, tours y clientes.'}
                                </p>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleInvite}
                                disabled={inviting || !inviteEmail}
                                className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                                Enviar Invitación
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">¿Eliminar administrador?</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Estás a punto de eliminar el acceso de <strong>{deleteConfirm.email}</strong>. Esta acción no se puede deshacer.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm.id)}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2"
                                >
                                    {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
