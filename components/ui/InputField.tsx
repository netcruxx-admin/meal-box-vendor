import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Text } from "@react-navigation/elements";

export default function InputField({
    label,
    value,
    onChangeText,
    placeholder,
    ...props
}: any) {
    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                style={styles.input}
                {...props}
            />
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
});