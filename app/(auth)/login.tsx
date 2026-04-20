import AppText from '@/components/AppText';
import Button from '@/components/Button';
import GoBack from '@/components/GoBack';
import { colors } from '@/constants/theme';
import { useLoginMutation } from '@/services/authApi';
import { saveToken } from '@/utils/authStorage';
import { AuthErrors, hasErrors, validateLoginForm } from '@/utils/authValidation';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import ErrorText from '@/components/ErrorText';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<AuthErrors>({});

  const [login] = useLoginMutation();

  const handleLogin = async () => {
    const validationErrors = validateLoginForm(phone, password);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    try {
      const res = await login({
        phone,
        password,
        role: 'vendor'
      }).unwrap();

      await saveToken(res.token);
      Toast.show({ type: 'success', text1: 'Login successful' });
      router.replace('/(tabs)');
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: err?.data?.message || 'Something went wrong. Please try again.',
        visibilityTime: 4000,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <GoBack />
      </View>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.form_container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>👨‍🍳</Text>
          </View>

          <View style={styles.header}>
            <AppText type="title">
              Vendor Portal
            </AppText>

            <AppText>
              Manage your tiffin business
            </AppText>
          </View>

          {/* Phone */}
          <AppText style={styles.label}>Phone</AppText>
          <TextInput
            value={phone}
            onChangeText={(val) => {
              setPhone(val);
              setErrors(prev => ({ ...prev, phone: undefined }));
            }}
            style={[styles.input, errors.phone ? styles.inputError : null]}
            autoCapitalize="none"
            placeholder="9876543210"
            keyboardType="phone-pad"
          />
          <ErrorText message={errors.phone} />

          {/* Password */}
          <AppText style={styles.label}>Password</AppText>
          <View style={[styles.passwordWrapper, errors.password ? styles.inputError : null]}>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                setErrors(prev => ({ ...prev, password: undefined }));
              }}
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(prev => !prev)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#9ca3af" />
            </TouchableOpacity>
          </View>
          <ErrorText message={errors.password} />

          <View style={{ marginTop: 20 }}>
            <Button
              title="Login"
              variant="fill"
              fullWidth
              onPress={handleLogin}
            />
          </View>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.linkText}>
              Don&apos;t have an account? <Text style={styles.link}>Register</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  form_container: {
    flexGrow: 1,
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
    marginBottom: 4,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 4,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
  },
  eyeBtn: {
    paddingHorizontal: 14,
  },
  linkText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    color: '#555',
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
});
