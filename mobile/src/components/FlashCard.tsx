import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

export default function FlashCard({ phrase, onNext }: any) {
  const [flipped, setFlipped] = useState(false)

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.card} onPress={() => setFlipped(!flipped)}>
        <Text style={styles.text}>{flipped ? phrase.portuguese : phrase.english}</Text>
        <Icon name="flip" size={24} color="#9CA3AF" style={styles.flipIcon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.nextButton} onPress={onNext}>
        <Text style={styles.nextText}>Próximo</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { height: 300, backgroundColor: '#FFF', borderRadius: 16, justifyContent: 'center', alignItems: 'center', padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  text: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#111827' },
  flipIcon: { position: 'absolute', bottom: 20, right: 20 },
  nextButton: { marginTop: 20, backgroundColor: '#3B82F6', padding: 16, borderRadius: 12, alignItems: 'center' },
  nextText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
})
