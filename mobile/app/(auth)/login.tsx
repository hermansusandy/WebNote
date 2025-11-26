import React, { useState } from 'react'
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { Mail, Lock } from 'lucide-react-native'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-50"
        >
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 32 }}>
                <View className="mb-12">
                    <View className="w-16 h-16 bg-slate-900 rounded-2xl mb-6 items-center justify-center shadow-lg shadow-slate-900/20">
                        <Text className="text-white text-3xl font-bold">W</Text>
                    </View>
                    <Text className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Welcome Back</Text>
                    <Text className="text-slate-500 text-lg font-medium leading-6">
                        Sign in to access your reminders and learning goals.
                    </Text>
                </View>

                <View className="space-y-4 mb-8">
                    <Input
                        icon={Mail}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <Input
                        icon={Lock}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />
                </View>

                <View className="space-y-4">
                    <Button
                        title="Sign In"
                        onPress={signInWithEmail}
                        loading={loading}
                    />
                    <Button
                        title="Create Account"
                        variant="ghost"
                        onPress={signUpWithEmail}
                        loading={loading}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}
