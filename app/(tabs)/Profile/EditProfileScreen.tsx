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
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { isProfileComplete } from '@/utils/profileValidation';
import InputField from '@/components/ui/InputField';
import { Text } from '@react-navigation/elements';

type FoodType = 'veg' | 'non-veg' | 'both';

const FOOD_TYPE_OPTIONS: { label: string; value: FoodType; activeColor: string }[] = [
  { label: 'Veg', value: 'veg', activeColor: '#2e7d32' },
  { label: 'Non-Veg', value: 'non-veg', activeColor: '#c62828' },
  { label: 'Both', value: 'both', activeColor: '#e65100' },
];

export default function EditProfileScreen() {
  const router = useRouter();

  const { data, isLoading, refetch } = useGetProfileQuery(undefined);
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateProfileMutation();

  const vendor = data?.vendor;
  const profileIsComplete = isProfileComplete(vendor);

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

    // Check if all required fields are filled
    if (!form.address.line1 || !form.address.city || !form.address.state || !form.address.pincode) {
      Toast.show({
        type: 'error',
        text1: 'Validation',
        text2: 'Please fill in all required address fields (Line 1, City, State, Pincode).',
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

      // Refetch profile to get updated data
      await refetch();

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Vendor profile updated successfully.',
        visibilityTime: 2000,
      });

      // Navigate after a short delay to ensure data is updated
      setTimeout(() => {
        if (profileIsComplete) {
          router.back();
        } else {
          router.push('/(tabs)/Profile');
        }
      }, 2000);
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
          {profileIsComplete && <GoBack />}
          <AppText weight='semiBold'>Edit Profile</AppText>
        </View>

        {!profileIsComplete && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Please complete your profile to access all features
            </Text>
          </View>
        )}
        <InputField
          label="Business Name"
          value={form.businessName}
          onChangeText={(v: string) => handleChange('businessName', v)}
          placeholder="Enter your business name"
        />

        <InputField
          label="Description"
          value={form.description}
          onChangeText={(v: string) => handleChange('description', v)}
          placeholder="Description"
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
                <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <AppText weight="semiBold">Address</AppText>

        <InputField
          label="Address Line 1"
          value={form.address.line1}
          onChangeText={(v: string) => handleAddressChange('line1', v)}
        />

        <InputField
          label="Address Line 2 (Optional)"
          value={form.address.line2}
          onChangeText={(v: string) => handleAddressChange('line2', v)}
        />

        <InputField
          label="City"
          value={form.address.city}
          onChangeText={(v: string) => handleAddressChange('city', v)}
        />

        <InputField
          label="State"
          value={form.address.state}
          onChangeText={(v: string) => handleAddressChange('state', v)}
        />

        <InputField
          label="Pincode"
          value={form.address.pincode}
          onChangeText={(v: string) => handleAddressChange('pincode', v)}
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
    fontSize: 14,
    color: '#555',
  },
  segmentTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  warningText: {
    color: '#92400e',
    fontSize: 14,
  },
});