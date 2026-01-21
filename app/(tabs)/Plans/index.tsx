import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PlansScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30}}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="calendar-outline" size={26} color="#000" />
        </View>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Subscribe to daily home-cooked meal service and enjoy hassle-free dining
        </Text>
      </View>

      {/* Why Subscribe */}
      <View style={styles.whyBox}>
        <Text style={styles.whyTitle}>Why Subscribe?</Text>

        <View style={styles.whyRow}>
          <WhyItem text="Save up to 37%" />
          <WhyItem text="Free delivery" />
        </View>

        <View style={styles.whyRow}>
          <WhyItem text="Priority support" />
          <WhyItem text="Fresh daily meals" />
        </View>
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>Subscription Plans</Text>

      {/* Weekly Plan */}
      <PlanCard
        title="Weekly Plan"
        price="₹980"
        originalPrice="₹1260"
        duration="7 days"
        meals="1 meal/day"
        features={[
          '7 fresh meal boxes',
          'Choose lunch or dinner',
          'Customizable menu',
          'Free delivery',
          '22% savings',
        ]}
        onSelect={() => { }}
      />

      {/* Monthly Plan */}
      <PlanCard
        title="Monthly Plan"
        price="₹3600"
        originalPrice="₹5400"
        duration="30 days"
        meals="1 meal/day"
        features={[
          '30 fresh meal boxes',
          'Choose lunch or dinner',
          'Weekly menu variety',
          'Free delivery',
          'Priority support',
          '33% savings',
        ]}
        popular
        onSelect={() => { }}
      />
    </ScrollView>
  );
}

/* ---------- Small Components ---------- */

const WhyItem = ({ text }: { text: string }) => (
  <View style={styles.whyItem}>
    <View style={styles.greenDot} />
    <Text style={styles.whyText}>{text}</Text>
  </View>
);

const PlanCard = ({
  title,
  price,
  originalPrice,
  duration,
  meals,
  features,
  popular,
  onSelect,
}: any) => (
  <View style={[styles.planCard, popular && styles.popularCard]}>
    {popular && (
      <View style={styles.popularBadge}>
        <Text style={styles.popularText}>Most Popular</Text>
      </View>
    )}

    <View style={styles.planHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.planTitle}>{title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{price}</Text>
          <Text style={styles.originalPrice}>{originalPrice}</Text>
        </View>
        <Text style={styles.planMeta}>
          {duration}  •  {meals}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.selectBtn, popular && styles.selectBtnDark]}
        onPress={onSelect}
      >
        <Text style={[styles.selectText, popular && styles.selectTextDark]}>
          Select
        </Text>
      </TouchableOpacity>
    </View>

    {features.map((item: string, index: number) => (
      <View key={index} style={styles.featureRow}>
        <Ionicons name="checkmark" size={18} color="green" />
        <Text style={styles.featureText}>{item}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },

  /* Header */
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },

  /* Why Subscribe */
  whyBox: {
    backgroundColor: '#FFF1E6',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  whyTitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
    color: '#8B2E00',
  },
  whyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  whyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'green',
    marginRight: 8,
  },
  whyText: {
    fontSize: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 20,
    textAlign: 'center',
    color: '#555',
  },

  /* Plan Card */
  planCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  popularCard: {
    borderColor: '#000',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 16,
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  price: {
    fontSize: 26,
    fontWeight: '700',
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  planMeta: {
    color: '#666',
    marginTop: 4,
  },

  selectBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  selectBtnDark: {
    backgroundColor: '#000',
  },
  selectText: {
    fontWeight: '600',
  },
  selectTextDark: {
    color: '#fff',
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
  },
});
