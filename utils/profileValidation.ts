type VendorProfile = {
  businessName?: string;
  description?: string;
  foodType?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
};

export function isProfileComplete(vendor: VendorProfile | undefined): boolean {
  if (!vendor) return false;

  // Check if businessName exists
  if (!vendor.businessName || vendor.businessName.trim() === '') {
    return false;
  }

  // Check if address exists and has required fields
  if (!vendor.address) {
    return false;
  }

  const { line1, city, state, pincode } = vendor.address;

  // All address fields should be filled
  if (!line1 || !city || !state || !pincode) {
    return false;
  }

  return true;
}
