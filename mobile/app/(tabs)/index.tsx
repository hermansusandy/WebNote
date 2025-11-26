import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Image } from 'react-native';
import { supabase } from '../../lib/supabase';
import { isToday } from 'date-fns';
import { Stack } from 'expo-router';
import { Card } from '../../components/ui/Card';
import { CustomHeader } from '../../components/ui/CustomHeader';
import { Bell, BookOpen, TrendingUp } from 'lucide-react-native';

export default function Dashboard() {
  const [remindersCount, setRemindersCount] = useState(0);
  const [learningCount, setLearningCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUserName(user.email?.split('@')[0] || 'User');

    // Fetch reminders
    const { data: reminders } = await supabase
      .from('reminders')
      .select('due_at')
      .eq('user_id', user.id);

    if (reminders) {
      const todayCount = reminders.filter(r => r.due_at && isToday(new Date(r.due_at))).length;
      setRemindersCount(todayCount);
    }

    // Fetch learning
    const { count } = await supabase
      .from('learning_titles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'In Progress');

    setLearningCount(count || 0);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View className="flex-1 bg-slate-50">
      <Stack.Screen options={{ headerShown: false }} />
      <CustomHeader title="Dashboard" />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="mt-4 mb-8 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-500 font-medium text-lg">Good Morning,</Text>
            <Text className="text-3xl font-extrabold text-slate-900 capitalize">{userName}</Text>
          </View>
          <View className="w-12 h-12 bg-slate-200 rounded-full items-center justify-center border border-white shadow-sm">
            <Text className="text-xl font-bold text-slate-600">{userName.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        <Text className="text-xl font-bold text-slate-900 mb-4">Overview</Text>

        <View className="flex-row gap-4 mb-8">
          <Card className="flex-1 bg-slate-900 border-slate-900">
            <View className="bg-slate-800/50 w-10 h-10 rounded-full items-center justify-center mb-3">
              <Bell color="white" size={20} />
            </View>
            <Text className="text-slate-400 font-medium mb-1">Due Today</Text>
            <Text className="text-4xl font-bold text-white">{remindersCount}</Text>
          </Card>

          <Card className="flex-1">
            <View className="bg-blue-50 w-10 h-10 rounded-full items-center justify-center mb-3">
              <BookOpen color="#2563eb" size={20} />
            </View>
            <Text className="text-slate-500 font-medium mb-1">Learning</Text>
            <Text className="text-4xl font-bold text-slate-900">{learningCount}</Text>
          </Card>
        </View>

        <Text className="text-xl font-bold text-slate-900 mb-4">Recent Activity</Text>

        <Card className="min-h-[200px] items-center justify-center border-dashed border-2 border-slate-200 bg-transparent shadow-none">
          <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
            <TrendingUp color="#94a3b8" size={32} />
          </View>
          <Text className="text-slate-900 font-semibold text-lg mb-1">No recent activity</Text>
          <Text className="text-slate-500 text-center px-8">
            Your recent actions and completed tasks will appear here.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}
