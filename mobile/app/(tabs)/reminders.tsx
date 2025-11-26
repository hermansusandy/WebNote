import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { format, isToday } from 'date-fns';
import { Plus, Calendar, Tag } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';

export default function Reminders() {
    const [items, setItems] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchItems = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('reminders')
            .select(`
        *,
        category:reminder_categories(id, name, color)
      `)
            .eq('user_id', user.id)
            .order('due_at', { ascending: true });

        if (data) setItems(data);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchItems();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-slate-200">
            <View className="flex-row justify-between items-start mb-2">
                <Text className="text-lg font-semibold text-slate-900 flex-1 mr-2">{item.title}</Text>
                {item.priority && (
                    <View className={`px-2 py-1 rounded-full ${item.priority === 'High' || item.priority === 'Urgent' ? 'bg-red-100' : 'bg-slate-100'
                        }`}>
                        <Text className={`text-xs font-medium ${item.priority === 'High' || item.priority === 'Urgent' ? 'text-red-700' : 'text-slate-700'
                            }`}>
                            {item.priority}
                        </Text>
                    </View>
                )}
            </View>

            <View className="flex-row items-center gap-4">
                {item.due_at && (
                    <View className="flex-row items-center">
                        <Calendar size={14} color="#64748b" />
                        <Text className={`ml-1 text-sm ${isToday(new Date(item.due_at)) ? 'text-green-600 font-medium' : 'text-slate-500'}`}>
                            {format(new Date(item.due_at), 'MMM d')}
                        </Text>
                    </View>
                )}

                {item.category && (
                    <View className="flex-row items-center">
                        <Tag size={14} color="#64748b" />
                        <Text className="ml-1 text-sm text-slate-500">{item.category.name}</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{
                headerTitle: 'Reminders',
                headerRight: () => (
                    <TouchableOpacity className="mr-4" onPress={() => router.push('/add-reminder')}>
                        <Plus color="#0f172a" size={24} />
                    </TouchableOpacity>
                )
            }} />

            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View className="items-center justify-center py-10">
                        <Text className="text-slate-400">No reminders found</Text>
                    </View>
                }
            />
        </View>
    );
}
