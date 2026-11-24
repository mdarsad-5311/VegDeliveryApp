import React from 'react';
import Svg, {
  G,
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

export const FreshVegLogo = ({ size = 100, light = false }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Defs>
        <LinearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={light ? '#FFFFFF' : '#4CAF50'} />
          <Stop offset="100%" stopColor={light ? '#E8F5E9' : '#1B5E20'} />
        </LinearGradient>
        <LinearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={light ? '#2E7D32' : '#81C784'} />
          <Stop offset="100%" stopColor={light ? '#1B5E20' : '#4CAF50'} />
        </LinearGradient>
        <LinearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={light ? '#43A047' : '#A5D6A7'} />
          <Stop offset="100%" stopColor={light ? '#2E7D32' : '#66BB6A'} />
        </LinearGradient>
        <LinearGradient id="carrotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFA726" />
          <Stop offset="100%" stopColor="#F57C00" />
        </LinearGradient>
      </Defs>

      {/* Background Soft Glow Circle */}
      <Circle
        cx="60"
        cy="60"
        r="54"
        fill="url(#logoBgGrad)"
        fillOpacity={light ? 0.95 : 0.25}
      />

      {/* Outer Golden Organic Ring */}
      <Circle
        cx="60"
        cy="60"
        r="53"
        stroke={light ? '#A5D6A7' : '#81C784'}
        strokeWidth="2"
        strokeDasharray="4 3"
        fillOpacity="0"
      />

      <G transform="translate(10, 8)">
        {/* Left Leaf */}
        <Path
          d="M50 48 C35 32 30 18 50 12 C60 22 58 38 50 48 Z"
          fill="url(#leafGrad2)"
        />

        {/* Center Main Leaf */}
        <Path
          d="M50 46 C50 25 40 10 50 6 C60 10 52 28 50 46 Z"
          fill="url(#leafGrad1)"
        />

        {/* Right Leaf */}
        <Path
          d="M50 48 C65 32 70 18 50 12 C42 22 44 38 50 48 Z"
          fill="url(#leafGrad2)"
        />

        {/* Carrot Body */}
        <Path
          d="M38 48 C36 44 64 44 62 48 L52 86 C51 89 49 89 48 86 Z"
          fill="url(#carrotGrad)"
        />

        {/* Carrot Texture Ridges */}
        <Path
          d="M42 55 Q49 57 56 55"
          stroke="#E65100"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <Path
          d="M44 64 Q50 66 54 64"
          stroke="#E65100"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <Path
          d="M46 73 Q50 74 53 73"
          stroke="#E65100"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Fresh Dew Drop Accent */}
        <Circle cx="56" cy="50" r="2.5" fill="#FFFFFF" fillOpacity="0.8" />
      </G>
    </Svg>
  );
};

export default FreshVegLogo;
