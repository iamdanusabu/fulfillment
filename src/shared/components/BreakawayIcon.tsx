
import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface BreakawayIconProps {
  width?: number;
  height?: number;
  iconColor?: string;
  backgroundColor?: string;
}

export const BreakawayIcon: React.FC<BreakawayIconProps> = ({ 
  width = 24, 
  height = 24,
  iconColor = '#2563EB',
  backgroundColor = '#f8f9fa'
}) => {
  const containerSize = width * 1.8;
  const borderRadius = width * 0.2;

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
      <Svg width={width} height={height} viewBox="0 0 511.994 511.994">
      <Path 
        d="M206.497 69.529c25.819 0 47.836-19.628 51.389-44.733l-102.779-.005c3.551 25.108 25.568 44.738 51.39 44.738z" 
        fill={iconColor} 
      />
      <Path 
        d="M340.021 243.993h.024V183.79h57.948c8.284 0 15-6.716 15-15v-79a15 15 0 0 0-8.929-13.716L291.116 26.081a15.002 15.002 0 0 0-3.077-.976c-2.963 40.89-40.456 75.232-81.543 74.424-41.084.81-78.586-33.538-81.543-74.428a14.965 14.965 0 0 0-3.051.972L8.93 76.074A14.999 14.999 0 0 0 0 89.79v79c0 8.284 6.716 15 15 15h57.974v186.338c0 8.284 6.716 15 15 15h103.255c4.103-78.517 69.271-141.135 148.792-141.135zM511.483 437.513a14.99 14.99 0 0 0-5.013-7.724H328.191a14.967 14.967 0 0 0 3.447 2.74l76.76 44.317c12.13 7.003 25.045 10.356 37.672 10.356 25.403 0 49.633-13.574 63.914-38.308a14.99 14.99 0 0 0 1.499-11.381zM397.662 350.191v49.599h61.358c1.54-34.019-11.148-66.842-33.655-89.634-16.582 6.295-27.703 22.341-27.703 40.035z" 
        fill={iconColor} 
      />
      <Path 
        d="M367.662 350.191c0-24.321 12.337-46.8 31.932-60.181-80.953-47.48-183.75 15.798-178.572 109.779h146.641v-49.598z" 
        fill={iconColor} 
      />
      </Svg>
    </View>
  );
};
