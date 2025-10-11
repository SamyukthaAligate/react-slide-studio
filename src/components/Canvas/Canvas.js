import React, { useState, useRef, useCallback } from 'react';
import './Canvas.css';

const Canvas = ({ 
  slide, 
  onUpdateSlide, 
  selectedElement, 
  onSelectElement, 
  onUpdateElement, 
  onDeleteElement,
  onAddElement,
  zoomLevel = 100,
  showRulers = false,
  onToggleRulers
}) => {
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [gridSize, setGridSize] = useState(24);
  // track Shift key to temporarily disable snapping
  const [isShiftDown, setIsShiftDown] = useState(false);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0 });
  const [clipboardElement, setClipboardElement] = useState(null);
  const canvasRef = useRef(null);

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
      setIsEditingText(false);
      setContextMenu({ show: false, x: 0, y: 0 });
    }
  };

  // Context menu handlers
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on an element
    const elementAtPoint = slide.elements.find(el => {
      return x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height;
    });

    if (elementAtPoint) {
      onSelectElement(elementAtPoint);
    } else {
      onSelectElement(null);
    }

    setContextMenu({ show: true, x: e.clientX, y: e.clientY });
  };

  const hideContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0 });
  };

  const handleCopy = () => {
    if (selectedElement) {
      setClipboardElement(JSON.parse(JSON.stringify(selectedElement)));
    }
    hideContextMenu();
  };

  const handleCut = () => {
    if (selectedElement) {
      setClipboardElement(JSON.parse(JSON.stringify(selectedElement)));
      onDeleteElement(selectedElement.id);
    }
    hideContextMenu();
  };

  const handlePaste = () => {
    if (clipboardElement) {
      const newElement = {
        ...clipboardElement,
        id: Date.now().toString(), // Simple unique ID
        x: clipboardElement.x + 20, // Offset slightly
        y: clipboardElement.y + 20
      };
      onAddElement(newElement);
    }
    hideContextMenu();
  };

  const handleDelete = () => {
    if (selectedElement) {
      onDeleteElement(selectedElement.id);
    }
    hideContextMenu();
  };

  // Drag and drop for images and other files
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide drag overlay if leaving the canvas entirely
    if (e.target === canvasRef.current) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Check if it's an image or video
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left - 100; // Center on drop point
          const y = e.clientY - rect.top - 75;

          if (onAddElement) {
            onAddElement({
              type: 'image',
              src: event.target.result,
              x: Math.max(0, x),
              y: Math.max(0, y),
              width: 200,
              height: 150
            });
          }
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left - 200;
          const y = e.clientY - rect.top - 150;

          if (onAddElement) {
            onAddElement({
              type: 'video',
              src: event.target.result,
              x: Math.max(0, x),
              y: Math.max(0, y),
              width: 400,
              height: 300
            });
          }
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'text/plain') {
        // Handle text files
        const reader = new FileReader();
        reader.onload = (event) => {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left - 100;
          const y = e.clientY - rect.top - 50;

          if (onAddElement) {
            onAddElement({
              type: 'text',
              content: event.target.result.substring(0, 200), // Limit text length
              x: Math.max(0, x),
              y: Math.max(0, y),
              width: 200,
              height: 100,
              fontSize: 16,
              fontFamily: 'Roboto',
              color: '#000000',
              backgroundColor: 'transparent',
              textAlign: 'left',
              fontWeight: 'normal',
              fontStyle: 'normal'
            });
          }
        };
        reader.readAsText(file);
      }
    }
  };

  const handleElementClick = (e, element) => {
    e.stopPropagation();
    
    // If the element is already selected and it's a text element, start editing
    if (selectedElement && selectedElement.id === element.id && element.type === 'text') {
      setIsEditingText(true);
    } else {
      // Otherwise, just select the element
      onSelectElement(element);
      setIsEditingText(false);
    }
  };

  const handleElementDoubleClick = (e, element) => {
    e.stopPropagation();
    if (element.type === 'text') {
      setIsEditingText(true);
    }
  };

  const handleMouseDown = (e, element, handle = null) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      setIsDragging(true);
    }
    
    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    onSelectElement(element);
  };

  const handleMouseMove = useCallback((e) => {
    if (!selectedElement || (!isDragging && !isResizing) || isEditingText) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    if (isDragging) {
      const deltaX = currentX - dragStart.x;
      const deltaY = currentY - dragStart.y;
      
      // PowerPoint-like canvas dimensions (16:9 aspect ratio)
      const canvasWidth = 960; // 16:9 aspect ratio
      const canvasHeight = 540; // 16:9 aspect ratio
      
      let newX = Math.max(0, Math.min(canvasWidth - selectedElement.width, selectedElement.x + deltaX));
      let newY = Math.max(0, Math.min(canvasHeight - selectedElement.height, selectedElement.y + deltaY));

      // Snap to grid if enabled and Shift not held
      const snap = (v) => Math.round(v / gridSize) * gridSize;
      if (snapToGrid && !isShiftDown) {
        newX = Math.max(0, Math.min(canvasWidth - selectedElement.width, snap(newX)));
        newY = Math.max(0, Math.min(canvasHeight - selectedElement.height, snap(newY)));
      }
      
      onUpdateElement(selectedElement.id, {
        x: newX,
        y: newY
      });
      
      setDragStart({ x: currentX, y: currentY });
    }
    
    if (isResizing && resizeHandle) {
      const deltaX = currentX - dragStart.x;
      const deltaY = currentY - dragStart.y;
      
      let updates = {};
      // PowerPoint-like canvas dimensions (16:9 aspect ratio)
      const canvasWidth = 960;
      const canvasHeight = 540;
      
      switch (resizeHandle) {
        case 'se':
          updates = {
            width: Math.max(50, Math.min(canvasWidth - selectedElement.x, selectedElement.width + deltaX)),
            height: Math.max(30, Math.min(canvasHeight - selectedElement.y, selectedElement.height + deltaY))
          };
          if (snapToGrid && !isShiftDown) {
            updates.width = Math.max(50, Math.round(updates.width / gridSize) * gridSize);
            updates.height = Math.max(30, Math.round(updates.height / gridSize) * gridSize);
          }
          break;
        case 'sw':
          const newWidth = Math.max(50, selectedElement.width - deltaX);
          const newX = Math.max(0, selectedElement.x + selectedElement.width - newWidth);
          updates = {
            x: newX,
            width: newWidth,
            height: Math.max(30, Math.min(canvasHeight - selectedElement.y, selectedElement.height + deltaY))
          };
          if (snapToGrid && !isShiftDown) {
            updates.width = Math.max(50, Math.round(updates.width / gridSize) * gridSize);
            updates.x = Math.max(0, Math.round(updates.x / gridSize) * gridSize);
          }
          break;
        case 'ne':
          const newHeight = Math.max(30, selectedElement.height - deltaY);
          const newY = Math.max(0, selectedElement.y + selectedElement.height - newHeight);
          updates = {
            y: newY,
            width: Math.max(50, Math.min(canvasWidth - selectedElement.x, selectedElement.width + deltaX)),
            height: newHeight
          };
          if (snapToGrid && !isShiftDown) {
            updates.height = Math.max(30, Math.round(updates.height / gridSize) * gridSize);
            updates.y = Math.max(0, Math.round(updates.y / gridSize) * gridSize);
          }
          break;
        case 'nw':
          const newWidthNW = Math.max(50, selectedElement.width - deltaX);
          const newHeightNW = Math.max(30, selectedElement.height - deltaY);
          const newXNW = Math.max(0, selectedElement.x + selectedElement.width - newWidthNW);
          const newYNW = Math.max(0, selectedElement.y + selectedElement.height - newHeightNW);
          updates = {
            x: newXNW,
            y: newYNW,
            width: newWidthNW,
            height: newHeightNW
          };
          if (snapToGrid && !isShiftDown) {
            updates.x = Math.max(0, Math.round(updates.x / gridSize) * gridSize);
            updates.y = Math.max(0, Math.round(updates.y / gridSize) * gridSize);
            updates.width = Math.max(50, Math.round(updates.width / gridSize) * gridSize);
            updates.height = Math.max(30, Math.round(updates.height / gridSize) * gridSize);
          }
          break;
        default:
          break;
      }
      
      onUpdateElement(selectedElement.id, updates);
      setDragStart({ x: currentX, y: currentY });
    }
  }, [selectedElement, isDragging, isResizing, dragStart, resizeHandle, onUpdateElement]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleTextChange = (e, element) => {
    onUpdateElement(element.id, { content: e.target.value });
  };

  const handleTextBlur = () => {
    setIsEditingText(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Delete' && selectedElement) {
      onDeleteElement(selectedElement.id);
    }
    if (e.key === 'Escape') {
      onSelectElement(null);
      setIsEditingText(false);
    }
  };

  React.useEffect(() => {
    const handleToggle = (e) => {
      if (e && e.detail && typeof e.detail.show === 'boolean') {
        // when grid is shown we also enable snap-to-grid by default
        setShowGrid(e.detail.show);
        setSnapToGrid(e.detail.show);
        if (e.detail.size && typeof e.detail.size === 'number') {
          setGridSize(e.detail.size);
        }
      }
    };
    const handleSizeChange = (e) => {
      if (e && e.detail && typeof e.detail.size === 'number') {
        setGridSize(e.detail.size);
      }
    };
    window.addEventListener('toggleCanvasGrid', handleToggle);
    window.addEventListener('updateCanvasGridSize', handleSizeChange);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggleCanvasGrid', handleToggle);
      window.removeEventListener('updateCanvasGridSize', handleSizeChange);
    };
  }, [selectedElement]);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu.show && !e.target.closest('.context-menu')) {
        hideContextMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.show]);

  const renderChart = (element) => {
    const { chartType, data = [], color } = element;
    const fallbackColor = color || '#4F46E5';
    const chartWidth = Math.max(element.width || 320, 140);
    const chartHeight = Math.max(element.height || 240, 160);

    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a4a4a', fontSize: '12px' }}>
          No data for chart
        </div>
      );
    }

    if (chartType === 'bar') {
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
          style={{
            width: '100%',
            height: '100%',
            padding: `${verticalPadding / 2}px ${horizontalPadding / 2}px`,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111', textAlign: 'center', marginBottom: '8px' }}>Bar chart</div>
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

    if (chartType === 'pie') {
      const total = data.reduce((sum, item) => sum + (typeof item.value === 'number' ? item.value : 0), 0) || 1;
      let currentAngle = 0;
      const radius = Math.min(chartWidth, chartHeight) / 2 - 20;
      const centerX = chartWidth / 2;
      const centerY = chartHeight / 2;

      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', padding: '16px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>Pie chart</div>
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
                  stroke="#0f0f0f"
                  strokeWidth="1"
                  opacity="0.95"
                />
              );
            })}
          </svg>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', fontSize: '11px', color: '#333', maxWidth: '100%' }}>
            {data.map((item, index) => (
              <span key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color || fallbackColor }}></span>
                {item.label || `Slice ${index + 1}`}
              </span>
            ))}
          </div>
        </div>
      );
    }

    if (chartType === 'line') {
      const values = data.map(item => (typeof item.value === 'number' ? item.value : 0));
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      const range = maxValue - minValue || 1;

      const points = data.map((item, index) => {
        const value = typeof item.value === 'number' ? item.value : 0;
        const x = (index / Math.max(data.length - 1, 1)) * (chartWidth - 40) + 20;
        const normalized = Math.max(Math.min((value - minValue) / range, 1), 0);
        const rawY = (chartHeight - 72) - normalized * (chartHeight - 96);
        const y = Math.max(Math.min(rawY, chartHeight - 40), 12);
        return `${x},${y}`;
      }).join(' ');

      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111', textAlign: 'center' }}>Line chart</div>
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
              const normalized = Math.max(Math.min((value - minValue) / range, 1), 0);
              const rawY = (chartHeight - 72) - normalized * (chartHeight - 96);
              const y = Math.max(Math.min(rawY, chartHeight - 40), 12);

              return (
                <g key={index}>
                  <circle cx={x} cy={y} r="5" fill="#ffffff" stroke={item.color || fallbackColor} strokeWidth="2" />
                  <text x={x} y={chartHeight - 40 + 18} textAnchor="middle" fontSize="11" fill="#333">
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
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a4a4a', fontSize: '12px' }}>
        Chart preview unavailable
      </div>
    );
  };

  const renderElement = (element) => {
    const isSelected = selectedElement && selectedElement.id === element.id;
    
    const elementStyle = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      cursor: isDragging ? 'grabbing' : (isSelected ? 'move' : 'pointer'),
      userSelect: 'none'
    };

    if (element.type === 'text') {
      return (
        <div key={element.id} className={`canvas-element ${isDragging && isSelected ? 'dragging' : ''}`}>
          {isEditingText && isSelected ? (
            <textarea
              style={{
                ...elementStyle,
                fontSize: element.fontSize,
                fontFamily: element.fontFamily,
                color: element.color,
                backgroundColor: element.backgroundColor || 'transparent',
                fontWeight: element.fontWeight,
                fontStyle: element.fontStyle,
                textAlign: element.textAlign,
                textDecoration: element.textDecoration,
                border: '2px solid #1a73e8',
                outline: 'none',
                resize: 'none',
                padding: '8px',
                cursor: 'text',
                borderRadius: '4px',
                boxShadow: '0 0 8px rgba(26, 115, 232, 0.3)',
                boxSizing: 'border-box',
                minHeight: '30px'
              }}
              value={element.content || ''}
              onChange={(e) => handleTextChange(e, element)}
              onBlur={handleTextBlur}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  handleTextBlur();
                }
                e.stopPropagation();
              }}
              autoFocus
              placeholder="Type your text here..."
            />
          ) : (
            <div
              style={{
                ...elementStyle,
                fontSize: element.fontSize,
                fontFamily: element.fontFamily,
                color: element.color,
                backgroundColor: element.backgroundColor || 'transparent',
                fontWeight: element.fontWeight,
                fontStyle: element.fontStyle,
                textAlign: element.textAlign,
                textDecoration: element.textDecoration,
                padding: '8px',
                border: isSelected ? '2px solid #1a73e8' : '2px solid transparent',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflow: 'auto',
                cursor: isSelected && !isEditingText ? 'move' : 'pointer',
                borderRadius: '4px',
                minHeight: '30px',
                boxSizing: 'border-box'
              }}
              onClick={(e) => handleElementClick(e, element)}
              onDoubleClick={(e) => handleElementDoubleClick(e, element)}
              onMouseDown={(e) => !isEditingText && handleMouseDown(e, element)}
            >
              {element.content || 'Click to edit text'}
            </div>
          )}
          {isSelected && !isEditingText && (
            <div className="resize-handles">
              <div 
                className="resize-handle nw" 
                onMouseDown={(e) => handleMouseDown(e, element, 'nw')}
              />
              <div 
                className="resize-handle ne" 
                onMouseDown={(e) => handleMouseDown(e, element, 'ne')}
              />
              <div 
                className="resize-handle sw" 
                onMouseDown={(e) => handleMouseDown(e, element, 'sw')}
              />
              <div 
                className="resize-handle se" 
                onMouseDown={(e) => handleMouseDown(e, element, 'se')}
              />
            </div>
          )}
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
        <div key={element.id} className={`canvas-element ${isDragging && isSelected ? 'dragging' : ''}`}>
          <div
            style={{
              position: 'absolute',
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              border: isSelected ? '2px solid #1a73e8' : '2px solid transparent',
              cursor: isDragging ? 'grabbing' : (isSelected ? 'move' : 'pointer'),
              borderRadius: element.shapeType === 'rectangle' ? cornerRadius : 0,
              boxShadow: shadowStyle,
              transition: 'box-shadow 0.2s ease',
              background: 'transparent'
            }}
            onClick={(e) => handleElementClick(e, element)}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
              {shapeSvg}
            </div>
          </div>
          {isSelected && (
            <div className="resize-handles">
              <div 
                className="resize-handle nw" 
                onMouseDown={(e) => handleMouseDown(e, element, 'nw')}
              />
              <div 
                className="resize-handle ne" 
                onMouseDown={(e) => handleMouseDown(e, element, 'ne')}
              />
              <div 
                className="resize-handle sw" 
                onMouseDown={(e) => handleMouseDown(e, element, 'sw')}
              />
              <div 
                className="resize-handle se" 
                onMouseDown={(e) => handleMouseDown(e, element, 'se')}
              />
            </div>
          )}
        </div>
      );
    }

    if (element.type === 'image') {
      return (
        <div key={element.id} className={`canvas-element ${isDragging && isSelected ? 'dragging' : ''}`}>
          <img
            src={element.src}
            alt=""
            style={{
              ...elementStyle,
              objectFit: 'cover',
              border: isSelected ? '2px solid #1a73e8' : '2px solid transparent'
            }}
            onClick={(e) => handleElementClick(e, element)}
            onMouseDown={(e) => handleMouseDown(e, element)}
            draggable={false}
          />
          {isSelected && (
            <div className="resize-handles">
              <div 
                className="resize-handle nw" 
                onMouseDown={(e) => handleMouseDown(e, element, 'nw')}
              />
              <div 
                className="resize-handle ne" 
                onMouseDown={(e) => handleMouseDown(e, element, 'ne')}
              />
              <div 
                className="resize-handle sw" 
                onMouseDown={(e) => handleMouseDown(e, element, 'sw')}
              />
              <div 
                className="resize-handle se" 
                onMouseDown={(e) => handleMouseDown(e, element, 'se')}
              />
            </div>
          )}
        </div>
      );
    }

    if (element.type === 'chart') {
      return (
        <div key={element.id} className={`canvas-element ${isDragging && isSelected ? 'dragging' : ''}`}>
          <div
            style={{
              ...elementStyle,
              border: isSelected ? '2px solid #1a73e8' : '2px solid transparent',
              cursor: isDragging ? 'grabbing' : (isSelected ? 'move' : 'pointer'),
              borderRadius: '8px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '16px'
            }}
            onClick={(e) => handleElementClick(e, element)}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            {renderChart(element)}
          </div>
          {isSelected && (
            <div className="resize-handles">
              <div 
                className="resize-handle nw" 
                onMouseDown={(e) => handleMouseDown(e, element, 'nw')}
              />
              <div 
                className="resize-handle ne" 
                onMouseDown={(e) => handleMouseDown(e, element, 'ne')}
              />
              <div 
                className="resize-handle sw" 
                onMouseDown={(e) => handleMouseDown(e, element, 'sw')}
              />
              <div 
                className="resize-handle se" 
                onMouseDown={(e) => handleMouseDown(e, element, 'se')}
              />
            </div>
          )}
        </div>
      );
    }

    if (element.type === 'video') {
      return (
        <div key={element.id} className={`canvas-element ${isDragging && isSelected ? 'dragging' : ''}`}>
          <video
            src={element.src}
            controls
            style={{
              ...elementStyle,
              objectFit: 'cover',
              border: isSelected ? '2px solid #1a73e8' : '2px solid transparent',
              borderRadius: '4px',
              backgroundColor: '#000'
            }}
            onClick={(e) => handleElementClick(e, element)}
            onMouseDown={(e) => handleMouseDown(e, element)}
          />
          {isSelected && (
            <div className="resize-handles">
              <div 
                className="resize-handle nw" 
                onMouseDown={(e) => handleMouseDown(e, element, 'nw')}
              />
              <div 
                className="resize-handle ne" 
                onMouseDown={(e) => handleMouseDown(e, element, 'ne')}
              />
              <div 
                className="resize-handle sw" 
                onMouseDown={(e) => handleMouseDown(e, element, 'sw')}
              />
              <div 
                className="resize-handle se" 
                onMouseDown={(e) => handleMouseDown(e, element, 'se')}
              />
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const zoomScale = zoomLevel / 100;

  return (
    <div className="canvas-container">
      {showRulers && (
        <>
          <div className="ruler-corner">
            <button 
              className="ruler-close-btn" 
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleRulers) {
                  onToggleRulers();
                }
              }}
              title="Hide Rulers (Click to remove)"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="ruler-horizontal">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="ruler-mark" style={{ left: `${i * 48}px` }}>
                <span className="ruler-label">{i * 48}px</span>
              </div>
            ))}
          </div>
          <div className="ruler-vertical">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="ruler-mark" style={{ top: `${i * 45}px` }}>
                <span className="ruler-label">{i * 45}px</span>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="canvas-wrapper" style={{ transform: `scale(${zoomScale})`, transformOrigin: 'top center', marginLeft: showRulers ? '30px' : '0', marginTop: showRulers ? '30px' : '20px' }}>
        <div
          ref={canvasRef}
          className={`canvas ${isDragOver ? 'drag-over' : ''}`}
          style={{ 
            backgroundColor: slide.background,
            backgroundImage: slide.backgroundImage
              ? `url(${slide.backgroundImage})`
              : (slide.backgroundGradient || 'none'),
            backgroundSize: slide.backgroundImage ? 'cover' : 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: slide.backgroundImage ? 'no-repeat' : 'no-repeat'
          }}
          onClick={handleCanvasClick}
          onContextMenu={handleContextMenu}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {slide.elements.map(renderElement)}
          {isDragOver && (
            <div className="drag-overlay">
              <div className="drag-message">
                <i className="fas fa-cloud-upload-alt"></i>
                <p>Drop images, videos, or text files here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 1000,
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            minWidth: '150px',
            padding: '4px 0'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedElement ? (
            <>
              <button
                className="context-menu-item"
                onClick={handleCopy}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <i className="fas fa-copy" style={{ marginRight: '8px' }}></i>
                Copy
              </button>
              <button
                className="context-menu-item"
                onClick={handleCut}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <i className="fas fa-cut" style={{ marginRight: '8px' }}></i>
                Cut
              </button>
              <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #eee' }} />
              <button
                className="context-menu-item"
                onClick={handleDelete}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#d32f2f'
                }}
              >
                <i className="fas fa-trash" style={{ marginRight: '8px' }}></i>
                Delete
              </button>
            </>
          ) : (
            clipboardElement && (
              <button
                className="context-menu-item"
                onClick={handlePaste}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <i className="fas fa-paste" style={{ marginRight: '8px' }}></i>
                Paste
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Canvas;
