/**
 * CONTACT PAGE
 * Contact form for user inquiries and support
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

interface ContactFormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export default function Contact() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const subjectOptions = [
    { value: '', label: 'Selecione um assunto' },
    { value: 'general', label: 'Dúvida Geral' },
    { value: 'technical', label: 'Problema Técnico' },
    { value: 'billing', label: 'Pagamento e Cobrança' },
    { value: 'feedback', label: 'Sugestão ou Feedback' },
    { value: 'partnership', label: 'Parceria ou Business' },
    { value: 'other', label: 'Outro Assunto' },
  ]

  // Validation
  const validateForm = (): boolean => {
    const newErrors: ContactFormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    // Subject validation
    if (!formData.subject) {
      newErrors.subject = 'Selecione um assunto'
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Mensagem é obrigatória'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Mensagem deve ter pelo menos 10 caracteres'
    } else if (formData.message.trim().length > 2000) {
      newErrors.message = 'Mensagem deve ter no máximo 2000 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field
    if (errors[name as keyof ContactFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            English Flow
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/pricing"
              className="px-4 py-2 text-gray-700 font-semibold hover:text-primary-600 transition"
            >
              Preços
            </Link>
            <Link
              to="/about"
              className="px-4 py-2 text-gray-700 font-semibold hover:text-primary-600 transition"
            >
              Sobre
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 text-primary-600 font-semibold hover:bg-primary-50 rounded-lg transition"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
            <MessageSquare className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Entre em Contato
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tem dúvidas ou sugestões? Estamos aqui para ajudar! Preencha o
            formulário abaixo e responderemos em até 24 horas.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-8">
            {/* Email */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Envie-nos um email diretamente
                  </p>
                  <a
                    href="mailto:suporte@englishflow.com"
                    className="text-primary-600 font-semibold hover:underline"
                  >
                    suporte@englishflow.com
                  </a>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">WhatsApp</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Fale conosco via WhatsApp
                  </p>
                  <a
                    href="https://wa.me/5511999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 font-semibold hover:underline"
                  >
                    (11) 99999-9999
                  </a>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Horário de Atendimento
                  </h3>
                  <p className="text-gray-600 text-sm">
                    <strong>Segunda a Sexta:</strong> 9h - 18h<br />
                    <strong>Sábado:</strong> 9h - 13h<br />
                    <strong>Domingo:</strong> Fechado
                  </p>
                  <p className="text-xs text-gray-500 mt-2">(Horário de Brasília)</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Localização
                  </h3>
                  <p className="text-gray-600 text-sm">
                    São Paulo, SP<br />
                    Brasil
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Dúvidas Frequentes?</h3>
              <p className="text-purple-100 text-sm mb-4">
                Confira nossa página de FAQ antes de entrar em contato. Muitas
                dúvidas já têm resposta lá!
              </p>
              <Link
                to="/faq"
                className="inline-block bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition"
              >
                Ver FAQ
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Envie sua Mensagem
              </h2>
              <p className="text-gray-600 mb-8">
                Preencha o formulário abaixo e entraremos em contato em breve.
              </p>

              {/* Success Message */}
              {submitStatus === 'success' && (
                <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-green-900 font-bold mb-1">
                      Mensagem enviada com sucesso!
                    </h4>
                    <p className="text-green-800 text-sm">
                      Obrigado por entrar em contato. Responderemos em até 24
                      horas (dias úteis).
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-red-900 font-bold mb-1">Erro ao enviar</h4>
                    <p className="text-red-800 text-sm">
                      Ocorreu um erro ao enviar sua mensagem. Tente novamente ou
                      envie um email para suporte@englishflow.com
                    </p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Seu nome completo"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="seu@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Assunto *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition ${
                      errors.subject ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {subjectOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-900 mb-2"
                  >
                    Mensagem *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={8}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Descreva sua dúvida, sugestão ou problema em detalhes..."
                  />
                  <div className="flex items-center justify-between mt-1">
                    {errors.message ? (
                      <p className="text-sm text-red-600">{errors.message}</p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        {formData.message.length}/2000 caracteres
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Enviar Mensagem</span>
                    </>
                  )}
                </button>

                <p className="text-sm text-gray-600 text-center">
                  * Campos obrigatórios. Seus dados estão protegidos pela nossa{' '}
                  <Link to="/privacy" className="text-primary-600 hover:underline">
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 English Flow. Todos os direitos reservados.
          </p>
          <div className="mt-4 space-x-6">
            <Link to="/terms" className="text-gray-400 hover:text-white transition">
              Termos de Uso
            </Link>
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-white transition"
            >
              Privacidade
            </Link>
            <Link to="/faq" className="text-gray-400 hover:text-white transition">
              FAQ
            </Link>
            <Link to="/about" className="text-gray-400 hover:text-white transition">
              Sobre
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
