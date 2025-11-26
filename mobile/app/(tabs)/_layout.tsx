import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, ListTodo, BookOpen, Settings } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

function TabBarIcon(props: {
  icon: React.ElementType;
  color: string;
}) {
  const Icon = props.icon;
  return <Icon size={28} color={props.color} style={{ marginBottom: -3 }} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabBarIcon icon={LayoutDashboard} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: 'Reminders',
          tabBarIcon: ({ color }) => <TabBarIcon icon={ListTodo} color={color} />,
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: 'Learning',
          tabBarIcon: ({ color }) => <TabBarIcon icon={BookOpen} color={color} />,
        }}
      />
    </Tabs>
  );
}
