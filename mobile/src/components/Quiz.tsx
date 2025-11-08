import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export default function Quiz({ question, options, correctAnswer, onAnswer }: any) {
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)

  const handleSelect = (index: number) => {
    if (answered) return
    setSelected(index)
    setAnswered(true)
    setTimeout(() => onAnswer(index === correctAnswer), 1000)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.options}>
        {options.map((option: string, index: number) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              selected === index && (index === correctAnswer ? styles.correct : styles.incorrect),
            ]}
            onPress={() => handleSelect(index)}
            disabled={answered}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  question: { fontSize: 20, fontWeight: 'bold', marginBottom: 24, color: '#111827' },
  options: { gap: 12 },
  option: { padding: 16, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB' },
  optionText: { fontSize: 16, color: '#374151' },
  correct: { borderColor: '#10B981', backgroundColor: '#D1FAE5' },
  incorrect: { borderColor: '#EF4444', backgroundColor: '#FEE2E2' },
})
