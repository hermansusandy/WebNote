import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Filter, ChevronDown } from 'lucide-react-native';

export function FilterRow() {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            <TouchableOpacity className="flex-row items-center border border-slate-200 rounded-lg px-3 py-2 mr-3 bg-white">
                <Filter color="#64748b" size={16} />
                <Text className="ml-2 text-slate-600 font-medium">All Categories</Text>
                <ChevronDown color="#cbd5e1" size={16} style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center border border-slate-200 rounded-lg px-3 py-2 mr-3 bg-white">
                <Filter color="#64748b" size={16} />
                <Text className="ml-2 text-slate-600 font-medium">All Sub-Categories</Text>
                <ChevronDown color="#cbd5e1" size={16} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
        </ScrollView>
    );
}
