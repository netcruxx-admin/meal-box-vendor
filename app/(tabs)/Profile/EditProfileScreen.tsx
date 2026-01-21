import AppText from '@/components/AppText';
import Button from '@/components/Button';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/services/userApi';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

export default function EditProfileScreen() {
  const router = useRouter();

  const { data, isLoading } = useGetProfileQuery(undefined);
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateProfileMutation();

  const vendor = data?.vendor;

  const [form, setForm] = useState({
    businessName: '',
    description: '',
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
      alert('Business name is required');
      return;
    }

    const hasAddress = Object.values(form.address).some(Boolean);

    try {
      await updateProfile({
        businessName: form.businessName,
        description: form.description,
        ...(hasAddress && { address: form.address }),
      }).unwrap();

      alert('Vendor profile updated');
      router.back();
    } catch (err: any) {
      alert(err?.data?.message || 'Update failed');
    }
  };

  return (
    <View style={styles.container}>
      <AppText type='title'>Edit Profile</AppText>

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

      <AppText type='title'>Address</AppText>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
});