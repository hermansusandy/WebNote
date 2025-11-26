import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Edit2, Trash2, Square } from 'lucide-react-native';

interface ListItemProps {
    index: number;
    title: string;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function ListItem({ index, title, onEdit, onDelete }: ListItemProps) {
    return (
        <View className="flex-row items-center bg-white border border-slate-200 rounded-xl p-4 mb-3 h-16">
            {/* Checkbox placeholder */}
            <TouchableOpacity className="mr-4">
                <Square color="#e2e8f0" size={20} />
            </TouchableOpacity>

            {/* Index */}
            <Text className="text-slate-400 font-medium w-8 text-center mr-2">{index}</Text>

            {/* Title */}
            <Text className="flex-1 text-slate-900 font-bold text-base" numberOfLines={1}>
                {title}
            </Text>

            {/* Actions */}
            <View className="flex-row gap-4">
                <TouchableOpacity onPress={onEdit}>
                    <Edit2 color="#94a3b8" size={18} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDelete}>
                    <Trash2 color="#94a3b8" size={18} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
