import AppText from '@/components/AppText';
import Button from '@/components/Button';
import GoBack from '@/components/GoBack';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/services/userApi';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

type FoodType = 'veg' | 'non-veg' | 'both';

const FOOD_TYPE_OPTIONS: { label: string; value: FoodType; activeColor: string }[] = [
  { label: 'Veg', value: 'veg', activeColor: '#2e7d32' },
  { label: 'Non-Veg', value: 'non-veg', activeColor: '#c62828' },
  { label: 'Both', value: 'both', activeColor: '#e65100' },
];

export default function EditProfileScreen() {
  const router = useRouter();

  const { data, isLoading } = useGetProfileQuery(undefined);
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateProfileMutation();

  const vendor = data?.vendor;

  const [form, setForm] = useState({
    businessName: '',
    description: '',
    foodType: 'both' as FoodType,
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
    },
  });

  useEffect(() => {
    if (vendor) {
      setForm({
        businessName: vendor.businessName || '',
        description: vendor.description || '',
        foodType: (vendor.foodType as FoodType) || 'both',
        address: {
          line1: vendor.address?.line1 || '',
          line2: vendor.address?.line2 || '',
          city: vendor.address?.city || '',
          state: vendor.address?.state || '',
          pincode: vendor.address?.pincode || '',
        },
      });
    }
  }, [vendor]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddressChange = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!form.businessName) {
      Toast.show({
        type: 'error',
        text1: 'Validation',
        text2: 'Business name is required.',
        visibilityTime: 3000,
      });
      return;
    }

    const hasAddress = Object.values(form.address).some(Boolean);

    try {
      await updateProfile({
        businessName: form.businessName,
        description: form.description,
        foodType: form.foodType,
        ...(hasAddress && { address: form.address }),
      }).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Vendor profile updated successfully.',
        visibilityTime: 2000,
        onHide: () => router.back(),
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: err?.data?.message || 'Update failed. Please try again.',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <GoBack />
          <AppText weight='semiBold'>Edit Profile</AppText>
        </View>

        <TextInput
          placeholder="Business Name"
          value={form.businessName}
          onChangeText={(v) => handleChange('businessName', v)}
          style={styles.input}
        />

        <TextInput
          placeholder="Description"
          value={form.description}
          onChangeText={(v) => handleChange('description', v)}
          style={styles.input}
        />


        <AppText weight='semiBold'>Food Type</AppText>
        <View style={styles.segmentedControl}>
          {FOOD_TYPE_OPTIONS.map((option) => {
            const isSelected = form.foodType === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.segment, isSelected && { backgroundColor: option.activeColor }]}
                onPress={() => handleChange('foodType', option.value)}
                activeOpacity={0.8}
              >
                <AppText style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>
                  {option.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        <AppText weight='semiBold'>Address</AppText>
        <TextInput
          placeholder="Address Line 1"
          value={form.address.line1}
          onChangeText={(v) => handleAddressChange('line1', v)}
          style={styles.input}
        />
        <TextInput
          placeholder="Address Line 2"
          value={form.address.line2}
          onChangeText={(v) => handleAddressChange('line2', v)}
          style={styles.input}
        />
        <TextInput
          placeholder="City"
          value={form.address.city}
          onChangeText={(v) => handleAddressChange('city', v)}
          style={styles.input}
        />
        <TextInput
          placeholder="State"
          value={form.address.state}
          onChangeText={(v) => handleAddressChange('state', v)}
          style={styles.input}
        />
        <TextInput
          placeholder="Pincode"
          value={form.address.pincode}
          onChangeText={(v) => handleAddressChange('pincode', v)}
          style={styles.input}
          keyboardType="number-pad"
        />

        <Button
          title={isUpdating ? 'Saving...' : 'Save Changes'}
          variant="fill"
          fullWidth
          disabled={isUpdating}
          onPress={handleSave}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  segmentText: {
    fontSize: 12,
    color: '#555',
  },
  segmentTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});