import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function AddReminder() {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        if (!title.trim()) return;
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error } = await supabase.from('reminders').insert({
                user_id: user.id,
                title: title.trim(),
                due_at: new Date().toISOString(),
                priority: 'Medium',
            });

            if (error) Alert.alert('Error', error.message);
            else router.back();
        }
        setLoading(false);
    };

    return (
        <View className="flex-1 bg-slate-50 p-4">
            <Stack.Screen options={{ title: 'New Reminder', presentation: 'modal' }} />

            <View className="bg-white p-4 rounded-xl border border-slate-200 mb-4">
                <Text className="text-slate-500 mb-1 text-sm">Title</Text>
                <TextInput
                    className="text-lg text-slate-900 border-b border-slate-100 pb-2"
                    placeholder="What needs to be done?"
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
                <Text className="text-white font-bold text-lg">Save Reminder</Text>
            </TouchableOpacity>
        </View>
    );
}
