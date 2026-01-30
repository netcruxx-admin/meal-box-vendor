import TabIcon from "@/components/TabIcon";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getToken } from "@/utils/authStorage";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const token = await getToken();
  //     setIsLoggedIn(!!token);
  //     setLoading(false);
  //   };

  //   checkAuth();
  // }, []);

  if (loading) return null;

  if (!isLoggedIn) {
    return <Redirect href="/welcome" />;
  }
  type TabItem = {
    name: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  };

  const tabs: TabItem[] = [
    {
      name: "index",
      label: "Dashboard",
      icon: "home-outline",
    },
    {
      name: "Menu",
      label: "Menu",
      icon: "fast-food-outline",
    },
    {
      name: "Orders",
      label: "Orders",
      icon: "menu",
    },
    {
      name: "Plans",
      label: "Profile",
      icon: "person-outline",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarInactiveTintColor: "#ffffff40",
          tabBarActiveTintColor: "#ffffff",
          tabBarStyle: {
            backgroundColor: "white",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "transparent",
          },
        }}
      >
        {tabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              tabBarIcon: ({ focused }) => (
                <TabIcon
                  focused={focused}
                  label={tab.label}
                  icon={
                    <Ionicons
                      name={tab.icon as any}
                      size={25}
                      // color={focused ? "#000" : "#777"}
                    />
                  }
                />
              ),
            }}
          />
        ))}
      </Tabs>
    </SafeAreaView>
  );
}
