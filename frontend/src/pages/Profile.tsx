import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import authService from '../services/auth.service'
import { LogOut, User, Mail, Zap, Flame, Trophy, Calendar, Crown } from 'lucide-react'

export default function Profile() {
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await authService.logout()
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="text-2xl font-bold text-primary-700">
            English Flow
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Dashboard
            </Link>
            <Link
              to="/lessons"
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Lições
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-12 h-12" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{user?.name || 'Usuário'}</h1>
              <div className="flex items-center gap-2 text-primary-100">
                <Mail className="w-4 h-4" />
                <span>{user?.email}</span>
              </div>
            </div>
            {user?.isPremium && (
              <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Premium
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Zap className="w-8 h-8 text-yellow-600" />}
            label="XP Total"
            value={user?.xp || 0}
            bgColor="bg-yellow-50"
          />
          <StatCard
            icon={<Flame className="w-8 h-8 text-orange-600" />}
            label="Streak Atual"
            value={`${user?.streak || 0} dias`}
            bgColor="bg-orange-50"
          />
          <StatCard
            icon={<Trophy className="w-8 h-8 text-purple-600" />}
            label="Level"
            value={user?.level || 1}
            bgColor="bg-purple-50"
          />
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações da Conta
          </h2>
          <div className="space-y-4">
            <InfoRow label="Nome" value={user?.name || 'Não informado'} />
            <InfoRow label="Email" value={user?.email || ''} />
            <InfoRow label="Plano" value={user?.isPremium ? 'Premium' : 'Freemium'} />
            <InfoRow
              label="Membro desde"
              value={new Date().toLocaleDateString('pt-BR')}
            />
          </div>
        </div>

        {/* Upgrade to Premium */}
        {!user?.isPremium && (
          <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-xl p-8 text-white text-center">
            <Crown className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Upgrade para Premium</h2>
            <p className="text-primary-100 mb-6">
              Acesso ilimitado a 5.000+ frases, IA conversacional e muito mais!
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-white text-primary-700 px-8 py-3 rounded-lg font-bold hover:bg-primary-50 transition">
                R$ 39,90/mês
              </button>
              <button className="bg-white/20 text-white px-8 py-3 rounded-lg font-bold hover:bg-white/30 transition">
                R$ 397/ano
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  bgColor,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  bgColor: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className={`${bgColor} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
