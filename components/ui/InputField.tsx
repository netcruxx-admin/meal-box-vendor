import React from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";

export default function InputField({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    ...props
}: any) {
    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                style={[styles.input, error ? styles.inputError : null]}
                {...props}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 12,
    },

    label: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 3,
        fontWeight: '500',
    },

    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        backgroundColor: "#fff",
    },

    inputError: {
        borderColor: '#EF4444',
    },

    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
});
