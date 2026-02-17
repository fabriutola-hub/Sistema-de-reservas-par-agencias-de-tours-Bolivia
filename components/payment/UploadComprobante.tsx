'use client'

import { useState, useRef } from 'react'
import { Upload, X, Check, Camera, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface UploadComprobanteProps {
    reservaId: string
    onSuccess: () => void
    existingUrl?: string
}

export default function UploadComprobante({ reservaId, onSuccess, existingUrl }: UploadComprobanteProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(existingUrl || null)
    const [uploaded, setUploaded] = useState(!!existingUrl)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setError(null)

        // Validate size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('El archivo no debe superar 5MB')
            return
        }

        // Validate type
        if (!file.type.startsWith('image/')) {
            setError('Solo se permiten imágenes (JPG, PNG, etc.)')
            return
        }

        // Show preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload to Supabase Storage
        setUploading(true)
        try {
            const supabase = createClient()
            const fileExt = file.name.split('.').pop()
            const fileName = `${reservaId}-${Date.now()}.${fileExt}`
            const filePath = `comprobantes/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('comprobantes')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            // Get public URL
            const { data } = supabase.storage
                .from('comprobantes')
                .getPublicUrl(filePath)

            // Update reservation using Secure RPC
            const { data: rpcData, error: rpcError } = await supabase
                .rpc('subir_comprobante', {
                    p_reserva_id: reservaId,
                    p_url: data.publicUrl
                })

            if (rpcError) throw rpcError
            if (rpcData && !rpcData.success) throw new Error(rpcData.message || 'Error al actualizar reserva')

            setUploaded(true)
            onSuccess()
        } catch (err) {
            console.error('Upload error:', err)
            setError('Error al subir el comprobante. Intenta nuevamente.')
            setPreview(null)
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = () => {
        setPreview(null)
        setUploaded(false)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-rose-500" />
                    Subir Comprobante de Pago
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    Sube una captura o foto de tu comprobante de transferencia
                </p>
            </div>

            <div className="p-6">
                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                        <X className="h-4 w-4" />
                        {error}
                    </div>
                )}

                {uploaded && (
                    <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        ¡Comprobante subido! Verificaremos tu pago en las próximas 24 horas.
                    </div>
                )}

                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Preview comprobante"
                            className="w-full max-h-80 object-contain rounded-xl border border-gray-200"
                        />
                        {!uploaded && (
                            <button
                                onClick={handleRemove}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition-all">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-600 font-medium mb-1">
                            {uploading ? 'Subiendo...' : 'Arrastra o haz clic para subir'}
                        </p>
                        <p className="text-sm text-gray-400">PNG, JPG hasta 5MB</p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="hidden"
                        />
                    </label>
                )}

                {!preview && (
                    <div className="mt-4 flex gap-3">
                        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 text-white rounded-xl cursor-pointer hover:bg-rose-700 transition-colors font-medium">
                            <Camera className="h-5 w-5" />
                            {uploading ? 'Subiendo...' : 'Seleccionar Imagen'}
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileChange}
                                disabled={uploading}
                                className="hidden"
                            />
                        </label>
                    </div>
                )}

                {preview && !uploaded && (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors font-medium disabled:opacity-50"
                    >
                        {uploading ? (
                            <>
                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Subiendo...
                            </>
                        ) : (
                            <>
                                <Upload className="h-5 w-5" />
                                Confirmar y Subir
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}
