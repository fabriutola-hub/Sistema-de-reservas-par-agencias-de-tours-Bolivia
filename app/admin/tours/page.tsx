'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { getTours, createTour, updateTour, deleteTour, toggleTourActive } from '@/lib/actions/admin'
import { Plus, Edit, Trash2, Eye, EyeOff, X, Upload, QrCode } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import ImageGalleryUpload from '@/components/admin/ImageGalleryUpload'
import ItineraryBuilder, { ItineraryDay } from '@/components/admin/ItineraryBuilder'

interface Tour {
    id: string
    nombre: string
    descripcion: string
    precio_por_persona: number
    duracion_horas: number
    // cupo_maximo removed
    destino: string
    imagen_url: string | null
    incluye: string[] | null
    activo: boolean
    galeria: string[] | null
    itinerario: any | null // JSON
    qr_pago_url: string | null
}

export default function ToursPage() {
    const [tours, setTours] = useState<Tour[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingTour, setEditingTour] = useState<Tour | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    // Main image state
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string>('')

    // QR image state
    const [qrFile, setQrFile] = useState<File | null>(null)
    const [qrPreview, setQrPreview] = useState<string>('')

    // New state fields
    const [gallery, setGallery] = useState<string[]>([])
    const [itinerary, setItinerary] = useState<ItineraryDay[]>([])

    useEffect(() => {
        loadTours()
    }, [])

    async function loadTours() {
        try {
            const data = await getTours()
            setTours(data as Tour[])
        } catch (err) {
            console.error('Error loading tours:', err)
        } finally {
            setLoading(false)
        }
    }

    function openCreateModal() {
        setEditingTour(null)
        setImageFile(null)
        setImagePreview('')
        setQrFile(null)
        setQrPreview('')
        setGallery([])
        setItinerary([])
        setShowModal(true)
    }

    function openEditModal(tour: Tour) {
        setEditingTour(tour)
        setImageFile(null)
        setImagePreview(tour.imagen_url || '')
        setQrFile(null)
        setQrPreview(tour.qr_pago_url || '')
        setGallery(tour.galeria || [])
        setItinerary(Array.isArray(tour.itinerario) ? tour.itinerario : [])
        setShowModal(true)
    }

    async function handleImageUpload(file: File): Promise<string> {
        const supabase = createClient()
        const fileName = `tour-${Date.now()}-${file.name}`
        const { error } = await supabase.storage
            .from('tour-images')
            .upload(fileName, file)

        if (error) throw error

        const { data } = supabase.storage.from('tour-images').getPublicUrl(fileName)
        return data.publicUrl
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setSubmitting(true)

        try {
            const form = e.currentTarget
            const formData = new FormData(form)

            // Handle Main Image Logic
            if (imageFile) {
                const imageUrl = await handleImageUpload(imageFile)
                formData.set('imagen_url', imageUrl)
            } else if (imagePreview && editingTour?.imagen_url === imagePreview) {
                formData.set('imagen_url', editingTour.imagen_url)
            } else {
                formData.set('imagen_url', '')
            }

            // Handle QR Image Logic
            if (qrFile) {
                const qrUrl = await handleImageUpload(qrFile)
                formData.set('qr_pago_url', qrUrl)
            } else if (qrPreview && editingTour?.qr_pago_url === qrPreview) {
                formData.set('qr_pago_url', editingTour.qr_pago_url)
            } else {
                formData.set('qr_pago_url', '')
            }

            // Append JSON fields
            formData.set('galeria', JSON.stringify(gallery))
            formData.set('itinerario', JSON.stringify(itinerary))

            if (editingTour) {
                await updateTour(editingTour.id, formData)
            } else {
                await createTour(formData)
            }

            setShowModal(false)
            loadTours()
        } catch (err) {
            console.error('Error saving tour:', err)
            alert('Error al guardar el tour')
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete(id: string) {
        try {
            await deleteTour(id)
            setDeleteConfirm(null)
            loadTours()
        } catch (err) {
            console.error('Error deleting tour:', err)
            alert('Error al eliminar el tour')
        }
    }

    async function handleToggleActive(id: string, currentActive: boolean) {
        try {
            await toggleTourActive(id, !currentActive)
            loadTours()
        } catch (err) {
            console.error('Error toggling tour:', err)
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, setFile: (f: File | null) => void, setPreview: (s: string) => void) {
        const file = e.target.files?.[0]
        if (file) {
            setFile(file)
            setPreview(URL.createObjectURL(file))
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Tours</h1>
                    <p className="text-gray-500">Gestiona tu catálogo de tours</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Nuevo Tour
                </button>
            </div>

            {/* Tours Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tour</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destino</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duración</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR Pago</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tours.map((tour) => (
                                <tr key={tour.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {tour.imagen_url && (
                                                <div className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0">
                                                    <Image src={tour.imagen_url} alt={tour.nombre} fill className="object-cover" />
                                                </div>
                                            )}
                                            <span className="font-medium text-gray-800">{tour.nombre}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{tour.destino}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">Bs {tour.precio_por_persona}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{tour.duracion_horas}h</td>
                                    <td className="px-6 py-4">
                                        {tour.qr_pago_url ? (
                                            <div className="relative h-8 w-8 rounded overflow-hidden border border-gray-200">
                                                <Image src={tour.qr_pago_url} alt="QR" fill className="object-cover" />
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">Sin QR</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${tour.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {tour.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(tour)}
                                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleToggleActive(tour.id, tour.activo)}
                                                className={`p-2 rounded-lg transition-colors ${tour.activo
                                                    ? 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                                                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                                                    }`}
                                                title={tour.activo ? 'Desactivar' : 'Activar'}
                                            >
                                                {tour.activo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(tour.id)}
                                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {tours.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                        No hay tours registrados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingTour ? 'Editar Tour' : 'Nuevo Tour'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Tour</label>
                                    <input
                                        name="nombre"
                                        defaultValue={editingTour?.nombre || ''}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        name="descripcion"
                                        defaultValue={editingTour?.descripcion || ''}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                                    <input
                                        name="destino"
                                        defaultValue={editingTour?.destino || ''}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio por Persona (Bs)</label>
                                    <input
                                        name="precio_por_persona"
                                        type="number"
                                        defaultValue={editingTour?.precio_por_persona || ''}
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duración (horas)</label>
                                    <input
                                        name="duracion_horas"
                                        type="number"
                                        defaultValue={editingTour?.duracion_horas || ''}
                                        required
                                        min="1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Cupo input removed */}

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Servicios Incluidos (uno por línea)</label>
                                    <textarea
                                        name="incluye"
                                        defaultValue={editingTour?.incluye?.join('\n') || ''}
                                        rows={4}
                                        placeholder="Transporte&#10;Guía profesional&#10;Almuerzo&#10;Entrada a sitios"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Main Image */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Imagen Principal</label>
                                        <div className="flex items-start gap-4">
                                            {imagePreview && (
                                                <div className="relative h-24 w-32 rounded-lg overflow-hidden flex-shrink-0 group">
                                                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setImageFile(null)
                                                            setImagePreview('')
                                                        }}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Eliminar imagen"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}
                                            <label className="flex-1 flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-rose-400 transition-colors">
                                                <Upload className="h-6 w-6 text-gray-400" />
                                                <span className="text-sm text-gray-500 mt-1">Subir imagen</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, setImageFile, setImagePreview)}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* QR Payment Image */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Código QR de Pago</label>
                                        <div className="flex items-start gap-4">
                                            {qrPreview && (
                                                <div className="relative h-24 w-32 rounded-lg overflow-hidden flex-shrink-0 group">
                                                    <Image src={qrPreview} alt="QR Preview" fill className="object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setQrFile(null)
                                                            setQrPreview('')
                                                        }}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Eliminar QR"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            )}
                                            <label className="flex-1 flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-rose-400 transition-colors">
                                                <QrCode className="h-6 w-6 text-gray-400" />
                                                <span className="text-sm text-gray-500 mt-1">Subir QR</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, setQrFile, setQrPreview)}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Este QR se mostrará al cliente al reservar.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Galería de Imágenes</label>
                                <ImageGalleryUpload
                                    images={gallery}
                                    onChange={setGallery}
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2 pt-4 border-t border-gray-100">
                                <h3 className="text-lg font-medium text-gray-800">Itinerario Detallado</h3>
                                <ItineraryBuilder
                                    itinerary={itinerary}
                                    onChange={setItinerary}
                                />
                            </div>


                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {submitting ? 'Guardando...' : editingTour ? 'Actualizar' : 'Crear Tour'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )
            }

            {/* Delete Confirmation Modal */}
            {
                deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">¿Eliminar este tour?</h3>
                            <p className="text-gray-600 mb-6">Esta acción no se puede deshacer. Todas las disponibilidades asociadas también serán eliminadas.</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
