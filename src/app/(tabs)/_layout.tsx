
import React from 'react';
import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="picklist" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
