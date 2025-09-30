import React, { useState } from 'react';
import './Toolbar.css';

const Toolbar = ({ 
  onAddElement, 
  selectedElement, 
  onUpdateElement, 
  onDeleteElement, 
  slides, 
  currentSlideIndex, 
  onUpdateSlide 
}) => {
  const [activeTab, setActiveTab] = useState('insert');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

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
    onAddElement({
      type: 'text',
      content: 'Click to edit text',
      x: 100,
      y: 100,
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
    
    onAddElement(shapes[shapeType]);
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
    
    onAddElement(charts[chartType]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onAddElement({
          type: 'image',
          src: event.target.result,
          x: 100,
          y: 100,
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
        onAddElement({
          type: 'video',
          src: event.target.result,
          x: 100,
          y: 100,
          width: 400,
          height: 300
        });
      };
      reader.readAsDataURL(file);
    }
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
      <div className="toolbar-tabs">
        <button 
          className={`tab ${activeTab === 'insert' ? 'active' : ''}`}
          onClick={() => setActiveTab('insert')}
        >
          Insert
        </button>
        <button 
          className={`tab ${activeTab === 'format' ? 'active' : ''}`}
          onClick={() => setActiveTab('format')}
        >
          Format
        </button>
        <button 
          className={`tab ${activeTab === 'design' ? 'active' : ''}`}
          onClick={() => setActiveTab('design')}
        >
          Design
        </button>
      </div>

      <div className="toolbar-content">
        {activeTab === 'insert' && (
          <div className="insert-tools">
            <div className="tool-group">
              <button className="tool-btn" onClick={addTextBox} title="Add text box">
                <i className="fas fa-font"></i>
                <span>Text box</span>
              </button>
              
              <div className="tool-dropdown">
                <button className="tool-btn dropdown-toggle" title="Insert image">
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
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <div className="tool-dropdown">
                <button className="tool-btn dropdown-toggle" title="Insert video">
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
                      onChange={handleVideoUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              <div className="tool-dropdown">
                <button className="tool-btn dropdown-toggle" title="Insert shape">
                  <i className="fas fa-shapes"></i>
                  <span>Shape</span>
                </button>
                <div className="dropdown-content">
                  <button className="dropdown-item" onClick={() => addShape('rectangle')}>
                    <i className="fas fa-square"></i>
                    Rectangle
                  </button>
                  <button className="dropdown-item" onClick={() => addShape('circle')}>
                    <i className="fas fa-circle"></i>
                    Circle
                  </button>
                  <button className="dropdown-item" onClick={() => addShape('triangle')}>
                    <i className="fas fa-play"></i>
                    Triangle
                  </button>
                </div>
              </div>

              <div className="tool-dropdown">
                <button className="tool-btn dropdown-toggle" title="Insert chart">
                  <i className="fas fa-chart-bar"></i>
                  <span>Chart</span>
                </button>
                <div className="dropdown-content">
                  <button className="dropdown-item" onClick={() => addChart('bar')}>
                    <i className="fas fa-chart-bar"></i>
                    Bar Chart
                  </button>
                  <button className="dropdown-item" onClick={() => addChart('pie')}>
                    <i className="fas fa-chart-pie"></i>
                    Pie Chart
                  </button>
                  <button className="dropdown-item" onClick={() => addChart('line')}>
                    <i className="fas fa-chart-line"></i>
                    Line Chart
                  </button>
                </div>
              </div>
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

                    <div className="control-group">
                      <label>Text Color:</label>
                      <div className="color-picker-container">
                        <button 
                          className="color-preview-btn"
                          style={{ backgroundColor: selectedElement.color || '#000000' }}
                          onClick={() => setShowColorPicker(!showColorPicker)}
                        />
                        {showColorPicker && (
                          <div className="color-palette">
                            {textColors.map(color => (
                              <button
                                key={color}
                                className="color-option"
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                  updateSelectedElement('color', color);
                                  setShowColorPicker(false);
                                }}
                              />
                            ))}
                          </div>
                        )}
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
              <label>Slide Background:</label>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
