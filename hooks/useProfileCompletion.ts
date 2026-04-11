import { useGetProfileQuery } from '@/services/userApi';
import { isProfileComplete } from '@/utils/profileValidation';
import { useRouter, usePathname } from 'expo-router';
import { useEffect } from 'react';

export function useProfileCompletion() {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading, error } = useGetProfileQuery(undefined);

  const vendor = data?.vendor;
  const profileComplete = isProfileComplete(vendor);

  useEffect(() => {
    // Skip check if still loading
    if (isLoading) return;

    // If profile not found, redirect to EditProfile
    const isApiError = (error: unknown): error is { data: { message?: string } } => {
      return typeof error === 'object' && error !== null && 'data' in error;
    };

    if (isApiError(error) && error.data?.message === 'Vendor profile not found') {
      if (!pathname.includes('EditProfileScreen')) {
        router.replace('/(tabs)/Profile/EditProfileScreen');
      }
      return;
    }

    // If profile exists but incomplete, redirect to EditProfile
    if (vendor && !profileComplete) {
      // Don't redirect if already on EditProfile screen
      if (!pathname.includes('EditProfileScreen')) {
        router.replace('/(tabs)/Profile/EditProfileScreen');
      }
    }
  }, [isLoading, vendor, profileComplete, pathname, error, router]);

  return {
    vendor,
    isLoading,
    profileComplete,
  };
}
