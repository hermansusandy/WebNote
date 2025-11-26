import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { format, isToday } from 'date-fns';
import { Plus, Calendar, Tag, Clock } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
import { Card } from '../../components/ui/Card';

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
        <Card className="mb-3 border-l-4" style={{ borderLeftColor: getPriorityColor(item.priority) }}>
            <View className="flex-row justify-between items-start mb-3">
                <Text className="text-lg font-bold text-slate-900 flex-1 mr-2 leading-6">{item.title}</Text>
                {item.priority && (
                    <View className={`px-2.5 py-1 rounded-lg ${getPriorityBg(item.priority)}`}>
                        <Text className={`text-xs font-bold ${getPriorityText(item.priority)} uppercase tracking-wide`}>
                            {item.priority}
                        </Text>
                    </View>
                )}
            </View>

            <View className="flex-row items-center gap-4 border-t border-slate-100 pt-3 mt-1">
                {item.due_at && (
                    <View className="flex-row items-center">
                        <Clock size={14} color={isToday(new Date(item.due_at)) ? "#dc2626" : "#64748b"} />
                        <Text className={`ml-1.5 text-sm font-medium ${isToday(new Date(item.due_at)) ? 'text-red-600' : 'text-slate-500'}`}>
                            {format(new Date(item.due_at), 'MMM d, h:mm a')}
                        </Text>
                    </View>
                )}

                {item.category && (
                    <View className="flex-row items-center">
                        <Tag size={14} color="#64748b" />
                        <Text className="ml-1.5 text-sm text-slate-500 font-medium">{item.category.name}</Text>
                    </View>
                )}
            </View>
        </Card>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{
                headerTitle: 'Reminders',
                headerStyle: { backgroundColor: '#f8fafc' },
                headerShadowVisible: false,
                headerTitleStyle: { fontWeight: '800', fontSize: 20, color: '#0f172a' },
                headerRight: () => (
                    <TouchableOpacity
                        className="mr-4 bg-slate-900 w-8 h-8 rounded-full items-center justify-center shadow-md shadow-slate-900/20"
                        onPress={() => router.push('/add-reminder')}
                    >
                        <Plus color="white" size={18} />
                    </TouchableOpacity>
                )
            }} />

            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View className="items-center justify-center py-20">
                        <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
                            <Calendar color="#cbd5e1" size={40} />
                        </View>
                        <Text className="text-slate-900 font-bold text-lg mb-1">No reminders yet</Text>
                        <Text className="text-slate-500 text-center px-10">
                            Tap the + button to create your first reminder.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

function getPriorityColor(priority: string) {
    switch (priority) {
        case 'Urgent': return '#dc2626';
        case 'High': return '#f97316';
        case 'Medium': return '#3b82f6';
        default: return '#94a3b8';
    }
}

function getPriorityBg(priority: string) {
    switch (priority) {
        case 'Urgent': return 'bg-red-100';
        case 'High': return 'bg-orange-100';
        case 'Medium': return 'bg-blue-100';
        default: return 'bg-slate-100';
    }
}

function getPriorityText(priority: string) {
    switch (priority) {
        case 'Urgent': return 'text-red-700';
        case 'High': return 'text-orange-700';
        case 'Medium': return 'text-blue-700';
        default: return 'text-slate-700';
    }
}
