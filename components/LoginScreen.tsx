import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { View, Text } from 'react-native';

async function handleLogin(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password);
}

export default function LoginScreen() {
  return (
    <View>
      <Text>Login</Text>
    </View>
  );
}