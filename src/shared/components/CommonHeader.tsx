
import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

export function CommonHeader() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = width >= 768;
  const isSmallMobile = width < 480;

  return (
    <View style={[
      styles.commonHeader,
      {
        paddingHorizontal: isSmallMobile ? 12 : 16,
        paddingVertical: isLandscape && !isTablet ? 6 : 8,
      }
    ]}>
      {/* This is the common header - no content needed as per requirements */}
    </View>
  );
}

const styles = StyleSheet.create({
  commonHeader: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    zIndex: 1001,
    minHeight: 20,
  },
});
