import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group } from 'react-konva';
import { Transformer } from 'react-konva';
import './Canvas.css';

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

const KonvaCanvas = ({
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
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, absolutePosition: null });
  const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
  const [pastePosition, setPastePosition] = useState(null);
  const [elements, setElements] = useState([]);
  const [images, setImages] = useState({});
  
  // Update elements when slide changes
  useEffect(() => {
    if (slide?.elements) {
      setElements([...slide.elements]);
    }
  }, [slide]);

  // Update transformer when selected element changes
  useEffect(() => {
    if (transformerRef.current && selectedElement) {
      const selectedNode = stageRef.current.findOne(`#${selectedElement.id}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedElement]);

  // Load images
  const loadImage = (src) => {
    if (!src) return null;
    
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  };

  // Handle element selection
  const handleElementSelect = (e, element) => {
    e.cancelBubble = true; // Prevent event from bubbling to stage
    onSelectElement(element);
  };

  // Handle element drag end
  const handleDragEnd = (e, element) => {
    const node = e.target;
    const updatedElement = {
      ...element,
      x: node.x(),
      y: node.y()
    };
    onUpdateElement(updatedElement);
  };

  // Handle element transform end
  const handleTransformEnd = (e, element) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale to avoid cumulative scaling
    node.scaleX(1);
    node.scaleY(1);
    
    const updatedElement = {
      ...element,
      x: node.x(),
      y: node.y(),
      width: Math.max(30, element.width * scaleX),
      height: Math.max(30, element.height * scaleY)
    };
    
    onUpdateElement(updatedElement);
  };

  // Render different types of elements
  const renderElement = (element) => {
    const commonProps = {
      id: element.id,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      draggable: true,
      onClick: (e) => handleElementSelect(e, element),
      onDragEnd: (e) => handleDragEnd(e, element),
      onTransformEnd: (e) => handleTransformEnd(e, element),
      onContextMenu: (e) => handleContextMenu(e, element),
    };

    switch (element.type) {
      case 'text':
        return (
          <Text
            {...commonProps}
            text={element.content || 'Double click to edit'}
            fontSize={element.fontSize || 16}
            fontFamily={element.fontFamily || 'Arial'}
            fill={element.color || '#000000'}
            align={element.textAlign || 'left'}
            verticalAlign={element.verticalAlign || 'top'}
            padding={8}
            onDblClick={() => {
              // Handle double click to edit text (implement as needed)
              console.log('Edit text:', element.id);
            }}
          />
        );
      
      case 'image':
        return (
          <KonvaImage
            {...commonProps}
            image={images[element.id]}
            onMouseDown={(e) => e.cancelBubble = true}
          />
        );
      
      case 'shape':
        return (
          <Rect
            {...commonProps}
            fill={element.fill || '#3498db'}
            stroke={element.stroke || '#2980b9'}
            strokeWidth={element.strokeWidth || 1}
            cornerRadius={element.cornerRadius || 0}
          />
        );
      
      case 'chart':
        return (
          <Group {...commonProps}>
            <Rect
              width={element.width}
              height={element.height}
              fill="#ffffff"
              stroke="#e0e0e0"
              strokeWidth={1}
            />
            <Text
              text="Chart"
              x={10}
              y={10}
              fontSize={14}
              fill="#666666"
            />
            {/* Add chart rendering logic here */}
          </Group>
        );
      
      default:
        return null;
    }
  };

  // Handle context menu
  const handleContextMenu = (e, element) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition();
    
    setPastePosition(null);
    setContextMenu({
      show: true,
      x: pointerPosition.x,
      y: pointerPosition.y,
      absolutePosition: pointerPosition
    });
    
    if (element) {
      onSelectElement(element);
    } else {
      onSelectElement(null);
      setPastePosition(pointerPosition);
    }
  };

  // Handle stage click (deselect)
  const handleStageClick = (e) => {
    if (e.target === e.target.getStage()) {
      onSelectElement(null);
      setContextMenu({ show: false, x: 0, y: 0, absolutePosition: null });
      setHoveredMenuItem(null);
      setPastePosition(null);
    }
  };

  // Handle key events
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Delete' && selectedElement) {
      onDeleteElement(selectedElement.id);
      onSelectElement(null);
    } else if (e.key === 'Escape') {
      onSelectElement(null);
    }
  }, [selectedElement, onDeleteElement, onSelectElement]);

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Load images when elements change
  useEffect(() => {
    const loadImages = async () => {
      const imageElements = elements.filter(el => el.type === 'image' && el.src);
      const newImages = {};
      
      for (const el of imageElements) {
        if (!images[el.id] && el.src) {
          try {
            const img = await loadImage(el.src);
            newImages[el.id] = img;
          } catch (err) {
            console.error('Failed to load image:', err);
          }
        }
      }
      
      if (Object.keys(newImages).length > 0) {
        setImages(prev => ({ ...prev, ...newImages }));
      }
    };
    
    loadImages();
  }, [elements]);

  const scale = zoomLevel / 100;
  
  return (
    <div 
      className="canvas-container"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Stage
        ref={stageRef}
        width={CANVAS_WIDTH * scale}
        height={CANVAS_HEIGHT * scale}
        onClick={handleStageClick}
        onContextMenu={(e) => handleContextMenu(e, null)}
        scaleX={scale}
        scaleY={scale}
        style={{
          backgroundColor: slide?.background || '#ffffff',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <Layer>
          {elements.map((element) => (
            <React.Fragment key={element.id}>
              {renderElement(element)}
            </React.Fragment>
          ))}
          
          {selectedElement && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Limit minimum size
                newBox.width = Math.max(30, newBox.width);
                newBox.height = Math.max(30, newBox.height);
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
      
      {/* Context Menu */}
      {contextMenu.show && (
        <div 
          className="context-menu" 
          style={{
            position: 'fixed',
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 1000,
            minWidth: '180px',
          }}
          onMouseLeave={() => setHoveredMenuItem(null)}
        >
          {selectedElement ? (
            <>
              <div 
                className="menu-item"
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: hoveredMenuItem === 'copy' ? '#f0f0f0' : 'transparent',
                }}
                onMouseEnter={() => setHoveredMenuItem('copy')}
                onClick={() => {
                  onCopyElement(selectedElement);
                  setContextMenu({ show: false, x: 0, y: 0, absolutePosition: null });
                }}
              >
                Copy
              </div>
              <div 
                className="menu-item"
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: hoveredMenuItem === 'cut' ? '#f0f0f0' : 'transparent',
                }}
                onMouseEnter={() => setHoveredMenuItem('cut')}
                onClick={() => {
                  onCutElement(selectedElement);
                  setContextMenu({ show: false, x: 0, y: 0, absolutePosition: null });
                }}
              >
                Cut
              </div>
              <div 
                className="menu-item"
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: hoveredMenuItem === 'duplicate' ? '#f0f0f0' : 'transparent',
                }}
                onMouseEnter={() => setHoveredMenuItem('duplicate')}
                onClick={() => {
                  onDuplicateElement(selectedElement);
                  setContextMenu({ show: false, x: 0, y: 0, absolutePosition: null });
                }}
              >
                Duplicate
              </div>
              <div 
                className="menu-item"
                style={{
                  padding: '8px 12px',
                  color: '#e74c3c',
                  cursor: 'pointer',
                  backgroundColor: hoveredMenuItem === 'delete' ? '#f0f0f0' : 'transparent',
                }}
                onMouseEnter={() => setHoveredMenuItem('delete')}
                onClick={() => {
                  onDeleteElement(selectedElement.id);
                  setContextMenu({ show: false, x: 0, y: 0, absolutePosition: null });
                }}
              >
                Delete
              </div>
            </>
          ) : (
            <>
             <div 
  className="menu-item"
  style={{
    padding: '8px 12px',
    cursor: 'pointer',
    backgroundColor: hoveredMenuItem === 'paste' ? '#f0f0f0' : 'transparent',
    opacity: clipboard ? 1 : 0.5
  }}
  onMouseEnter={() => setHoveredMenuItem('paste')}
  onClick={() => {
    if (clipboard) {
      onPasteElement(contextMenu.absolutePosition);
    }
    setContextMenu({ show: false, x: 0, y: 0, absolutePosition: null });
  }}
  disabled={!clipboard}
>
  Paste
</div>
              <div 
                className="menu-item"
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: hoveredMenuItem === 'add_text' ? '#f0f0f0' : 'transparent',
                }}
                onMouseEnter={() => setHoveredMenuItem('add_text')}
                onClick={() => {
                  onAddElement({
                    type: 'text',
                    x: contextMenu.absolutePosition.x,
                    y: contextMenu.absolutePosition.y,
                    width: 200,
                    height: 50,
                    content: 'New Text',
                    fontSize: 16,
                    fontFamily: 'Arial',
                    color: '#000000',
                    textAlign: 'left',
                    verticalAlign: 'top',
                  });
                  setContextMenu({ show: false, x: 0, y: 0, absolutePosition: null });
                }}
              >
                Add Text
              </div>
              <div 
                className="menu-item"
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  backgroundColor: hoveredMenuItem === 'add_shape' ? '#f0f0f0' : 'transparent',
                }}
                onMouseEnter={() => setHoveredMenuItem('add_shape')}
                onClick={() => {
                  onAddElement({
                    type: 'shape',
                    x: contextMenu.absolutePosition.x,
                    y: contextMenu.absolutePosition.y,
                    width: 100,
                    height: 100,
                    fill: '#3498db',
                    stroke: '#2980b9',
                    strokeWidth: 1,
                    cornerRadius: 0,
                  });
                  setContextMenu({ show: false, x: 0, y: 0, absolutePosition: null });
                }}
              >
                Add Shape
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default KonvaCanvas;
