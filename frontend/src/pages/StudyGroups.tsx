/**
 * STUDY GROUPS PAGE
 * Join and create study groups for collaborative learning
 */

import { useState, useEffect } from 'react'
import { Users, Plus, Search, TrendingUp, Lock, Globe } from 'lucide-react'
import { api } from '../services/api'

interface StudyGroup {
  id: string
  name: string
  description?: string
  image?: string
  isPublic: boolean
  memberCount: number
  totalXP: number
  creator: {
    name?: string
    avatar?: string
  }
  isMember?: boolean
}

export default function StudyGroups() {
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [groupsRes, myGroupsRes] = await Promise.all([
        api.get('/api/social/groups'),
        api.get('/api/social/groups/my'),
      ])

      if (groupsRes.data.success) setGroups(groupsRes.data.groups)
      if (myGroupsRes.data.success) setMyGroups(myGroupsRes.data.groups)
    } catch (error) {
      console.error('Failed to load groups:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      loadData()
      return
    }

    try {
      const response = await api.get('/api/social/groups', {
        params: { q: query },
      })
      if (response.data.success) {
        setGroups(response.data.groups)
      }
    } catch (error) {
      console.error('Failed to search groups:', error)
    }
  }

  const joinGroup = async (groupId: string) => {
    try {
      await api.post(`/api/social/groups/${groupId}/join`)
      loadData()
    } catch (error) {
      console.error('Failed to join group:', error)
    }
  }

  const leaveGroup = async (groupId: string) => {
    if (!confirm('Tem certeza que deseja sair deste grupo?')) return

    try {
      await api.post(`/api/social/groups/${groupId}/leave`)
      loadData()
    } catch (error) {
      console.error('Failed to leave group:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Users className="w-8 h-8 text-primary-600" />
              Grupos de Estudo
            </h1>
            <p className="text-gray-600">Aprenda junto com outros estudantes</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Criar Grupo
          </button>
        </div>

        {/* My Groups */}
        {myGroups.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Meus Grupos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myGroups.map((group) => (
                <div key={group.id} className="bg-white rounded-xl shadow-sm p-6 border-2 border-primary-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{group.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
                    </div>
                    {group.isPublic ? (
                      <Globe className="w-5 h-5 text-green-600" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-600" />
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{group.memberCount} membros</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{group.totalXP.toLocaleString()} XP</span>
                    </div>
                  </div>

                  <button
                    onClick={() => leaveGroup(group.id)}
                    className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                  >
                    Sair do Grupo
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar grupos..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            />
          </div>
        </div>

        {/* Available Groups */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Grupos Disponíveis</h2>
          {groups.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum grupo encontrado</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Criar Primeiro Grupo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <div key={group.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{group.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
                    </div>
                    {group.isPublic ? (
                      <Globe className="w-5 h-5 text-green-600" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-600" />
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{group.memberCount} membros</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{group.totalXP.toLocaleString()} XP</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Criado por {group.creator.name || 'Usuário'}
                  </div>

                  {group.isMember ? (
                    <button
                      disabled
                      className="w-full px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
                    >
                      Já é membro
                    </button>
                  ) : (
                    <button
                      onClick={() => joinGroup(group.id)}
                      className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                    >
                      Participar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}

// Create Group Modal Component
function CreateGroupModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
    maxMembers: 50,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await api.post('/api/social/groups', formData)
      onSuccess()
    } catch (error) {
      console.error('Failed to create group:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Criar Grupo de Estudo</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Grupo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ex: Estudantes de Negócios"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxLength={500}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Descreva o objetivo do grupo..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibilidade
            </label>
            <select
              value={formData.isPublic ? 'public' : 'private'}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.value === 'public' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="public">Público - Qualquer um pode participar</option>
              <option value="private">Privado - Requer aprovação</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Máximo de Membros
            </label>
            <input
              type="number"
              value={formData.maxMembers}
              onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
              min={2}
              max={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
            >
              Criar Grupo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
