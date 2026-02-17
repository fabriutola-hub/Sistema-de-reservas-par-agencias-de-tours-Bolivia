'use client'

import { useEffect, useState } from 'react'
import { getTours, getReportData } from '@/lib/actions/admin'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Download, Calendar, TrendingUp, DollarSign, FileText } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { jsPDF } from 'jspdf'

interface Tour {
    id: string
    nombre: string
}

interface ReportData {
    totalReservas: number
    totalIngresos: number
    porTour: { nombre: string; reservas: number; ingresos: number }[]
    porMetodoPago: { metodo: string; total: number }[]
    porCanal: { canal: string; total: number }[]
}

const COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

export default function ReportesPage() {
    const [tours, setTours] = useState<Tour[]>([])
    const [reportData, setReportData] = useState<ReportData | null>(null)
    const [loading, setLoading] = useState(false)
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [selectedTour, setSelectedTour] = useState('')

    useEffect(() => {
        loadTours()
    }, [])

    async function loadTours() {
        try {
            const data = await getTours()
            setTours(data as Tour[])
        } catch (err) {
            console.error('Error loading tours:', err)
        }
    }

    async function generateReport() {
        setLoading(true)
        try {
            const data = await getReportData(startDate, endDate, selectedTour || undefined)
            setReportData(data as ReportData)
        } catch (err) {
            console.error('Error generating report:', err)
            alert('Error al generar reporte')
        } finally {
            setLoading(false)
        }
    }

    function exportPDF() {
        if (!reportData) return

        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()

        // Title
        doc.setFontSize(20)
        doc.setTextColor(244, 63, 94)
        doc.text('Reporte de Ventas', pageWidth / 2, 20, { align: 'center' })

        // Period
        doc.setFontSize(12)
        doc.setTextColor(100)
        doc.text(`Período: ${startDate} al ${endDate}`, pageWidth / 2, 30, { align: 'center' })

        // Summary
        doc.setFontSize(14)
        doc.setTextColor(0)
        doc.text('Resumen', 20, 50)

        doc.setFontSize(11)
        doc.text(`Total de Reservas: ${reportData.totalReservas}`, 20, 60)
        doc.text(`Ingresos Totales: Bs ${reportData.totalIngresos.toLocaleString()}`, 20, 70)

        // By Tour
        doc.setFontSize(14)
        doc.text('Desglose por Tour', 20, 90)

        let yPos = 100
        doc.setFontSize(10)
        reportData.porTour.forEach((t, i) => {
            doc.text(`${i + 1}. ${t.nombre}`, 25, yPos)
            doc.text(`${t.reservas} reservas - Bs ${t.ingresos.toLocaleString()}`, 100, yPos)
            yPos += 8
        })

        // By Payment Method
        yPos += 10
        doc.setFontSize(14)
        doc.text('Por Método de Pago', 20, yPos)

        yPos += 10
        doc.setFontSize(10)
        reportData.porMetodoPago.forEach((p, i) => {
            doc.text(`${p.metodo}: Bs ${p.total.toLocaleString()}`, 25, yPos)
            yPos += 8
        })

        // By Channel
        yPos += 10
        doc.setFontSize(14)
        doc.text('Por Canal', 20, yPos)

        yPos += 10
        doc.setFontSize(10)
        reportData.porCanal?.forEach((c, i) => {
            doc.text(`${c.canal}: ${c.total}`, 25, yPos)
            yPos += 8
        })

        // Footer
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(`Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, 280, { align: 'center' })

        doc.save(`reporte_${startDate}_${endDate}.pdf`)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
                <p className="text-gray-500">Analiza las ventas y estadísticas</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-semibold text-gray-800 mb-4">Filtros</h2>
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tour</label>
                        <select
                            value={selectedTour}
                            onChange={(e) => setSelectedTour(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                        >
                            <option value="">Todos los tours</option>
                            {tours.map(t => (
                                <option key={t.id} value={t.id}>{t.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={generateReport}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50"
                    >
                        <FileText className="h-4 w-4" />
                        {loading ? 'Generando...' : 'Generar Reporte'}
                    </button>
                </div>
            </div>

            {reportData && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Calendar className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Reservas</p>
                                    <p className="text-2xl font-bold text-gray-800">{reportData.totalReservas}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <DollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Ingresos Totales</p>
                                    <p className="text-2xl font-bold text-gray-800">Bs {reportData.totalIngresos.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Promedio por Reserva</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        Bs {reportData.totalReservas > 0 ? Math.round(reportData.totalIngresos / reportData.totalReservas).toLocaleString() : 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* By Tour Chart */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
                            <h3 className="font-semibold text-gray-800 mb-4">Ingresos por Tour</h3>
                            <div className="h-72">
                                {reportData.porTour.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={reportData.porTour} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis type="number" tickFormatter={(v) => `Bs ${v}`} />
                                            <YAxis dataKey="nombre" type="category" width={120} tick={{ fontSize: 11 }} />
                                            <Tooltip formatter={(value) => `Bs ${Number(value).toLocaleString()}`} />
                                            <Bar dataKey="ingresos" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        No hay datos
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Methods and Channels Grid */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Payment Methods Pie Chart */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-[340px]">
                                <h3 className="font-semibold text-gray-800 mb-4">Por Método de Pago</h3>
                                <div className="h-64">
                                    {reportData.porMetodoPago.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={reportData.porMetodoPago}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={40}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="total"
                                                    nameKey="metodo"
                                                    label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                                                >
                                                    {reportData.porMetodoPago.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            No hay datos
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Channels Pie Chart */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-[340px]">
                                <h3 className="font-semibold text-gray-800 mb-4">Por Canal</h3>
                                <div className="h-64">
                                    {reportData.porCanal && reportData.porCanal.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={reportData.porCanal}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={40}
                                                    outerRadius={80}
                                                    fill="#82ca9d"
                                                    dataKey="total"
                                                    nameKey="canal"
                                                    label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                                                >
                                                    {reportData.porCanal.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            No hay datos
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800">Desglose por Tour</h3>
                            <button
                                onClick={exportPDF}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                            >
                                <Download className="h-4 w-4" />
                                Exportar PDF
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tour</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reservas</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% del Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reportData.porTour.map((t, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-800">{t.nombre}</td>
                                            <td className="px-6 py-4 text-gray-600">{t.reservas}</td>
                                            <td className="px-6 py-4 font-medium text-gray-800">Bs {t.ingresos.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {reportData.totalIngresos > 0 ? ((t.ingresos / reportData.totalIngresos) * 100).toFixed(1) : 0}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td className="px-6 py-4 font-bold text-gray-800">Total</td>
                                        <td className="px-6 py-4 font-bold text-gray-800">{reportData.totalReservas}</td>
                                        <td className="px-6 py-4 font-bold text-rose-600">Bs {reportData.totalIngresos.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800">100%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {!reportData && !loading && (
                <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Selecciona un rango de fechas y genera el reporte</p>
                </div>
            )}
        </div>
    )
}
