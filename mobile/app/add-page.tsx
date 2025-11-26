import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Type } from 'lucide-react-native';

export default function AddPage() {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const params = useLocalSearchParams();
    const id = params.id as string;

    useEffect(() => {
        if (id) {
            fetchItem();
        }
    }, [id]);

    const fetchItem = async () => {
        const { data } = await supabase.from('pages').select('*').eq('id', id).single();
        if (data) {
            setTitle(data.title);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) return;

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            if (id) {
                await supabase.from('pages').update({ title }).eq('id', id);
            } else {
                await supabase.from('pages').insert({
                    user_id: user.id,
                    title,
                });
            }
            router.back();
        }
        setLoading(false);
    };

    return (
        <View className="flex-1 bg-white p-6 pt-12">
            <Text className="text-2xl font-bold text-slate-900 mb-8">
                {id ? 'Edit Page' : 'Add Page'}
            </Text>

            <View className="space-y-4">
                <Input
                    icon={Type}
                    placeholder="Page Title"
                    value={title}
                    onChangeText={setTitle}
                    autoFocus
                />
            </View>

            <View className="flex-row gap-3 mt-8">
                <Button
                    title="Cancel"
                    variant="ghost"
                    className="flex-1"
                    onPress={() => router.back()}
                />
                <Button
                    title={id ? 'Update' : 'Create'}
                    className="flex-[2]"
                    onPress={handleSave}
                    loading={loading}
                />
            </View>
        </View>
    );
}
