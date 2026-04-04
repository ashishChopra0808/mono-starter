import { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { nativeFontSize, nativeRadius, sp } from '../tokens/native-tokens';

// ─── TextField ──────────────────────────────────────────────────────────────
// A labeled text input with error display.
// Uses forwardRef so consumers can call .focus() / .blur().
//
// Usage:
//   <TextField
//     label="Email"
//     placeholder="you@example.com"
//     value={email}
//     onChangeText={setEmail}
//     error={errors?.email}
//     keyboardType="email-address"
//   />

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  /** Label displayed above the input. */
  label?: string;
  /** Error message displayed below the input in destructive color. */
  error?: string;
  /** Optional style overrides for the outer container. */
  containerStyle?: ViewStyle;
  /** Optional style overrides for the input itself. */
  inputStyle?: ViewStyle;
  /** Whether the field is disabled. */
  disabled?: boolean;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, containerStyle, inputStyle, disabled = false, ...inputProps }, ref) => {
    const { colors } = useTheme();

    const borderColor = error
      ? colors.destructive
      : colors['border-input'];

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[styles.label, { color: colors.foreground }]}>
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          {...inputProps}
          editable={!disabled}
          placeholderTextColor={colors['muted-foreground']}
          style={[
            styles.input,
            {
              color: colors.foreground,
              backgroundColor: colors.background,
              borderColor,
            },
            disabled && styles.disabled,
            inputStyle,
          ]}
          accessibilityLabel={label}
          accessibilityState={{ disabled }}
        />
        {error && (
          <Text style={[styles.error, { color: colors.destructive }]}>
            {error}
          </Text>
        )}
      </View>
    );
  }
);

TextField.displayName = 'TextField';

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: nativeFontSize.sm,
    fontWeight: '500',
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: nativeRadius.md,
    paddingHorizontal: sp('3'),
    paddingVertical: sp('2'),
    fontSize: nativeFontSize.base,
  },
  error: {
    fontSize: nativeFontSize.xs,
    marginTop: 2,
  },
  disabled: {
    opacity: 0.5,
  },
});
