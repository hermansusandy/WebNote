import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Type, StickyNote } from 'lucide-react-native';

export default function AddReminder() {
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
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
        const { data } = await supabase.from('reminders').select('*').eq('id', id).single();
        if (data) {
            setTitle(data.title);
            setNotes(data.description || '');
        }
    };

    const handleSave = async () => {
        if (!title.trim()) return;

        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            if (id) {
                await supabase.from('reminders').update({
                    title,
                    description: notes,
                }).eq('id', id);
            } else {
                await supabase.from('reminders').insert({
                    user_id: user.id,
                    title,
                    description: notes,
                    due_at: new Date().toISOString(),
                    priority: 'Medium'
                });
            }
            router.back();
        }
        setLoading(false);
    };

    return (
        <ScrollView className="flex-1 bg-white p-6 pt-12">
            <Text className="text-2xl font-bold text-slate-900 mb-8">
                {id ? 'Edit Reminder' : 'Add Reminder'}
            </Text>

            <View className="space-y-4">
                <Input
                    icon={Type}
                    placeholder="E.g., Buy groceries, Call mom..."
                    value={title}
                    onChangeText={setTitle}
                    autoFocus
                />
                <Input
                    icon={StickyNote}
                    placeholder="Notes (optional)"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={4}
                    style={{ height: 100, textAlignVertical: 'top' }}
                />
            </View>

            <View className="flex-row gap-3 mb-8 mt-8">
                <Button
                    title="Cancel"
                    variant="ghost"
                    className="flex-1"
                    onPress={() => router.back()}
                />
                <Button
                    title={id ? 'Update' : 'Create Reminder'}
                    className="flex-[2]"
                    onPress={handleSave}
                    loading={loading}
                />
            </View>
        </ScrollView>
    );
}
