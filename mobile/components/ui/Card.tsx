import { View, ViewProps } from 'react-native';

export function Card({ className, ...props }: ViewProps) {
    return (
        <View
            className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 ${className}`}
            {...props}
        />
    );
}
