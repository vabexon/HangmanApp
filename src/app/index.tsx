import { View, Text, StyleSheet, Pressable, FlatList, Modal, SafeAreaView, Platform, useWindowDimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StartScreen() {
  const router = useRouter();
  const [isRulesVisible, setIsRulesVisible] = useState(false);
  const { width } = useWindowDimensions();
  const [isDesktop, setIsDesktop] = useState(false);
  
  const [winStreak, setWinStreak] = useState(0);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setIsDesktop(width > 768);
  }, [width]);

  const loadData = async () => {
    try {
      const streak = await AsyncStorage.getItem('@win_streak');
      if (streak !== null) setWinStreak(parseInt(streak));

      const historyData = await AsyncStorage.getItem('@game_history');
      if (historyData !== null) {
        setHistory(JSON.parse(historyData));
      } else {
        setHistory([]);
      }
    } catch (e) { console.log('Ошибка загрузки:', e); }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        
        <View style={styles.logoContainer}>
          <Ionicons name="skull-outline" size={isDesktop ? 100 : 70} color="#ffd33d" />
          <Text style={[styles.title, isDesktop && styles.titleDesktop]}>ВИСЕЛИЦА</Text>

          <View style={styles.winsContainer}>
            <Ionicons name="flame-outline" size={20} color="#ffd33d" />
            <Text style={styles.winsText}>Побед подряд: {winStreak}</Text>
          </View>

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
          <Text style={styles.historyTitle}>Ваш топ-3 лучших серий:</Text>
          
          {history.length === 0 ? (
            <Text style={styles.emptyText}>Здесь появятся ваши лучшие результаты</Text>
          ) : (
            <FlatList
              data={history}
              keyExtractor={(item) => item.id}
              style={styles.flatListStyle}
              showsVerticalScrollIndicator={true}
              renderItem={({ item }) => (
                <View style={styles.historyCard}>
                  <View style={styles.leftColumn}>
                    <Text style={styles.historyWord}>{item.word}</Text>
                    <Text style={styles.historyScore}>{item.score} побед подряд</Text>
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
                3. Если буква есть в слове — она открывается.{"\n\n"}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1e1e24', alignItems: 'center', paddingTop: Platform.OS === 'android' ? 25 : 0 },
  container: { flex: 1, width: '100%', maxWidth: 500, backgroundColor: '#25292e', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 40, paddingHorizontal: 20 },
  containerDesktop: { maxWidth: '100%', paddingHorizontal: 80 },
  logoContainer: { alignItems: 'center', marginTop: 10 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#fff', marginTop: 5, letterSpacing: 2 },
  titleDesktop: { fontSize: 48 },
  winsContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#333', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginTop: 15 },
  winsText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  rulesButton: { flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: '#333', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  rulesText: { color: '#aaa', marginLeft: 6, fontSize: 14 },
  startButton: { backgroundColor: '#ffd33d', paddingVertical: 16, paddingHorizontal: 60, borderRadius: 30, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
  startButtonDesktop: { paddingVertical: 20, paddingHorizontal: 100 },
  startButtonText: { color: '#25292e', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 },
  
historyContainer: { 
    width: '100%', 
    backgroundColor: '#333', 
    borderRadius: 15, 
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10, 
    height: 140, // Уменьшили высоту со 160 до 140
    justifyContent: 'flex-start' 
  },
  historyContainerDesktop: { padding: 20, height: 160 },
  historyTitle: { color: '#ffd33d', fontSize: 14, fontWeight: 'bold', marginBottom: 5 }, // Чуть уменьшили шрифт
  emptyText: { color: '#aaa', fontSize: 13, fontStyle: 'italic', textAlign: 'center', paddingVertical: 10 },
  flatListStyle: { flex: 1 },
  
  historyCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 5, // Уменьшили отступы внутри карточки
    borderBottomWidth: 1, 
    borderBottomColor: '#444' 
  },
  leftColumn: { flexDirection: 'column' },
  historyWord: { color: '#fff', fontSize: 13, fontWeight: 'bold' }, // Уменьшили шрифт
  historyScore: { color: '#ffd33d', fontSize: 11, marginTop: 1 }, // Уменьшили шрифт
  historyDate: { color: '#aaa', fontSize: 11 }, // Уменьшили шрифт
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', maxWidth: 400, backgroundColor: '#333', borderRadius: 20, padding: 20, alignItems: 'center' },
  modalContentDesktop: { maxWidth: 700, padding: 40 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffd33d', marginBottom: 15 },
  modalTitleDesktop: { fontSize: 32 },
  modalText: { color: '#fff', fontSize: 16, lineHeight: 24, marginBottom: 20 },
  modalTextDesktop: { fontSize: 20, lineHeight: 30 },
  closeButton: { backgroundColor: '#ffd33d', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 15 },
  closeButtonText: { color: '#25292e', fontWeight: 'bold', fontSize: 16 },
});