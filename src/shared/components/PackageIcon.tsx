
import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Defs, ClipPath, Rect, G } from 'react-native-svg';

interface PackageIconProps {
  size?: number;
  iconColor?: string;
  backgroundColor?: string;
}

export const PackageIcon: React.FC<PackageIconProps> = ({ 
  size = 24, 
  iconColor = '#666',
  backgroundColor = '#f8f9fa'
}) => {
  const containerSize = size * 1.8; // Make container larger than icon
  const borderRadius = size * 0.2; // 20% of size for corner radius

  return (
    <View 
      style={{
        width: containerSize,
        height: containerSize,
        backgroundColor: backgroundColor,
        borderRadius: borderRadius,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Svg width={size} height={size + 1} viewBox="0 0 24 25" fill="none">
        <Defs>
          <ClipPath id="clip0_4214_80">
            <Rect width="24" height="24" fill="white" transform="translate(0 0.5)"/>
          </ClipPath>
        </Defs>
        <G clipPath="url(#clip0_4214_80)">
          <Path 
            d="M23.3569 5.60763C23.3569 5.30315 23.173 5.02881 22.8914 4.91308L12.286 0.556314C12.1032 0.481229 11.8982 0.481229 11.7154 0.556314L1.11006 4.91308C0.828445 5.02876 0.644531 5.30315 0.644531 5.60763V19.3924C0.644531 19.6968 0.828398 19.9712 1.11006 20.0869L11.7154 24.4437C11.8963 24.518 12.0995 24.5196 12.2851 24.4436C12.2942 24.4406 11.8926 24.6053 22.8914 20.0869C23.173 19.9712 23.3569 19.6968 23.3569 19.3924V5.60763ZM12.0007 9.21579L8.09306 7.6105L16.5379 3.92655L20.7069 5.63921L12.0007 9.21579ZM2.14625 6.79098L5.51766 8.17599V12.0835C5.51766 12.4981 5.85385 12.8343 6.26852 12.8343C6.68318 12.8343 7.01937 12.4981 7.01937 12.0835V8.79291L11.2499 10.5308V22.6289L2.14625 18.8891V6.79098ZM12.0007 2.06259L14.6037 3.1319L6.1588 6.81585L3.2945 5.63916L12.0007 2.06259ZM12.7516 10.5308L21.8552 6.79098V18.8891L12.7516 22.6289V10.5308Z" 
            fill={iconColor}
          />
        </G>
      </Svg>
    </View>
  );
};
