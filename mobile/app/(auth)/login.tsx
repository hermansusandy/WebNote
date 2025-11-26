import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { Mail, Lock } from 'lucide-react-native'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function signInWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) Alert.alert(error.message)
        setLoading(false)
    }

    async function signUpWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) Alert.alert(error.message)
        else Alert.alert('Check your inbox for email verification!')
        setLoading(false)
    }

    return (
        <View className="flex-1 justify-center px-8 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            <View className="mb-10">
                <Text className="text-4xl font-bold text-slate-900 mb-2">Welcome Back</Text>
                <Text className="text-slate-500 text-lg">Sign in to continue to WebNote</Text>
            </View>

            <View className="space-y-4">
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14">
                    <Mail color="#64748b" size={20} />
                    <TextInput
                        className="flex-1 ml-3 text-slate-900 text-base"
                        placeholder="Email"
                        placeholderTextColor="#94a3b8"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                </View>

                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14 mb-4">
                    <Lock color="#64748b" size={20} />
                    <TextInput
                        className="flex-1 ml-3 text-slate-900 text-base"
                        placeholder="Password"
                        placeholderTextColor="#94a3b8"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity
                    className="bg-slate-900 h-14 rounded-xl justify-center items-center shadow-lg shadow-slate-900/20"
                    onPress={signInWithEmail}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Sign In</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    className="h-14 justify-center items-center"
                    onPress={signUpWithEmail}
                    disabled={loading}
                >
                    <Text className="text-slate-600 font-medium">Don't have an account? Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}
