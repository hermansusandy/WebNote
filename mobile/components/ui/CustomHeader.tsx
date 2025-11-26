import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Modal, Pressable } from 'react-native';
import { Menu, User, LayoutDashboard, FileText, BookOpen, Bell, Box, Tag, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export function CustomHeader({ title = "WebNote" }: { title?: string }) {
    const [menuVisible, setMenuVisible] = useState(false);
    const router = useRouter();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', route: '/(tabs)' },
        { icon: FileText, label: 'Page', route: '/pages' },
        { icon: BookOpen, label: 'Learning', route: '/(tabs)/learning' },
        { icon: Bell, label: 'Reminders', route: '/(tabs)/reminders' },
        { icon: Box, label: 'Tools/URL', route: '/tools' },
        { icon: Tag, label: 'Label', route: '/labels' },
    ];

    const handleNavigation = (route: string) => {
        setMenuVisible(false);
        router.push(route);
    };

    return (
        <SafeAreaView className="bg-white z-50">
            <View className="px-4 py-2 z-50">
                <View className="bg-purple-50 rounded-full h-14 flex-row items-center justify-between px-4 shadow-sm z-50">
                    <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
                        <Menu color="#0f172a" size={24} />
                    </TouchableOpacity>

                    <Text className="text-xl font-medium text-slate-900">{title}</Text>

                    <TouchableOpacity>
                        <View className="w-8 h-8 rounded-full bg-slate-200 items-center justify-center border border-slate-300">
                            <User color="#64748b" size={18} />
                        </View>
                    </TouchableOpacity>
                </View>

                {menuVisible && (
                    <>
                        <Pressable
                            className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-transparent"
                            onPress={() => setMenuVisible(false)}
                        />
                        <View className="absolute top-16 left-4 bg-purple-50 rounded-2xl p-2 shadow-xl border border-purple-100 w-48 z-50">
                            {menuItems.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className="flex-row items-center p-3 rounded-xl active:bg-purple-100"
                                    onPress={() => handleNavigation(item.route as any)}
                                >
                                    <item.icon size={20} color="#0f172a" style={{ marginRight: 12 }} />
                                    <Text className="text-slate-900 font-medium text-base">{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                            <View className="h-[1px] bg-slate-200 my-1" />
                            <TouchableOpacity
                                className="flex-row items-center p-3 rounded-xl active:bg-red-50"
                                onPress={async () => {
                                    setMenuVisible(false);
                                    await import('../../lib/supabase').then(m => m.supabase.auth.signOut());
                                    router.replace('/(auth)/login');
                                }}
                            >
                                <LogOut size={20} color="#ef4444" style={{ marginRight: 12 }} />
                                <Text className="text-red-500 font-medium text-base">Log Out</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
}
