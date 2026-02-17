'use client'

import { useActionState } from 'react'
import { submitContactForm, ContactState } from '@/app/actions/contact'
import { MapPin, Mail, Clock, CheckCircle, Send } from 'lucide-react'

const initialState: ContactState = {}

export default function ContactoPage() {
    const [state, formAction, isPending] = useActionState(submitContactForm, initialState)

    return (
        <div className="bg-background min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-b from-dark to-dark-light text-white py-20 md:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">Contáctanos</h1>
                    <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                        Estamos aquí para responder tus dudas y ayudarte a planificar tu próxima aventura.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Formulario */}
                    <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-border">
                        <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Envíanos un mensaje</h2>

                        {state.success ? (
                            <div className="bg-secondary/10 border border-secondary/20 text-foreground p-8 rounded-2xl text-center">
                                <CheckCircle className="w-12 h-12 mx-auto text-secondary mb-4" />
                                <h3 className="text-lg font-bold mb-1">¡Mensaje enviado!</h3>
                                <p className="text-muted-foreground text-sm">Gracias por contactarnos. Te responderemos a la brevedad posible.</p>
                            </div>
                        ) : (
                            <form action={formAction} className="space-y-5">
                                <div>
                                    <label htmlFor="nombre" className="block text-sm font-semibold text-foreground mb-2">
                                        Nombre Completo
                                    </label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        className="input-warm"
                                        required
                                        placeholder="Juan Pérez"
                                    />
                                    {state.fieldErrors?.nombre && (
                                        <p className="text-error text-sm mt-1">{state.fieldErrors.nombre[0]}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="input-warm"
                                        required
                                        placeholder="juan@ejemplo.com"
                                    />
                                    {state.fieldErrors?.email && (
                                        <p className="text-error text-sm mt-1">{state.fieldErrors.email[0]}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="mensaje" className="block text-sm font-semibold text-foreground mb-2">
                                        Mensaje
                                    </label>
                                    <textarea
                                        id="mensaje"
                                        name="mensaje"
                                        rows={5}
                                        className="input-warm resize-none"
                                        required
                                        placeholder="Hola, me gustaría información sobre..."
                                    />
                                    {state.fieldErrors?.mensaje && (
                                        <p className="text-error text-sm mt-1">{state.fieldErrors.mensaje[0]}</p>
                                    )}
                                </div>

                                {state.error && (
                                    <div className="bg-error/10 text-error p-4 rounded-xl text-sm font-medium">
                                        {state.error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="btn-primary-warm w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isPending ? (
                                        'Enviando...'
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Enviar Mensaje
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Información y Mapa */}
                    <div className="space-y-8">
                        <div className="grid gap-6">
                            {[
                                {
                                    icon: MapPin,
                                    title: 'Ubicación',
                                    lines: ['Av. 16 de Julio #1440, El Prado', 'La Paz, Bolivia'],
                                },
                                {
                                    icon: Mail,
                                    title: 'Email',
                                    lines: ['info@tourreservas.bo', 'ventas@tourreservas.bo'],
                                },
                                {
                                    icon: Clock,
                                    title: 'Horario de Atención',
                                    lines: ['Lunes a Viernes: 9:00 - 18:00', 'Sábados: 9:00 - 13:00'],
                                },
                            ].map(({ icon: Icon, title, lines }) => (
                                <div key={title} className="flex items-start gap-4">
                                    <div className="w-11 h-11 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-foreground">{title}</h3>
                                        {lines.map((line) => (
                                            <p key={line} className="text-muted-foreground text-sm">{line}</p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mapa Embed */}
                        <div className="aspect-video rounded-2xl overflow-hidden shadow-sm border border-border">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15301.996173004812!2d-68.1299557!3d-16.5020104!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x915f206259d33261%3A0xe7585215b0266e7!2sEl%20Prado%2C%20La%20Paz!5e0!3m2!1sen!2sbo!4v1716327000000!5m2!1sen!2sbo"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={true}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
