import React, { useState, useRef, useCallback } from "react";
import ChartFrame from "../ChartFrame/ChartFrame";
import ShapeRenderer from "../ShapeRenderer/ShapeRenderer";
import "./Canvas.css";

const CANVAS_WIDTH = 960;  // Standard canvas width matching App.js
const CANVAS_HEIGHT = 540; // Standard canvas height matching App.js (16:9 aspect ratio)
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
  onToggleRulers,
}) => {
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [gridSize, setGridSize] = useState(24);
  // track Shift key to temporarily disable snapping
  const [isShiftDown, setIsShiftDown] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    absolutePosition: null,
  });
  const [clipboardElement, setClipboardElement] = useState(null);
  const [hoveredMenuItem, setHoveredMenuItem] = useState(null);
  const [pastePosition, setPastePosition] = useState(null);
  const canvasRef = useRef(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationStart, setRotationStart] = useState({ angle: 0, x: 0, y: 0 });
  const editorRefs = useRef(new Map());
  const ENABLE_PEER_GUIDES = false;
  const activeSlide = slide || { background: "#ffffff", elements: [] };
  const elements = Array.isArray(activeSlide.elements)
    ? activeSlide.elements
    : [];
  const [guides, setGuides] = useState({ v: null, h: null }); // { v: x | null, h: y | null }
  const SNAP_TOLERANCE = 6; // px tolerance for guide snapping

  const getLocalPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = (zoomLevel || 100) / 100;
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  const startTextEdit = (el) => {
    setIsEditingText(true);
    setEditingId(el.id);
    // focus after render
    requestAnimationFrame(() => {
      const node = editorRefs.current.get(el.id);
      if (node) {
        // place caret at end
        const range = document.createRange();
        range.selectNodeContents(node);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        node.focus();
      }
    });
  };

  const stopTextEdit = () => {
    setIsEditingText(false);
    setEditingId(null);
  };

  const handleCanvasBackgroundMouseDown = (e) => {
    if (isEditingText) return; // don't kill selection while typing
    onSelectElement(null);
  };

  React.useEffect(() => {
    const down = (e) => {
      if (e.key === "Shift") setIsShiftDown(true);
    };
    const up = (e) => {
      if (e.key === "Shift") setIsShiftDown(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

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
      y: Math.round(localY / scale),
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

    const menuHeight = 400; // Estimated max menu height
    const menuWidth = 280; // Estimated menu width
    
    // Get canvas bounds to constrain menu within canvas area
    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const canvasRight = canvasBounds.right;
    const canvasBottom = canvasBounds.bottom;
    const canvasLeft = canvasBounds.left;
    const canvasTop = canvasBounds.top;
    
    // Position menu at cursor with minimal offset
    let menuX = e.clientX + 2; // Small offset to avoid cursor overlap
    let menuY = e.clientY + 2;
    
    // If menu would go off right edge of canvas, position it to the left of cursor
    if (menuX + menuWidth > canvasRight) {
      menuX = e.clientX - menuWidth - 2;
      // If still off-screen to the left, clamp to canvas left edge
      if (menuX < canvasLeft) {
        menuX = canvasLeft + 10;
      }
    }
    
    // If menu would go off bottom edge of canvas, position it above cursor
    if (menuY + menuHeight > canvasBottom) {
      menuY = e.clientY - menuHeight - 2;
      // If still off-screen to the top, clamp to canvas top edge
      if (menuY < canvasTop) {
        menuY = canvasTop + 10;
      }
    }
    
    // Ensure menu stays within canvas bounds
    menuX = Math.max(canvasLeft + 10, Math.min(menuX, canvasRight - menuWidth - 10));
    menuY = Math.max(canvasTop + 10, Math.min(menuY, canvasBottom - menuHeight - 10));

    setHoveredMenuItem(null);
    setContextMenu({ show: true, x: menuX, y: menuY, absolutePosition });
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
    const baseX =
      typeof basePosition.x === "number"
        ? basePosition.x
        : typeof cloned.x === "number"
        ? cloned.x + 20
        : 120;
    const baseY =
      typeof basePosition.y === "number"
        ? basePosition.y
        : typeof cloned.y === "number"
        ? cloned.y + 20
        : 120;
    const nextElement = {
      ...cloned,
      id: Date.now().toString(),
      width,
      height,
      x: Math.max(0, Math.min(canvasWidth - width, baseX)),
      y: Math.max(0, Math.min(canvasHeight - height, baseY)),
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
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left - 100; // Center on drop point
          const y = e.clientY - rect.top - 75;

          if (onAddElement) {
            onAddElement({
              type: "image",
              src: event.target.result,
              x: Math.max(0, x),
              y: Math.max(0, y),
              width: 200,
              height: 150,
              rotation: 0,
            });
          }
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left - 200;
          const y = e.clientY - rect.top - 150;

          if (onAddElement) {
            onAddElement({
              type: "video",
              src: event.target.result,
              x: Math.max(0, x),
              y: Math.max(0, y),
              width: 400,
              height: 300,
              rotation: 0,
            });
          }
        };
        reader.readAsDataURL(file);
      } else if (file.type === "text/plain") {
        // Handle text files
        const reader = new FileReader();
        reader.onload = (event) => {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left - 100;
          const y = e.clientY - rect.top - 50;

          if (onAddElement) {
            onAddElement({
              type: "text",
              content: event.target.result.substring(0, 200), // Limit text length
              x: Math.max(0, x),
              y: Math.max(0, y),
              width: 200,
              height: 100,
              fontSize: 16,
              fontFamily: "Roboto",
              color: "#000000",
              backgroundColor: "transparent",
              textAlign: "left",
              fontWeight: "normal",
              fontStyle: "normal",
            });
          }
        };
        reader.readAsText(file);
      }
    }
  };

  const handleElementClick = (e, element) => {
    e.stopPropagation();
    // select first
    onSelectElement(element);
    // if already selected AND it's text -> enter edit
    if (selectedElement?.id === element.id && element.type === "text") {
      startTextEdit(element);
    }
  };

  const handleElementDoubleClick = (e, element) => {
    e.stopPropagation();
    if (element.type === "text" || element.type === "shape") {
      startTextEdit(element);
    }
  };

  const handleMouseDown = (e, element, handle = null) => {
    e.stopPropagation();
    e.preventDefault();

    if (handle === 'rotate') {
      setIsRotating(true);
      const rect = canvasRef.current.getBoundingClientRect();
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      setRotationStart({ 
        angle: element.rotation || 0, 
        x: e.clientX, 
        y: e.clientY,
        centerX,
        centerY
      });
    } else if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      setIsDragging(true);
    }
    const p = getLocalPoint(e);
    setDragStart({ x: p.x, y: p.y });

    onSelectElement(element);
  };

  const getElementEdges = (el) => ({
    left: el.x,
    right: el.x + el.width,
    top: el.y,
    bottom: el.y + el.height,
    cx: el.x + el.width / 2,
    cy: el.y + el.height / 2,
  });

  const snapToPeers = (moving, proposed) => {
    // moving: selectedElement, proposed: {x, y}
    const m = { ...moving, ...proposed }; // pretend it's moved already
    const mEdges = getElementEdges(m);

    let snapX = proposed.x;
    let snapY = proposed.y;
    let vGuide = null;
    let hGuide = null;

    elements
      .filter((el) => el.id !== moving.id)
      .forEach((peer) => {
        const p = getElementEdges(peer);

        // vertical align: left, center, right
        const candidatesX = [
          { val: p.left - (mEdges.left - proposed.x), guide: p.left }, // left to left
          { val: p.cx - (mEdges.cx - proposed.x), guide: p.cx }, // center to center
          { val: p.right - (mEdges.right - proposed.x), guide: p.right }, // right to right
        ];
        candidatesX.forEach((c) => {
          if (
            Math.abs(mEdges.left + (c.val - proposed.x) - p.left) <=
              SNAP_TOLERANCE ||
            Math.abs(mEdges.cx + (c.val - proposed.x) - p.cx) <=
              SNAP_TOLERANCE ||
            Math.abs(mEdges.right + (c.val - proposed.x) - p.right) <=
              SNAP_TOLERANCE
          ) {
            snapX = c.val;
            vGuide = c.guide; // draw vertical guide on peer
          }
        });

        // horizontal align: top, middle, bottom
        const candidatesY = [
          { val: p.top - (mEdges.top - proposed.y), guide: p.top }, // top to top
          { val: p.cy - (mEdges.cy - proposed.y), guide: p.cy }, // middle to middle
          { val: p.bottom - (mEdges.bottom - proposed.y), guide: p.bottom }, // bottom to bottom
        ];
        candidatesY.forEach((c) => {
          if (
            Math.abs(mEdges.top + (c.val - proposed.y) - p.top) <=
              SNAP_TOLERANCE ||
            Math.abs(mEdges.cy + (c.val - proposed.y) - p.cy) <=
              SNAP_TOLERANCE ||
            Math.abs(mEdges.bottom + (c.val - proposed.y) - p.bottom) <=
              SNAP_TOLERANCE
          ) {
            snapY = c.val;
            hGuide = c.guide; // draw horizontal guide on peer
          }
        });
      });

    return { x: snapX, y: snapY, vGuide, hGuide };
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!selectedElement || (!isDragging && !isResizing && !isRotating) || isEditingText)
        return;

      // Use requestAnimationFrame for smoother performance
      requestAnimationFrame(() => {
        // mouse in canvas coordinates (accounts for zoom)
        const p = getLocalPoint(e);
        const currentX = p.x;
        const currentY = p.y;

        if (isDragging) {
          const deltaX = currentX - dragStart.x;
          const deltaY = currentY - dragStart.y;

          const canvasWidth = CANVAS_WIDTH;
          const canvasHeight = CANVAS_HEIGHT;

        let newX = Math.max(
          0,
          Math.min(
            canvasWidth - selectedElement.width,
            selectedElement.x + deltaX
          )
        );
        let newY = Math.max(
          0,
          Math.min(
            canvasHeight - selectedElement.height,
            selectedElement.y + deltaY
          )
        );

        // position snapping to grid (optional)
        // optional grid snap (hold Shift to disable)
        const snap = (v) => Math.round(v / gridSize) * gridSize;
        if (snapToGrid && !isShiftDown) {
          newX = snap(newX);
          newY = snap(newY);
        }

        // (DISABLED) smart guides to peers unless you re-enable the flag
        if (ENABLE_PEER_GUIDES && !isShiftDown) {
          const snapped = snapToPeers(selectedElement, { x: newX, y: newY });
          newX = snapped.x;
          newY = snapped.y;
          setGuides({ v: snapped.vGuide, h: snapped.hGuide });
        } else {
          setGuides({ v: null, h: null });
        }

        // FINAL: clamp to slide so it never goes outside
        const clamped = clampMove(
          newX,
          newY,
          selectedElement.width,
          selectedElement.height
        );
        onUpdateElement(selectedElement.id, { x: clamped.x, y: clamped.y });

        // keep the “relative drag” feeling
        setDragStart({ x: currentX, y: currentY });
      }

      if (isResizing && resizeHandle) {
        const deltaX = currentX - dragStart.x;
        const deltaY = currentY - dragStart.y;

        const canvasWidth = CANVAS_WIDTH;
        const canvasHeight = CANVAS_HEIGHT;

        let updates = {};

        switch (resizeHandle) {
          case "se": {
            updates = {
              width: Math.max(
                MIN_ELEMENT_WIDTH,
                Math.min(
                  canvasWidth - selectedElement.x,
                  selectedElement.width + deltaX
                )
              ),
              height: Math.max(
                MIN_ELEMENT_HEIGHT,
                Math.min(
                  canvasHeight - selectedElement.y,
                  selectedElement.height + deltaY
                )
              ),
            };
            break;
          }
          case "sw": {
            const newWidth = Math.max(
              MIN_ELEMENT_WIDTH,
              selectedElement.width - deltaX
            );
            const newX = Math.max(
              0,
              selectedElement.x + selectedElement.width - newWidth
            );
            updates = {
              x: newX,
              width: newWidth,
              height: Math.max(
                MIN_ELEMENT_HEIGHT,
                Math.min(
                  canvasHeight - selectedElement.y,
                  selectedElement.height + deltaY
                )
              ),
            };
            break;
          }
          case "ne": {
            const newHeight = Math.max(
              MIN_ELEMENT_HEIGHT,
              selectedElement.height - deltaY
            );
            const newY = Math.max(
              0,
              selectedElement.y + selectedElement.height - newHeight
            );
            updates = {
              y: newY,
              width: Math.max(
                MIN_ELEMENT_WIDTH,
                Math.min(
                  canvasWidth - selectedElement.x,
                  selectedElement.width + deltaX
                )
              ),
              height: newHeight,
            };
            break;
          }
          case "nw": {
            const newWidthNW = Math.max(
              MIN_ELEMENT_WIDTH,
              selectedElement.width - deltaX
            );
            const newHeightNW = Math.max(
              MIN_ELEMENT_HEIGHT,
              selectedElement.height - deltaY
            );
            const newXNW = Math.max(
              0,
              selectedElement.x + selectedElement.width - newWidthNW
            );
            const newYNW = Math.max(
              0,
              selectedElement.y + selectedElement.height - newHeightNW
            );
            updates = {
              x: newXNW,
              y: newYNW,
              width: newWidthNW,
              height: newHeightNW,
            };
            break;
          }
          case "n": {
            const newHeightN = Math.max(
              MIN_ELEMENT_HEIGHT,
              selectedElement.height - deltaY
            );
            const newYN = Math.max(
              0,
              selectedElement.y + selectedElement.height - newHeightN
            );
            updates = { y: newYN, height: newHeightN };
            break;
          }
          case "s": {
            updates = {
              height: Math.max(
                MIN_ELEMENT_HEIGHT,
                Math.min(
                  canvasHeight - selectedElement.y,
                  selectedElement.height + deltaY
                )
              ),
            };
            break;
          }
          case "e": {
            updates = {
              width: Math.max(
                MIN_ELEMENT_WIDTH,
                Math.min(
                  canvasWidth - selectedElement.x,
                  selectedElement.width + deltaX
                )
              ),
            };
            break;
          }
          case "w": {
            const newWidthW = Math.max(
              MIN_ELEMENT_WIDTH,
              selectedElement.width - deltaX
            );
            const newXW = Math.max(
              0,
              selectedElement.x + selectedElement.width - newWidthW
            );
            updates = { x: newXW, width: newWidthW };
            break;
          }
          default:
            break;
        }

        const rect = clampResize({
          x: updates.x ?? selectedElement.x,
          y: updates.y ?? selectedElement.y,
          width: updates.width ?? selectedElement.width,
          height: updates.height ?? selectedElement.height,
        });
        onUpdateElement(selectedElement.id, rect);

        setDragStart({ x: currentX, y: currentY });
      }

      if (isRotating) {
        // Calculate angle from element center to mouse position
        const rect = canvasRef.current.getBoundingClientRect();
        const scale = zoomLevel / 100 || 1;
        
        // Get element center in screen coordinates
        const centerScreenX = rect.left + (rotationStart.centerX * scale);
        const centerScreenY = rect.top + (rotationStart.centerY * scale);
        
        // Calculate angle from center to current mouse position
        const deltaX = e.clientX - centerScreenX;
        const deltaY = e.clientY - centerScreenY;
        const angleRad = Math.atan2(deltaY, deltaX);
        const angleDeg = angleRad * (180 / Math.PI);
        
        // Calculate initial angle
        const initialDeltaX = rotationStart.x - centerScreenX;
        const initialDeltaY = rotationStart.y - centerScreenY;
        const initialAngleRad = Math.atan2(initialDeltaY, initialDeltaX);
        const initialAngleDeg = initialAngleRad * (180 / Math.PI);
        
        // Calculate rotation delta
        let newRotation = rotationStart.angle + (angleDeg - initialAngleDeg);
        
        // Normalize to 0-360 range
        newRotation = ((newRotation % 360) + 360) % 360;
        
        // Snap to 15-degree increments if Shift is held
        if (e.shiftKey) {
          newRotation = Math.round(newRotation / 15) * 15;
        }
        
        onUpdateElement(selectedElement.id, { rotation: newRotation });
      }
      }); // Close requestAnimationFrame
    },
    [
      selectedElement,
      isDragging,
      isResizing,
      isRotating,
      isEditingText,
      rotationStart,
      zoomLevel,
      dragStart,
      resizeHandle,
      onUpdateElement,
      snapToGrid,
      isShiftDown,
      gridSize,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setResizeHandle(null);
    setGuides({ v: null, h: null });
  }, []);

  React.useEffect(() => {
    if (isDragging || isResizing || isRotating) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, isRotating, handleMouseMove, handleMouseUp]);

  const addBulletList = (style) => {
    // Set initial dimensions to fit within canvas with safe margins
    const initialWidth = 300; // Slightly narrower for better fit
    const initialHeight = 120; // Reduced height to ensure visibility
    
    // Position in the top-left corner with some padding
    const x = 20; // 20px from left
    const y = 20; // 20px from top
    
    const bulletContent = (() => {
      switch (style) {
        case "circle":
          return ["◦ First point"];
        case "square":
          return ["▪ First point"];
        case "decimal":
          return ["1. First point"];
        case "disc":
        default:
          return ["• First point"];
      }
    })().join("\n");
    
    onAddElement({
      type: "text",
      content: bulletContent,
      listType: style,
      x,
      y,
      width: initialWidth,
      height: initialHeight,
    });
  };

  const bulletForStyle = (styleName, index) => {
    switch (styleName) {
      case "circle":
        return "◦";
      case "square":
        return "▪";
      case "decimal":
        return `${index + 1}.`;
      case "disc":
      default:
        return "•";
    }
  };

  const getBulletPrefix = (line, style) => {
    if (style === "decimal") {
      const match = line.match(/^\d+\.\s*/);
      return match ? match[0] : null;
    }
    if (["disc", "circle", "square"].includes(style)) {
      const match = line.match(/^[•◦▪]\s*/);
      return match ? match[0] : null;
    }
    return null;
  };

  const applyBulletContinuation = (rawValue, listType) => {
    try {
      // Handle undefined or null input
      if (rawValue === undefined || rawValue === null) {
        return '';
      }
      
      // Ensure rawValue is a string
      const stringValue = String(rawValue);
      const style = listType || '';
      
      // If no list type is specified, return the original value as a string
      if (!style) return stringValue;

      const lines = stringValue.split('\n');
      let bulletIndex = 0;

      const processed = lines.map((line, idx) => {
        // Ensure line is a string before calling trim()
        const lineStr = String(line || '');
        const trimmed = lineStr.trim();
        
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

        return lineStr;
      });

      return processed.join('\n');
    } catch (error) {
      console.error('Error in applyBulletContinuation:', error);
      return rawValue !== undefined ? String(rawValue) : '';
    }
  };

  const handleTextChange = (e, element) => {
    const node = e.target;
    const rawValue = node.value;
    
    // For shapes, just update text without bullet continuation or resizing
    if (element.type === "shape") {
      onUpdateElement(element.id, { 
        text: rawValue
      });
      return;
    }
    
    // For text elements, apply bullet continuation and auto-resize
    const content = applyBulletContinuation(rawValue, element.listType);
    
    // Calculate new height based on content
    node.style.height = 'auto';
    const newHeight = Math.max(30, node.scrollHeight);
    
    // Calculate maximum available space within canvas
    const maxHeight = CANVAS_HEIGHT - element.y - 20; // 20px padding from bottom
    const maxWidth = CANVAS_WIDTH - element.x - 20;   // 20px padding from right
    
    // Constrain dimensions to canvas bounds
    const finalHeight = Math.min(newHeight, maxHeight);
    const finalWidth = Math.min(element.width, maxWidth);
    
    // Apply height to textarea - no scrollbars, just expand
    node.style.height = `${finalHeight}px`;
    
    // Update element with new content and dimensions
    onUpdateElement(element.id, { 
      content,
      height: finalHeight,
      width: finalWidth
    });
  };

  const handleTextKeyDown = (e, element) => {
    const textarea = e.target;
    const { selectionStart, selectionEnd, value } = textarea;
    const style = element.listType;

    if (e.key === "Enter") {
      e.preventDefault();
      
      // For bullet points, handle the bullet insertion
      if (style) {
        const before = value.slice(0, selectionStart);
        const after = value.slice(selectionEnd);
        
        // Count existing bullets to determine the next number for numbered lists
        const linesBefore = before.split("\n");
        let bulletCount = 0;
        linesBefore.forEach((line) => {
          if (!line.trim()) return;
          bulletCount += 1;
        });
        
        const bullet = bulletForStyle(style, bulletCount);
        const insertion = e.shiftKey ? "\n" : `\n${bullet} `;
        const newValue = before + insertion + after;
        const content = applyBulletContinuation(newValue, style);
        
        // Update element with new content
        onUpdateElement(element.id, { content });
        
        // Set cursor position after the new bullet
        requestAnimationFrame(() => {
          const pos = before.length + insertion.length;
          textarea.selectionStart = textarea.selectionEnd = pos;
          
          // Trigger a resize to ensure the textarea expands if needed
          const event = new Event('input', { bubbles: true });
          Object.defineProperty(event, 'target', { value: textarea, enumerable: true });
          textarea.dispatchEvent(event);
        });
      } else {
        // For regular text, just add a new line and resize
        const before = value.slice(0, selectionStart);
        const after = value.slice(selectionEnd);
        const newValue = before + "\n" + after;
        
        onUpdateElement(element.id, { content: newValue });
        
        requestAnimationFrame(() => {
          const pos = before.length + 1;
          textarea.selectionStart = textarea.selectionEnd = pos;
          
          // Trigger a resize to ensure the textarea expands if needed
          const event = new Event('input', { bubbles: true });
          Object.defineProperty(event, 'target', { value: textarea, enumerable: true });
          textarea.dispatchEvent(event);
        });
      }
      return;
    }

    if (e.key === "Backspace" && selectionStart === selectionEnd) {
      const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
      const currentLine = value.slice(lineStart);
      const prefix = getBulletPrefix(currentLine, style);

      if (prefix && selectionStart <= lineStart + prefix.length) {
        e.preventDefault();

        const before = value.slice(0, lineStart);
        const after = value.slice(selectionEnd);
        const trimmedBefore =
          lineStart > 0 && before.endsWith("\n") ? before.slice(0, -1) : before;
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
  const NUDGE_SMALL = 1;
  const NUDGE_LARGE = 10;

  const nudgeSelected = (dx, dy) => {
    if (!selectedElement) return;
    const canvasWidth = CANVAS_WIDTH;
    const canvasHeight = CANVAS_HEIGHT;
    const nx = Math.max(
      0,
      Math.min(canvasWidth - selectedElement.width, selectedElement.x + dx)
    );
    const ny = Math.max(
      0,
      Math.min(canvasHeight - selectedElement.height, selectedElement.y + dy)
    );
    onUpdateElement(selectedElement.id, { x: nx, y: ny });
  };
  const handleKeyDown = (e) => {
    // Delete / Esc (existing)
    if (e.key === "Delete" && selectedElement) {
      onDeleteElement(selectedElement.id);
      return;
    }
    if (e.key === "Escape") {
      onSelectElement(null);
      setIsEditingText(false);
      return;
    }

    // Undo/Redo (optional – your app may already handle globally)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey && typeof window.onRedoAction === "function")
        window.onRedoAction();
      else if (typeof window.onUndoAction === "function") window.onUndoAction();
      return;
    }

    // Copy / Cut / Paste
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
      if (selectedElement) {
        const cloned = JSON.parse(JSON.stringify(selectedElement));
        setClipboardElement(cloned);
        onCopyElement && onCopyElement(selectedElement);
        e.preventDefault();
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "x") {
      if (selectedElement) {
        const cloned = JSON.parse(JSON.stringify(selectedElement));
        setClipboardElement(cloned);
        if (onCutElement) onCutElement(selectedElement);
        else onDeleteElement(selectedElement.id);
        e.preventDefault();
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
      handlePaste();
      e.preventDefault();
      return;
    }

    // Arrow nudge (Shift = 10px)
    const step = e.shiftKey ? NUDGE_LARGE : NUDGE_SMALL;
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) &&
      selectedElement &&
      !isEditingText
    ) {
      e.preventDefault();
      if (e.key === "ArrowUp") nudgeSelected(0, -step);
      if (e.key === "ArrowDown") nudgeSelected(0, step);
      if (e.key === "ArrowLeft") nudgeSelected(-step, 0);
      if (e.key === "ArrowRight") nudgeSelected(step, 0);
    }
  };

  React.useEffect(() => {
    const handleToggle = (e) => {
      if (e && e.detail && typeof e.detail.show === "boolean") {
        // when grid is shown we also enable snap-to-grid by default
        setShowGrid(e.detail.show);
        setSnapToGrid(e.detail.show);
        if (e.detail.size && typeof e.detail.size === "number") {
          setGridSize(e.detail.size);
        }
      }
    };
    const handleSizeChange = (e) => {
      if (e && e.detail && typeof e.detail.size === "number") {
        setGridSize(e.detail.size);
      }
    };
    window.addEventListener("toggleCanvasGrid", handleToggle);
    window.addEventListener("updateCanvasGridSize", handleSizeChange);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("toggleCanvasGrid", handleToggle);
      window.removeEventListener("updateCanvasGridSize", handleSizeChange);
    };
  }, [selectedElement]);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu.show && !e.target.closest(".context-menu")) {
        hideContextMenu();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [contextMenu.show]);
  const clampMove = (x, y, w, h) => {
    const maxX = CANVAS_WIDTH - w;
    const maxY = CANVAS_HEIGHT - h;
    return {
      x: Math.max(0, Math.min(maxX, x)),
      y: Math.max(0, Math.min(maxY, y)),
    };
  };

  const clampResize = (rect) => {
    // rect = { x, y, width, height }
    const minW = MIN_ELEMENT_WIDTH;
    const minH = MIN_ELEMENT_HEIGHT;

    let x = rect.x;
    let y = rect.y;
    let w = Math.max(minW, rect.width);
    let h = Math.max(minH, rect.height);

    // keep fully inside slide
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x + w > CANVAS_WIDTH) w = CANVAS_WIDTH - x;
    if (y + h > CANVAS_HEIGHT) h = CANVAS_HEIGHT - y;

    return { x, y, width: w, height: h };
  };

  const renderChart = (element) => {
    const { chartType, data = [], color } = element;
    const fallbackColor = color || "#4F46E5";

    const truncated = (text, maxChars) => {
      if (typeof text !== "string") return text;
      return text.length <= maxChars ? text : `${text.slice(0, maxChars - 1)}…`;
    };

    if (!Array.isArray(data) || data.length === 0) {
      return (
        <ChartFrame>
          {({ width, height }) => (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#4a4a4a",
                fontSize: Math.max(Math.min(width, height) * 0.06, 10),
              }}
            >
              No data for chart
            </div>
          )}
        </ChartFrame>
      );
    }

    const renderBarChart = ({ width, height }) => {
      const safeWidth = Math.max(width, 120);
      const safeHeight = Math.max(height, 120);
      const values = data.map((item) =>
        typeof item.value === "number" ? item.value : 0
      );
      const maxValue = Math.max(...values, 0) || 1;
      const basePadding = Math.min(safeWidth, safeHeight) * 0.12;
      const xPadding = Math.max(basePadding, 24);
      const yPaddingTop = Math.max(basePadding * 0.75, 28);
      const yPaddingBottom = Math.max(basePadding, 36);
      const plotHeight = safeHeight - yPaddingTop - yPaddingBottom;
      const plotWidth = safeWidth - xPadding * 2;
      const columnWidth = plotWidth / Math.max(data.length, 1);
      const maxBars = Math.max(data.length, 1);
      const tickFont = Math.max(Math.min(plotHeight * 0.12, 14), 9);
      const labelFont = Math.max(
        Math.min((plotWidth / Math.max(maxBars, 1)) * 0.24, 12),
        9
      );

      const columns = data.map((item, index) => {
        const value = typeof item.value === "number" ? item.value : 0;
        const heightRatio = Math.max(Math.min(value / maxValue, 1), 0);
        const barHeight = plotHeight * heightRatio;
        const x = xPadding + index * columnWidth + columnWidth * 0.25;
        const y = yPaddingTop + plotHeight - barHeight;
        const width = columnWidth * 0.5;
        return {
          x,
          y,
          width,
          height: Math.max(barHeight, 2),
          color: item.color || fallbackColor,
          label: item.label || `Series ${index + 1}`,
        };
      });

      const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const value = maxValue * ratio;
        return {
          ratio,
          y: yPaddingTop + plotHeight * (1 - ratio),
          label: value % 1 === 0 ? value.toString() : value.toFixed(1),
        };
      });

      const maxLabelLength = Math.max(6, Math.floor(columnWidth / 12));

      return (
        <div className="chart-card">
          <div
            className="chart-card__header"
            style={{
              padding: `${Math.max(safeHeight * 0.04, 12)}px ${Math.max(
                safeWidth * 0.06,
                16
              )}px 4px`,
              fontSize: Math.max(Math.min(safeWidth * 0.05, 16), 12),
            }}
          >
            Bar chart
          </div>
          <div
            className="chart-card__plot"
            style={{
              padding: `0 ${Math.max(safeWidth * 0.05, 16)}px ${Math.max(
                safeHeight * 0.05,
                16
              )}px`,
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${safeWidth} ${safeHeight}`}
            >
              <defs>
                <clipPath id="plot-area-clip">
                  <rect
                    x={xPadding}
                    y={yPaddingTop}
                    width={plotWidth}
                    height={plotHeight}
                    rx={Math.min(12, columnWidth * 0.2)}
                    ry={Math.min(12, columnWidth * 0.2)}
                  />
                </clipPath>
              </defs>
              <rect
                x={xPadding}
                y={yPaddingTop}
                width={plotWidth}
                height={plotHeight}
                fill="#f8fafc"
                rx={Math.min(12, columnWidth * 0.2)}
                ry={Math.min(12, columnWidth * 0.2)}
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
                    strokeDasharray={idx === ticks.length - 1 ? "none" : "3 4"}
                    opacity={idx === ticks.length - 1 ? 0.9 : 0.6}
                  />
                  <text
                    x={xPadding - 8}
                    y={tick.y}
                    textAnchor="end"
                    alignmentBaseline="middle"
                    fill="#475569"
                    fontSize={tickFont}
                  >
                    {tick.label}
                  </text>
                </g>
              ))}
              <g clipPath="url(#plot-area-clip)">
                {columns.map((col, index) => (
                  <rect
                    key={index}
                    x={col.x}
                    y={col.y}
                    width={col.width}
                    height={col.height}
                    rx={Math.min(12, col.width / 2)}
                    ry={Math.min(12, col.width / 2)}
                    fill={col.color}
                  />
                ))}
              </g>
              {columns.map((col, index) => (
                <text
                  key={index}
                  x={col.x + col.width / 2}
                  y={yPaddingTop + plotHeight + labelFont + 8}
                  textAnchor="middle"
                  fill="#334155"
                  fontSize={labelFont}
                >
                  {truncated(col.label, maxLabelLength)}
                </text>
              ))}
            </svg>
          </div>
        </div>
      );
    };

    if (chartType === "bar") {
      return <ChartFrame>{(size) => renderBarChart(size)}</ChartFrame>;
    }

    if (chartType === "pie") {
      const renderPieChart = ({ width, height }) => {
        const safeWidth = Math.max(width, 160);
        const safeHeight = Math.max(height, 160);
        const total =
          data.reduce(
            (sum, item) =>
              sum + (typeof item.value === "number" ? item.value : 0),
            0
          ) || 1;
        const radius =
          Math.min(safeWidth, safeHeight) / 2 -
          Math.max(Math.min(safeWidth, safeHeight) * 0.1, 24);
        const centerX = safeWidth / 2;
        const centerY = safeHeight / 2;
        let currentAngle = -90;
        const labelFont = Math.max(Math.min(radius * 0.22, 13), 9);

        return (
          <div className="chart-card">
            <div
              className="chart-card__header"
              style={{
                padding: `${Math.max(safeHeight * 0.04, 12)}px ${Math.max(
                  safeWidth * 0.06,
                  16
                )}px 4px`,
                fontSize: Math.max(Math.min(safeWidth * 0.05, 16), 12),
              }}
            >
              Pie chart
            </div>
            <div
              className="chart-card__plot"
              style={{
                padding: `0 ${Math.max(safeWidth * 0.06, 18)}px ${Math.max(
                  safeHeight * 0.06,
                  18
                )}px`,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                }}
              >
                <svg
                  width={safeWidth}
                  height={safeHeight}
                  viewBox={`0 0 ${safeWidth} ${safeHeight}`}
                >
                  {data.map((item, index) => {
                    const value =
                      typeof item.value === "number" ? item.value : 0;
                    const angle = (value / total) * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;
                    currentAngle += angle;
                    const largeArcFlag = angle > 180 ? 1 : 0;

                    const x1 =
                      centerX + radius * Math.cos((startAngle * Math.PI) / 180);
                    const y1 =
                      centerY + radius * Math.sin((startAngle * Math.PI) / 180);
                    const x2 =
                      centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                    const y2 =
                      centerY + radius * Math.sin((endAngle * Math.PI) / 180);

                    return (
                      <path
                        key={index}
                        d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        fill={item.color || fallbackColor}
                        stroke="#ffffff"
                        strokeWidth="1.2"
                        opacity="0.96"
                      />
                    );
                  })}
                </svg>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "10px",
                    fontSize: labelFont,
                    color: "#475569",
                  }}
                >
                  {data.map((item, index) => (
                    <span
                      key={index}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <span
                        style={{
                          width: labelFont * 0.6,
                          height: labelFont * 0.6,
                          borderRadius: "50%",
                          background: item.color || fallbackColor,
                        }}
                      ></span>
                      {truncated(item.label || `Slice ${index + 1}`, 18)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      };

      return <ChartFrame>{(size) => renderPieChart(size)}</ChartFrame>;
    }

    if (chartType === "line") {
      const renderLineChart = ({ width, height }) => {
        const safeWidth = Math.max(width, 200);
        const safeHeight = Math.max(height, 160);
        const values = data.map((item) =>
          typeof item.value === "number" ? item.value : 0
        );
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const range = maxValue - minValue || 1;
        const safeCount = data.length || 1;
        const xPadding = Math.max(Math.min(safeWidth * 0.12, 60), 24);
        const yPaddingTop = Math.max(safeHeight * 0.16, 28);
        const yPaddingBottom = Math.max(safeHeight * 0.18, 36);
        const plotWidth = safeWidth - xPadding * 2;
        const plotHeight = safeHeight - yPaddingTop - yPaddingBottom;
        const tickFont = Math.max(Math.min(plotHeight * 0.12, 14), 9);
        const labelFont = Math.max(
          Math.min((plotWidth / Math.max(safeCount, 1)) * 0.24, 12),
          9
        );

        const coordinates = data.map((item, index) => {
          const value = typeof item.value === "number" ? item.value : 0;
          const normalized = Math.max(
            Math.min((value - minValue) / range, 1),
            0
          );
          const x =
            safeCount === 1
              ? safeWidth / 2
              : xPadding + (plotWidth * index) / (safeCount - 1);
          const y = yPaddingTop + plotHeight * (1 - normalized);
          return {
            x,
            y,
            value,
            label: item.label || `Point ${index + 1}`,
            color: item.color || fallbackColor,
          };
        });

        const points = coordinates
          .map((point) => `${point.x},${point.y}`)
          .join(" ");
        const maxLabelLength = Math.max(
          6,
          Math.floor(plotWidth / Math.max(safeCount, 1) / 10)
        );

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
                padding: `${Math.max(safeHeight * 0.04, 12)}px ${Math.max(
                  safeWidth * 0.06,
                  16
                )}px 4px`,
                fontSize: Math.max(Math.min(safeWidth * 0.05, 16), 12),
              }}
            >
              Line chart
            </div>
            <div
              className="chart-card__plot"
              style={{
                padding: `0 ${Math.max(safeWidth * 0.06, 18)}px ${Math.max(
                  safeHeight * 0.06,
                  18
                )}px`,
              }}
            >
              <svg
                width={safeWidth}
                height={safeHeight}
                viewBox={`0 0 ${safeWidth} ${safeHeight}`}
              >
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
                      strokeDasharray={
                        idx === ticks.length - 1 ? "none" : "3 4"
                      }
                      opacity={idx === ticks.length - 1 ? 0.9 : 0.6}
                    />
                    <text
                      x={xPadding - 10}
                      y={tick.y}
                      textAnchor="end"
                      alignmentBaseline="middle"
                      fill="#475569"
                      fontSize={tickFont}
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
                      key={index}
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
                    key={index}
                    x={point.x}
                    y={yPaddingTop + plotHeight + labelFont + 10}
                    textAnchor="middle"
                    fill="#334155"
                    fontSize={labelFont}
                  >
                    {truncated(point.label, maxLabelLength)}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        );
      };

      return <ChartFrame>{(size) => renderLineChart(size)}</ChartFrame>;
    }

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#4a4a4a",
          fontSize: "12px",
        }}
      >
        Chart preview unavailable
      </div>
    );
  };

  const renderElement = (element) => {
    const isSelected = selectedElement && selectedElement.id === element.id;

    const elementStyle = {
      position: "absolute",
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      cursor: isDragging ? "grabbing" : isSelected ? "move" : "pointer",
      userSelect: "none",
      zIndex: element.zIndex || 1,
    };

    if (element.type === "text") {
      return (
        <div
          key={element.id}
          className={`canvas-element ${
            isDragging && isSelected ? "dragging" : ""
          }`}
        >
          {isEditingText && isSelected ? (
            <textarea
              ref={(el) => editorRefs.current.set(element.id, el)}
              style={{
                position: "absolute",
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height,
                fontSize: element.fontSize,
                fontFamily: element.fontFamily,
                color: element.color,
                backgroundColor: element.backgroundColor || "transparent",
                fontWeight: element.fontWeight,
                fontStyle: element.fontStyle,
                textAlign: element.textAlign,
                textDecoration: element.textDecoration,
                border: "2px solid #1a73e8",
                outline: "none",
                resize: "none",
                padding: "8px",
                cursor: "text",
                borderRadius: "4px",
                boxShadow: "0 0 8px rgba(26, 115, 232, 0.3)",
                boxSizing: "border-box",
                minHeight: "30px",
                overflow: "hidden",
              }}
              value={element.content || ""}
              onChange={(e) => handleTextChange(e, element)}
              onBlur={handleTextBlur}
              onKeyDown={(e) => {
                handleTextKeyDown(e, element);
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
                  if (e.shiftKey) {
                    if (typeof window.onRedoAction === "function") {
                      window.onRedoAction();
                    }
                  } else {
                    if (typeof window.onUndoAction === "function") {
                      window.onUndoAction();
                    }
                  }
                }
                if (e.key === "Escape") {
                  handleTextBlur();
                }
                e.stopPropagation();
              }}
              autoFocus
              placeholder={element.placeholder || "Type your text here..."}
            />
          ) : (
            <div
              key={element.id}
              className={`canvas-element ${
                isDragging && isSelected ? "dragging" : ""
              }`}
            >
              {/* 1) The positioned box */}
              <div
                style={{
                  ...elementStyle, // <-- left, top, width, height live here
                  fontSize: element.fontSize,
                  fontFamily: element.fontFamily,
                  color: element.color,
                  backgroundColor: element.backgroundColor || "transparent",
                  fontWeight: element.fontWeight,
                  fontStyle: element.fontStyle,
                  textAlign: element.textAlign,
                  textDecoration: element.textDecoration,
                  padding: "8px",
                  border: isSelected
                    ? "2px solid #1a73e8"
                    : "2px solid transparent",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  overflowWrap: "anywhere",
                  overflow: "hidden",
                  height: element.height,
                  cursor: isSelected && !isEditingText ? "move" : "pointer",
                  borderRadius: "4px",
                  minHeight: "30px",
                  boxSizing: "border-box",
                  position: "absolute",
                  transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
                  transformOrigin: "center center",
                }}
                onClick={(e) => handleElementClick(e, element)}
                onDoubleClick={(e) => handleElementDoubleClick(e, element)}
                onMouseDown={(e) =>
                  !isEditingText && handleMouseDown(e, element)
                }
              >
                {/* 2) The content or placeholder */}
                <span style={{
                  pointerEvents: isEditingText ? "auto" : "none",
                  color: !element.content && element.placeholder ? "#999999" : "inherit",
                  fontStyle: !element.content && element.placeholder ? "italic" : "inherit",
                }}>
                  {element.content || element.placeholder || "Click to add text"}
                </span>

                {/* 3) The overlay hit areas */}
                {isSelected && !isEditingText && (
                  <div className="resize-zones" aria-hidden>
                    <div
                      className="rz-edge rz-n"
                      onMouseDown={(e) => handleMouseDown(e, element, "n")}
                    />
                    <div
                      className="rz-edge rz-s"
                      onMouseDown={(e) => handleMouseDown(e, element, "s")}
                    />
                    <div
                      className="rz-edge rz-e"
                      onMouseDown={(e) => handleMouseDown(e, element, "e")}
                    />
                    <div
                      className="rz-edge rz-w"
                      onMouseDown={(e) => handleMouseDown(e, element, "w")}
                    />
                    <div
                      className="rz-corner rz-nw"
                      onMouseDown={(e) => handleMouseDown(e, element, "nw")}
                    />
                    <div
                      className="rz-corner rz-ne"
                      onMouseDown={(e) => handleMouseDown(e, element, "ne")}
                    />
                    <div
                      className="rz-corner rz-sw"
                      onMouseDown={(e) => handleMouseDown(e, element, "sw")}
                    />
                    <div
                      className="rz-corner rz-se"
                      onMouseDown={(e) => handleMouseDown(e, element, "se")}
                    />
                    <div
                      className="rz-rotate"
                      onMouseDown={(e) => handleMouseDown(e, element, "rotate")}
                      title="Rotate (hold Shift for 15° snap)"
                    >
                      <i className="fas fa-redo"></i>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (element.type === "shape") {
      const shadowStyle = element.shadow
        ? "0 8px 24px rgba(0,0,0,0.15)"
        : "none";

      return (
        <div
          key={element.id}
          className={`canvas-element ${
            isDragging && isSelected ? "dragging" : ""
          }`}
        >
          <div
            style={{
              position: "absolute",
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              cursor: isDragging ? "grabbing" : isSelected ? "move" : "pointer",
              filter: element.shadow ? `drop-shadow(${shadowStyle})` : "none",
              outline: isSelected ? "2px solid #1a73e8" : "none",
              outlineOffset: "2px",
              transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
              transformOrigin: "center center",
              zIndex: element.zIndex || 1,
            }}
            onClick={(e) => handleElementClick(e, element)}
            onDoubleClick={(e) => handleElementDoubleClick(e, element)}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            <ShapeRenderer element={element} />
            
            {/* Text overlay for shapes */}
            {isEditingText && isSelected ? (
              <textarea
                ref={(el) => editorRefs.current.set(element.id, el)}
                className="shape-text-editor"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: `calc(100% - ${element.textPadding || 20}px)`,
                  maxHeight: `calc(100% - ${element.textPadding || 20}px)`,
                  fontSize: element.fontSize || 16,
                  fontFamily: element.fontFamily || "Roboto",
                  color: element.textColor || "#FFFFFF",
                  backgroundColor: "transparent",
                  fontWeight: element.fontWeight || "normal",
                  fontStyle: element.fontStyle || "normal",
                  textAlign: element.textAlign || "center",
                  textDecoration: element.textDecoration || "none",
                  border: "2px solid #1a73e8",
                  outline: "none",
                  resize: "none",
                  padding: "8px",
                  borderRadius: "4px",
                  boxShadow: "0 0 8px rgba(26, 115, 232, 0.3)",
                  zIndex: 100,
                  overflow: "auto",
                  wordWrap: "break-word",
                  whiteSpace: "pre-wrap",
                }}
                value={element.text || ""}
                onChange={(e) => handleTextChange(e, element)}
                onBlur={handleTextBlur}
                onKeyDown={(e) => {
                  handleTextKeyDown(e, element);
                  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
                    if (e.shiftKey) {
                      if (typeof window.onRedoAction === "function") {
                        window.onRedoAction();
                      }
                    } else {
                      if (typeof window.onUndoAction === "function") {
                        window.onUndoAction();
                      }
                    }
                  }
                  if (e.key === "Escape") {
                    handleTextBlur();
                  }
                  e.stopPropagation();
                }}
                autoFocus
                placeholder={element.textPlaceholder || "Type your text here..."}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: element.verticalAlign === "top" ? "flex-start" : 
                             element.verticalAlign === "bottom" ? "flex-end" : "center",
                  justifyContent: element.textAlign === "left" ? "flex-start" : 
                                 element.textAlign === "right" ? "flex-end" : "center",
                  padding: `${element.textPadding || 10}px`,
                  pointerEvents: "none",
                  overflow: "hidden",
                  wordWrap: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              >
                <span
                  style={{
                    fontSize: element.fontSize || 16,
                    fontFamily: element.fontFamily || "Roboto",
                    color: !element.text && element.textPlaceholder 
                      ? "rgba(255, 255, 255, 0.4)" 
                      : element.textColor || "#FFFFFF",
                    fontWeight: element.fontWeight || "normal",
                    fontStyle: !element.text && element.textPlaceholder 
                      ? "italic" 
                      : element.fontStyle || "normal",
                    textAlign: element.textAlign || "center",
                    textDecoration: element.textDecoration || "none",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                    userSelect: "none",
                  }}
                >
                  {element.text || element.textPlaceholder || ""}
                </span>
              </div>
            )}
            
            {isSelected && !isEditingText && (
              <div className="resize-zones" aria-hidden>
                <div
                  className="rz-edge rz-n"
                  onMouseDown={(e) => handleMouseDown(e, element, "n")}
                />
                <div
                  className="rz-edge rz-s"
                  onMouseDown={(e) => handleMouseDown(e, element, "s")}
                />
                <div
                  className="rz-edge rz-e"
                  onMouseDown={(e) => handleMouseDown(e, element, "e")}
                />
                <div
                  className="rz-edge rz-w"
                  onMouseDown={(e) => handleMouseDown(e, element, "w")}
                />
                <div
                  className="rz-corner rz-nw"
                  onMouseDown={(e) => handleMouseDown(e, element, "nw")}
                />
                <div
                  className="rz-corner rz-ne"
                  onMouseDown={(e) => handleMouseDown(e, element, "ne")}
                />
                <div
                  className="rz-corner rz-sw"
                  onMouseDown={(e) => handleMouseDown(e, element, "sw")}
                />
                <div
                  className="rz-corner rz-se"
                  onMouseDown={(e) => handleMouseDown(e, element, "se")}
                />
                <div
                  className="rz-rotate"
                  onMouseDown={(e) => handleMouseDown(e, element, "rotate")}
                  title="Rotate (hold Shift for 15° snap)"
                >
                  <i className="fas fa-redo"></i>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (element.type === "image") {
      return (
        <div
          key={element.id}
          className={`canvas-element ${
            isDragging && isSelected ? "dragging" : ""
          }`}
        >
          <div
            style={{
              ...elementStyle,
              border: isSelected
                ? "2px solid #1a73e8"
                : "2px solid transparent",
              cursor: isDragging ? "grabbing" : isSelected ? "move" : "pointer",
              transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
              transformOrigin: "center center",
            }}
            onClick={(e) => handleElementClick(e, element)}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            <img
              src={element.src}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                pointerEvents: "none",
              }}
              draggable={false}
            />
            {isSelected && !isEditingText && (
              <div className="resize-zones" aria-hidden>
                <div
                  className="rz-edge rz-n"
                  onMouseDown={(e) => handleMouseDown(e, element, "n")}
                />
                <div
                  className="rz-edge rz-s"
                  onMouseDown={(e) => handleMouseDown(e, element, "s")}
                />
                <div
                  className="rz-edge rz-e"
                  onMouseDown={(e) => handleMouseDown(e, element, "e")}
                />
                <div
                  className="rz-edge rz-w"
                  onMouseDown={(e) => handleMouseDown(e, element, "w")}
                />
                <div
                  className="rz-corner rz-nw"
                  onMouseDown={(e) => handleMouseDown(e, element, "nw")}
                />
                <div
                  className="rz-corner rz-ne"
                  onMouseDown={(e) => handleMouseDown(e, element, "ne")}
                />
                <div
                  className="rz-corner rz-sw"
                  onMouseDown={(e) => handleMouseDown(e, element, "sw")}
                />
                <div
                  className="rz-corner rz-se"
                  onMouseDown={(e) => handleMouseDown(e, element, "se")}
                />
                <div
                  className="rz-rotate"
                  onMouseDown={(e) => handleMouseDown(e, element, "rotate")}
                  title="Rotate (hold Shift for 15° snap)"
                >
                  <i className="fas fa-redo"></i>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (element.type === "chart") {
      return (
        <div
          key={element.id}
          className={`canvas-element ${
            isDragging && isSelected ? "dragging" : ""
          }`}
        >
          <div
            style={{
              ...elementStyle,
              border: isSelected
                ? "2px solid #1a73e8"
                : "2px solid transparent",
              cursor: isDragging ? "grabbing" : isSelected ? "move" : "pointer",
              borderRadius: "16px",
              backgroundColor: "transparent",
              boxShadow: "none",
              transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
              transformOrigin: "center center",
            }}
            onClick={(e) => handleElementClick(e, element)}
            onDoubleClick={() => {
              if (typeof window.openChartEditor === "function") {
                window.openChartEditor(element); // parent can hook this to show ChartModal prefilled
              }
            }}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            {renderChart(element)}
            {isSelected && !isEditingText && (
              <div className="resize-zones" aria-hidden>
                <div
                  className="rz-edge rz-n"
                  onMouseDown={(e) => handleMouseDown(e, element, "n")}
                />
                <div
                  className="rz-edge rz-s"
                  onMouseDown={(e) => handleMouseDown(e, element, "s")}
                />
                <div
                  className="rz-edge rz-e"
                  onMouseDown={(e) => handleMouseDown(e, element, "e")}
                />
                <div
                  className="rz-edge rz-w"
                  onMouseDown={(e) => handleMouseDown(e, element, "w")}
                />
                <div
                  className="rz-corner rz-nw"
                  onMouseDown={(e) => handleMouseDown(e, element, "nw")}
                />
                <div
                  className="rz-corner rz-ne"
                  onMouseDown={(e) => handleMouseDown(e, element, "ne")}
                />
                <div
                  className="rz-corner rz-sw"
                  onMouseDown={(e) => handleMouseDown(e, element, "sw")}
                />
                <div
                  className="rz-corner rz-se"
                  onMouseDown={(e) => handleMouseDown(e, element, "se")}
                />
                <div
                  className="rz-rotate"
                  onMouseDown={(e) => handleMouseDown(e, element, "rotate")}
                  title="Rotate (hold Shift for 15° snap)"
                >
                  <i className="fas fa-redo"></i>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (element.type === "video") {
      return (
        <div
          key={element.id}
          className={`canvas-element ${
            isDragging && isSelected ? "dragging" : ""
          }`}
        >
          <div
            style={{
              ...elementStyle,
              border: isSelected
                ? "2px solid #1a73e8"
                : "2px solid transparent",
              borderRadius: "4px",
              backgroundColor: "#000",
              cursor: isDragging ? "grabbing" : isSelected ? "move" : "pointer",
              transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
              transformOrigin: "center center",
              overflow: "hidden",
            }}
            onClick={(e) => handleElementClick(e, element)}
            onMouseDown={(e) => handleMouseDown(e, element)}
          >
            <video
              src={element.src}
              controls
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                pointerEvents: "auto",
                borderRadius: "4px",
                display: "block",
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
            />
            
            {/* Draggable area - top portion above video controls */}
            {isSelected && !isDragging && !isResizing && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "calc(100% - 50px)",
                  cursor: "move",
                  zIndex: 14,
                  pointerEvents: "auto",
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(e, element);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
            )}
            
            {isSelected && !isEditingText && (
              <div className="resize-zones" aria-hidden>
                <div
                  className="rz-edge rz-n"
                  onMouseDown={(e) => handleMouseDown(e, element, "n")}
                />
                <div
                  className="rz-edge rz-s"
                  onMouseDown={(e) => handleMouseDown(e, element, "s")}
                />
                <div
                  className="rz-edge rz-e"
                  onMouseDown={(e) => handleMouseDown(e, element, "e")}
                />
                <div
                  className="rz-edge rz-w"
                  onMouseDown={(e) => handleMouseDown(e, element, "w")}
                />
                <div
                  className="rz-corner rz-nw"
                  onMouseDown={(e) => handleMouseDown(e, element, "nw")}
                />
                <div
                  className="rz-corner rz-ne"
                  onMouseDown={(e) => handleMouseDown(e, element, "ne")}
                />
                <div
                  className="rz-corner rz-sw"
                  onMouseDown={(e) => handleMouseDown(e, element, "sw")}
                />
                <div
                  className="rz-corner rz-se"
                  onMouseDown={(e) => handleMouseDown(e, element, "se")}
                />
                <div
                  className="rz-rotate"
                  onMouseDown={(e) => handleMouseDown(e, element, "rotate")}
                  title="Rotate (hold Shift for 15° snap)"
                >
                  <i className="fas fa-redo"></i>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  const zoomScale = zoomLevel / 100;

  return (
    <div 
      className="canvas-container"
      style={{
        transform: `scale(${zoomScale})`,
        transformOrigin: "center center",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        padding: '10px',
        margin: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
        minWidth: 0,
        minHeight: 0
      }}
    >
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
              <div
                key={i}
                className="ruler-mark"
                style={{ left: `${i * 48}px` }}
              >
                <span className="ruler-label">{i * 48}px</span>
              </div>
            ))}
          </div>
          <div className="ruler-vertical">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className="ruler-mark"
                style={{ top: `${i * 45}px` }}
              >
                <span className="ruler-label">{i * 45}px</span>
              </div>
            ))}
          </div>
        </>
      )}
      <div
        ref={canvasRef}
        className={`canvas ${isDragOver ? "drag-over" : ""}`}
        style={{
          backgroundColor: slide.background,
          backgroundImage: slide.backgroundImage
            ? `url(${slide.backgroundImage})`
            : slide.backgroundGradient || "none",
          backgroundSize: slide.backgroundImage ? "contain" : "cover",
          backgroundPosition: "center",
          backgroundRepeat: slide.backgroundImage ? "no-repeat" : "no-repeat",
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          margin: '0 auto',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          flexShrink: 0,
          boxSizing: 'border-box'
        }}
        onMouseDown={handleCanvasBackgroundMouseDown}
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

      {/* Context Menu */}
      {contextMenu.show && (
        <div
          className="context-menu"
          style={{
            position: "fixed",
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            background:
              "linear-gradient(160deg, rgba(14, 44, 85, 0.96) 0%, rgba(28, 73, 141, 0.98) 60%, rgba(14, 32, 68, 0.98) 100%)",
            backdropFilter: "blur(22px)",
            border: "1px solid rgba(56, 141, 232, 0.45)",
            borderRadius: "12px",
            boxShadow:
              "0 36px 60px rgba(10, 30, 60, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.06)",
            minWidth: "260px",
            maxWidth: "320px",
            padding: "8px 0",
            zIndex: 100000,
            pointerEvents: "auto",
          }}
          onMouseLeave={() => setHoveredMenuItem(null)}
        >
          {selectedElement ? (
            <>
              <div className="context-menu-header">
                <div className="context-menu-title">
                  <i
                    className={
                      selectedElement.type === "text"
                        ? "fas fa-font"
                        : selectedElement.type === "image"
                        ? "fas fa-image"
                        : selectedElement.type === "video"
                        ? "fas fa-video"
                        : selectedElement.type === "chart"
                        ? "fas fa-chart-pie"
                        : "fas fa-shapes"
                    }
                  ></i>
                  <span>
                    {selectedElement.type.charAt(0).toUpperCase() +
                      selectedElement.type.slice(1)}{" "}
                    options
                  </span>
                </div>
                <span className="context-menu-position">
                  x: {Math.round(selectedElement.x)}, y:{" "}
                  {Math.round(selectedElement.y)}
                </span>
              </div>

              <button
                className={`context-menu-item ${
                  hoveredMenuItem === "cut" ? "hovered" : ""
                }`}
                onMouseEnter={() => setHoveredMenuItem("cut")}
                onMouseLeave={() => setHoveredMenuItem(null)}
                onClick={handleCut}
              >
                <i className="fas fa-cut"></i>
                <div className="label">Cut</div>
                <span className="shortcut">Ctrl+X</span>
              </button>
              <button
                className={`context-menu-item ${
                  hoveredMenuItem === "copy" ? "hovered" : ""
                }`}
                onMouseEnter={() => setHoveredMenuItem("copy")}
                onMouseLeave={() => setHoveredMenuItem(null)}
                onClick={handleCopy}
              >
                <i className="fas fa-copy"></i>
                <div className="label">Copy</div>
                <span className="shortcut">Ctrl+C</span>
              </button>
              <button
                className={`context-menu-item ${
                  hoveredMenuItem === "paste" ? "hovered" : ""
                }`}
                onMouseEnter={() => setHoveredMenuItem("paste")}
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
                  <span className="context-menu-position">
                    x: {Math.round(contextMenu.absolutePosition.x)}, y:{" "}
                    {Math.round(contextMenu.absolutePosition.y)}
                  </span>
                )}
              </div>
              <button
                className={`context-menu-item ${
                  hoveredMenuItem === "paste-only" ? "hovered" : ""
                }`}
                onMouseEnter={() => setHoveredMenuItem("paste-only")}
                onMouseLeave={() => setHoveredMenuItem(null)}
                onClick={handlePaste}
                disabled={!clipboardElement && !clipboard}
              >
                <i className="fas fa-paste"></i>
                <div className="label">Paste</div>
                <span className="shortcut">Ctrl+V</span>
              </button>
              <button
                className={`context-menu-item ${
                  hoveredMenuItem === "copy-only" ? "hovered" : ""
                }`}
                onMouseEnter={() => setHoveredMenuItem("copy-only")}
                onMouseLeave={() => setHoveredMenuItem(null)}
                onClick={handleCopy}
                disabled={true}
              >
                <i className="fas fa-copy"></i>
                <div className="label">Copy</div>
                <span className="shortcut">Ctrl+C</span>
              </button>
              <button
                className={`context-menu-item ${
                  hoveredMenuItem === "cut-only" ? "hovered" : ""
                }`}
                onMouseEnter={() => setHoveredMenuItem("cut-only")}
                onMouseLeave={() => setHoveredMenuItem(null)}
                onClick={handleCut}
                disabled={true}
              >
                <i className="fas fa-cut"></i>
                <div className="label">Cut</div>
                <span className="shortcut">Ctrl+X</span>
              </button>
            </>
          )}
        </div>
      )}
      {guides.v !== null && (
        <div
          style={{
            position: "absolute",
            left: `${guides.v}px`,
            top: 0,
            bottom: 0,
            width: "1px",
            background: "rgba(26,115,232,0.7)",
            pointerEvents: "none",
          }}
        />
      )}
      {guides.h !== null && (
        <div
          style={{
            position: "absolute",
            top: `${guides.h}px`,
            left: 0,
            right: 0,
            height: "1px",
            background: "rgba(26,115,232,0.7)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};

export default Canvas;