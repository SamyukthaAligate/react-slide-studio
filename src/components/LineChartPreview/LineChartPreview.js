import React from 'react';

const clamp = (value, min, max) => Math.max(Math.min(value, max), min);

const LineChartPreview = ({ data = [], width = 240, height = 180, fallbackColor = '#4F46E5' }) => {
  const safeWidth = Math.max(width, 200);
  const safeHeight = Math.max(height, 160);
  const values = data.map((item) => (typeof item.value === 'number' ? item.value : 0));
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;
  const safeCount = data.length || 1;

  const xPadding = Math.max(Math.min(safeWidth * 0.12, 60), 24);
  const yPaddingTop = Math.max(safeHeight * 0.16, 28);
  const yPaddingBottom = Math.max(safeHeight * 0.18, 36);
  const plotWidth = safeWidth - xPadding * 2;
  const plotHeight = safeHeight - yPaddingTop - yPaddingBottom;

  const truncated = (text, maxChars) => {
    if (typeof text !== 'string') return text;
    return text.length <= maxChars ? text : `${text.slice(0, maxChars - 1)}…`;
  };

  const coordinates = data.map((item, index) => {
    const value = typeof item.value === 'number' ? item.value : 0;
    const normalized = Math.max(Math.min((value - minValue) / range, 1), 0);
    const x = safeCount === 1 ? safeWidth / 2 : xPadding + (plotWidth * index) / (safeCount - 1);
    const y = yPaddingTop + plotHeight * (1 - normalized);
    return {
      x,
      y,
      value,
      label: item.label || `Point ${index + 1}`,
      color: item.color || fallbackColor,
    };
  });

  const points = coordinates.map((point) => `${point.x},${point.y}`).join(' ');
  const maxLabelLength = Math.max(6, Math.floor(plotWidth / Math.max(safeCount, 1) / 10));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const value = minValue + range * ratio;
    return {
      ratio,
      y: yPaddingTop + plotHeight * (1 - ratio),
      label: value % 1 === 0 ? value.toString() : value.toFixed(1),
    };
  });

  return (
    <div className="chart-card">
      <div
        className="chart-card__header"
        style={{
          padding: `${Math.max(safeHeight * 0.04, 12)}px ${Math.max(safeWidth * 0.06, 16)}px 4px`,
          fontSize: Math.max(Math.min(safeWidth * 0.05, 16), 12),
        }}
      >
        Line chart
      </div>
      <div
        className="chart-card__plot"
        style={{
          padding: `0 ${Math.max(safeWidth * 0.06, 18)}px ${Math.max(safeHeight * 0.06, 18)}px`,
        }}
      >
        <svg width={safeWidth} height={safeHeight} viewBox={`0 0 ${safeWidth} ${safeHeight}`}>
          <defs>
            <clipPath id="line-plot-clip">
              <rect
                x={xPadding}
                y={yPaddingTop}
                width={plotWidth}
                height={plotHeight}
                rx={Math.min(12, plotWidth * 0.04)}
                ry={Math.min(12, plotWidth * 0.04)}
              />
            </clipPath>
          </defs>
          <rect
            x={xPadding}
            y={yPaddingTop}
            width={plotWidth}
            height={plotHeight}
            fill="#f8fafc"
            rx={Math.min(12, plotWidth * 0.04)}
            ry={Math.min(12, plotWidth * 0.04)}
          />
          {ticks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={xPadding}
                y1={tick.y}
                x2={xPadding + plotWidth}
                y2={tick.y}
                stroke="#e2e8f0"
                strokeWidth={idx === ticks.length - 1 ? 1.2 : 0.8}
                strokeDasharray={idx === ticks.length - 1 ? 'none' : '3 4'}
                opacity={idx === ticks.length - 1 ? 0.9 : 0.6}
              />
              <text
                x={xPadding - 10}
                y={tick.y}
                textAnchor="end"
                alignmentBaseline="middle"
                fill="#475569"
                fontSize={Math.max(Math.min(plotHeight * 0.12, 14), 9)}
              >
                {tick.label}
              </text>
            </g>
          ))}
          <g clipPath="url(#line-plot-clip)">
            <polyline
              fill="none"
              stroke={fallbackColor}
              strokeWidth={Math.max(plotWidth * 0.006, 2)}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={points}
            />
            {coordinates.map((point, index) => (
              <circle
                key={`line-point-${index}`}
                cx={point.x}
                cy={point.y}
                r={Math.max(plotWidth * 0.015, 4)}
                fill="#ffffff"
                stroke={point.color}
                strokeWidth={Math.max(plotWidth * 0.004, 1.4)}
              />
            ))}
          </g>
          {coordinates.map((point, index) => (
            <text
              key={`label-${index}`}
              x={point.x}
              y={yPaddingTop + plotHeight + Math.max(Math.min(plotHeight * 0.12, 14), 9) + 10}
              textAnchor="middle"
              fill="#334155"
              fontSize={Math.max(Math.min((plotWidth / Math.max(safeCount, 1)) * 0.24, 12), 9)}
            >
              {truncated(point.label, maxLabelLength)}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default LineChartPreview;
