import { View, Text, StyleSheet, Pressable, SafeAreaView, Modal, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WORDS } from '../data/words'; // <-- ВОТ ОН, НАШ ФАЙЛ СО СЛОВАМИ

const ALPHABET = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');
const MAX_MISTAKES = 6;

export default function GameScreen() {
  const router = useRouter();

  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [finalWord, setFinalWord] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [usedWords, setUsedWords] = useState<string[]>([]);

  useEffect(() => {
    loadGameState();
  }, []);

  const loadGameState = async () => {
    setIsLoading(true);
    try {
      const savedGame = await AsyncStorage.getItem('@saved_game');
      if (savedGame) {
        const { savedWord, savedGuessed, savedMistakes } = JSON.parse(savedGame);
        if (savedMistakes < MAX_MISTAKES) {
          setWord(savedWord);
          setGuessedLetters(savedGuessed);
          setMistakes(savedMistakes);
          setIsLoading(false);
          return;
        }
      }
      await startNewGame(true);
    } catch (e) {
      await startNewGame(true);
    }
  };

  const saveGameState = async (currentWord: string, currentGuessed: string[], currentMistakes: number) => {
    try {
      await AsyncStorage.setItem('@saved_game', JSON.stringify({
        savedWord: currentWord,
        savedGuessed: currentGuessed,
        savedMistakes: currentMistakes
      }));
    } catch (e) { console.log(e); }
  };

  const startNewGame = async (reset = false) => {
    setIsLoading(true);
    setGuessedLetters([]);
    setMistakes(0);
    setIsGameOver(false);
    setIsWin(false);
    setFinalWord('');

    let newWord = '';

    // Пытаемся скачать из интернета
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('https://random-word-api.herokuapp.com/word?lang=ru&length=6', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (data && data[0]) {
        newWord = data[0].toUpperCase().replace(/Ё/g, 'Е');
      }
    } catch (error) {
      console.log('Нет интернета, играем с локальными словами.');
    }

    // Если интернет не сработал, берем из нашего файла WORDS
    if (!newWord) {
      let available = WORDS; // <-- ИСПОЛЬЗУЕМ ИМПОРТИРОВАННЫЙ ФАЙЛ
      
      if (reset || usedWords.length >= WORDS.length) {
        available = WORDS;
        setUsedWords([]);
      } else {
        available = WORDS.filter(w => !usedWords.includes(w));
      }

      const randomIndex = Math.floor(Math.random() * available.length);
      newWord = available[randomIndex];
    }

    setWord(newWord);
    setUsedWords(prev => [...prev, newWord]);
    setIsLoading(false);
    
    await AsyncStorage.removeItem('@saved_game');
  };

  const saveGameResult = async (win: boolean) => {
    try {
      let currentStreak = await AsyncStorage.getItem('@win_streak');
      let streak = currentStreak ? parseInt(currentStreak) : 0;
      
      if (win) {
        streak += 1;
        await AsyncStorage.setItem('@win_streak', streak.toString());
        
        const historyData = await AsyncStorage.getItem('@game_history');
        let history = historyData ? JSON.parse(historyData) : [];
        
        const date = new Date().toLocaleDateString('ru-RU');
        history.push({ id: Date.now().toString(), word: word, score: streak, date: date });history.sort((a: any, b: any) => b.score - a.score);
        history = history.slice(0, 3);
        
        await AsyncStorage.setItem('@game_history', JSON.stringify(history));
      } else {
        await AsyncStorage.setItem('@win_streak', '0');
      }
      await AsyncStorage.removeItem('@saved_game');
    } catch (e) { console.log(e); }
  };

  const handleLetterPress = (letter: string) => {
    if (guessedLetters.includes(letter) || isGameOver || isLoading) return;

    const newGuessed = [...guessedLetters, letter];
    setGuessedLetters(newGuessed);

    if (!word.includes(letter)) {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      
      saveGameState(word, newGuessed, newMistakes);

      if (newMistakes >= MAX_MISTAKES) {
        setFinalWord(word);
        setIsGameOver(true);
        setIsWin(false);
        saveGameResult(false);
      }
    } else {
      saveGameState(word, newGuessed, mistakes);

      const isWordGuessed = word.split('').every(l => newGuessed.includes(l));
      if (isWordGuessed) {
        setFinalWord(word);
        setIsGameOver(true);
        setIsWin(true);
        saveGameResult(true);
      }
    }
  };

  const renderWord = () => {
    return word.split('').map((letter, index) => (
      <Text key={index} style={styles.wordLetter}>
        {guessedLetters.includes(letter) ? letter : '_'}
      </Text>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push('/')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>ВИСЕЛИЦА</Text>
        <Text style={styles.livesText}>Жизни: {MAX_MISTAKES - mistakes}/{MAX_MISTAKES}</Text>
      </View>

      <View style={styles.hangmanContainer}>
        <View style={styles.hangmanBase}>
          <View style={styles.hangmanPole} />
          <View style={styles.hangmanBeam} />
          <View style={styles.hangmanRope} />
          
          {mistakes >= 1 && <View style={styles.hangmanHead} />}
          {mistakes >= 2 && <View style={styles.hangmanBody} />}
          {mistakes >= 3 && <View style={styles.hangmanLeftArm} />}
          {mistakes >= 4 && <View style={styles.hangmanRightArm} />}
          {mistakes >= 5 && <View style={styles.hangmanLeftLeg} />}
          {mistakes >= 6 && <View style={styles.hangmanRightLeg} />}
        </View>
      </View>

      <View style={styles.wordContainer}>
        {isLoading ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', height: 40 }}>
            <ActivityIndicator size="small" color="#ffd33d" />
            <Text style={{ color: '#fff', marginLeft: 10 }}>Загрузка...</Text>
          </View>
        ) : (
          renderWord()
        )}
      </View>

      <View style={styles.keyboardContainer}>
        {ALPHABET.map((letter) => {
          const isGuessed = guessedLetters.includes(letter);
          const isInWord = word.includes(letter);

          return (
            <Pressable
              key={letter}
              style={[
                styles.key,
                isGuessed && (isInWord ? styles.keyCorrect : styles.keyWrong)
              ]}
              onPress={() => handleLetterPress(letter)}
              disabled={isGuessed || isGameOver || isLoading}
            >
              <Text style={[styles.keyText, isGuessed && { color: '#fff' }]}>
                {letter}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.restartButton} onPress={() => startNewGame(false)}>
        <Text style={styles.restartButtonText}>Начать заново</Text>
      </Pressable>

      <Modal visible={isGameOver} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name={isWin ? "happy-outline" : "sad-outline"} 
              size={80} 
              color={isWin ? "#4CAF50" : "#ff4d4d"} 
            />
            <Text style={styles.modalTitle}>
              {isWin ? 'Победа!' : 'Поражение'}
            </Text>
            <Text style={styles.modalText}>
              {isWin 
                ? 'Вы отлично справились и угадали слово!' 
                : `Вы проиграли. Загаданное слово: ${finalWord}`}
            </Text>
            
            <Pressable 
              style={styles.modalButton} 
              onPress={() => {
                setIsGameOver(false);
                setTimeout(() => startNewGame(false), 100);
              }}
            >
              <Text style={styles.modalButtonText}>Далее</Text>
            </Pressable>
            <Pressable 
              style={styles.modalButtonSecondary} 
              onPress={async () => {
                setIsGameOver(false);
                await new Promise(resolve => setTimeout(resolve, 200));
                router.push('/');
              }}
            >
              <Text style={styles.modalButtonSecondaryText}>В меню</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#25292e' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#1e1e24' },
  backButton: { padding: 5 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
  livesText: { color: '#ffd33d', fontSize: 16, fontWeight: 'bold' },
  hangmanContainer: { height: 200, justifyContent: 'flex-end', alignItems: 'center', marginTop: 20, marginBottom: 10 },
  hangmanBase: { width: 160, height: 190, position: 'relative' },
  hangmanPole: { position: 'absolute', bottom: 0, left: 30, width: 10, height: 190, backgroundColor: '#fff' },
  hangmanBeam: { position: 'absolute', top: 0, left: 30, width: 100, height: 10, backgroundColor: '#fff' },
  hangmanRope: { position: 'absolute', top: 10, left: 110, width: 6, height: 40, backgroundColor: '#ffd33d' },
  hangmanHead: { position: 'absolute', top: 50, left: 98, width: 30, height: 30, borderRadius: 15, borderWidth: 4, borderColor: '#fff', backgroundColor: '#25292e' },
  hangmanBody: { position: 'absolute', top: 80, left: 110, width: 6, height: 50, backgroundColor: '#fff' },
  hangmanLeftArm: { position: 'absolute', top: 85, left: 90, width: 20, height: 6, backgroundColor: '#fff', transform: [{ rotate: '30deg' }] },
  hangmanRightArm: { position: 'absolute', top: 85, left: 116, width: 20, height: 6, backgroundColor: '#fff', transform: [{ rotate: '-30deg' }] },
  hangmanLeftLeg: { position: 'absolute', top: 125, left: 94, width: 6, height: 35, backgroundColor: '#fff', transform: [{ rotate: '20deg' }] },
  hangmanRightLeg: { position: 'absolute', top: 125, left: 126, width: 6, height: 35, backgroundColor: '#fff', transform: [{ rotate: '-20deg' }] },
  wordContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginVertical: 10, paddingHorizontal: 20, minHeight: 50 },
  wordLetter: { fontSize: 30, fontWeight: 'bold', color: '#fff', marginHorizontal: 4, letterSpacing: 2 },
  keyboardContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 10 },
  key: { width: 36, height: 46, backgroundColor: '#444', justifyContent: 'center', alignItems: 'center', borderRadius: 8, margin: 3 },
  keyCorrect: { backgroundColor: '#4CAF50' },
  keyWrong: { backgroundColor: '#F44336' },
  keyText: { color: '#ffd33d', fontSize: 16, fontWeight: 'bold' },
  restartButton: { backgroundColor: '#ffd33d', paddingVertical: 15, borderRadius: 25, alignItems: 'center', marginHorizontal: 40, marginTop: 20, marginBottom: 20 },
  restartButtonText: { color: '#25292e', fontSize: 18, fontWeight: 'bold' },modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', maxWidth: 400, backgroundColor: '#333', borderRadius: 20, padding: 30, alignItems: 'center' },
  modalTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 15, marginBottom: 10 },
  modalText: { fontSize: 16, color: '#ccc', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  modalButton: { backgroundColor: '#ffd33d', width: '100%', paddingVertical: 15, borderRadius: 15, alignItems: 'center', marginBottom: 10 },
  modalButtonText: { color: '#25292e', fontSize: 18, fontWeight: 'bold' },
  modalButtonSecondary: { width: '100%', paddingVertical: 15, borderRadius: 15, alignItems: 'center' },
  modalButtonSecondaryText: { color: '#aaa', fontSize: 16, fontWeight: 'bold' },
});