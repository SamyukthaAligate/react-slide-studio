import React from "react";

const ShapeRenderer = ({ element }) => {
  const fill = element.fill || "#4285f4";
  const stroke = element.stroke || "#1a73e8";
  const strokeWidth = Number.isFinite(element.strokeWidth)
    ? Math.max(element.strokeWidth, 0)
    : 2;
  const opacity = typeof element.opacity === "number" ? element.opacity : 1;
  const cornerRadius =
    typeof element.cornerRadius === "number"
      ? Math.max(element.cornerRadius, 0)
      : 0;
  const viewWidth = Math.max(element.width, 1);
  const viewHeight = Math.max(element.height, 1);
  const inset = strokeWidth / 2;

  const renderShape = () => {
    switch (element.shapeType) {
      case "rectangle":
        return (
          <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
            <rect
              x={inset}
              y={inset}
              width={Math.max(viewWidth - strokeWidth, 0)}
              height={Math.max(viewHeight - strokeWidth, 0)}
              rx={cornerRadius}
              ry={cornerRadius}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          </svg>
        );

      case "rounded-rectangle":
        return (
          <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
            <rect
              x={inset}
              y={inset}
              width={Math.max(viewWidth - strokeWidth, 0)}
              height={Math.max(viewHeight - strokeWidth, 0)}
              rx={cornerRadius || 12}
              ry={cornerRadius || 12}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          </svg>
        );

      case "circle":
      case "ellipse":
        const radiusX = Math.max((viewWidth - strokeWidth) / 2, 0);
        const radiusY = Math.max((viewHeight - strokeWidth) / 2, 0);
        return (
          <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
            <ellipse
              cx={viewWidth / 2}
              cy={viewHeight / 2}
              rx={radiusX}
              ry={radiusY}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          </svg>
        );

      case "triangle":
        const topPoint = `${viewWidth / 2},${inset}`;
        const leftPoint = `${inset},${viewHeight - inset}`;
        const rightPoint = `${viewWidth - inset},${viewHeight - inset}`;
        return (
          <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
            <polygon
              points={`${topPoint} ${rightPoint} ${leftPoint}`}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeLinejoin="round"
            />
          </svg>
        );

      case "diamond":
        const top = `${viewWidth / 2},${inset}`;
        const right = `${viewWidth - inset},${viewHeight / 2}`;
        const bottom = `${viewWidth / 2},${viewHeight - inset}`;
        const left = `${inset},${viewHeight / 2}`;
        return (
          <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
            <polygon
              points={`${top} ${right} ${bottom} ${left}`}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeLinejoin="round"
            />
          </svg>
        );

      case "arrow-right":
        return (
          <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
            <path
              d={`M ${inset} ${viewHeight / 2} L ${viewWidth * 0.7} ${viewHeight / 2} L ${viewWidth * 0.7} ${inset} L ${viewWidth - inset} ${viewHeight / 2} L ${viewWidth * 0.7} ${viewHeight - inset} L ${viewWidth * 0.7} ${viewHeight / 2} Z`}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeLinejoin="round"
            />
          </svg>
        );

      case "arrow-left":
        return (
          <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
            <path
              d={`M ${viewWidth - inset} ${viewHeight / 2} L ${viewWidth * 0.3} ${viewHeight / 2} L ${viewWidth * 0.3} ${viewHeight - inset} L ${inset} ${viewHeight / 2} L ${viewWidth * 0.3} ${inset} L ${viewWidth * 0.3} ${viewHeight / 2} Z`}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeLinejoin="round"
            />
          </svg>
        );

      case "arrow-up":
        return (
          <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
            <path
              d={`M ${viewWidth / 2} ${viewHeight - inset} L ${viewWidth / 2} ${viewHeight * 0.3} L ${viewWidth - inset} ${viewHeight * 0.3} L ${viewWidth / 2} ${inset} L ${inset} ${viewHeight * 0.3} L ${viewWidth / 2} ${viewHeight * 0.3} Z`}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeLinejoin="round"
            />
          </svg>
        );

      case "arrow-down":
        return (
          <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
            <path
              d={`M ${viewWidth / 2} ${inset} L ${viewWidth / 2} ${viewHeight * 0.7} L ${inset} ${viewHeight * 0.7} L ${viewWidth / 2} ${viewHeight - inset} L ${viewWidth - inset} ${viewHeight * 0.7} L ${viewWidth / 2} ${viewHeight * 0.7} Z`}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeLinejoin="round"
            />
          </svg>
        );

      case "double-arrow":
        return (
          <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
            <path
              d={`M ${inset} ${viewHeight / 2} L ${viewWidth * 0.25} ${inset} L ${viewWidth * 0.25} ${viewHeight * 0.35} L ${viewWidth * 0.75} ${viewHeight * 0.35} L ${viewWidth * 0.75} ${inset} L ${viewWidth - inset} ${viewHeight / 2} L ${viewWidth * 0.75} ${viewHeight - inset} L ${viewWidth * 0.75} ${viewHeight * 0.65} L ${viewWidth * 0.25} ${viewHeight * 0.65} L ${viewWidth * 0.25} ${viewHeight - inset} Z`}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeLinejoin="round"
            />
          </svg>
        );

      case "star-5":
        const points5 = [];
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const outerX = viewWidth / 2 + (viewWidth / 2 - inset) * Math.cos(angle);
          const outerY = viewHeight / 2 + (viewHeight / 2 - inset) * Math.sin(angle);
          points5.push(`${outerX},${outerY}`);
          
          const innerAngle = angle + (2 * Math.PI) / 10;
          const innerX = viewWidth / 2 + (viewWidth / 4) * Math.cos(innerAngle);
          const innerY = viewHeight / 2 + (viewHeight / 4) * Math.sin(innerAngle);
          points5.push(`${innerX},${innerY}`);
        }
        return (
          <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
            <polygon
              points={points5.join(" ")}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeLinejoin="round"
            />
          </svg>
        );

      case "star-6":
        const points6 = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * 2 * Math.PI) / 6 - Math.PI / 2;
          const outerX = viewWidth / 2 + (viewWidth / 2 - inset) * Math.cos(angle);
          const outerY = viewHeight / 2 + (viewHeight / 2 - inset) * Math.sin(angle);
          points6.push(`${outerX},${outerY}`);
          
          const innerAngle = angle + Math.PI / 6;
          const innerX = viewWidth / 2 + (viewWidth / 3.5) * Math.cos(innerAngle);
          const innerY = viewHeight / 2 + (viewHeight / 3.5) * Math.sin(innerAngle);
          points6.push(`${innerX},${innerY}`);
        }
        return (
          <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
            <polygon
              points={points6.join(" ")}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeLinejoin="round"
            />
          </svg>
        );

      case "star-8":
        const points8 = [];
        for (let i = 0; i < 8; i++) {
          const angle = (i * 2 * Math.PI) / 8 - Math.PI / 2;
          const outerX = viewWidth / 2 + (viewWidth / 2 - inset) * Math.cos(angle);
          const outerY = viewHeight / 2 + (viewHeight / 2 - inset) * Math.sin(angle);
          points8.push(`${outerX},${outerY}`);
          
          const innerAngle = angle + Math.PI / 8;
          const innerX = viewWidth / 2 + (viewWidth / 3) * Math.cos(innerAngle);
          const innerY = viewHeight / 2 + (viewHeight / 3) * Math.sin(innerAngle);
          points8.push(`${innerX},${innerY}`);
        }
        return (
          <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
            <polygon
              points={points8.join(" ")}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeLinejoin="round"
            />
          </svg>
        );

      case "speech-bubble":
        return (
          <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
            <path
              d={`M ${inset + 10} ${inset} L ${viewWidth - inset - 10} ${inset} Q ${viewWidth - inset} ${inset} ${viewWidth - inset} ${inset + 10} L ${viewWidth - inset} ${viewHeight * 0.7 - 10} Q ${viewWidth - inset} ${viewHeight * 0.7} ${viewWidth - inset - 10} ${viewHeight * 0.7} L ${viewWidth * 0.3} ${viewHeight * 0.7} L ${viewWidth * 0.2} ${viewHeight - inset} L ${viewWidth * 0.25} ${viewHeight * 0.7} L ${inset + 10} ${viewHeight * 0.7} Q ${inset} ${viewHeight * 0.7} ${inset} ${viewHeight * 0.7 - 10} L ${inset} ${inset + 10} Q ${inset} ${inset} ${inset + 10} ${inset} Z`}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeLinejoin="round"
            />
          </svg>
        );

      case "thought-bubble":
        return (
          <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
            <ellipse
              cx={viewWidth / 2}
              cy={viewHeight * 0.35}
              rx={(viewWidth - strokeWidth) / 2.2}
              ry={(viewHeight - strokeWidth) / 2.5}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
            <circle
              cx={viewWidth * 0.25}
              cy={viewHeight * 0.75}
              r={viewWidth * 0.08}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
            <circle
              cx={viewWidth * 0.15}
              cy={viewHeight * 0.9}
              r={viewWidth * 0.05}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          </svg>
        );

      case "callout-rectangle":
        return (
          <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
            <path
              d={`M ${inset} ${inset} L ${viewWidth - inset} ${inset} L ${viewWidth - inset} ${viewHeight * 0.75} L ${viewWidth * 0.6} ${viewHeight * 0.75} L ${viewWidth * 0.5} ${viewHeight - inset} L ${viewWidth * 0.45} ${viewHeight * 0.75} L ${inset} ${viewHeight * 0.75} Z`}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeLinejoin="round"
            />
          </svg>
        );

      case "parallelogram":
        return (
          <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
            <polygon
              points={`${viewWidth * 0.2},${inset} ${viewWidth - inset},${inset} ${viewWidth * 0.8},${viewHeight - inset} ${inset},${viewHeight - inset}`}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeLinejoin="round"
            />
          </svg>
        );

      default:
        // Fallback to rectangle
        return (
          <svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
            <rect
              x={inset}
              y={inset}
              width={Math.max(viewWidth - strokeWidth, 0)}
              height={Math.max(viewHeight - strokeWidth, 0)}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          </svg>
        );
    }
  };

  return (
    <div style={{ 
      width: "100%", 
      height: "100%", 
      pointerEvents: "none",
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      {renderShape()}
    </div>
  );
};

export default ShapeRenderer;
