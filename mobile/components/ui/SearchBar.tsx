import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Search, Mic } from 'lucide-react-native';

export function SearchBar(props: TextInputProps) {
    return (
        <View className="flex-row items-center bg-slate-100 rounded-full px-4 h-12 mb-6">
            <Search color="#94a3b8" size={20} />
            <TextInput
                className="flex-1 ml-3 text-slate-900 text-base"
                placeholder="Search"
                placeholderTextColor="#94a3b8"
                {...props}
            />
            <Mic color="#94a3b8" size={20} />
        </View>
    );
}
