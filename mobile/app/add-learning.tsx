import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { BookOpen } from 'lucide-react-native';

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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-50 p-6"
        >
            <Stack.Screen options={{
                title: 'New Topic',
                presentation: 'modal',
                headerStyle: { backgroundColor: '#f8fafc' },
                headerShadowVisible: false,
            }} />

            <View className="flex-1 pt-4">
                <Text className="text-slate-900 font-bold text-2xl mb-6">What do you want to learn?</Text>

                <View className="space-y-4">
                    <Input
                        icon={BookOpen}
                        placeholder="E.g., React Native, Python, Piano..."
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
                        title="Start Learning"
                        className="flex-[2]"
                        onPress={handleSave}
                        loading={loading}
                    />
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
