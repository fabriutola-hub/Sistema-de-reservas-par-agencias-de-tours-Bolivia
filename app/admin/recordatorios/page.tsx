'use client'

import { useEffect, useState } from 'react'
import { getRecordatorios, getRecordatorioStats, reenviarRecordatorio, retryFailedRecordatorios } from '@/lib/actions/recordatorios'
import { Mail, MessageSquare, Send, RefreshCw, Filter, Check, X, AlertCircle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Recordatorio {
    id: string
    reserva_id: string
    tipo: string
    canal: string
    destinatario: string
    enviado_at: string
    estado: string
    error_mensaje: string | null
    intentos?: number
    reservas?: {
        fecha_tour: string
        tours?: { nombre: string }
        clientes?: { nombre_completo: string }
    }
}

interface Stats {
    total: number
    enviados: number
    fallidos: number
    porTipo: Record<string, number>
}

const tipoLabels: Record<string, string> = {
    confirmacion: 'Confirmación',
    recordatorio_24h: '24h Antes',
    recordatorio_2h: '2h Antes',
    feedback: 'Feedback'
}

const tipoColors: Record<string, string> = {
    confirmacion: 'bg-blue-100 text-blue-800',
    recordatorio_24h: 'bg-yellow-100 text-yellow-800',
    recordatorio_2h: 'bg-orange-100 text-orange-800',
    feedback: 'bg-purple-100 text-purple-800'
}

const canalIcons: Record<string, typeof Mail> = {
    email: Mail,
    sms: MessageSquare
}

export default function RecordatoriosPage() {
    const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [filterTipo, setFilterTipo] = useState('')
    const [filterEstado, setFilterEstado] = useState('')
    const [resending, setResending] = useState<string | null>(null)
    const [retrying, setRetrying] = useState(false)

    useEffect(() => {
        loadData()
    }, [filterTipo, filterEstado])

    async function loadData() {
        setLoading(true)
        try {
            const [recsData, statsData] = await Promise.all([
                getRecordatorios({ tipo: filterTipo || undefined, estado: filterEstado || undefined, limit: 100 }),
                getRecordatorioStats()
            ])
            setRecordatorios(recsData)
            setStats(statsData)
        } catch (err) {
            console.error('Error loading recordatorios:', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleResend(id: string) {
        setResending(id)
        try {
            await reenviarRecordatorio(id)
            loadData()
        } catch (err) {
            console.error('Error resending:', err)
            alert('Error al reenviar recordatorio')
        } finally {
            setResending(null)
        }
    }

    async function handleRetryAll() {
        setRetrying(true)
        try {
            const result = await retryFailedRecordatorios()
            alert(`Reintentos: ${result.retried}, Exitosos: ${result.succeeded}`)
            loadData()
        } catch (err) {
            console.error('Error retrying:', err)
        } finally {
            setRetrying(false)
        }
    }

    if (loading && recordatorios.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Recordatorios</h1>
                    <p className="text-gray-500">Log de todos los recordatorios enviados</p>
                </div>

                <button
                    onClick={handleRetryAll}
                    disabled={retrying}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
                    Reintentar Fallidos
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                        <p className="text-sm text-gray-500">Total Enviados</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-2xl font-bold text-green-600">{stats.enviados}</p>
                        <p className="text-sm text-gray-500">Exitosos</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-2xl font-bold text-red-600">{stats.fallidos}</p>
                        <p className="text-sm text-gray-500">Fallidos</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <p className="text-2xl font-bold text-blue-600">
                            {stats.total > 0 ? ((stats.enviados / stats.total) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-sm text-gray-500">Tasa de Éxito</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                >
                    <option value="">Todos los tipos</option>
                    <option value="confirmacion">Confirmación</option>
                    <option value="recordatorio_24h">24h Antes</option>
                    <option value="recordatorio_2h">2h Antes</option>
                    <option value="feedback">Feedback</option>
                </select>
                <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                >
                    <option value="">Todos los estados</option>
                    <option value="enviado">Enviado</option>
                    <option value="fallido">Fallido</option>
                    <option value="pendiente">Pendiente</option>
                </select>
                <button
                    onClick={() => { setFilterTipo(''); setFilterEstado(''); }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    Limpiar
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Canal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destinatario</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reserva</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recordatorios.map(r => {
                                const CanalIcon = canalIcons[r.canal] || Mail
                                return (
                                    <tr key={r.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {format(new Date(r.enviado_at), "d MMM HH:mm", { locale: es })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${tipoColors[r.tipo]}`}>
                                                {tipoLabels[r.tipo] || r.tipo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <CanalIcon className="h-4 w-4 text-gray-500" />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{r.destinatario}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <p className="text-gray-800">{r.reservas?.tours?.nombre || 'N/A'}</p>
                                            <p className="text-xs text-gray-500">{r.reservas?.clientes?.nombre_completo}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {r.estado === 'enviado' ? (
                                                <span className="flex items-center gap-1 text-green-600 text-sm">
                                                    <Check className="h-4 w-4" /> Enviado
                                                </span>
                                            ) : r.estado === 'fallido' ? (
                                                <div>
                                                    <span className="flex items-center gap-1 text-red-600 text-sm">
                                                        <X className="h-4 w-4" /> Fallido
                                                    </span>
                                                    {r.error_mensaje && (
                                                        <p className="text-xs text-gray-400 mt-1 truncate max-w-32" title={r.error_mensaje}>
                                                            {r.error_mensaje}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="flex items-center gap-1 text-yellow-600 text-sm">
                                                    <Clock className="h-4 w-4" /> Pendiente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleResend(r.id)}
                                                disabled={resending === r.id}
                                                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                                            >
                                                {resending === r.id ? (
                                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                                ) : (
                                                    <Send className="h-3 w-3" />
                                                )}
                                                Reenviar
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {recordatorios.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                        No hay recordatorios registrados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
