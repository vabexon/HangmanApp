import { View, Text, StyleSheet, Pressable, FlatList, Modal, SafeAreaView, Platform, useWindowDimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

const HISTORY: any[] = [];

export default function StartScreen() {
  const router = useRouter();
  const [isRulesVisible, setIsRulesVisible] = useState(false);

  // Получаем ширину экрана
  const { width } = useWindowDimensions();
  // По умолчанию считаем, что это мобилка (чтобы избежать ошибки гидратации в вебе)
  const [isDesktop, setIsDesktop] = useState(false);

  // Как только приложение загрузится в браузере, проверяем реальную ширину
  useEffect(() => {
    setIsDesktop(width > 768);
  }, [width]);

  const topThreeGames = [...HISTORY]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        
        <View style={styles.logoContainer}>
          <Ionicons name="skull-outline" size={isDesktop ? 100 : 70} color="#ffd33d" />
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>ВИСЕЛИЦА</Text>

          <Pressable onPress={() => setIsRulesVisible(true)} style={styles.rulesButton}>
            <Ionicons name="help-circle-outline" size={20} color="#aaa" />
            <Text style={styles.rulesText}>Как играть?</Text>
          </Pressable>
        </View>

        <Pressable 
          style={[styles.startButton, isDesktop && styles.startButtonDesktop]} 
          onPress={() => router.push('/game')}
        >
          <Text style={styles.startButtonText}>СТАРТ</Text>
        </Pressable>

        <View style={[styles.historyContainer, isDesktop && styles.historyContainerDesktop]}>
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
            <View style={[styles.modalContent, isDesktop && styles.modalContentDesktop]}>
              <Text style={[styles.modalTitle, isDesktop && styles.modalTitleDesktop]}>Правила игры</Text>
              <Text style={[styles.modalText, isDesktop && styles.modalTextDesktop]}>
                1. Компьютер загадывает слово и показывает его в виде прочерков.
                {"\n\n"}
                2. Вы вводите буквы по одной.
                {"\n\n"}
                3. Если буква есть в слове - она открывается.
                {"\n\n"}
                4. Если буквы нет - вы теряете одну жизнь (всего их 6).
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1e1e24',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  containerDesktop: {
    maxWidth: '100%',
    paddingHorizontal: 80,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
    letterSpacing: 2,
  },
  titleDesktop: {
    fontSize: 48,
  },
  rulesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
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
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  startButtonDesktop: {
    paddingVertical: 20,
    paddingHorizontal: 100,
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
    marginBottom: 10,
    minHeight: 110,
    justifyContent: 'center',
  },
  historyContainerDesktop: {
    padding: 30,
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
    maxWidth: 400,
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalContentDesktop: {
    maxWidth: 700,
    padding: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffd33d',
    marginBottom: 15,
  },
  modalTitleDesktop: {
    fontSize: 32,
  },
  modalText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  modalTextDesktop: {
    fontSize: 20,
    lineHeight: 30,
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