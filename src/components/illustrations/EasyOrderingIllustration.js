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

export const EasyOrderingIllustration = ({ width = 280, height = 220 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 320 260" fill="none">
      <Defs>
        <LinearGradient id="phoneBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#F5F5F5" />
        </LinearGradient>
        <LinearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#E8F5E9" stopOpacity="0.7" />
          <Stop offset="100%" stopColor="#C8E6C9" stopOpacity="0.2" />
        </LinearGradient>
      </Defs>

      {/* Soft Background Circle */}
      <Circle cx="160" cy="130" r="105" fill="url(#screenGrad)" />

      {/* Smartphone Body */}
      <G transform="translate(100, 20)">
        <Rect
          x="0"
          y="0"
          width="120"
          height="215"
          rx="22"
          fill="#212121"
        />
        {/* Screen Bezel */}
        <Rect
          x="4"
          y="4"
          width="112"
          height="207"
          rx="18"
          fill="url(#phoneBgGrad)"
        />
        {/* Dynamic Island / Speaker */}
        <Rect x="42" y="10" width="36" height="5" rx="2.5" fill="#212121" />

        {/* In-app Veg Card 1 */}
        <Rect x="12" y="30" width="96" height="42" rx="8" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="1" />
        <Circle cx="28" cy="51" r="12" fill="#E8F5E9" />
        {/* Veg icon */}
        <Circle cx="28" cy="51" r="7" fill="#4CAF50" />
        <Rect x="46" y="42" width="38" height="6" rx="3" fill="#424242" />
        <Rect x="46" y="52" width="24" height="5" rx="2.5" fill="#2E7D32" />
        <Circle cx="96" cy="51" r="8" fill="#2E7D32" />
        {/* Plus check */}
        <Path d="M96 48 V54 M93 51 H99" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* In-app Veg Card 2 (Selected with tick) */}
        <Rect x="12" y="80" width="96" height="42" rx="8" fill="#E8F5E9" stroke="#4CAF50" strokeWidth="1.5" />
        <Circle cx="28" cy="101" r="12" fill="#FFF3E0" />
        <Circle cx="28" cy="101" r="7" fill="#FF9800" />
        <Rect x="46" y="92" width="42" height="6" rx="3" fill="#424242" />
        <Rect x="46" y="102" width="28" height="5" rx="2.5" fill="#2E7D32" />
        <Circle cx="96" cy="101" r="8" fill="#4CAF50" />
        {/* Tick Mark */}
        <Path d="M93 101 L95 103 L99 99" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

        {/* In-app Checkout Button */}
        <Rect x="16" y="135" width="88" height="24" rx="12" fill="#2E7D32" />
        <Rect x="36" y="145" width="48" height="5" rx="2.5" fill="#FFFFFF" />

        {/* Home Indicator */}
        <Rect x="40" y="196" width="40" height="4" rx="2" fill="#9E9E9E" />
      </G>

      {/* Interactive Hand / Tap Gesture */}
      <G transform="translate(190, 130)">
        <Circle cx="25" cy="25" r="28" fill="#81C784" fillOpacity="0.25" />
        <Circle cx="25" cy="25" r="18" fill="#81C784" fillOpacity="0.4" />
        <Circle cx="25" cy="25" r="8" fill="#2E7D32" />
      </G>

      {/* Floating Shopping Cart Bubble */}
      <G transform="translate(45, 90)">
        <Circle cx="28" cy="28" r="28" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="1.5" />
        {/* Shopping Cart Body */}
        <Path
          d="M18 20 H23 L26 34 H38 L41 24 H24"
          stroke="#2E7D32"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Circle cx="28" cy="38" r="2.5" fill="#2E7D32" />
        <Circle cx="37" cy="38" r="2.5" fill="#2E7D32" />
        {/* Veg badge in cart */}
        <Circle cx="32" cy="23" r="5" fill="#FF8F00" />
      </G>

      {/* Decorative Fast Tap Sparks */}
      <Circle cx="245" cy="70" r="4" fill="#FF9800" />
      <Circle cx="50" cy="175" r="5" fill="#4CAF50" />
      <Circle cx="255" cy="180" r="3" fill="#81C784" />
    </Svg>
  );
};

export default EasyOrderingIllustration;
