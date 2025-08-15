
import React from 'react';
import { View } from 'react-native';
import Svg, { G, Rect, Defs, LinearGradient, Stop, ClipPath } from 'react-native-svg';

interface OrderUpLogoProps {
  size?: number;
}

export function OrderUpLogo({ size = 24 }: OrderUpLogoProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 118 118" fill="none">
        <G clipPath="url(#clip0_7717_9093)">
          <Rect 
            x="61.1406" 
            y="37.3828" 
            width="71.7663" 
            height="28.209" 
            rx="14.1045" 
            transform="rotate(90 61.1406 37.3828)" 
            fill="url(#paint0_linear_7717_9093)"
          />
          <Rect 
            width="65.1888" 
            height="28.209" 
            rx="14.1045" 
            transform="matrix(0.707107 0.707107 0.707107 -0.707107 28.1172 22.2422)" 
            fill="url(#paint1_linear_7717_9093)"
          />
          <Rect 
            x="67.4922" 
            y="22.2422" 
            width="65.1888" 
            height="28.209" 
            rx="14.1045" 
            transform="rotate(135 67.4922 22.2422)" 
            fill="url(#paint2_linear_7717_9093)"
          />
          <Rect 
            x="105.785" 
            y="83.2891" 
            width="32.9104" 
            height="14.1045" 
            rx="7.05224" 
            transform="rotate(-180 105.785 83.2891)" 
            fill="url(#paint3_linear_7717_9093)"
          />
          <Rect 
            x="105.785" 
            y="104.445" 
            width="32.9104" 
            height="14.1045" 
            rx="7.05224" 
            transform="rotate(-180 105.785 104.445)" 
            fill="url(#paint4_linear_7717_9093)"
          />
        </G>
        <Defs>
          <LinearGradient 
            id="paint0_linear_7717_9093" 
            x1="61.1406" 
            y1="51.4873" 
            x2="132.907" 
            y2="51.4873" 
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#ecf0f1"/>
            <Stop offset="0.295696" stopColor="#bdc3c7"/>
            <Stop offset="1" stopColor="#95a5a6"/>
          </LinearGradient>
          <LinearGradient 
            id="paint1_linear_7717_9093" 
            x1="65.4421" 
            y1="13.2074" 
            x2="0.716404" 
            y2="16.728" 
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#95a5a6"/>
            <Stop offset="1" stopColor="#ecf0f1"/>
          </LinearGradient>
          <LinearGradient 
            id="paint2_linear_7717_9093" 
            x1="132.681" 
            y1="36.3466" 
            x2="67.4922" 
            y2="36.3466" 
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#ecf0f1"/>
            <Stop offset="0.295696" stopColor="#bdc3c7"/>
            <Stop offset="1" stopColor="#95a5a6"/>
          </LinearGradient>
          <LinearGradient 
            id="paint3_linear_7717_9093" 
            x1="138.696" 
            y1="90.3413" 
            x2="105.785" 
            y2="90.3413" 
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#ecf0f1"/>
            <Stop offset="0.295696" stopColor="#bdc3c7"/>
            <Stop offset="1" stopColor="#95a5a6"/>
          </LinearGradient>
          <LinearGradient 
            id="paint4_linear_7717_9093" 
            x1="105.785" 
            y1="111.498" 
            x2="138.696" 
            y2="111.498" 
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#ecf0f1"/>
            <Stop offset="0.295696" stopColor="#bdc3c7"/>
            <Stop offset="1" stopColor="#95a5a6"/>
          </LinearGradient>
          <ClipPath id="clip0_7717_9093">
            <Rect width="117.537" height="117.537" fill="white"/>
          </ClipPath>
        </Defs>
      </Svg>
    </View>
  );
}
