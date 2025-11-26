import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Plus, ArrowUpDown } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
import { CustomHeader } from '../../components/ui/CustomHeader';
import { SearchBar } from '../../components/ui/SearchBar';
import { FilterRow } from '../../components/ui/FilterRow';
import { ListItem } from '../../components/ui/ListItem';

export default function Reminders() {
    const [items, setItems] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchItems = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('reminders')
            .select('*')
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

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <ListItem
            index={index + 1}
            title={item.title}
            onEdit={() => { }}
            onDelete={() => { }}
        />
    );

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />
            <CustomHeader />

            <View className="flex-1 px-4 pt-4">
                <Text className="text-3xl font-bold text-slate-900 mb-4">Reminders</Text>

                <FilterRow />
                <SearchBar />

                <View className="flex-row items-center justify-between mb-2 px-4">
                    <View className="flex-row items-center w-12 mr-2">
                        <Text className="text-slate-400 font-medium mr-1">No.</Text>
                        <ArrowUpDown size={12} color="#94a3b8" />
                    </View>

                    <View className="flex-1 flex-row items-center">
                        <Text className="text-slate-400 font-medium mr-1">Name</Text>
                        <ArrowUpDown size={12} color="#94a3b8" />
                    </View>

                    <Text className="text-slate-400 font-medium">Actions</Text>
                </View>

                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <Text className="text-slate-400">No reminders found</Text>
                        </View>
                    }
                />
            </View>

            <TouchableOpacity
                className="absolute bottom-8 right-6 bg-purple-600 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-purple-600/30"
                onPress={() => router.push('/add-reminder')}
            >
                <Plus color="white" size={24} />
            </TouchableOpacity>
        </View>
    );
}
