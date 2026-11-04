import { View, Text, StyleSheet, Pressable, FlatList, Modal } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

const HISTORY: any[] = [];

export default function StartScreen() {
  const router = useRouter();
  const [isRulesVisible, setIsRulesVisible] = useState(false);

  const topThreeGames = [...HISTORY]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Ionicons name="skull-outline" size={80} color="#ffd33d" />
        <Text style={styles.title}>ВИСЕЛИЦА</Text>

        <Pressable onPress={() => setIsRulesVisible(true)} style={styles.rulesButton}>
          <Ionicons name="help-circle-outline" size={20} color="#aaa" />
          <Text style={styles.rulesText}>Как играть?</Text>
        </Pressable>
      </View>

      <Pressable 
        style={styles.startButton} 
        onPress={() => router.push('/game')}
      >
        <Text style={styles.startButtonText}>СТАРТ</Text>
      </Pressable>

      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Ваш топ-3 лучших игр:</Text>
        
        {topThreeGames.length === 0 ? (
          <Text style={styles.emptyText}>Здесь появятся ваши лучшие результаты</Text>
        ) : (
          <FlatList
            data={topThreeGames}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.historyCard}>
                <View style={styles.leftColumn}>
                  <Text style={styles.historyWord}>{item.word}</Text>
                  <Text style={styles.historyScore}>{item.score} баллов</Text>
                </View>
                <Text style={styles.historyDate}>{item.date}</Text>
              </View>
            )}
          />
        )}
      </View>

      <Modal visible={isRulesVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Правила игры</Text>
            <Text style={styles.modalText}>
              1. Компьютер загадывает слово и показывает его в виде прочерков.
              {"\n\n"}
              2. Вы вводите буквы по одной.
              {"\n\n"}
              3. Если буква есть в слове — она открывается.
              {"\n\n"}
              4. Если буквы нет — вы теряете одну жизнь (всего их 6).
              {"\n\n"}
              5. Угадайте все буквы, пока не кончились жизни!
            </Text>
            <Pressable style={styles.closeButton} onPress={() => setIsRulesVisible(false)}>
              <Text style={styles.closeButtonText}>Понятно</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    letterSpacing: 2,
  },
  rulesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  rulesText: {
    color: '#aaa',
    marginLeft: 6,
    fontSize: 14,
  },
  startButton: {
    backgroundColor: '#ffd33d',
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  startButtonText: {
    color: '#25292e',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  historyContainer: {
    width: '100%',
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    minHeight: 120,
    justifyContent: 'center',
  },
  historyTitle: {
    color: '#ffd33d',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  leftColumn: {
    flexDirection: 'column',
  },
  historyWord: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyScore: {
    color: '#ffd33d',
    fontSize: 12,
    marginTop: 2,
  },
  historyDate: {
    color: '#aaa',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 15,
  },
  modalText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#ffd33d',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 15,
  },
  closeButtonText: {
    color: '#25292e',
    fontWeight: 'bold',
    fontSize: 16,
  },
});