import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Menu, User } from 'lucide-react-native';

export function CustomHeader({ title = "WebNote" }: { title?: string }) {
    return (
        <SafeAreaView className="bg-white">
            <View className="px-4 py-2">
                <View className="bg-purple-50 rounded-full h-14 flex-row items-center justify-between px-4 shadow-sm">
                    <TouchableOpacity>
                        <Menu color="#0f172a" size={24} />
                    </TouchableOpacity>

                    <Text className="text-xl font-medium text-slate-900">{title}</Text>

                    <TouchableOpacity>
                        <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center border border-slate-300">
                            <User color="#64748b" size={18} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
