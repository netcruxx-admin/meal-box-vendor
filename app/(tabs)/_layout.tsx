import TabIcon from "@/components/TabIcon";
import { getToken } from "@/utils/authStorage";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    getToken().then((token) => setIsLoggedIn(!!token));
  }, []);

  if (isLoggedIn === null) return null;
  if (!isLoggedIn) return <Redirect href="/welcome" />;

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
      icon: "receipt-outline",
    },
    {
      name: "Plans",
      label: "Plans",
      icon: "receipt-outline",
    },
    {
      name: "Profile",
      label: "Profile",
      icon: "person-outline",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1,}}>
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
      </View>
    </SafeAreaView>
  );
}
