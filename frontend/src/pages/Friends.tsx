/**
 * FRIENDS PAGE
 * Manage friends, search users, and send friend requests
 */

import { useState, useEffect } from 'react'
import { UserPlus, Users, Search, Check, X, Mail } from 'lucide-react'
import { api } from '../services/api'

interface Friend {
  id: string
  name?: string
  email: string
  avatar?: string
  xp: number
  level: number
  streak: number
  friendsSince?: string
}

interface FriendRequest {
  id: string
  name?: string
  email: string
  avatar?: string
  xp: number
  level: number
  requestId: string
  requestedAt: string
}

interface SearchUser {
  id: string
  name?: string
  email: string
  avatar?: string
  xp: number
  level: number
  friendshipStatus: string | null
}

export default function Friends() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [friendsRes, requestsRes] = await Promise.all([
        api.get('/api/social/friends'),
        api.get('/api/social/friends/requests'),
      ])

      if (friendsRes.data.success) setFriends(friendsRes.data.friends)
      if (requestsRes.data.success) setRequests(requestsRes.data.requests)
    } catch (error) {
      console.error('Failed to load friends:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const response = await api.get('/api/social/users/search', {
        params: { q: query },
      })
      if (response.data.success) {
        setSearchResults(response.data.users)
      }
    } catch (error) {
      console.error('Failed to search users:', error)
    }
  }

  const sendFriendRequest = async (userId: string) => {
    try {
      await api.post(`/api/social/friends/request/${userId}`)
      handleSearch(searchQuery) // Refresh search results
    } catch (error) {
      console.error('Failed to send friend request:', error)
    }
  }

  const acceptRequest = async (friendId: string) => {
    try {
      await api.post(`/api/social/friends/accept/${friendId}`)
      loadData()
    } catch (error) {
      console.error('Failed to accept request:', error)
    }
  }

  const rejectRequest = async (friendId: string) => {
    try {
      await api.post(`/api/social/friends/reject/${friendId}`)
      loadData()
    } catch (error) {
      console.error('Failed to reject request:', error)
    }
  }

  const removeFriend = async (friendId: string) => {
    if (!confirm('Tem certeza que deseja remover este amigo?')) return

    try {
      await api.delete(`/api/social/friends/${friendId}`)
      loadData()
    } catch (error) {
      console.error('Failed to remove friend:', error)
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Amigos</h1>
          <p className="text-gray-600">Conecte-se com outros estudantes</p>
        </div>

        {/* Search */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar usuários..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      {user.name?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {user.name || 'Usuário'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Level {user.level} • {user.xp} XP
                      </div>
                    </div>
                  </div>

                  {user.friendshipStatus === 'accepted' ? (
                    <span className="text-sm text-green-600 font-medium">Amigo</span>
                  ) : user.friendshipStatus === 'pending' ? (
                    <span className="text-sm text-yellow-600 font-medium">Pendente</span>
                  ) : (
                    <button
                      onClick={() => sendFriendRequest(user.id)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                    >
                      <UserPlus className="w-4 h-4 inline-block mr-1" />
                      Adicionar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Friend Requests */}
        {requests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Solicitações de Amizade ({requests.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {requests.map((request) => (
                <div key={request.requestId} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      {request.name?.[0] || request.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {request.name || 'Usuário'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Level {request.level} • {request.xp} XP
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRequest(request.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => rejectRequest(request.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Seus Amigos ({friends.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {friends.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Você ainda não tem amigos. Use a busca acima para encontrar usuários!
              </div>
            ) : (
              friends.map((friend) => (
                <div key={friend.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      {friend.name?.[0] || friend.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {friend.name || 'Usuário'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Level {friend.level} • {friend.xp} XP • {friend.streak} dias de sequência
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFriend(friend.id)}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm"
                  >
                    Remover
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
