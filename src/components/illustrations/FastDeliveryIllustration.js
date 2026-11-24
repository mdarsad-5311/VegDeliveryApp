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

export const FastDeliveryIllustration = ({ width = 280, height = 220 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 320 260" fill="none">
      <Defs>
        <LinearGradient id="delBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#E8F5E9" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#C8E6C9" stopOpacity="0.2" />
        </LinearGradient>
        <LinearGradient id="bikeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#2E7D32" />
          <Stop offset="100%" stopColor="#43A047" />
        </LinearGradient>
      </Defs>

      {/* Soft Background Circle */}
      <Circle cx="160" cy="130" r="105" fill="url(#delBgGrad)" />

      {/* Speed Lines */}
      <Path d="M40 90 H75" stroke="#81C784" strokeWidth="3" strokeLinecap="round" />
      <Path d="M25 115 H65" stroke="#4CAF50" strokeWidth="4" strokeLinecap="round" />
      <Path d="M35 140 H60" stroke="#81C784" strokeWidth="3" strokeLinecap="round" />

      {/* Delivery Scooter / Vehicle */}
      <G transform="translate(85, 75)">
        {/* Cargo Box at Rear */}
        <Rect x="5" y="30" width="55" height="50" rx="8" fill="#1B5E20" />
        <Rect x="10" y="35" width="45" height="40" rx="6" fill="#2E7D32" />
        {/* Fresh Leaf Badge on Box */}
        <Circle cx="32" cy="55" r="14" fill="#FFFFFF" />
        <Path d="M32 45 C24 50 24 62 32 65 C40 62 40 50 32 45 Z" fill="#4CAF50" />

        {/* Scooter Main Frame */}
        <Path
          d="M55 70 L80 70 L95 40 L115 40"
          stroke="url(#bikeGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Handlebars */}
        <Path d="M108 30 L118 40 L108 42" stroke="#212121" strokeWidth="4" strokeLinecap="round" />

        {/* Headlight Beam */}
        <Path d="M118 42 L150 32 L155 58 L118 48 Z" fill="#FFF9C4" fillOpacity="0.5" />
        <Circle cx="118" cy="45" r="5" fill="#FFEB3B" />

        {/* Rider Helmet Silhouette */}
        <Circle cx="76" cy="24" r="14" fill="#2E7D32" />
        <Path d="M72 26 H88" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />

        {/* Front Wheel */}
        <Circle cx="120" cy="85" r="22" fill="#212121" />
        <Circle cx="120" cy="85" r="13" fill="#BDBDBD" />
        <Circle cx="120" cy="85" r="4" fill="#424242" />

        {/* Rear Wheel */}
        <Circle cx="35" cy="85" r="22" fill="#212121" />
        <Circle cx="35" cy="85" r="13" fill="#BDBDBD" />
        <Circle cx="35" cy="85" r="4" fill="#424242" />
      </G>

      {/* Destination Doorstep Pin Accent */}
      <G transform="translate(235, 75)">
        <Circle cx="20" cy="20" r="18" fill="#FFA000" />
        {/* Home / Door Icon inside Pin */}
        <Path
          d="M14 26 V18 L20 13 L26 18 V26 H14 Z"
          fill="#FFFFFF"
        />
        <Rect x="18" y="21" width="4" height="5" fill="#FFA000" />
      </G>

      {/* Road / Ground Line */}
      <Path d="M50 182 H275" stroke="#E0E0E0" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 6" />

      {/* Floating Fresh Leaves */}
      <Path d="M70 50 C60 40 55 30 75 25 C80 35 78 45 70 50 Z" fill="#81C784" />
      <Circle cx="260" cy="140" r="4" fill="#4CAF50" />
      <Circle cx="270" cy="165" r="3" fill="#81C784" />
    </Svg>
  );
};

export default FastDeliveryIllustration;
