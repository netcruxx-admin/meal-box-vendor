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

type FormErrors = {
  name?: string;
  businessName?: string;
  description?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

const ADDRESS_REGEX = /^[a-zA-Z0-9\s,.\-\/#']+$/;
const LETTERS_ONLY_REGEX = /^[a-zA-Z\s]+$/;

function validateForm(form: any): FormErrors {
  const errors: FormErrors = {};

  // Name
  if (!form.name.trim()) {
    errors.name = 'Name is required';
  } else if (form.name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters';
  } else if (form.name.trim().length > 50) {
    errors.name = 'Name must not exceed 50 characters';
  }

  // Business Name
  if (!form.businessName.trim()) {
    errors.businessName = 'Business name is required';
  } else if (form.businessName.trim().length < 3) {
    errors.businessName = 'Business name must be at least 3 characters';
  } else if (form.businessName.trim().length > 50) {
    errors.businessName = 'Business name must not exceed 50 characters';
  }

  // Description (optional but max length)
  if (form.description.length > 300) {
    errors.description = 'Description must not exceed 300 characters';
  }

  // Address Line 1
  if (!form.address.line1.trim()) {
    errors.line1 = 'Address Line 1 is required';
  } else if (form.address.line1.length > 100) {
    errors.line1 = 'Address Line 1 must not exceed 100 characters';
  } else if (!ADDRESS_REGEX.test(form.address.line1)) {
    errors.line1 = 'Address contains invalid characters';
  }

  // Landmark (optional)
  if (form.address.line2) {
    if (form.address.line2.length > 100) {
      errors.line2 = 'Landmark must not exceed 100 characters';
    } else if (!ADDRESS_REGEX.test(form.address.line2)) {
      errors.line2 = 'Address contains invalid characters';
    }
  }

  // City
  if (!form.address.city.trim()) {
    errors.city = 'City is required';
  } else if (form.address.city.length > 50) {
    errors.city = 'City must not exceed 50 characters';
  } else if (!LETTERS_ONLY_REGEX.test(form.address.city)) {
    errors.city = 'City must contain only letters';
  }

  // State
  if (!form.address.state.trim()) {
    errors.state = 'State is required';
  } else if (form.address.state.length > 50) {
    errors.state = 'State must not exceed 50 characters';
  } else if (!LETTERS_ONLY_REGEX.test(form.address.state)) {
    errors.state = 'State must contain only letters';
  }

  // Pincode
  if (!form.address.pincode.trim()) {
    errors.pincode = 'Pincode is required';
  } else if (!/^\d{6}$/.test(form.address.pincode)) {
    errors.pincode = 'Pincode must be exactly 6 digits';
  }

  return errors;
}

export default function EditProfileScreen() {
  const router = useRouter();

  const { data, isLoading, refetch } = useGetProfileQuery(undefined);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const vendor = data?.vendor;
  const profileIsComplete = isProfileComplete(vendor);

  const [form, setForm] = useState({
    name: '',
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

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (vendor) {
      setForm({
        name: vendor.user?.name || '',
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
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleAddressChange = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [key]: value },
    }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSave = async () => {
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const hasAddress = Object.values(form.address).some(Boolean);

    try {
      await updateProfile({
        name: form.name,
        businessName: form.businessName,
        description: form.description,
        foodType: form.foodType,
        ...(hasAddress && { address: form.address }),
      }).unwrap();

      await refetch();

      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Vendor profile updated successfully.',
        visibilityTime: 2000,
      });

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
          label="Full Name"
          value={form.name}
          onChangeText={(v: string) => handleChange('name', v)}
          placeholder="Enter your full name"
          error={errors.name}
        />

        <InputField
          label="Business Name"
          value={form.businessName}
          onChangeText={(v: string) => handleChange('businessName', v)}
          placeholder="Enter your business name"
          error={errors.businessName}
        />

        <InputField
          label="Description"
          value={form.description}
          onChangeText={(v: string) => handleChange('description', v)}
          placeholder="Description (max 300 characters)"
          error={errors.description}
          multiline
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
          placeholder="e.g. 123, Main Street"
          error={errors.line1}
        />

        <InputField
          label="Landmark (Optional)"
          value={form.address.line2}
          onChangeText={(v: string) => handleAddressChange('line2', v)}
          placeholder="e.g. Near City Mall"
          error={errors.line2}
        />

        <InputField
          label="City"
          value={form.address.city}
          onChangeText={(v: string) => handleAddressChange('city', v)}
          placeholder="e.g. Mumbai"
          error={errors.city}
        />

        <InputField
          label="State"
          value={form.address.state}
          onChangeText={(v: string) => handleAddressChange('state', v)}
          placeholder="e.g. Maharashtra"
          error={errors.state}
        />

        <InputField
          label="Pincode"
          value={form.address.pincode}
          onChangeText={(v: string) => handleAddressChange('pincode', v)}
          placeholder="6-digit pincode"
          keyboardType="number-pad"
          maxLength={6}
          error={errors.pincode}
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
