/**
 * HOME SCREEN
 * Main dashboard for mobile app
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import LinearGradient from 'react-native-linear-gradient'
import { api } from '../services/api'

export default function HomeScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null)
  const [dailyGoal, setDailyGoal] = useState<any>(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // TODO: Load actual data from API
      setUser({
        name: 'João',
        level: 3,
        xp: 1250,
        avatar: null,
      })
      setStreak(7)
      setDailyGoal({
        phrasesCompleted: 8,
        phraseGoal: 10,
        xpEarned: 80,
        xpGoal: 100,
      })
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.name || 'Usuário'}! 👋</Text>
            <Text style={styles.subtitle}>Continue seu aprendizado</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="notifications" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Streak Card */}
        <LinearGradient
          colors={['#3B82F6', '#8B5CF6']}
          style={styles.streakCard}
        >
          <Icon name="local-fire-department" size={40} color="#FFF" />
          <View style={styles.streakContent}>
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.streakLabel}>dias de sequência</Text>
          </View>
          <Icon name="arrow-forward" size={24} color="#FFF" />
        </LinearGradient>

        {/* Daily Goal */}
        {dailyGoal && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="flag" size={24} color="#3B82F6" />
              <Text style={styles.cardTitle}>Meta Diária</Text>
            </View>

            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Frases</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(dailyGoal.phrasesCompleted / dailyGoal.phraseGoal) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.goalValue}>
                {dailyGoal.phrasesCompleted}/{dailyGoal.phraseGoal}
              </Text>
            </View>

            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>XP</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(dailyGoal.xpEarned / dailyGoal.xpGoal) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.goalValue}>
                {dailyGoal.xpEarned}/{dailyGoal.xpGoal}
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ações Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Learn')}
            >
              <Icon name="school" size={32} color="#3B82F6" />
              <Text style={styles.actionLabel}>Aprender</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Progress')}
            >
              <Icon name="trending-up" size={32} color="#10B981" />
              <Text style={styles.actionLabel}>Progresso</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Challenges')}
            >
              <Icon name="emoji-events" size={32} color="#F59E0B" />
              <Text style={styles.actionLabel}>Desafios</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Social')}
            >
              <Icon name="people" size={32} color="#8B5CF6" />
              <Text style={styles.actionLabel}>Amigos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Continue Learning */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Continue Aprendendo</Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.navigate('Learn')}
          >
            <Text style={styles.continueButtonText}>Começar Lição</Text>
            <Icon name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakContent: {
    flex: 1,
    marginLeft: 16,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  streakLabel: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#FFF',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 8,
  },
  goalItem: {
    marginBottom: 16,
  },
  goalLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  goalValue: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  actionButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginRight: '2%',
  },
  actionLabel: {
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
})
