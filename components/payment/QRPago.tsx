'use client'

import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { Smartphone, CreditCard, Building2 } from 'lucide-react'

interface QRPagoProps {
    monto: number
    reservaId: string
    metodoPago: 'yape' | 'altoke' | 'banco'
    datosAgencia?: {
        yape_numero?: string
        yape_nombre?: string
        altoke_cuenta?: string
        altoke_nombre?: string
        banco_nombre?: string
        banco_cuenta?: string
        banco_titular?: string
    }
}

const metodosInfo = {
    yape: {
        icon: Smartphone,
        label: 'Yape',
        color: 'bg-purple-600',
        bgLight: 'bg-purple-50'
    },
    altoke: {
        icon: Smartphone,
        label: 'Altoke',
        color: 'bg-teal-600',
        bgLight: 'bg-teal-50'
    },
    banco: {
        icon: Building2,
        label: 'Transferencia Bancaria',
        color: 'bg-blue-600',
        bgLight: 'bg-blue-50'
    }
}

export default function QRPago({ monto, reservaId, metodoPago, datosAgencia }: QRPagoProps) {
    const [copied, setCopied] = useState(false)

    const metodo = metodosInfo[metodoPago]
    const Icon = metodo.icon

    // Get payment data based on method
    const getDatosPago = () => {
        switch (metodoPago) {
            case 'yape':
                return {
                    cuenta: datosAgencia?.yape_numero || '+591 70000000',
                    nombre: datosAgencia?.yape_nombre || 'TourReservas Bolivia'
                }
            case 'altoke':
                return {
                    cuenta: datosAgencia?.altoke_cuenta || '12345678',
                    nombre: datosAgencia?.altoke_nombre || 'TourReservas Bolivia'
                }
            case 'banco':
                return {
                    cuenta: datosAgencia?.banco_cuenta || '1234567890',
                    nombre: datosAgencia?.banco_titular || 'TourReservas Bolivia',
                    banco: datosAgencia?.banco_nombre || 'Banco de Bolivia'
                }
            default:
                return { cuenta: '', nombre: '' }
        }
    }

    const datosPago = getDatosPago()

    // Generate QR data string
    const qrData = metodoPago === 'banco'
        ? `Transferencia|${(datosPago as any).banco}|${datosPago.cuenta}|${datosPago.nombre}|Bs${monto}|Ref:${reservaId.slice(0, 8)}`
        : `${metodoPago.toUpperCase()}|${datosPago.cuenta}|${monto}|REF:${reservaId.slice(0, 8)}`

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className={`${metodo.color} px-6 py-4 text-white`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Pagar con {metodo.label}</h3>
                        <p className="text-white/80 text-sm">Escanea el código QR para pagar</p>
                    </div>
                </div>
            </div>

            {/* QR Code */}
            <div className="p-6">
                <div className={`${metodo.bgLight} p-8 rounded-xl flex justify-center mb-6`}>
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <QRCodeSVG
                            value={qrData}
                            size={200}
                            level="H"
                            includeMargin={true}
                        />
                    </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">
                            {metodoPago === 'banco' ? 'N° Cuenta' : 'Número'}
                        </span>
                        <button
                            onClick={() => handleCopy(datosPago.cuenta)}
                            className="font-mono font-medium text-gray-900 hover:text-rose-600 transition-colors"
                        >
                            {datosPago.cuenta}
                            {copied && <span className="ml-2 text-xs text-green-600">¡Copiado!</span>}
                        </button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Titular</span>
                        <span className="font-medium text-gray-900">{datosPago.nombre}</span>
                    </div>

                    {metodoPago === 'banco' && 'banco' in datosPago && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Banco</span>
                            <span className="font-medium text-gray-900">{(datosPago as any).banco}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center p-4 bg-rose-50 rounded-lg border border-rose-200">
                        <span className="text-rose-700 font-medium">Monto a Pagar</span>
                        <span className="text-2xl font-bold text-rose-600">Bs {monto.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Referencia</span>
                        <span className="font-mono text-sm text-gray-900">{reservaId.slice(0, 8).toUpperCase()}</span>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                        <strong>Importante:</strong> Después de realizar el pago, sube una captura del comprobante
                        para que podamos verificar tu pago.
                    </p>
                </div>
            </div>
        </div>
    )
}
