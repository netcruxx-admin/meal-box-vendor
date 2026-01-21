import TabIcon from '@/components/TabIcon';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getToken } from '@/utils/authStorage';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      setIsLoggedIn(!!token);
      setLoading(false);
    };

    checkAuth();
  }, []);

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
      name: 'index',
      label: 'Home',
      icon: 'home-outline',
    },
    {
      name: 'Weekly',
      label: 'Weekly',
      icon: 'calendar-outline',
    },
    {
      name: 'Plans',
      label: 'Plans',
      icon: 'card-outline',
    },
    {
      name: 'Manage',
      label: 'Manage',
      icon: 'settings-outline',
    },
    {
      name: 'Profile',
      label: 'Profile',
      icon: 'person-outline',
    },
  ];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarInactiveTintColor: '#ffffff40',
        tabBarActiveTintColor: '#ffffff',
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: '#fff' }} />
        ),
        tabBarStyle: { paddingTop: 5 },
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
                    size={20}
                    color={focused ? '#000' : '#777'}
                  />
                }
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
