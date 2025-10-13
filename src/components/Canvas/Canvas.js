import React, { useState, useRef, useCallback } from 'react';
import './Canvas.css';

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;
const MIN_ELEMENT_WIDTH = 50;
const MIN_ELEMENT_HEIGHT = 30;

const Canvas = ({ 
  slide, 
  onUpdateSlide, 
  selectedElement, 
  onSelectElement, 
  onUpdateElement, 
  onDeleteElement,
  onAddElement,
  onCopyElement,
  onCutElement,
  onPasteElement,
  onDuplicateElement,
  onReorderElement,
  clipboard,
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
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, absolutePosition: null });
  const [clipboardElement, setClipboardElement] = useState(null);
  const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
  const [pastePosition, setPastePosition] = useState(null);
  const canvasRef = useRef(null);

  const activeSlide = slide || { background: '#ffffff', elements: [] };
  const elements = Array.isArray(activeSlide.elements) ? activeSlide.elements : [];

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
      setIsEditingText(false);
      setContextMenu({ show: false, x: 0, y: 0, absolutePosition: null });
      setHoveredMenuItem(null);
      setPastePosition(null);
    }
  };

  // Context menu handlers
  const handleContextMenu = (e) => {
    if (!canvasRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = canvasRef.current.getBoundingClientRect();
    const scale = zoomLevel / 100 || 1;
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const absolutePosition = {
      x: Math.round(localX / scale),
      y: Math.round(localY / scale)
    };

    const elementAtPoint = elements.find((el) => {
      return (
        absolutePosition.x >= el.x &&
        absolutePosition.x <= el.x + el.width &&
        absolutePosition.y >= el.y &&
        absolutePosition.y <= el.y + el.height
      );
    });

    if (elementAtPoint) {
      onSelectElement(elementAtPoint);
      setPastePosition(null);
    } else {
      onSelectElement(null);
      setPastePosition(absolutePosition);
    }

    const menuHeight = 240;
    const viewportHeight = window.innerHeight;
    const clampedY = Math.min(e.clientY, Math.max(0, viewportHeight - menuHeight));

    setHoveredMenuItem(null);
    setContextMenu({ show: true, x: e.clientX, y: clampedY, absolutePosition });
  };

  const hideContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, absolutePosition: null });
    setHoveredMenuItem(null);
    setPastePosition(null);
  };

  const handleCopy = () => {
    if (selectedElement) {
      const cloned = JSON.parse(JSON.stringify(selectedElement));
      setClipboardElement(cloned);
      if (onCopyElement) {
        onCopyElement(selectedElement);
      }
    }
    hideContextMenu();
  };

  const handleCut = () => {
    if (selectedElement) {
      const cloned = JSON.parse(JSON.stringify(selectedElement));
      setClipboardElement(cloned);
      if (onCutElement) {
        onCutElement(selectedElement);
      } else {
        onDeleteElement(selectedElement.id);
      }
    }
    hideContextMenu();
  };

  const handlePaste = () => {
    const source = clipboardElement || clipboard;
    if (!source) {
      hideContextMenu();
      return;
    }

    const canvasWidth = CANVAS_WIDTH;
    const canvasHeight = CANVAS_HEIGHT;
    const basePosition = pastePosition || contextMenu.absolutePosition || {};
    const cloned = JSON.parse(JSON.stringify(source));
    const width = Number.isFinite(cloned.width) ? cloned.width : 200;
    const height = Number.isFinite(cloned.height) ? cloned.height : 120;
    const baseX = typeof basePosition.x === 'number' ? basePosition.x : (typeof cloned.x === 'number' ? cloned.x + 20 : 120);
    const baseY = typeof basePosition.y === 'number' ? basePosition.y : (typeof cloned.y === 'number' ? cloned.y + 20 : 120);
    const nextElement = {
      ...cloned,
      id: Date.now().toString(),
      width,
      height,
      x: Math.max(0, Math.min(canvasWidth - width, baseX)),
      y: Math.max(0, Math.min(canvasHeight - height, baseY))
    };

    if (onPasteElement) {
      onPasteElement({ ...basePosition });
    } else if (onAddElement) {
      onAddElement(nextElement);
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
      const canvasWidth = CANVAS_WIDTH;
      const canvasHeight = CANVAS_HEIGHT;
      
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
      const canvasWidth = CANVAS_WIDTH;
      const canvasHeight = CANVAS_HEIGHT;
      
      switch (resizeHandle) {
        case 'se':
          updates = {
            width: Math.max(MIN_ELEMENT_WIDTH, Math.min(canvasWidth - selectedElement.x, selectedElement.width + deltaX)),
            height: Math.max(MIN_ELEMENT_HEIGHT, Math.min(canvasHeight - selectedElement.y, selectedElement.height + deltaY))
          };
          if (snapToGrid && !isShiftDown) {
            updates.width = Math.max(MIN_ELEMENT_WIDTH, Math.round(updates.width / gridSize) * gridSize);
            updates.height = Math.max(MIN_ELEMENT_HEIGHT, Math.round(updates.height / gridSize) * gridSize);
          }
          break;
        case 'sw':
          const newWidth = Math.max(MIN_ELEMENT_WIDTH, selectedElement.width - deltaX);
          const newX = Math.max(0, selectedElement.x + selectedElement.width - newWidth);
          updates = {
            x: newX,
            width: newWidth,
            height: Math.max(MIN_ELEMENT_HEIGHT, Math.min(canvasHeight - selectedElement.y, selectedElement.height + deltaY))
          };
          if (snapToGrid && !isShiftDown) {
            updates.width = Math.max(MIN_ELEMENT_WIDTH, Math.round(updates.width / gridSize) * gridSize);
            updates.x = Math.max(0, Math.round(updates.x / gridSize) * gridSize);
          }
          break;
        case 'ne':
          const newHeight = Math.max(MIN_ELEMENT_HEIGHT, selectedElement.height - deltaY);
          const newY = Math.max(0, selectedElement.y + selectedElement.height - newHeight);
          updates = {
            y: newY,
            width: Math.max(MIN_ELEMENT_WIDTH, Math.min(canvasWidth - selectedElement.x, selectedElement.width + deltaX)),
            height: newHeight
          };
          if (snapToGrid && !isShiftDown) {
            updates.height = Math.max(MIN_ELEMENT_HEIGHT, Math.round(updates.height / gridSize) * gridSize);
            updates.y = Math.max(0, Math.round(updates.y / gridSize) * gridSize);
          }
          break;
        case 'nw':
          const newWidthNW = Math.max(MIN_ELEMENT_WIDTH, selectedElement.width - deltaX);
          const newHeightNW = Math.max(MIN_ELEMENT_HEIGHT, selectedElement.height - deltaY);
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
            updates.width = Math.max(MIN_ELEMENT_WIDTH, Math.round(updates.width / gridSize) * gridSize);
            updates.height = Math.max(MIN_ELEMENT_HEIGHT, Math.round(updates.height / gridSize) * gridSize);
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

  const bulletForStyle = (styleName, index) => {
    switch (styleName) {
      case 'circle':
        return '◦';
      case 'square':
        return '▪';
      case 'decimal':
        return `${index + 1}.`;
      case 'disc':
      default:
        return '•';
    }
  };

  const getBulletPrefix = (line, style) => {
    if (style === 'decimal') {
      const match = line.match(/^\d+\.\s*/);
      return match ? match[0] : null;
    }
    if (['disc', 'circle', 'square'].includes(style)) {
      const match = line.match(/^[•◦▪]\s*/);
      return match ? match[0] : null;
    }
    return null;
  };

  const applyBulletContinuation = (rawValue, listType) => {
    const style = listType || '';
    if (!style) return rawValue;

    const lines = rawValue.split('\n');
    let bulletIndex = 0;

    const processed = lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        if (idx === lines.length - 1) {
          const bullet = bulletForStyle(style, bulletIndex++);
          return `${bullet} `;
        }
        return '';
      }

      const bullet = bulletForStyle(style, bulletIndex++);

      if (style === 'decimal') {
        const text = trimmed.replace(/^\d+\.\s*/, '').trim();
        return text ? `${bullet} ${text}`.trimEnd() : `${bullet} `;
      }

      if (['disc', 'circle', 'square'].includes(style)) {
        const text = trimmed.replace(/^[•◦▪]\s*/, '').trim();
        return text ? `${bullet} ${text}`.trimEnd() : `${bullet} `;
      }

      return line;
    });

    return processed.join('\n');
  };

  const handleTextChange = (e, element) => {
    const rawValue = e.target.value;
    const content = applyBulletContinuation(rawValue, element.listType);
    onUpdateElement(element.id, { content });
  };

  const handleTextKeyDown = (e, element) => {
    if (!element.listType) return;

    const textarea = e.target;
    const { selectionStart, selectionEnd, value } = textarea;
    const style = element.listType;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      const before = value.slice(0, selectionStart);
      const after = value.slice(selectionEnd);

      const linesBefore = before.split('\n');
      let bulletCount = 0;
      linesBefore.forEach((line) => {
        if (!line.trim()) return;
        bulletCount += 1;
      });

      const bullet = bulletForStyle(style, bulletCount);
      const insertion = `\n${bullet} `;
      const newValue = before + insertion + after;
      const content = applyBulletContinuation(newValue, style);
      onUpdateElement(element.id, { content });

      requestAnimationFrame(() => {
        const pos = before.length + insertion.length;
        textarea.selectionStart = textarea.selectionEnd = pos;
      });
      return;
    }

    if (e.key === 'Backspace' && selectionStart === selectionEnd) {
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const currentLine = value.slice(lineStart);
      const prefix = getBulletPrefix(currentLine, style);

      if (prefix && selectionStart <= lineStart + prefix.length) {
        e.preventDefault();

        const before = value.slice(0, lineStart);
        const after = value.slice(selectionEnd);
        const trimmedBefore = lineStart > 0 && before.endsWith('\n') ? before.slice(0, -1) : before;
        const newValue = trimmedBefore + after;
        const content = applyBulletContinuation(newValue, style);
        onUpdateElement(element.id, { content });

        requestAnimationFrame(() => {
          const pos = trimmedBefore.length;
          textarea.selectionStart = textarea.selectionEnd = pos;
        });
      }
    }
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
                handleTextKeyDown(e, element);
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                  if (e.shiftKey) {
                    if (typeof window.onRedoAction === 'function') {
                      window.onRedoAction();
                    }
                  } else {
                    if (typeof window.onUndoAction === 'function') {
                      window.onUndoAction();
                    }
                  }
                }
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
            zIndex: 1200,
            background: 'linear-gradient(165deg, rgba(12,38,76,0.96) 0%, rgba(22,56,108,0.97) 60%, rgba(10,28,58,0.96) 100%)',
            borderRadius: '16px',
            border: '1px solid rgba(88, 164, 255, 0.35)',
            boxShadow: '0 36px 60px rgba(8, 22, 44, 0.66), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
            minWidth: '220px',
            padding: '10px 0',
            backdropFilter: 'blur(18px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {selectedElement ? (
            <>
              <div className="context-menu-header">
                <div className="context-menu-title">
                  <i className={selectedElement.type === 'text' ? 'fas fa-font' : selectedElement.type === 'image' ? 'fas fa-image' : selectedElement.type === 'video' ? 'fas fa-video' : selectedElement.type === 'chart' ? 'fas fa-chart-pie' : 'fas fa-shapes'}></i>
                  <span>{selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} options</span>
                </div>
                <span className="context-menu-position">x: {Math.round(selectedElement.x)}, y: {Math.round(selectedElement.y)}</span>
              </div>

              <button
                className={`context-menu-item ${hoveredMenuItem === 'cut' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredMenuItem('cut')}
                onMouseLeave={() => setHoveredMenuItem(null)}
                onClick={handleCut}
              >
                <i className="fas fa-cut"></i>
                <div className="label">Cut</div>
                <span className="shortcut">Ctrl+X</span>
              </button>
              <button
                className={`context-menu-item ${hoveredMenuItem === 'copy' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredMenuItem('copy')}
                onMouseLeave={() => setHoveredMenuItem(null)}
                onClick={handleCopy}
              >
                <i className="fas fa-copy"></i>
                <div className="label">Copy</div>
                <span className="shortcut">Ctrl+C</span>
              </button>
              <button
                className={`context-menu-item ${hoveredMenuItem === 'paste' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredMenuItem('paste')}
                onMouseLeave={() => setHoveredMenuItem(null)}
                onClick={handlePaste}
                disabled={!clipboardElement && !clipboard}
              >
                <i className="fas fa-paste"></i>
                <div className="label">Paste</div>
                <span className="shortcut">Ctrl+V</span>
              </button>
            </>
          ) : (
            <>
              <div className="context-menu-header">
                <div className="context-menu-title">
                  <i className="fas fa-mouse-pointer"></i>
                  <span>Canvas options</span>
                </div>
                {contextMenu.absolutePosition && (
                  <span className="context-menu-position">x: {Math.round(contextMenu.absolutePosition.x)}, y: {Math.round(contextMenu.absolutePosition.y)}</span>
                )}
              </div>
              <button
                className={`context-menu-item ${hoveredMenuItem === 'paste-only' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredMenuItem('paste-only')}
                onMouseLeave={() => setHoveredMenuItem(null)}
                onClick={handlePaste}
                disabled={!clipboardElement && !clipboard}
              >
                <i className="fas fa-paste"></i>
                <div className="label">Paste</div>
                <span className="shortcut">Ctrl+V</span>
              </button>
              <button
                className={`context-menu-item ${hoveredMenuItem === 'copy-only' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredMenuItem('copy-only')}
                onMouseLeave={() => setHoveredMenuItem(null)}
                onClick={handleCopy}
                disabled={!!selectedElement}
              >
                <i className="fas fa-copy"></i>
                <div className="label">Copy</div>
                <span className="shortcut">Ctrl+C</span>
              </button>
              <button
                className={`context-menu-item ${hoveredMenuItem === 'cut-only' ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredMenuItem('cut-only')}
                onMouseLeave={() => setHoveredMenuItem(null)}
                onClick={handleCut}
                disabled={!!selectedElement}
              >
                <i className="fas fa-cut"></i>
                <div className="label">Cut</div>
                <span className="shortcut">Ctrl+X</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Canvas;
