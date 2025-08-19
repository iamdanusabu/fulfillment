
import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface DeliveryIconProps {
  width?: number;
  height?: number;
}

export const DeliveryIcon: React.FC<DeliveryIconProps> = ({ width = 24, height = 24 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 306 306" fill="none">
      <Path 
        d="M70.8244 108.501L196.772 41.157L153 19.125L23.1362 84.4943L70.8244 108.501Z" 
        fill="#2563EB"
      />
      <Path 
        d="M235.022 60.4111L109.075 127.755L153 149.868L282.864 84.4943L235.022 60.4111Z" 
        fill="#2563EB"
      />
      <Path 
        d="M149.414 156.131L105.188 133.87V182.782L86.0625 163.528H66.9375V114.616L19.125 90.5518V221.29L149.414 286.875V156.131Z" 
        fill="#2563EB"
      />
      <Path 
        d="M156.586 156.131V286.875L286.875 221.29V90.5518L156.586 156.131Z" 
        fill="#2563EB"
      />
    </Svg>
  );
};
