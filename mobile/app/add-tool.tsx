import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Link, Type } from 'lucide-react-native';

export default function AddTool() {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');

    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'category' | 'subCategory'>('category');

    const router = useRouter();
    const params = useLocalSearchParams();
    const id = params.id as string;

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch Categories
        const { data: cats } = await supabase.from('web_url_categories').select('*').eq('user_id', user.id).order('name');
        if (cats) setCategories(cats);

        // Fetch Sub-Categories
        const { data: subCats } = await supabase.from('web_url_sub_categories').select('*').eq('user_id', user.id).order('name');
        if (subCats) setSubCategories(subCats);

        if (id) {
            const { data } = await supabase.from('web_urls').select('*').eq('id', id).single();
            if (data) {
                setName(data.name);
                setUrl(data.url);
                setCategory(data.category || '');
                setSubCategory(data.sub_category || '');
            }
        }
    };

    const handleSave = async () => {
        if (!name.trim() || !url.trim()) return;

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const payload = {
                user_id: user.id,
                name,
                url,
                category: category || null,
                sub_category: subCategory || null,
            };

            if (id) {
                await supabase.from('web_urls').update(payload).eq('id', id);
            } else {
                await supabase.from('web_urls').insert(payload);
            }
            router.back();
        }
        setLoading(false);
    };

    const openModal = (type: 'category' | 'subCategory') => {
        setModalType(type);
        setModalVisible(true);
    };

    return (
        <View className="flex-1 bg-white p-6 pt-12">
            <Text className="text-2xl font-bold text-slate-900 mb-8">
                {id ? 'Edit Tool' : 'Add Tool'}
            </Text>

            <View className="space-y-4">
                <Input
                    icon={Type}
                    placeholder="Tool Name"
                    value={name}
                    onChangeText={setName}
                    autoFocus
                />
                <Input
                    icon={Link}
                    placeholder="URL (https://...)"
                    value={url}
                    onChangeText={setUrl}
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    className="flex-row items-center border border-slate-200 rounded-xl px-4 py-3 bg-slate-50"
                    onPress={() => openModal('category')}
                >
                    <Text className={`flex-1 text-base ${category ? 'text-slate-900' : 'text-slate-400'}`}>
                        {category || 'Select Category'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-row items-center border border-slate-200 rounded-xl px-4 py-3 bg-slate-50"
                    onPress={() => openModal('subCategory')}
                >
                    <Text className={`flex-1 text-base ${subCategory ? 'text-slate-900' : 'text-slate-400'}`}>
                        {subCategory || 'Select Sub-Category'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="flex-row gap-3 mt-8">
                <Button
                    title="Cancel"
                    variant="ghost"
                    className="flex-1"
                    onPress={() => router.back()}
                />
                <Button
                    title={id ? 'Update' : 'Add'}
                    className="flex-[2]"
                    onPress={handleSave}
                    loading={loading}
                />
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-end"
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View className="bg-white rounded-t-3xl h-[50%]">
                        <View className="p-4 border-b border-slate-100 flex-row justify-between items-center">
                            <Text className="text-lg font-bold text-slate-900">
                                Select {modalType === 'category' ? 'Category' : 'Sub-Category'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text className="text-purple-600 font-medium">Close</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                            {(modalType === 'category' ? categories : subCategories).map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    className="p-4 border-b border-slate-100 active:bg-slate-50"
                                    onPress={() => {
                                        if (modalType === 'category') setCategory(item.name);
                                        else setSubCategory(item.name);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text className="text-base text-slate-700">{item.name}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                className="p-4 border-b border-slate-100 active:bg-slate-50"
                                onPress={() => {
                                    if (modalType === 'category') setCategory('');
                                    else setSubCategory('');
                                    setModalVisible(false);
                                }}
                            >
                                <Text className="text-base text-red-500">Clear Selection</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
