import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function GameScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Здесь будет игра!</Text>
      <Link href="/" style={styles.backButton}>Назад на главную</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#25292e', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 24, marginBottom: 20 },
  backButton: { color: '#ffd33d', fontSize: 18, textDecorationLine: 'underline' }
});