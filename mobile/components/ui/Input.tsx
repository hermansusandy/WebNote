import { TextInput, View, TextInputProps } from 'react-native';
import { styled } from 'nativewind';
import { LucideIcon } from 'lucide-react-native';

const StyledTextInput = styled(TextInput);
const StyledView = styled(View);

interface InputProps extends TextInputProps {
    icon?: LucideIcon;
}

export function Input({ icon: Icon, className, ...props }: InputProps) {
    return (
        <StyledView className={`flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14 ${className}`}>
            {Icon && <Icon color="#64748b" size={20} style={{ marginRight: 12 }} />}
            <StyledTextInput
                className="flex-1 text-slate-900 text-base font-medium"
                placeholderTextColor="#94a3b8"
                {...props}
            />
        </StyledView>
    );
}
