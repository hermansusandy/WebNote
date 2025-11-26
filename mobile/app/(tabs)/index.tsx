import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { isToday } from 'date-fns';
import { Stack } from 'expo-router';

export default function Dashboard() {
  const [remindersCount, setRemindersCount] = useState(0);
  const [learningCount, setLearningCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
    <ScrollView
      className="flex-1 bg-slate-50 p-4"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Stack.Screen options={{ headerTitle: 'Dashboard' }} />

      <Text className="text-2xl font-bold text-slate-900 mb-6">Overview</Text>

      <View className="flex-row gap-4 mb-6">
        <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <Text className="text-slate-500 font-medium mb-2">Today's Reminders</Text>
          <Text className="text-3xl font-bold text-slate-900">{remindersCount}</Text>
        </View>

        <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <Text className="text-slate-500 font-medium mb-2">Active Learning</Text>
          <Text className="text-3xl font-bold text-slate-900">{learningCount}</Text>
        </View>
      </View>

      <View className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <Text className="text-lg font-bold text-slate-900 mb-2">Recent Activity</Text>
        <Text className="text-slate-500">No recent activity.</Text>
      </View>
    </ScrollView>
  );
}
