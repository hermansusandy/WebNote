import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Plus } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';

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
        <View className="bg-white p-4 mb-3 rounded-xl shadow-sm border border-slate-200">
            <View className="flex-row justify-between items-start mb-2">
                <Text className="text-lg font-semibold text-slate-900 flex-1 mr-2">{item.title}</Text>
                <View className={`px-2 py-1 rounded-full ${item.status === 'Completed' ? 'bg-green-100' :
                        item.status === 'In Progress' ? 'bg-blue-100' : 'bg-slate-100'
                    }`}>
                    <Text className={`text-xs font-medium ${item.status === 'Completed' ? 'text-green-700' :
                            item.status === 'In Progress' ? 'text-blue-700' : 'text-slate-700'
                        }`}>
                        {item.status}
                    </Text>
                </View>
            </View>

            {item.notes && (
                <Text className="text-slate-500 text-sm mb-3" numberOfLines={2}>{item.notes}</Text>
            )}

            <View className="flex-row items-center justify-between mt-2">
                {item.category && (
                    <View className="bg-slate-100 px-2 py-1 rounded-md">
                        <Text className="text-xs text-slate-600">{item.category.name}</Text>
                    </View>
                )}

                <View className="flex-row items-center">
                    {/* Actions could go here */}
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{
                headerTitle: 'Learning',
                headerRight: () => (
                    <TouchableOpacity className="mr-4" onPress={() => router.push('/add-learning')}>
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
                        <Text className="text-slate-400">No learning topics found</Text>
                    </View>
                }
            />
        </View>
    );
}
