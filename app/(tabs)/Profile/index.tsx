import AppText from '@/components/AppText';
import Button from '@/components/Button';
import { useGetProfileQuery } from '@/services/userApi';
import { removeToken } from '@/utils/authStorage';
import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ApiError = {
  message?: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { data, isLoading, error } = useGetProfileQuery(undefined);

  const vendor = data?.vendor;
  const user = vendor?.user;

  const handleLogout = async () => {
    await removeToken();
    router.replace('/welcome');
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isApiError = (error: unknown): error is { data: ApiError } => {
    return (
      typeof error === 'object' &&
      error !== null &&
      'data' in error
    );
  };

  if (isApiError(error) && error.data?.message === 'Vendor profile not found') {
    router.replace('/(tabs)/Profile/EditProfileScreen');
    return null;
  }

  // if (error) {
  //   return (
  //     <View style={styles.center}>
  //       <Text>Failed to load profile</Text>
  //     </View>
  //   );
  // }

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <AppText type='subTitle'>Profile</AppText>

        {/* User Info */}
        <View style={styles.section}>
          <AppText>{vendor?.businessName}</AppText>
          <AppText>
            Owner: {user?.name}
          </AppText>
          <AppText>
            +91 {user?.phone}
          </AppText>
        </View>

        <View style={styles.section}>
          <AppText type='subTitle' >About Business</AppText>
          <AppText>
            {vendor?.description || 'No description added'}
          </AppText>
        </View>

        {/* Future Address Section */}
        <View style={styles.section}>
          <AppText type='subTitle'>Business Address</AppText>
          {vendor?.address ? (
            <AppText>
              {vendor.address.line1}
              {'\n'}
              {vendor.address.city}, {vendor.address.state}{' '}
              {vendor.address.pincode}
            </AppText>
          ) : (
            <AppText>No address added</AppText>
          )}
        </View>

      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Edit Profile"
          variant="outline"
          fullWidth
          onPress={() => router.push('/(tabs)/Profile/EditProfileScreen')}
        />
        <Button
          title="Logout"
          variant="fill"
          fullWidth
          onPress={handleLogout}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'space-between',
  },
  section: {
    marginBottom: 18,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    gap: 10,
    flexDirection: 'column'
  }
});