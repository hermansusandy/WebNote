import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Type } from 'lucide-react-native';

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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-50 p-6"
        >
            <Stack.Screen options={{
                title: 'New Reminder',
                presentation: 'modal',
                headerStyle: { backgroundColor: '#f8fafc' },
                headerShadowVisible: false,
            }} />

            <View className="flex-1 pt-4">
                <Text className="text-slate-900 font-bold text-2xl mb-6">What needs to be done?</Text>

                <View className="space-y-4">
                    <Input
                        icon={Type}
                        placeholder="E.g., Buy groceries, Call mom..."
                        value={title}
                        onChangeText={setTitle}
                        autoFocus
                    />
                </View>

                <View className="flex-1" />

                <View className="flex-row gap-3 mb-8">
                    <Button
                        title="Cancel"
                        variant="ghost"
                        className="flex-1"
                        onPress={() => router.back()}
                    />
                    <Button
                        title="Create Reminder"
                        className="flex-[2]"
                        onPress={handleSave}
                        loading={loading}
                    />
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
