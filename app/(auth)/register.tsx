import AppText from '@/components/AppText';
import Button from '@/components/Button';
import GoBack from '@/components/GoBack';
import { colors } from '@/constants/theme';
import { useRegisterMutation } from '@/services/authApi';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const [register, { isLoading, error }] = useRegisterMutation();

    const handleRegister = async () => {
        if (!name || !phone || !password) {
            alert('All fields are required');
            return;
        }

        try {
            await register({
                name,
                phone,
                password,
            }).unwrap();

            alert('Registration successful. Please login.');

            router.replace('/(auth)/login');
        } catch (err: any) {
            alert(err?.data?.message || 'Registration failed');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View>
                <GoBack />
            </View>

            <View style={styles.form_container}>

                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarEmoji}>🍱</Text>
                </View>

                <View style={styles.header}>
                    <AppText type="title">
                        Become a Vendor
                    </AppText>

                    <AppText type="subTitle">
                        Start selling your tiffin services with us
                    </AppText>
                </View>
                <AppText style={styles.label}>Full Name</AppText>
                <TextInput
                    placeholder="Full Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                />
                <AppText style={styles.label}>Phone</AppText>

                <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    style={styles.input}
                    placeholder="Phone"
                    keyboardType="phone-pad"
                />
                <AppText style={styles.label}>Password</AppText>

                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    secureTextEntry
                />

                <Button
                    title={isLoading ? 'Creating...' : 'Create Account'}
                    variant="fill"
                    fullWidth
                    disabled={isLoading}
                    onPress={handleRegister}
                />

                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                    <Text style={styles.linkText}>
                        Already have an account? <Text style={styles.link}>Login</Text>
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
