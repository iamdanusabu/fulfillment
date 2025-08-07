
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: 'dark-mode',
          title: 'Dark Mode',
          subtitle: 'Switch between light and dark themes',
          type: 'switch',
          value: darkMode,
          onToggle: setDarkMode
        }
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Receive order and system notifications',
          type: 'switch',
          value: notifications,
          onToggle: setNotifications
        }
      ]
    },
    {
      title: 'Data & Sync',
      items: [
        {
          icon: 'sync',
          title: 'Auto Sync',
          subtitle: 'Automatically sync data when online',
          type: 'switch',
          value: autoSync,
          onToggle: setAutoSync
        },
        {
          icon: 'cloud-download',
          title: 'Data Export',
          subtitle: 'Export your data',
          type: 'action',
          onPress: () => console.log('Export data')
        }
      ]
    },
    {
      title: 'Account',
      items: [
        {
          icon: 'account-circle',
          title: 'Profile Settings',
          subtitle: 'Manage your account information',
          type: 'action',
          onPress: () => console.log('Profile settings')
        },
        {
          icon: 'security',
          title: 'Security',
          subtitle: 'Password and security settings',
          type: 'action',
          onPress: () => console.log('Security settings')
        }
      ]
    }
  ];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.title}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'switch'}
    >
      <View style={styles.settingLeft}>
        <MaterialIcons name={item.icon} size={24} color="#666" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <View style={styles.settingRight}>
        {item.type === 'switch' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#e9ecef', true: '#007AFF' }}
            thumbColor={item.value ? '#fff' : '#fff'}
          />
        ) : (
          <MaterialIcons name="chevron-right" size={24} color="#ccc" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your app experience</Text>
      </View>

      <View style={styles.content}>
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  settingRight: {
    marginLeft: 16,
  },
});
