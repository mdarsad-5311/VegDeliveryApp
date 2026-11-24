import React from 'react';
import Svg, {
  G,
  Path,
  Rect,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

export const WelcomeIllustration = ({ width = 280, height = 220 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 320 260" fill="none">
      <Defs>
        <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#E8F5E9" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#C8E6C9" stopOpacity="0.2" />
        </LinearGradient>
        <LinearGradient id="crateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#8D6E63" />
          <Stop offset="100%" stopColor="#5D4037" />
        </LinearGradient>
        <LinearGradient id="crateSlat" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#A1887F" />
          <Stop offset="100%" stopColor="#6D4C41" />
        </LinearGradient>
      </Defs>

      {/* Soft Background Cloud Shape */}
      <Circle cx="160" cy="130" r="115" fill="url(#bgGrad)" />
      <Circle cx="80" cy="160" r="45" fill="#E8F5E9" fillOpacity="0.6" />
      <Circle cx="240" cy="150" r="50" fill="#E8F5E9" fillOpacity="0.6" />

      {/* Decorative Floating Leaves */}
      <Path
        d="M60 70 C50 60 45 45 65 40 C75 50 72 65 60 70 Z"
        fill="#81C784"
      />
      <Path
        d="M260 80 C270 70 275 55 255 50 C245 60 248 75 260 80 Z"
        fill="#66BB6A"
      />
      <Circle cx="270" cy="110" r="6" fill="#FFA726" fillOpacity="0.7" />
      <Circle cx="50" cy="120" r="4" fill="#4CAF50" fillOpacity="0.7" />

      {/* Vegetables Sticking Out of Basket */}
      {/* Broccoli */}
      <G transform="translate(90, 75)">
        <Circle cx="30" cy="25" r="16" fill="#2E7D32" />
        <Circle cx="45" cy="20" r="14" fill="#388E3C" />
        <Circle cx="20" cy="22" r="14" fill="#1B5E20" />
        <Rect x="28" y="32" width="10" height="22" rx="4" fill="#66BB6A" />
      </G>

      {/* Carrot */}
      <G transform="translate(180, 70) rotate(25)">
        <Path d="M10 15 L22 15 L16 55 Z" fill="#FF7043" />
        {/* Leaf stems */}
        <Path d="M16 15 L12 0 M16 15 L16 -4 M16 15 L20 0" stroke="#4CAF50" strokeWidth="2.5" />
      </G>

      {/* Tomato */}
      <G transform="translate(145, 95)">
        <Circle cx="20" cy="20" r="18" fill="#E53935" />
        <Circle cx="15" cy="14" r="5" fill="#EF5350" />
        {/* Green calyx */}
        <Path d="M20 2 L22 8 L27 8 L23 11 L25 16 L20 12 L15 16 L17 11 L13 8 L18 8 Z" fill="#388E3C" />
      </G>

      {/* Pumpkin / Squash */}
      <G transform="translate(70, 105)">
        <Circle cx="22" cy="20" r="16" fill="#FFA000" />
        <Circle cx="32" cy="22" r="15" fill="#FFB300" />
        <Rect x="24" y="2" width="6" height="8" rx="2" fill="#5D4037" />
      </G>

      {/* Farm Crate Base */}
      <Rect x="65" y="130" width="190" height="85" rx="10" fill="url(#crateGrad)" />
      {/* Crate Horizontal Slats */}
      <Rect x="70" y="138" width="180" height="20" rx="4" fill="url(#crateSlat)" />
      <Rect x="70" y="164" width="180" height="20" rx="4" fill="url(#crateSlat)" />
      <Rect x="70" y="190" width="180" height="18" rx="4" fill="url(#crateSlat)" />

      {/* Crate Handles */}
      <Rect x="80" y="142" width="22" height="10" rx="5" fill="#4E342E" />
      <Rect x="218" y="142" width="22" height="10" rx="5" fill="#4E342E" />

      {/* Clean Farm Tag Ribbon */}
      <Rect x="125" y="152" width="70" height="24" rx="6" fill="#FFFFFF" />
      <Path d="M135 164 H185" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
      <Circle cx="160" cy="164" r="4" fill="#FF8F00" />

      {/* Ground Shadow */}
      <Rect x="60" y="222" width="200" height="10" rx="5" fill="#000000" fillOpacity="0.08" />
    </Svg>
  );
};

export default WelcomeIllustration;
