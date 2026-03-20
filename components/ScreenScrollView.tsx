import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ScrollView, ScrollViewProps } from 'react-native';

export default function ScreenScrollView({ contentContainerStyle, ...props }: ScrollViewProps) {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[{ paddingBottom: tabBarHeight }, contentContainerStyle]}
      {...props}
    />
  );
}
