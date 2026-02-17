'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageGalleryUploadProps {
    images: string[]
    onChange: (images: string[]) => void
}

export default function ImageGalleryUpload({ images = [], onChange }: ImageGalleryUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files)
        }
    }, [])

    const handleFiles = async (files: FileList) => {
        setUploading(true)
        const supabase = createClient()
        const newImages: string[] = []

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                if (!file.type.startsWith('image/')) continue

                const fileName = `gallery-${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`

                // Upload to Supabase Storage
                // Assuming 'tours-gallery' bucket exists (if not, we might need to use 'tour-images' or create one)
                // Let's use 'tour-images' as it was used in the original code, or create a 'gallery' folder inside it
                const { error: uploadError } = await supabase.storage
                    .from('tour-images')
                    .upload(`gallery/${fileName}`, file, {
                        cacheControl: '3600',
                        upsert: false
                    })

                if (uploadError) throw uploadError

                const { data } = supabase.storage
                    .from('tour-images')
                    .getPublicUrl(`gallery/${fileName}`)

                newImages.push(data.publicUrl)
            }

            onChange([...images, ...newImages])
        } catch (error) {
            console.error('Error uploading images:', error)
            alert('Error al subir imágenes')
        } finally {
            setUploading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files)
        }
    }

    const removeImage = (index: number) => {
        const newImages = [...images]
        newImages.splice(index, 1)
        onChange(newImages)
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((url, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <Image
                            src={url}
                            alt={`Gallery image ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1.5 bg-white/90 text-gray-600 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-all z-10"
                            title="Eliminar imagen"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-colors ${dragActive ? 'border-rose-500 bg-rose-50' : 'border-gray-300 hover:border-rose-400'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                />

                <div className="flex flex-col items-center justify-center text-gray-500">
                    {uploading ? (
                        <>
                            <Loader2 className="h-10 w-10 animate-spin text-rose-500 mb-3" />
                            <p className="text-sm font-medium">Subiendo imágenes...</p>
                        </>
                    ) : (
                        <>
                            <div className="p-3 bg-gray-100 rounded-full mb-3">
                                <Upload className="h-6 w-6 text-gray-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-700">
                                Arrastra imágenes aquí o <span className="text-rose-600">haz clic para elegir</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                PNG, JPG, WEBP hasta 5MB
                            </p>
                        </>
                    )}
                </div>
            </div>

            <input type="hidden" name="galeria" value={JSON.stringify(images)} />
        </div>
    )
}
