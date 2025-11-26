import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function AddLearning() {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        if (!title.trim()) return;
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error } = await supabase.from('learning_titles').insert({
                user_id: user.id,
                title: title.trim(),
                status: 'Planned',
                priority: 'Medium',
            });

            if (error) Alert.alert('Error', error.message);
            else router.back();
        }
        setLoading(false);
    };

    return (
        <View className="flex-1 bg-slate-50 p-4">
            <Stack.Screen options={{ title: 'New Topic', presentation: 'modal' }} />

            <View className="bg-white p-4 rounded-xl border border-slate-200 mb-4">
                <Text className="text-slate-500 mb-1 text-sm">Topic</Text>
                <TextInput
                    className="text-lg text-slate-900 border-b border-slate-100 pb-2"
                    placeholder="What do you want to learn?"
                    value={title}
                    onChangeText={setTitle}
                    autoFocus
                />
            </View>

            <TouchableOpacity
                className={`bg-slate-900 p-4 rounded-xl items-center ${loading ? 'opacity-50' : ''}`}
                onPress={handleSave}
                disabled={loading}
            >
                <Text className="text-white font-bold text-lg">Save Topic</Text>
            </TouchableOpacity>
        </View>
    );
}
