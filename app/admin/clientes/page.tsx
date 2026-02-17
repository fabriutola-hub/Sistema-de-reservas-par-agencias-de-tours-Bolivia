'use client'

import { useEffect, useState } from 'react'
import { getClientes, getClienteReservas } from '@/lib/actions/admin'
import { Search, Download, X, User, Mail, Phone, CreditCard, History } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Cliente {
    id: string
    nombre_completo: string
    email: string
    telefono: string
    ci: string
    created_at: string
}

interface Reserva {
    id: string
    fecha_tour: string
    num_personas: number
    precio_total: number
    estado: string
    tours: { nombre: string }
}

const estadoColors: Record<string, string> = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    confirmada: 'bg-blue-100 text-blue-800',
    pagada: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800',
    completada: 'bg-gray-100 text-gray-800'
}

export default function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
    const [clienteReservas, setClienteReservas] = useState<Reserva[]>([])
    const [loadingReservas, setLoadingReservas] = useState(false)

    useEffect(() => {
        loadClientes()
    }, [])

    async function loadClientes() {
        try {
            const data = await getClientes()
            setClientes(data as Cliente[])
        } catch (err) {
            console.error('Error loading clientes:', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleSearch() {
        setLoading(true)
        try {
            const data = await getClientes(searchTerm || undefined)
            setClientes(data as Cliente[])
        } catch (err) {
            console.error('Error searching clientes:', err)
        } finally {
            setLoading(false)
        }
    }

    async function openClienteDetail(cliente: Cliente) {
        setSelectedCliente(cliente)
        setLoadingReservas(true)
        try {
            const reservas = await getClienteReservas(cliente.id)
            setClienteReservas(reservas as Reserva[])
        } catch (err) {
            console.error('Error loading reservas:', err)
        } finally {
            setLoadingReservas(false)
        }
    }

    function exportCSV() {
        const headers = ['Nombre', 'Email', 'Teléfono', 'CI', 'Fecha Registro']
        const rows = clientes.map(c => [
            c.nombre_completo,
            c.email,
            c.telefono,
            c.ci,
            format(new Date(c.created_at), 'dd/MM/yyyy')
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(v => `"${v}"`).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `clientes_${format(new Date(), 'yyyy-MM-dd')}.csv`
        link.click()
        URL.revokeObjectURL(url)
    }

    if (loading && clientes.length === 0) {
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
                    <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
                    <p className="text-gray-500">{clientes.length} clientes registrados</p>
                </div>

                <div className="flex items-center gap-3">
                    <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o CI..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 w-72"
                        />
                    </form>
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                    >
                        <Download className="h-4 w-4" />
                        Exportar CSV
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CI</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registro</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {clientes.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
                                                <User className="h-5 w-5 text-rose-600" />
                                            </div>
                                            <span className="font-medium text-gray-800">{c.nombre_completo}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{c.email}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{c.telefono}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{c.ci}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {format(new Date(c.created_at), 'd MMM yyyy', { locale: es })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => openClienteDetail(c)}
                                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            <History className="h-4 w-4" />
                                            Ver historial
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {clientes.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        No se encontraron clientes
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cliente Detail Modal */}
            {selectedCliente && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">Detalle del Cliente</h2>
                            <button onClick={() => setSelectedCliente(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Client Info */}
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center">
                                    <User className="h-8 w-8 text-rose-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{selectedCliente.nombre_completo}</h3>
                                    <p className="text-gray-500">Cliente desde {format(new Date(selectedCliente.created_at), "d 'de' MMMM, yyyy", { locale: es })}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="font-medium text-gray-800">{selectedCliente.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Teléfono</p>
                                        <p className="font-medium text-gray-800">{selectedCliente.telefono}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">CI</p>
                                        <p className="font-medium text-gray-800">{selectedCliente.ci}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reservations History */}
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-4">Historial de Reservas</h3>
                                {loadingReservas ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-600"></div>
                                    </div>
                                ) : clienteReservas.length > 0 ? (
                                    <div className="space-y-3">
                                        {clienteReservas.map(r => (
                                            <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                                                <div>
                                                    <p className="font-medium text-gray-800">{r.tours?.nombre}</p>
                                                    <p className="text-sm text-gray-500">{r.fecha_tour} · {r.num_personas} personas</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-800">Bs {r.precio_total?.toLocaleString()}</p>
                                                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${estadoColors[r.estado]}`}>
                                                        {r.estado}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-400 py-8">No tiene reservas registradas</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
