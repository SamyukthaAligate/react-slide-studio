import React, { useState, useEffect, useRef } from 'react';
import './Toolbar.css';

const Toolbar = ({ 
  onAddElement, 
  selectedElement, 
  onUpdateElement, 
  onDeleteElement, 
  slides, 
  currentSlideIndex, 
  onUpdateSlide,
  toolbarActiveTab,
  setToolbarActiveTab
}) => {
  // expose grid toggle via prop callbacks if parent passes them
  // We'll call onToggleGrid(true/false) when user toggles grid
  // Expect parent (App/Canvas) to wire it up
  // ...existing code...
  
  // activeTab is controlled by App via props
  const activeTab = toolbarActiveTab;
  const setActiveTab = setToolbarActiveTab;
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showTextBgPicker, setShowTextBgPicker] = useState(false);
  const [gridOn, setGridOn] = useState(false);
  const [gridSize, setGridSize] = useState(24);

  const fontFamilies = [
    'Roboto', 'Arial', 'Times New Roman', 'Helvetica', 'Georgia', 
    'Verdana', 'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS',
    'Palatino', 'Garamond', 'Bookman', 'Avant Garde', 'Lucida Console'
  ];

  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72];

  const backgroundThemes = [
    { name: 'White', color: '#ffffff', gradient: null },
    { name: 'Light Blue', color: '#e3f2fd', gradient: null },
    { name: 'Light Green', color: '#e8f5e8', gradient: null },
    { name: 'Light Yellow', color: '#fffde7', gradient: null },
    { name: 'Light Pink', color: '#fce4ec', gradient: null },
    { name: 'Light Purple', color: '#f3e5f5', gradient: null },
    { name: 'Blue Gradient', color: null, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { name: 'Green Gradient', color: null, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { name: 'Orange Gradient', color: null, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { name: 'Purple Gradient', color: null, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { name: 'Dark Theme', color: '#1a1a1a', gradient: null },
    { name: 'Professional', color: '#f8f9fa', gradient: null }
  ];

  const textColors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', 
    '#ff00ff', '#00ffff', '#800000', '#008000', '#000080', '#808000',
    '#800080', '#008080', '#c0c0c0', '#808080', '#ff6b6b', '#4ecdc4',
    '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#f7dc6f'
  ];

  const addTextBox = () => {
    const { x, y } = findNonOverlappingPosition(200, 50);
    onAddElement({
      type: 'text',
      content: 'Click to edit text',
      x,
      y,
      width: 200,
      height: 50,
      fontSize: 16,
      fontFamily: 'Roboto',
      color: '#000000',
      backgroundColor: 'transparent',
      textAlign: 'left',
      fontWeight: 'normal',
      fontStyle: 'normal'
    });
  };

  const addShape = (shapeType) => {
    const shapes = {
      rectangle: {
        type: 'shape',
        shapeType: 'rectangle',
        x: 150,
        y: 150,
        width: 100,
        height: 80,
        fill: '#4285f4',
        stroke: '#1a73e8',
        strokeWidth: 2
      },
      circle: {
        type: 'shape',
        shapeType: 'circle',
        x: 150,
        y: 150,
        width: 100,
        height: 100,
        fill: '#34a853',
        stroke: '#137333',
        strokeWidth: 2
      },
      triangle: {
        type: 'shape',
        shapeType: 'triangle',
        x: 150,
        y: 150,
        width: 100,
        height: 100,
        fill: '#fbbc04',
        stroke: '#f29900',
        strokeWidth: 2
      }
    };
    
    const dims = shapes[shapeType];
    const { x, y } = findNonOverlappingPosition(dims.width, dims.height);
    onAddElement({ ...dims, x, y });
  };

  const addChart = (chartType) => {
    const charts = {
      bar: {
        type: 'chart',
        chartType: 'bar',
        x: 100,
        y: 100,
        width: 300,
        height: 200,
        data: [
          { label: 'Jan', value: 65 },
          { label: 'Feb', value: 59 },
          { label: 'Mar', value: 80 },
          { label: 'Apr', value: 81 },
          { label: 'May', value: 56 }
        ],
        color: '#4285f4'
      },
      pie: {
        type: 'chart',
        chartType: 'pie',
        x: 100,
        y: 100,
        width: 250,
        height: 250,
        data: [
          { label: 'Desktop', value: 45, color: '#4285f4' },
          { label: 'Mobile', value: 35, color: '#34a853' },
          { label: 'Tablet', value: 20, color: '#fbbc04' }
        ]
      },
      line: {
        type: 'chart',
        chartType: 'line',
        x: 100,
        y: 100,
        width: 300,
        height: 200,
        data: [
          { label: 'Q1', value: 20 },
          { label: 'Q2', value: 45 },
          { label: 'Q3', value: 30 },
          { label: 'Q4', value: 70 }
        ],
        color: '#ea4335'
      }
    };
    
    const dims = charts[chartType];
    const { x, y } = findNonOverlappingPosition(dims.width, dims.height);
    onAddElement({ ...dims, x, y });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const { x, y } = findNonOverlappingPosition(200, 150);
        onAddElement({
          type: 'image',
          src: event.target.result,
          x,
          y,
          width: 200,
          height: 150
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const { x, y } = findNonOverlappingPosition(400, 300);
        onAddElement({
          type: 'video',
          src: event.target.result,
          x,
          y,
          width: 400,
          height: 300
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper: find a non-overlapping position for new element on current slide
  const findNonOverlappingPosition = (width, height) => {
    const slide = slides && slides[currentSlideIndex] ? slides[currentSlideIndex] : null;
    const padding = 20;
    const canvasW = 800;
    const canvasH = 600;
    let x = padding;
    let y = padding;

    const overlaps = (r1, r2) => !(r1.x + r1.width <= r2.x || r2.x + r2.width <= r1.x || r1.y + r1.height <= r2.y || r2.y + r2.height <= r1.y);

    const existing = slide ? (slide.elements || []) : [];

    let attempts = 0;
    while (attempts < 1000) {
      const rect = { x, y, width, height };
      const collision = existing.some(e => overlaps(rect, { x: e.x, y: e.y, width: e.width, height: e.height }));
      if (!collision && x + width <= canvasW && y + height <= canvasH) {
        return { x, y };
      }
      x += Math.max(30, Math.round(width / 3));
      if (x + width > canvasW) {
        x = padding;
        y += Math.max(30, Math.round(height / 3));
      }
      if (y + height > canvasH) {
        // fallback: place at random safe spot within canvas
        x = Math.max(padding, Math.min(canvasW - width - padding, Math.floor(Math.random() * (canvasW - width - padding))));
        y = Math.max(padding, Math.min(canvasH - height - padding, Math.floor(Math.random() * (canvasH - height - padding))));
        return { x, y };
      }
      attempts++;
    }

    return { x: padding, y: padding };
  };

  // Dropdown control: open/close on click (no hover), close on outside click
  const [activeDropdown, setActiveDropdown] = useState(null);
  const toolbarRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setActiveDropdown(null);
        setShowColorPicker(false);
        setShowBackgroundPicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const toggleDropdown = (name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const updateSelectedElement = (property, value) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, { [property]: value });
    }
  };

  const deleteSelectedElement = () => {
    if (selectedElement) {
      onDeleteElement(selectedElement.id);
    }
  };

  const increaseFontSize = () => {
    if (selectedElement && selectedElement.type === 'text') {
      const currentSize = selectedElement.fontSize || 16;
      const newSize = Math.min(currentSize + 2, 72);
      updateSelectedElement('fontSize', newSize);
    }
  };

  const decreaseFontSize = () => {
    if (selectedElement && selectedElement.type === 'text') {
      const currentSize = selectedElement.fontSize || 16;
      const newSize = Math.max(currentSize - 2, 8);
      updateSelectedElement('fontSize', newSize);
    }
  };

  const applyBackgroundTheme = (theme) => {
    if (slides && slides[currentSlideIndex]) {
      const updatedSlide = {
        ...slides[currentSlideIndex],
        background: theme.color || theme.gradient,
        theme: theme.name
      };
      onUpdateSlide(currentSlideIndex, updatedSlide);
    }
    setShowBackgroundPicker(false);
  };

  return (
    <div className="toolbar">
      {/* Header controls toolbar tab state now */}

  <div ref={toolbarRef} className="toolbar-content">
        {activeTab === 'insert' && (
          <div className="insert-tools">
            <div className="tool-group">
              <button className="tool-btn" onClick={addTextBox} title="Add text box">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 4h12v2H6V4zM8 8h8v10H8V8z" fill="currentColor"/></svg>
                <span>Text box</span>
              </button>
              
              <div className={`tool-dropdown ${activeDropdown === 'image' ? 'open' : ''}`}>
                <button className="tool-btn dropdown-toggle" title="Insert image" onClick={() => toggleDropdown('image')}>
                  <i className="fas fa-image"></i>
                  <span>Image</span>
                </button>
                <div className="dropdown-content">
                  <label className="dropdown-item">
                    <i className="fas fa-upload"></i>
                    Upload
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => { handleImageUpload(e); setActiveDropdown(null); }}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <div className={`tool-dropdown ${activeDropdown === 'video' ? 'open' : ''}`}>
                <button className="tool-btn dropdown-toggle" title="Insert video" onClick={() => toggleDropdown('video')}>
                  <i className="fas fa-video"></i>
                  <span>Video</span>
                </button>
                <div className="dropdown-content">
                  <label className="dropdown-item">
                    <i className="fas fa-upload"></i>
                    Upload Video
                    <input 
                      type="file" 
                      accept="video/*" 
                      onChange={(e) => { handleVideoUpload(e); setActiveDropdown(null); }}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <div className={`tool-dropdown ${activeDropdown === 'shape' ? 'open' : ''}`}>
                <button className="tool-btn dropdown-toggle" title="Insert shape" onClick={() => toggleDropdown('shape')}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h8v8H3V3zm10 10h8v8h-8v-8z" fill="currentColor"/></svg>
                  <span>Shape</span>
                </button>
                <div className="dropdown-content">
                  <button className="dropdown-item" onClick={() => { addShape('rectangle'); setActiveDropdown(null); }}>
                    <i className="fas fa-square"></i>
                    Rectangle
                  </button>
                  <button className="dropdown-item" onClick={() => { addShape('circle'); setActiveDropdown(null); }}>
                    <i className="fas fa-circle"></i>
                    Circle
                  </button>
                  <button className="dropdown-item" onClick={() => { addShape('triangle'); setActiveDropdown(null); }}>
                    <i className="fas fa-play"></i>
                    Triangle
                  </button>
                </div>
              </div>

              <div className={`tool-dropdown ${activeDropdown === 'chart' ? 'open' : ''}`}>
                <button className="tool-btn dropdown-toggle" title="Insert chart" onClick={() => toggleDropdown('chart')}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20h16v-2H4v2zm3-6h2v6H7v-6zm4-4h2v10h-2V10zm4 2h2v8h-2v-8z" fill="currentColor"/></svg>
                  <span>Chart</span>
                </button>
                <div className="dropdown-content">
                  <button className="dropdown-item" onClick={() => { addChart('bar'); setActiveDropdown(null); }}>
                    <i className="fas fa-chart-bar"></i>
                    Bar Chart
                  </button>
                  <button className="dropdown-item" onClick={() => { addChart('pie'); setActiveDropdown(null); }}>
                    <i className="fas fa-chart-pie"></i>
                    Pie Chart
                  </button>
                  <button className="dropdown-item" onClick={() => { addChart('line'); setActiveDropdown(null); }}>
                    <i className="fas fa-chart-line"></i>
                    Line Chart
                  </button>
                </div>
              </div>
            </div>
            <div className="tool-group">
              {/* Grid controls removed per request */}
            </div>
          </div>
        )}

        {activeTab === 'format' && (
          <div className="format-tools">
            {selectedElement ? (
              <div className="format-controls">
                {selectedElement.type === 'text' && (
                  <>
                    <div className="control-group">
                      <label>Font Family:</label>
                      <select 
                        value={selectedElement.fontFamily || 'Roboto'}
                        onChange={(e) => updateSelectedElement('fontFamily', e.target.value)}
                        className="font-family-select"
                      >
                        {fontFamilies.map(font => (
                          <option key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="control-group">
                      <label>Font Size:</label>
                      <div className="font-size-controls">
                        <button 
                          className="size-btn" 
                          onClick={decreaseFontSize}
                          title="Decrease font size"
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                        <select 
                          value={selectedElement.fontSize || 16}
                          onChange={(e) => updateSelectedElement('fontSize', parseInt(e.target.value))}
                          className="font-size-select"
                        >
                          {fontSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <button 
                          className="size-btn" 
                          onClick={increaseFontSize}
                          title="Increase font size"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>

                    <div className="control-group">
                      <label>Text Color:</label>
                      <div className="color-picker-container">
                        <button 
                          className="color-preview-btn"
                          style={{ backgroundColor: selectedElement.color || '#000000' }}
                          onClick={() => { setShowTextColorPicker(!showTextColorPicker); setShowTextBgPicker(false); setActiveDropdown(null); }}
                        />
                        {showTextColorPicker && (
                          <div className="color-palette">
                            {textColors.map(color => (
                              <button
                                key={color}
                                className="color-option"
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                  updateSelectedElement('color', color);
                                  setShowTextColorPicker(false);
                                }}
                              />
                            ))}
                            <input
                              type="color"
                              value={selectedElement.color || '#000000'}
                              onChange={(e) => updateSelectedElement('color', e.target.value)}
                              className="custom-color-input"
                              title="Custom color"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="control-group">
                      <label>Style:</label>
                      <div className="text-style-controls">
                        <button 
                          className={`format-btn ${selectedElement.fontWeight === 'bold' ? 'active' : ''}`}
                          onClick={() => updateSelectedElement('fontWeight', 
                            selectedElement.fontWeight === 'bold' ? 'normal' : 'bold')}
                          title="Bold"
                        >
                          <i className="fas fa-bold"></i>
                        </button>
                        <button 
                          className={`format-btn ${selectedElement.fontStyle === 'italic' ? 'active' : ''}`}
                          onClick={() => updateSelectedElement('fontStyle', 
                            selectedElement.fontStyle === 'italic' ? 'normal' : 'italic')}
                          title="Italic"
                        >
                          <i className="fas fa-italic"></i>
                        </button>
                        <button 
                          className={`format-btn ${selectedElement.textDecoration === 'underline' ? 'active' : ''}`}
                          onClick={() => updateSelectedElement('textDecoration', 
                            selectedElement.textDecoration === 'underline' ? 'none' : 'underline')}
                          title="Underline"
                        >
                          <i className="fas fa-underline"></i>
                        </button>
                      </div>
                    </div>

                    {/* duplicate Text Color removed; single color picker exists above */}

                    <div className="control-group">
                      <label>Text Background:</label>
                      <div className="color-picker-container">
                        <button 
                          className="color-preview-btn"
                          style={{ backgroundColor: selectedElement.backgroundColor === 'transparent' ? '#ffffff' : (selectedElement.backgroundColor || 'transparent') }}
                          onClick={() => { setShowTextBgPicker(!showTextBgPicker); setShowTextColorPicker(false); setActiveDropdown(null); }}
                        />
                        {showTextBgPicker && (
                          <div className="color-palette">
                            <button
                              className="color-option transparent"
                              onClick={() => {
                                updateSelectedElement('backgroundColor', 'transparent');
                                setShowTextBgPicker(false);
                              }}
                              title="Transparent"
                            >
                              <i className="fas fa-ban"></i>
                            </button>
                            {textColors.map(color => (
                              <button
                                key={color}
                                className="color-option"
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                  updateSelectedElement('backgroundColor', color);
                                  setShowTextBgPicker(false);
                                }}
                              />
                            ))}
                            <input
                              type="color"
                              value={selectedElement.backgroundColor === 'transparent' ? '#ffffff' : (selectedElement.backgroundColor || '#ffffff')}
                              onChange={(e) => updateSelectedElement('backgroundColor', e.target.value)}
                              className="custom-color-input"
                              title="Custom color"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="control-group">
                      <label>Size:</label>
                      <div className="size-controls">
                        <button 
                          className="format-btn"
                          onClick={() => {
                            const newWidth = (selectedElement.width || 200) * 1.1;
                            const newHeight = (selectedElement.height || 50) * 1.1;
                            onUpdateElement(selectedElement.id, { width: newWidth, height: newHeight });
                          }}
                          title="Increase size"
                        >
                          <i className="fas fa-search-plus"></i>
                        </button>
                        <button 
                          className="format-btn"
                          onClick={() => {
                            const newWidth = (selectedElement.width || 200) * 0.9;
                            const newHeight = (selectedElement.height || 50) * 0.9;
                            onUpdateElement(selectedElement.id, { width: newWidth, height: newHeight });
                          }}
                          title="Decrease size"
                        >
                          <i className="fas fa-search-minus"></i>
                        </button>
                      </div>
                    </div>

                    <div className="control-group">
                      <label>Alignment:</label>
                      <div className="alignment-controls">
                        <button 
                          className={`format-btn ${selectedElement.textAlign === 'left' ? 'active' : ''}`}
                          onClick={() => updateSelectedElement('textAlign', 'left')}
                          title="Align left"
                        >
                          <i className="fas fa-align-left"></i>
                        </button>
                        <button 
                          className={`format-btn ${selectedElement.textAlign === 'center' ? 'active' : ''}`}
                          onClick={() => updateSelectedElement('textAlign', 'center')}
                          title="Align center"
                        >
                          <i className="fas fa-align-center"></i>
                        </button>
                        <button 
                          className={`format-btn ${selectedElement.textAlign === 'right' ? 'active' : ''}`}
                          onClick={() => updateSelectedElement('textAlign', 'right')}
                          title="Align right"
                        >
                          <i className="fas fa-align-right"></i>
                        </button>
                        <button 
                          className={`format-btn ${selectedElement.textAlign === 'justify' ? 'active' : ''}`}
                          onClick={() => updateSelectedElement('textAlign', 'justify')}
                          title="Justify"
                        >
                          <i className="fas fa-align-justify"></i>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {selectedElement.type === 'shape' && (
                  <>
                    <div className="control-group">
                      <label>Fill Color:</label>
                      <input 
                        type="color" 
                        value={selectedElement.fill || '#4285f4'}
                        onChange={(e) => updateSelectedElement('fill', e.target.value)}
                        className="color-input"
                      />
                    </div>

                    <div className="control-group">
                      <label>Border Color:</label>
                      <input 
                        type="color" 
                        value={selectedElement.stroke || '#1a73e8'}
                        onChange={(e) => updateSelectedElement('stroke', e.target.value)}
                        className="color-input"
                      />
                    </div>

                    <div className="control-group">
                      <label>Border Width:</label>
                      <input 
                        type="range" 
                        min="0"
                        max="10"
                        value={selectedElement.strokeWidth || 2}
                        onChange={(e) => updateSelectedElement('strokeWidth', parseInt(e.target.value))}
                        className="range-input"
                      />
                      <span className="range-value">{selectedElement.strokeWidth || 2}px</span>
                    </div>

                    <div className="control-group">
                      <label>Size:</label>
                      <div className="size-controls">
                        <button 
                          className="format-btn"
                          onClick={() => {
                            const newWidth = (selectedElement.width || 100) * 1.1;
                            const newHeight = (selectedElement.height || 100) * 1.1;
                            onUpdateElement(selectedElement.id, { width: newWidth, height: newHeight });
                          }}
                          title="Increase size"
                        >
                          <i className="fas fa-search-plus"></i>
                        </button>
                        <button 
                          className="format-btn"
                          onClick={() => {
                            const newWidth = (selectedElement.width || 100) * 0.9;
                            const newHeight = (selectedElement.height || 100) * 0.9;
                            onUpdateElement(selectedElement.id, { width: newWidth, height: newHeight });
                          }}
                          title="Decrease size"
                        >
                          <i className="fas fa-search-minus"></i>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {(selectedElement.type === 'image' || selectedElement.type === 'video' || selectedElement.type === 'chart') && (
                  <>
                    <div className="control-group">
                      <label>Size:</label>
                      <div className="size-controls">
                        <button 
                          className="format-btn"
                          onClick={() => {
                            const newWidth = (selectedElement.width || 200) * 1.1;
                            const newHeight = (selectedElement.height || 150) * 1.1;
                            onUpdateElement(selectedElement.id, { width: newWidth, height: newHeight });
                          }}
                          title="Increase size"
                        >
                          <i className="fas fa-search-plus"></i>
                        </button>
                        <button 
                          className="format-btn"
                          onClick={() => {
                            const newWidth = (selectedElement.width || 200) * 0.9;
                            const newHeight = (selectedElement.height || 150) * 0.9;
                            onUpdateElement(selectedElement.id, { width: newWidth, height: newHeight });
                          }}
                          title="Decrease size"
                        >
                          <i className="fas fa-search-minus"></i>
                        </button>
                      </div>
                    </div>

                    <div className="control-group">
                      <label>Dimensions:</label>
                      <div className="dimension-controls">
                        <div className="dimension-input-group">
                          <label>W:</label>
                          <input 
                            type="number" 
                            value={Math.round(selectedElement.width || 200)}
                            onChange={(e) => updateSelectedElement('width', parseInt(e.target.value) || 50)}
                            className="dimension-input"
                            min="50"
                            max="800"
                          />
                        </div>
                        <div className="dimension-input-group">
                          <label>H:</label>
                          <input 
                            type="number" 
                            value={Math.round(selectedElement.height || 150)}
                            onChange={(e) => updateSelectedElement('height', parseInt(e.target.value) || 30)}
                            className="dimension-input"
                            min="30"
                            max="600"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="control-group">
                  <button className="delete-btn" onClick={deleteSelectedElement}>
                    <i className="fas fa-trash"></i>
                    Delete Element
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <i className="fas fa-mouse-pointer"></i>
                <span>Select an element to format</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'design' && (
          <div className="design-tools">
            <div className="control-group">
              <label>Background Themes:</label>
              <button 
                className="background-picker-btn"
                onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
              >
                <i className="fas fa-palette"></i>
                Choose Theme
              </button>
              {showBackgroundPicker && (
                <div className="background-themes">
                  {backgroundThemes.map(theme => (
                    <button
                      key={theme.name}
                      className="theme-option"
                      style={{ 
                        background: theme.color || theme.gradient,
                        border: slides[currentSlideIndex]?.theme === theme.name ? '3px solid #1a73e8' : '1px solid #e0e0e0'
                      }}
                      onClick={() => applyBackgroundTheme(theme)}
                      title={theme.name}
                    >
                      <span className="theme-name">{theme.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="control-group">
              <label>Custom Background Color:</label>
              <div className="custom-bg-controls">
                <input 
                  type="color" 
                  value={slides[currentSlideIndex]?.background || '#ffffff'}
                  onChange={(e) => {
                    const updatedSlide = {
                      ...slides[currentSlideIndex],
                      background: e.target.value,
                      backgroundImage: null,
                      theme: 'custom'
                    };
                    onUpdateSlide(currentSlideIndex, updatedSlide);
                  }}
                  className="color-input-large"
                />
                <span className="color-value">{slides[currentSlideIndex]?.background || '#ffffff'}</span>
              </div>
            </div>

            <div className="control-group">
              <label>Background Image:</label>
              <div className="bg-image-controls">
                <label className="upload-bg-btn">
                  <i className="fas fa-image"></i>
                  Upload Image
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const updatedSlide = {
                            ...slides[currentSlideIndex],
                            backgroundImage: event.target.result,
                            theme: 'custom'
                          };
                          onUpdateSlide(currentSlideIndex, updatedSlide);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
                {slides[currentSlideIndex]?.backgroundImage && (
                  <button 
                    className="remove-bg-btn"
                    onClick={() => {
                      const updatedSlide = {
                        ...slides[currentSlideIndex],
                        backgroundImage: null
                      };
                      onUpdateSlide(currentSlideIndex, updatedSlide);
                    }}
                  >
                    <i className="fas fa-times"></i>
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="control-group">
              <label>Quick Colors:</label>
              <div className="quick-colors">
                {textColors.slice(0, 12).map(color => (
                  <button
                    key={color}
                    className="quick-color-btn"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      const updatedSlide = {
                        ...slides[currentSlideIndex],
                        background: color,
                        backgroundImage: null,
                        theme: 'custom'
                      };
                      onUpdateSlide(currentSlideIndex, updatedSlide);
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
