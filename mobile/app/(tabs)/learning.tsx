import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Plus, BookOpen, CheckCircle2, Circle, MoreHorizontal } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
import { Card } from '../../components/ui/Card';

export default function Learning() {
    const [items, setItems] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchItems = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('learning_titles')
            .select(`
        *,
        category:learning_categories(id, name, color)
      `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

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
        <Card className="mb-3">
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-3">
                    <View className="flex-row items-center mb-1">
                        {item.category && (
                            <Text className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                                {item.category.name}
                            </Text>
                        )}
                    </View>
                    <Text className="text-lg font-bold text-slate-900 leading-6">{item.title}</Text>
                </View>

                <View className={`px-2.5 py-1 rounded-lg ${getStatusBg(item.status)}`}>
                    <Text className={`text-xs font-bold ${getStatusText(item.status)}`}>
                        {item.status}
                    </Text>
                </View>
            </View>

            {item.notes && (
                <Text className="text-slate-500 text-sm mb-4 leading-5" numberOfLines={2}>
                    {item.notes}
                </Text>
            )}

            <View className="flex-row items-center justify-between border-t border-slate-100 pt-3">
                <View className="flex-row items-center">
                    {item.status === 'Completed' ? (
                        <CheckCircle2 size={18} color="#16a34a" />
                    ) : (
                        <Circle size={18} color="#94a3b8" />
                    )}
                    <Text className="ml-2 text-sm font-medium text-slate-500">
                        {item.status === 'Completed' ? 'Completed' : 'Mark as Complete'}
                    </Text>
                </View>

                <TouchableOpacity>
                    <MoreHorizontal size={20} color="#94a3b8" />
                </TouchableOpacity>
            </View>
        </Card>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{
                headerTitle: 'Learning',
                headerStyle: { backgroundColor: '#f8fafc' },
                headerShadowVisible: false,
                headerTitleStyle: { fontWeight: '800', fontSize: 20, color: '#0f172a' },
                headerRight: () => (
                    <TouchableOpacity
                        className="mr-4 bg-slate-900 w-8 h-8 rounded-full items-center justify-center shadow-md shadow-slate-900/20"
                        onPress={() => router.push('/add-learning')}
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
                            <BookOpen color="#cbd5e1" size={40} />
                        </View>
                        <Text className="text-slate-900 font-bold text-lg mb-1">Start learning</Text>
                        <Text className="text-slate-500 text-center px-10">
                            Add a topic you want to learn about.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

function getStatusBg(status: string) {
    switch (status) {
        case 'Completed': return 'bg-green-100';
        case 'In Progress': return 'bg-blue-100';
        default: return 'bg-slate-100';
    }
}

function getStatusText(status: string) {
    switch (status) {
        case 'Completed': return 'text-green-700';
        case 'In Progress': return 'text-blue-700';
        default: return 'text-slate-700';
    }
}
