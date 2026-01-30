import AppText from '@/components/AppText';
import Button from '@/components/Button';
import GoBack from '@/components/GoBack';
import { colors } from '@/constants/theme';
import { useLoginMutation } from '@/services/authApi';
import { saveToken } from '@/utils/authStorage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [login, { isLoading, error }] = useLoginMutation();

  const handleLogin = async () => {
    if (!phone || !password) {
      alert('Phone and password are required');
      return;
    }

    try {
      const res = await login({
        phone,
        password,
      }).unwrap();

      await saveToken(res.token);
      alert('Login successful.');
      router.replace('/(tabs)');
    } catch (err: any) {
      alert(err?.data?.message || 'Login failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <GoBack />
      </View>
      <View style={styles.form_container}>

        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>👨‍🍳</Text>
        </View>

        <View style={styles.header}>
          <AppText type="title">
            Vendor Portal
          </AppText>

          <AppText type="subTitle">
            Manage your tiffin business
          </AppText>
        </View>

        {/* Email */}
        <AppText style={styles.label}>Email</AppText>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          autoCapitalize="none"
          placeholder="vendor@email.com"
          keyboardType="email-address"
        />

        {/* Password */}
        <AppText style={styles.label}>Password</AppText>
        <TextInput
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        <Button
          title="Login"
          variant="fill"
          fullWidth
          onPress={handleLogin}
        />

        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.linkText}>
            Don&apos;t have an account? <Text style={styles.link}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
  },
  form_container: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F0FF',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  avatarEmoji: {
    fontSize: 48,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#111',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  linkText: {
    textAlign: 'center',
    marginTop: 18,
    fontSize: 14,
    color: '#555',
  },

  link: {
    color: colors.primary,
    fontWeight: '600',
  },
});
