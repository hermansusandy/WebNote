import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import { supabase } from '../lib/supabase';
import { Plus, ArrowUpDown, ExternalLink } from 'lucide-react-native';
import { Stack, useRouter } from 'expo-router';
import { CustomHeader } from '../components/ui/CustomHeader';
import { SearchBar } from '../components/ui/SearchBar';
import { FilterRow } from '../components/ui/FilterRow';
import { ListItem } from '../components/ui/ListItem';

export default function Tools() {
    const [items, setItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedSubCategory, setSelectedSubCategory] = useState('All Sub-Categories');
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch Items
        const { data: tools } = await supabase
            .from('web_urls')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (tools) setItems(tools);

        // Fetch Categories
        const { data: cats } = await supabase
            .from('web_url_categories')
            .select('*')
            .eq('user_id', user.id)
            .order('name');

        if (cats) setCategories(cats);

        // Fetch Sub-Categories
        const { data: subCats } = await supabase
            .from('web_url_sub_categories')
            .select('*')
            .eq('user_id', user.id)
            .order('name');

        if (subCats) setSubCategories(subCats);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
        const matchesSubCategory = selectedSubCategory === 'All Sub-Categories' || item.sub_category === selectedSubCategory;
        return matchesCategory && matchesSubCategory;
    });

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <TouchableOpacity onPress={() => item.url && Linking.openURL(item.url)}>
            <ListItem
                index={index + 1}
                title={item.name}
                onEdit={() => router.push({ pathname: '/add-tool', params: { id: item.id } })}
                onDelete={async () => {
                    const { error } = await supabase.from('web_urls').delete().eq('id', item.id);
                    if (!error) fetchData();
                }}
            />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />
            <CustomHeader title="Tools/URL" />

            <View className="flex-1 px-4 pt-4">
                <Text className="text-3xl font-bold text-slate-900 mb-4">Tools/URL</Text>

                <FilterRow
                    categories={categories}
                    subCategories={subCategories}
                    selectedCategory={selectedCategory}
                    selectedSubCategory={selectedSubCategory}
                    onSelectCategory={setSelectedCategory}
                    onSelectSubCategory={setSelectedSubCategory}
                />
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
                    data={filteredItems}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <Text className="text-slate-400">No URLs found</Text>
                        </View>
                    }
                />
            </View>

            <TouchableOpacity
                className="absolute bottom-8 right-6 bg-purple-600 w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-purple-600/30"
                onPress={() => router.push('/add-tool')}
            >
                <Plus color="white" size={24} />
            </TouchableOpacity>
        </View>
    );
}
