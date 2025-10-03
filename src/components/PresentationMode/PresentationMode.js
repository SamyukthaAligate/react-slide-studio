import React, { useEffect, useCallback } from 'react';
import './PresentationMode.css';

const PresentationMode = ({ slides, currentSlideIndex, onSlideChange, onExit }) => {
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

  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        prevSlide();
        break;
      case 'Escape':
        e.preventDefault();
        onExit();
        break;
      default:
        break;
    }
  }, [nextSlide, prevSlide, onExit]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentSlide = slides[currentSlideIndex];

  const renderChart = (element) => {
    const { chartType, data, color } = element;
    const scale = window.innerWidth / 800; // Scale factor for presentation
    const chartWidth = (element.width - 32) * scale;
    const chartHeight = (element.height - 32) * scale;

    if (chartType === 'bar') {
      const maxValue = Math.max(...data.map(d => d.value));
      const barWidth = chartWidth / data.length - 10;
      
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div style={{ fontSize: `${14 * scale}px`, fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>
            Bar Chart
          </div>
          <div style={{ display: 'flex', alignItems: 'end', height: chartHeight - 30 * scale, gap: '5px' }}>
            {data.map((item, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: barWidth,
                    height: (item.value / maxValue) * (chartHeight - 50 * scale),
                    backgroundColor: color,
                    borderRadius: '2px 2px 0 0'
                  }}
                />
                <div style={{ fontSize: `${10 * scale}px`, marginTop: '5px', textAlign: 'center' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (chartType === 'pie') {
      const total = data.reduce((sum, item) => sum + item.value, 0);
      let currentAngle = 0;
      const radius = Math.min(chartWidth, chartHeight) / 2 - 20 * scale;
      const centerX = chartWidth / 2;
      const centerY = chartHeight / 2;

      return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div style={{ fontSize: `${14 * scale}px`, fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>
            Pie Chart
          </div>
          <svg width={chartWidth} height={chartHeight - 30 * scale} style={{ display: 'block' }}>
            {data.map((item, index) => {
              const angle = (item.value / total) * 360;
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
                  fill={item.color}
                  stroke="#fff"
                  strokeWidth={2 * scale}
                />
              );
            })}
          </svg>
        </div>
      );
    }

    if (chartType === 'line') {
      const maxValue = Math.max(...data.map(d => d.value));
      const minValue = Math.min(...data.map(d => d.value));
      const range = maxValue - minValue || 1;
      
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <div style={{ fontSize: `${14 * scale}px`, fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>
            Line Chart
          </div>
          <svg width={chartWidth} height={chartHeight - 30 * scale} style={{ display: 'block' }}>
            <polyline
              fill="none"
              stroke={color}
              strokeWidth={3 * scale}
              points={data.map((item, index) => {
                const x = (index / (data.length - 1)) * (chartWidth - 40 * scale) + 20 * scale;
                const y = chartHeight - 50 * scale - ((item.value - minValue) / range) * (chartHeight - 80 * scale);
                return `${x},${y}`;
              }).join(' ')}
            />
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * (chartWidth - 40 * scale) + 20 * scale;
              const y = chartHeight - 50 * scale - ((item.value - minValue) / range) * (chartHeight - 80 * scale);
              return (
                <g key={index}>
                  <circle cx={x} cy={y} r={4 * scale} fill={color} />
                  <text x={x} y={chartHeight - 25 * scale} textAnchor="middle" fontSize={10 * scale}>
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      );
    }

    return <div>Chart</div>;
  };

  const renderElement = (element) => {
    const elementStyle = {
      position: 'absolute',
      left: `${(element.x / 800) * 100}%`,
      top: `${(element.y / 600) * 100}%`,
      width: `${(element.width / 800) * 100}%`,
      height: `${(element.height / 600) * 100}%`,
    };

    if (element.type === 'text') {
      return (
        <div
          key={element.id}
          style={{
            ...elementStyle,
            fontSize: `${element.fontSize * (window.innerWidth / 800)}px`,
            fontFamily: element.fontFamily,
            color: element.color,
            backgroundColor: element.backgroundColor,
            fontWeight: element.fontWeight,
            fontStyle: element.fontStyle,
            textAlign: element.textAlign,
            padding: '4px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflow: 'hidden'
          }}
        >
          {element.content}
        </div>
      );
    }

    if (element.type === 'shape') {
      if (element.shapeType === 'rectangle') {
        return (
          <div
            key={element.id}
            style={{
              ...elementStyle,
              backgroundColor: element.fill,
              border: `${element.strokeWidth}px solid ${element.stroke}`,
            }}
          />
        );
      }

      if (element.shapeType === 'circle') {
        return (
          <div
            key={element.id}
            style={{
              ...elementStyle,
              backgroundColor: element.fill,
              border: `${element.strokeWidth}px solid ${element.stroke}`,
              borderRadius: '50%',
            }}
          />
        );
      }

      if (element.shapeType === 'triangle') {
        return (
          <div
            key={element.id}
            style={{
              ...elementStyle,
              width: 0,
              height: 0,
              borderLeft: `${(element.width / 800) * (window.innerWidth / 2)}px solid transparent`,
              borderRight: `${(element.width / 800) * (window.innerWidth / 2)}px solid transparent`,
              borderBottom: `${(element.height / 600) * window.innerHeight}px solid ${element.fill}`,
            }}
          />
        );
      }
    }

    if (element.type === 'image') {
      return (
        <img
          key={element.id}
          src={element.src}
          alt=""
          style={{
            ...elementStyle,
            objectFit: 'cover',
          }}
        />
      );
    }

    if (element.type === 'chart') {
      return (
        <div
          key={element.id}
          style={{
            ...elementStyle,
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '16px',
            overflow: 'hidden'
          }}
        >
          {renderChart(element)}
        </div>
      );
    }

    if (element.type === 'video') {
      return (
        <video
          key={element.id}
          src={element.src}
          controls
          style={{
            ...elementStyle,
            objectFit: 'cover',
            borderRadius: '4px',
            backgroundColor: '#000'
          }}
        />
      );
    }

    return null;
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

      <div 
        className="presentation-slide"
        style={{ 
          backgroundColor: currentSlide.background,
          backgroundImage: currentSlide.backgroundImage ? `url(${currentSlide.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        onClick={nextSlide}
      >
        {currentSlide.elements.map(renderElement)}
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
