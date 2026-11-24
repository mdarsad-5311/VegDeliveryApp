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

export const OrganicIllustration = ({ width = 280, height = 220 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 320 260" fill="none">
      <Defs>
        <LinearGradient id="organicBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#E8F5E9" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#C8E6C9" stopOpacity="0.3" />
        </LinearGradient>
        <LinearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#43A047" />
          <Stop offset="100%" stopColor="#1B5E20" />
        </LinearGradient>
      </Defs>

      {/* Sun Ray Aura */}
      <Circle cx="160" cy="130" r="105" fill="url(#organicBg)" />
      <Circle cx="160" cy="75" r="30" fill="#FFF9C4" fillOpacity="0.8" />

      {/* Farm Soil Mound */}
      <Path
        d="M40 215 Q160 170 280 215 L280 235 L40 235 Z"
        fill="#8D6E63"
      />
      <Path
        d="M50 215 Q160 185 270 215"
        stroke="#6D4C41"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Sprouting Young Greens in Soil */}
      <G transform="translate(65, 185)">
        <Path d="M15 25 Q10 10 0 15 Q5 0 20 15 L20 25" fill="#4CAF50" />
      </G>
      <G transform="translate(235, 185)">
        <Path d="M15 25 Q20 10 30 15 Q25 0 10 15 L10 25" fill="#4CAF50" />
      </G>

      {/* Big Crisp Cabbage / Lettuce in Center */}
      <G transform="translate(110, 95)">
        {/* Outer leaf layers */}
        <Circle cx="50" cy="60" r="46" fill="#66BB6A" />
        <Circle cx="35" cy="55" r="38" fill="#4CAF50" />
        <Circle cx="65" cy="55" r="38" fill="#43A047" />
        {/* Heart of lettuce */}
        <Circle cx="50" cy="62" r="28" fill="#81C784" />
        <Circle cx="50" cy="64" r="18" fill="#A5D6A7" />
        {/* Leaf Veins */}
        <Path
          d="M50 82 Q48 64 50 48"
          stroke="#C8E6C9"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Path
          d="M50 64 Q38 58 32 50"
          stroke="#C8E6C9"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <Path
          d="M50 64 Q62 58 68 50"
          stroke="#C8E6C9"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </G>

      {/* Farm Fresh Tomatoes on Side */}
      <G transform="translate(75, 150)">
        <Circle cx="18" cy="18" r="16" fill="#E53935" />
        <Path d="M18 2 L19 8 L24 8 L20 11 L22 15 L18 12 L14 15 L16 11 L12 8 L17 8 Z" fill="#2E7D32" />
      </G>
      <G transform="translate(210, 145)">
        <Circle cx="20" cy="20" r="17" fill="#E53935" />
        <Path d="M20 3 L21 9 L26 9 L22 12 L24 16 L20 13 L16 16 L18 12 L14 9 L19 9 Z" fill="#2E7D32" />
      </G>

      {/* "100% ORGANIC" Badge */}
      <G transform="translate(100, 30)">
        <Rect x="0" y="0" width="120" height="32" rx="16" fill="url(#badgeGrad)" />
        <Circle cx="16" cy="16" r="9" fill="#FFF9C4" />
        <Path d="M16 10 L16 22 M12 16 L20 16" stroke="#2E7D32" strokeWidth="2" />
        {/* Organic Text Indicator Lines */}
        <Rect x="32" y="11" width="55" height="4" rx="2" fill="#FFFFFF" />
        <Rect x="32" y="19" width="38" height="3" rx="1.5" fill="#E8F5E9" />
        <Circle cx="104" cy="16" r="4" fill="#FFA000" />
      </G>

      {/* Floating Sparkles */}
      <Circle cx="60" cy="80" r="4" fill="#81C784" />
      <Circle cx="255" cy="70" r="5" fill="#FFB74D" />
      <Circle cx="265" cy="115" r="3" fill="#81C784" />
    </Svg>
  );
};

export default OrganicIllustration;
