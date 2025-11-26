import { View, ViewProps } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);

export function Card({ className, ...props }: ViewProps) {
    return (
        <StyledView
            className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 ${className}`}
            {...props}
        />
    );
}
