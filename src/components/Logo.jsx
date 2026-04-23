import React from 'react';

export default function Logo({ size = 'md' }) {
  const scales = {
    sm: { iconSize: 32, titleSize: 13, subSize: 9 },
    md: { iconSize: 40, titleSize: 15, subSize: 10 },
    lg: { iconSize: 52, titleSize: 20, subSize: 12 },
    xl: { iconSize: 68, titleSize: 26, subSize: 15 },
  };
  const s = scales[size] || scales.md;
  const pad = 4;
  const textX = s.iconSize + 10;

  // Approximate text widths to size the SVG correctly
  const titleWidth = s.titleSize * 13.5; // "SERVICE CONNECT PRO"
  const subWidth = s.subSize * 22;       // "by Kindness Community Foundation"
  const maxTextWidth = Math.max(titleWidth, subWidth);
  const totalWidth = textX + maxTextWidth + pad;
  const totalHeight = s.iconSize + pad * 2;

  return (
    <svg
      width={totalWidth}
      height={totalHeight}
      viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Icon background */}
      <rect x={pad} y={pad} width={s.iconSize} height={s.iconSize} rx="8" fill="#f97316" />
      {/* Shield overlay */}
      <path
        d={`M${pad + s.iconSize / 2} ${pad + s.iconSize * 0.16}
           L${pad + s.iconSize * 0.84} ${pad + s.iconSize * 0.30}
           L${pad + s.iconSize * 0.84} ${pad + s.iconSize * 0.56}
           Q${pad + s.iconSize * 0.84} ${pad + s.iconSize * 0.80} ${pad + s.iconSize / 2} ${pad + s.iconSize * 0.86}
           Q${pad + s.iconSize * 0.16} ${pad + s.iconSize * 0.80} ${pad + s.iconSize * 0.16} ${pad + s.iconSize * 0.56}
           L${pad + s.iconSize * 0.16} ${pad + s.iconSize * 0.30} Z`}
        fill="white"
        fillOpacity="0.15"
      />
      {/* Heart */}
      <text
        x={pad + s.iconSize / 2}
        y={pad + s.iconSize * 0.65}
        textAnchor="middle"
        fontSize={s.iconSize * 0.38}
        fill="white"
      >♥</text>

      {/* Title */}
      <text
        x={textX}
        y={pad + s.iconSize * 0.44}
        fontFamily="'Segoe UI', Arial, sans-serif"
        fontWeight="800"
        fontSize={s.titleSize}
        fill="white"
        letterSpacing="0.5"
      >
        SERVICE CONNECT PRO
      </text>
      {/* Subtitle */}
      <text
        x={textX}
        y={pad + s.iconSize * 0.76}
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontSize={s.subSize}
        fill="#f97316"
        letterSpacing="0.3"
      >
        by Kindness Community
      </text>
    </svg>
  );
}