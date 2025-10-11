import React, { useEffect, useCallback, useState } from 'react';
import './PresentationMode.css';

const BASE_WIDTH = 960;
const BASE_HEIGHT = 540;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const computeScale = () => {
  if (typeof window === 'undefined') {
    return 1;
  }
  const widthRatio = window.innerWidth / BASE_WIDTH;
  const heightRatio = window.innerHeight / BASE_HEIGHT;
  return Math.min(widthRatio, heightRatio, 1);
};

const PresentationMode = ({ slides, currentSlideIndex, onSlideChange, onExit }) => {
  const [scale, setScale] = useState(() => computeScale());

  const nextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      onSlideChange(currentSlideIndex + 1);
    }
  }, [currentSlideIndex, slides.length, onSlideChange]);

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      onSlideChange(currentSlideIndex - 1);
    }
  }, [currentSlideIndex, onSlideChange]);

  const recalcScale = useCallback(() => {
    setScale(computeScale());
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      }
    },
    [nextSlide, prevSlide, onExit]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    recalcScale();
    window.addEventListener('resize', recalcScale);
    return () => window.removeEventListener('resize', recalcScale);
  }, [recalcScale]);

  const currentSlide = slides[currentSlideIndex];
  if (!currentSlide) {
    return null;
  }

  const renderChart = (element) => {
    const data = Array.isArray(element.data) ? element.data : [];
    const fallbackColor = element.color || '#4F46E5';
    const chartWidth = Math.max(element.width || 320, 140);
    const chartHeight = Math.max(element.height || 240, 160);

    if (data.length === 0) {
      return (
        <div className="presentation-chart-empty">
          No data for chart
        </div>
      );
    }

    if (element.chartType === 'bar') {
      const maxValue = Math.max(...data.map(item => (typeof item.value === 'number' ? item.value : 0)), 0) || 1;
      const horizontalPadding = Math.min(chartWidth * 0.12, 64);
      const verticalPadding = Math.min(chartHeight * 0.18, 84);
      const headerSpace = 32;
      const labelSpace = Math.min(chartHeight * 0.18, 48);
      const innerHeight = Math.max(chartHeight - verticalPadding - headerSpace - labelSpace, 80);
      const columnGap = Math.max(Math.min(chartWidth * 0.05, 32), 12);
      const minColumnWidth = Math.max(
        Math.min((chartWidth - horizontalPadding) / Math.max(data.length, 1), 140),
        36
      );

      return (
        <div
          className="presentation-chart-area"
          style={{
            padding: `${verticalPadding / 2}px ${horizontalPadding / 2}px`
          }}
        >
          <div className="presentation-chart-title">Bar chart</div>
          <div
            style={{
              flex: 1,
              minHeight: innerHeight,
              width: '100%',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: columnGap,
              padding: '0 6px',
              boxSizing: 'border-box'
            }}
          >
            {data.map((item, index) => {
              const value = typeof item.value === 'number' ? item.value : 0;
              const label = item.label || `Series ${index + 1}`;
              const barColor = item.color || fallbackColor;
              const heightRatio = Math.max(value / maxValue, 0);
              const barHeight = Math.min(
                Math.max(heightRatio * innerHeight, Math.max(innerHeight * 0.06, 14)),
                innerHeight
              );

              return (
                <div
                  key={index}
                  style={{
                    flex: `1 1 ${minColumnWidth}px`,
                    maxWidth: Math.max(minColumnWidth, (chartWidth - horizontalPadding) / Math.max(data.length, 1)),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: barHeight,
                      maxHeight: innerHeight,
                      borderRadius: '8px 8px 4px 4px',
                      background: barColor,
                      boxShadow: '0 6px 14px rgba(0,0,0,0.12)',
                      transition: 'height 0.2s ease, width 0.2s ease'
                    }}
                  />
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#333',
                      width: '100%',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (element.chartType === 'pie') {
      const total = data.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0) || 1;
      let currentAngle = 0;
      const radius = Math.min(chartWidth, chartHeight) / 2 - 20;
      const centerX = chartWidth / 2;
      const centerY = chartHeight / 2;

      return (
        <div className="presentation-chart-area">
          <div className="presentation-chart-title">Pie chart</div>
          <svg width={chartWidth} height={chartHeight - 60} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
            {data.map((item, index) => {
              const value = typeof item.value === 'number' ? item.value : 0;
              const angle = (value / total) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              currentAngle += angle;

              const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
              const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
              const largeArcFlag = angle > 180 ? 1 : 0;

              return (
                <path
                  key={index}
                  d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={item.color || fallbackColor}
                  stroke="#0f172a"
                  strokeWidth="1"
                  opacity="0.96"
                />
              );
            })}
          </svg>
          <div className="presentation-chart-legend">
            {data.map((item, index) => (
              <span key={index}>
                <span className="legend-dot" style={{ background: item.color || fallbackColor }} />
                {item.label || `Slice ${index + 1}`}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (element.chartType === 'line') {
      const values = data.map(item => (typeof item.value === 'number' ? item.value : 0));
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      const range = maxValue - minValue || 1;

      const points = data.map((item, index) => {
      	const value = typeof item.value === 'number' ? item.value : 0;
        const x = (index / Math.max(data.length - 1, 1)) * (chartWidth - 40) + 20;
        const normalized = clamp((value - minValue) / range, 0, 1);
        const rawY = (chartHeight - 72) - normalized * (chartHeight - 96);
        const y = clamp(rawY, 12, chartHeight - 40);
        return `${x},${y}`;
      }).join(' ');

      return (
        <div className="presentation-chart-area">
          <div className="presentation-chart-title">Line chart</div>
          <svg width={chartWidth} height={chartHeight - 40} style={{ display: 'block' }}>
            <polyline
              fill="none"
              stroke={fallbackColor}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={points}
            />
            {data.map((item, index) => {
              const value = typeof item.value === 'number' ? item.value : 0;
              const x = (index / Math.max(data.length - 1, 1)) * (chartWidth - 40) + 20;
              const normalized = clamp((value - minValue) / range, 0, 1);
              const rawY = (chartHeight - 72) - normalized * (chartHeight - 96);
              const y = clamp(rawY, 12, chartHeight - 40);

              return (
                <g key={index}>
                  <circle cx={x} cy={y} r="5" fill="#ffffff" stroke={item.color || fallbackColor} strokeWidth="2" />
                  <text x={x} y={chartHeight - 18} textAnchor="middle" fontSize="11" fill="#334155">
                    {item.label || `Point ${index + 1}`}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      );
    }

    return (
      <div className="presentation-chart-empty">
        Chart preview unavailable
      </div>
    );
  };

  const renderElement = (element) => {
    const baseStyle = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height
    };

    if (element.type === 'text') {
      return (
        <div
          key={element.id}
          style={{
            ...baseStyle,
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            color: element.color,
            backgroundColor: element.backgroundColor || 'transparent',
            fontWeight: element.fontWeight,
            fontStyle: element.fontStyle,
            textAlign: element.textAlign,
            textDecoration: element.textDecoration,
            padding: '8px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflow: 'hidden',
            borderRadius: '4px',
            boxShadow: element.backgroundColor && element.backgroundColor !== 'transparent'
              ? '0 14px 32px rgba(15, 23, 42, 0.14)'
              : 'none'
          }}
        >
          {element.content}
        </div>
      );
    }

    if (element.type === 'shape') {
      const fill = element.fill || '#2f2f2f';
      const stroke = element.stroke || 'transparent';
      const strokeWidth = Number.isFinite(element.strokeWidth) ? Math.max(element.strokeWidth, 0) : 0;
      const opacity = typeof element.opacity === 'number' ? element.opacity : 1;
      const cornerRadius = typeof element.cornerRadius === 'number' ? Math.max(element.cornerRadius, 0) : 0;
      const shadowStyle = element.shadow ? '0 18px 32px rgba(0,0,0,0.35)' : 'none';
      const viewWidth = Math.max(element.width, 1);
      const viewHeight = Math.max(element.height, 1);
      const inset = strokeWidth / 2;

      let shapeSvg = null;

      if (element.shapeType === 'rectangle') {
        shapeSvg = (
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
      } else if (element.shapeType === 'circle') {
        const radiusX = Math.max((viewWidth - strokeWidth) / 2, 0);
        const radiusY = Math.max((viewHeight - strokeWidth) / 2, 0);
        shapeSvg = (
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
      } else if (element.shapeType === 'triangle') {
        const topPoint = `${viewWidth / 2},${inset}`;
        const leftPoint = `${inset},${viewHeight - inset}`;
        const rightPoint = `${viewWidth - inset},${viewHeight - inset}`;
        shapeSvg = (
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
      }

      return (
        <div
          key={element.id}
          style={{
            ...baseStyle,
            borderRadius: element.shapeType === 'rectangle' ? cornerRadius : 0,
            boxShadow: shadowStyle
          }}
        >
          <div style={{ width: '100%', height: '100%' }}>
            {shapeSvg}
          </div>
        </div>
      );
    }

    if (element.type === 'image') {
      return (
        <img
          key={element.id}
          src={element.src}
          alt=""
          style={{
            ...baseStyle,
            objectFit: 'cover',
            borderRadius: '12px',
            boxShadow: '0 24px 48px rgba(15, 23, 42, 0.28)'
          }}
        />
      );
    }

    if (element.type === 'video') {
      return (
        <video
          key={element.id}
          src={element.src}
          controls
          style={{
            ...baseStyle,
            objectFit: 'cover',
            borderRadius: '12px',
            backgroundColor: '#000'
          }}
        />
      );
    }

    if (element.type === 'chart') {
      return (
        <div
          key={element.id}
          style={{
            ...baseStyle,
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 24px 56px rgba(15, 23, 42, 0.22)',
            padding: '16px',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          {renderChart(element)}
        </div>
      );
    }

    return null;
  };

  const slideStyle = {
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    transform: `scale(${scale})`,
    transformOrigin: 'center center',
    backgroundColor: currentSlide.background,
    backgroundImage: currentSlide.backgroundImage
      ? `url(${currentSlide.backgroundImage})`
      : (currentSlide.backgroundGradient || 'none'),
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  };

  return (
    <div className="presentation-mode">
      <div className="presentation-controls">
        <button className="control-btn" onClick={onExit} title="Exit presentation (Esc)">
          <i className="fas fa-times"></i>
        </button>
        <div className="slide-counter">
          {currentSlideIndex + 1} / {slides.length}
        </div>
        <div className="navigation-controls">
          <button
            className="control-btn"
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            title="Previous slide (←)"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button
            className="control-btn"
            onClick={nextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            title="Next slide (→ or Space)"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="presentation-stage">
        <div
          className="presentation-slide"
          style={slideStyle}
          onClick={nextSlide}
        >
          {currentSlide.elements.map(renderElement)}
        </div>
      </div>

      <div className="presentation-help">
        <div className="help-text">
          Use arrow keys or space to navigate • Press Esc to exit
        </div>
      </div>
    </div>
  );
};

export default PresentationMode;
