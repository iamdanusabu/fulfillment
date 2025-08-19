
import React from 'react';
import Svg, { G, Path, Mask, Defs, ClipPath, Rect } from 'react-native-svg';

interface PhoneIconProps {
  width?: number;
  height?: number;
}

export const PhoneIcon: React.FC<PhoneIconProps> = ({ width = 24, height = 24 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 360 360" fill="none">
      <G clipPath="url(#clip0_4130_1607)">
        <Mask 
          id="mask0_4130_1607" 
          style={{ maskType: 'luminance' }} 
          maskUnits="userSpaceOnUse" 
          x="0" 
          y="0" 
          width="360" 
          height="360"
        >
          <Path d="M360 0H0V360H360V0Z" fill="white"/>
        </Mask>
        <G mask="url(#mask0_4130_1607)">
          <Path 
            d="M243.6 30H116.4C75 30 60 45 60 87.15V272.85C60 315 75 330 116.4 330H243.45C285 330 300 315 300 272.85V87.15C300 45 285 30 243.6 30ZM180 289.5C165.6 289.5 153.75 277.65 153.75 263.25C153.75 248.85 165.6 237 180 237C194.4 237 206.25 248.85 206.25 263.25C206.25 277.65 194.4 289.5 180 289.5ZM210 93.75H150C143.85 93.75 138.75 88.65 138.75 82.5C138.75 76.35 143.85 71.25 150 71.25H210C216.15 71.25 221.25 76.35 221.25 82.5C221.25 88.65 216.15 93.75 210 93.75Z" 
            fill="#2563EB"
          />
        </G>
      </G>
      <Defs>
        <ClipPath id="clip0_4130_1607">
          <Rect width="360" height="360" fill="white"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
};
