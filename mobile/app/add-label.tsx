import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Link, Type, StickyNote } from 'lucide-react-native';

export default function AddLabel() {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [note, setNote] = useState('');
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
        const { data } = await supabase.from('youtube_items').select('*').eq('id', id).single();
        if (data) {
            setName(data.name);
            setUrl(data.url);
            setNote(data.note || '');
        }
    };

    const handleSave = async () => {
        if (!name.trim()) return;

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            if (id) {
                await supabase.from('youtube_items').update({ name, url, note }).eq('id', id);
            } else {
                await supabase.from('youtube_items').insert({
                    user_id: user.id,
                    name,
                    url,
                    note
                });
            }
            router.back();
        }
        setLoading(false);
    };

    return (
        <View className="flex-1 bg-white p-6 pt-12">
            <Text className="text-2xl font-bold text-slate-900 mb-8">
                {id ? 'Edit Label' : 'Add Label'}
            </Text>

            <View className="space-y-4">
                <Input
                    icon={Type}
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                    autoFocus
                />
                <Input
                    icon={Link}
                    placeholder="URL"
                    value={url}
                    onChangeText={setUrl}
                    autoCapitalize="none"
                />
                <Input
                    icon={StickyNote}
                    placeholder="Note"
                    value={note}
                    onChangeText={setNote}
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
                    title={id ? 'Update' : 'Add'}
                    className="flex-[2]"
                    onPress={handleSave}
                    loading={loading}
                />
            </View>
        </View>
    );
}
