import { getToken } from "@/utils/authStorage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { colors } from "@/constants/theme";
import { View } from "react-native";

export default function TabLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const { isLoading: profileLoading } = useProfileCompletion();

  useEffect(() => {
    getToken().then((token) => setIsLoggedIn(!!token));
  }, []);

  if (isLoggedIn === null || profileLoading) return null;
  if (!isLoggedIn) return <Redirect href="/welcome" />;

  type TabConfig = {
    name: string;
    label: string;
    iconOutline: keyof typeof Ionicons.glyphMap;
    iconFilled: keyof typeof Ionicons.glyphMap;
  };

  const tabs: TabConfig[] = [
    {
      name: "index",
      label: "Home",
      iconOutline: "home-outline",
      iconFilled: "home",
    },
    {
      name: "Menu",
      label: "Menu",
      iconOutline: "fast-food-outline",
      iconFilled: "fast-food",
    },
    {
      name: "Subscriptions",
      label: "Subscriptions",
      iconOutline: "receipt-outline",
      iconFilled: "receipt",
    },
    {
      name: "Plans",
      label: "Plans",
      iconOutline: "pricetag-outline",
      iconFilled: "pricetag",
    },
    {
      name: "Profile",
      label: "Profile",
      iconOutline: "person-outline",
      iconFilled: "person",
    },
  ];

  const hiddenTabs = ["Reviews"];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={['top', 'left', 'right']}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarInactiveTintColor: "#6b7280",
          tabBarActiveTintColor: colors.primary,
          tabBarBackground: () => (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }} />
          ),
          tabBarStyle: { paddingTop: 8 },
        }}
      >
        {tabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.label,
              tabBarLabel: tab.label,
              tabBarIcon: ({ color }) => (
                <Ionicons
                  name={tab.iconFilled}
                  size={24}
                  color={color}
                />
              ),
            }}
          />
        ))}
        {hiddenTabs.map((name) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{ href: null }}
          />
        ))}
      </Tabs>
    </SafeAreaView>
  );
}
