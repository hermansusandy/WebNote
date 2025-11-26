import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'outline' | 'ghost';
    loading?: boolean;
}

export function Button({ title, variant = 'primary', loading, className, ...props }: ButtonProps) {
    const baseStyles = "h-14 rounded-xl justify-center items-center flex-row";
    const variants = {
        primary: "bg-slate-900 shadow-lg shadow-slate-900/20",
        outline: "bg-transparent border border-slate-200",
        ghost: "bg-transparent",
    };

    const textStyles = {
        primary: "text-white font-bold text-lg",
        outline: "text-slate-900 font-semibold text-lg",
        ghost: "text-slate-600 font-medium text-base",
    };

    return (
        <StyledTouchableOpacity
            className={`${baseStyles} ${variants[variant]} ${loading ? 'opacity-80' : ''} ${className}`}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? 'white' : '#0f172a'} />
            ) : (
                <StyledText className={textStyles[variant]}>{title}</StyledText>
            )}
        </StyledTouchableOpacity>
    );
}
