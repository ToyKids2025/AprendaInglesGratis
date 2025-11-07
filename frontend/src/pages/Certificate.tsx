/**
 * CERTIFICATE PAGE
 * Generate and download completion certificates
 */

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { Download, Share2, Award, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface CertificateData {
  studentName: string
  completionDate: string
  level: number
  totalXP: number
  phrasesCompleted: number
  certificateId: string
}

export default function Certificate() {
  const { user } = useAuthStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null)

  useEffect(() => {
    if (user) {
      setCertificateData({
        studentName: user.name || 'Aluno',
        completionDate: new Date().toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        level: user.level || 1,
        totalXP: user.xp || 0,
        phrasesCompleted: 100, // TODO: Get from API
        certificateId: `EF-${Date.now()}-${user.id.slice(0, 8)}`,
      })
    }
  }, [user])

  const generateCertificate = () => {
    if (!certificateData || !canvasRef.current) return

    setIsGenerating(true)

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size (A4 landscape: 1754x1240 at 150 DPI)
    canvas.width = 1754
    canvas.height = 1240

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#8b5cf6')
    gradient.addColorStop(1, '#a855f7')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Border
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 20
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100)

    // Inner border
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 5
    ctx.strokeRect(70, 70, canvas.width - 140, canvas.height - 140)

    // Title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 80px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('CERTIFICADO DE CONCLUSÃO', canvas.width / 2, 200)

    // Subtitle
    ctx.font = '40px Arial'
    ctx.fillText('English Flow', canvas.width / 2, 280)

    // Body text
    ctx.font = '32px Arial'
    ctx.fillText('Certificamos que', canvas.width / 2, 400)

    // Student name (highlighted)
    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 60px Arial'
    ctx.fillText(certificateData.studentName.toUpperCase(), canvas.width / 2, 500)

    // Achievement text
    ctx.fillStyle = '#ffffff'
    ctx.font = '32px Arial'
    ctx.fillText(
      `Concluiu com sucesso o Nível ${certificateData.level} do programa English Flow,`,
      canvas.width / 2,
      600
    )
    ctx.fillText(
      `dominando ${certificateData.phrasesCompleted} frases e acumulando ${certificateData.totalXP} XP.`,
      canvas.width / 2,
      660
    )

    // Date and location
    ctx.font = '28px Arial'
    ctx.fillText(
      `São Paulo, ${certificateData.completionDate}`,
      canvas.width / 2,
      800
    )

    // Certificate ID
    ctx.font = '20px Arial'
    ctx.fillStyle = '#e5e7eb'
    ctx.fillText(`ID: ${certificateData.certificateId}`, canvas.width / 2, 900)

    // Signature line
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2 - 200, 1000)
    ctx.lineTo(canvas.width / 2 + 200, 1000)
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.font = '24px Arial'
    ctx.fillText('English Flow Team', canvas.width / 2, 1040)

    // Award icon (simplified)
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(150, 150, 60, 0, Math.PI * 2)
    ctx.fill()

    setIsGenerating(false)
  }

  const downloadCertificate = () => {
    if (!canvasRef.current) return

    const link = document.createElement('a')
    link.download = `certificate-english-flow-${certificateData?.certificateId}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  const shareCertificate = async () => {
    if (!canvasRef.current) return

    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvasRef.current!.toBlob((blob) => resolve(blob!), 'image/png')
      })

      const file = new File([blob], 'certificate.png', { type: 'image/png' })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Meu Certificado English Flow',
          text: `Completei o Nível ${certificateData?.level} no English Flow! 🎓`,
          files: [file],
        })
      } else {
        // Fallback: download
        downloadCertificate()
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Faça login para gerar seu certificado</p>
          <Link
            to="/login"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Award className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-primary-900 mb-2">
              Seu Certificado
            </h1>
            <p className="text-primary-600">
              Parabéns por completar o Nível {user.level}! 🎉
            </p>
          </div>

          {/* Requirements */}
          {user.level < 1 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-8">
              <div className="flex items-start gap-3">
                <Award className="w-6 h-6 text-yellow-600 mt-1" />
                <div>
                  <h3 className="font-bold text-yellow-900 mb-2">
                    Complete requisitos para gerar certificado
                  </h3>
                  <ul className="space-y-2 text-yellow-800 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Completar pelo menos 80% das frases do nível
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Atingir 1.000 XP
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Manter streak de 7 dias
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Certificate Preview */}
          <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
            <canvas
              ref={canvasRef}
              className="w-full border-2 border-gray-200 rounded-lg"
              style={{ maxWidth: '100%', height: 'auto' }}
            />

            {!canvasRef.current?.width && (
              <div className="text-center py-20">
                <button
                  onClick={generateCertificate}
                  disabled={isGenerating}
                  className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 font-semibold"
                >
                  {isGenerating ? 'Gerando...' : '🎓 Gerar Certificado'}
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          {canvasRef.current?.width && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={downloadCertificate}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <Download className="w-5 h-5" />
                Baixar Certificado
              </button>
              <button
                onClick={shareCertificate}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Share2 className="w-5 h-5" />
                Compartilhar
              </button>
              <button
                onClick={generateCertificate}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Gerar Novamente
              </button>
            </div>
          )}

          {/* Info */}
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">ℹ️ Sobre o Certificado</h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>• Certificado válido e verificável pelo ID único</li>
              <li>• Compartilhe no LinkedIn, Instagram, ou WhatsApp</li>
              <li>• Comprova seu nível de inglês para empresas</li>
              <li>• Gere novo certificado a cada nível completado</li>
            </ul>
          </div>

          {/* Back button */}
          <div className="text-center mt-8">
            <Link
              to="/dashboard"
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              ← Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
