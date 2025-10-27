import React, { useState } from 'react';
import './SlidePanel.css';

const SlidePanel = ({ 
  slides, 
  currentSlideIndex, 
  onSlideSelect, 
  onAddSlide, 
  onDeleteSlide, 
  onDuplicateSlide,
  onReorderSlides
}) => {
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, slideIndex: null });
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleSlideClick = (index) => {
    onSlideSelect(index);
  };

  const handleRightClick = (e, index) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      slideIndex: index
    });
  };

  const handleContextMenuAction = (action) => {
    const { slideIndex } = contextMenu;
    
    switch (action) {
      case 'duplicate':
        onDuplicateSlide(slideIndex);
        break;
      case 'delete':
        if (slides.length > 1) {
          onDeleteSlide(slideIndex);
        }
        break;
      default:
        break;
    }
    
    setContextMenu({ show: false, x: 0, y: 0, slideIndex: null });
  };

  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, slideIndex: null });
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    setDragOverIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = (index) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const sourceData = e.dataTransfer.getData('text/plain');
    const sourceIndex = draggedIndex ?? (sourceData ? parseInt(sourceData, 10) : null);
    if (sourceIndex === null || Number.isNaN(sourceIndex) || sourceIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    if (typeof onReorderSlides === 'function') {
      onReorderSlides(sourceIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const renderSlidePreview = (slide) => {
    return (
      <div className="slide-preview-content">
        {slide.elements.map((element) => {
          const style = {
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
                  ...style,
                  fontSize: `${element.fontSize * 0.3}px`,
                  fontFamily: element.fontFamily,
                  color: element.color,
                  fontWeight: element.fontWeight,
                  fontStyle: element.fontStyle,
                  textAlign: element.textAlign,
                  backgroundColor: element.backgroundColor,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
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
                    ...style,
                    backgroundColor: element.fill,
                    border: `${element.strokeWidth * 0.3}px solid ${element.stroke}`,
                  }}
                />
              );
            }

            if (element.shapeType === 'circle') {
              return (
                <div
                  key={element.id}
                  style={{
                    ...style,
                    backgroundColor: element.fill,
                    border: `${element.strokeWidth * 0.3}px solid ${element.stroke}`,
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
                    ...style,
                    width: 0,
                    height: 0,
                    borderLeft: `${(element.width / 800) * 50}% solid transparent`,
                    borderRight: `${(element.width / 800) * 50}% solid transparent`,
                    borderBottom: `${(element.height / 600) * 100}% solid ${element.fill}`,
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
                  ...style,
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
                  ...style,
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '6px',
                  color: '#666'
                }}
              >
                📊
              </div>
            );
          }

          return null;
        })}
      </div>
    );
  };

  return (
    <>
      <div className="slide-panel">
        <div className="slide-panel-header">
          <div className="header-info">
            <h3>Slides</h3>
            <span className="slide-count">{slides.length} {slides.length === 1 ? 'slide' : 'slides'}</span>
          </div>
          <button className="add-slide-btn" onClick={onAddSlide} title="Add slide">
            <i className="fas fa-plus"></i>
          </button>
        </div>
        
        <div className="slides-container">
          {slides.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="fas fa-images"></i>
              </div>
              <p className="empty-state-text">No slides yet</p>
              <span className="empty-state-subtext">Click the + button to add your first slide</span>
            </div>
          ) : (
            slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`slide-thumbnail ${index === currentSlideIndex ? 'active' : ''} ${dragOverIndex === index && draggedIndex !== null && draggedIndex !== index ? 'drag-over' : ''} ${draggedIndex === index ? 'dragging' : ''}`}
                onClick={() => handleSlideClick(index)}
                onContextMenu={(e) => handleRightClick(e, index)}
                draggable={slides.length > 1}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={() => handleDragLeave(index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="slide-number">{index + 1}</div>
                <div 
                  className="slide-preview"
                  style={{
                    backgroundColor: slide.background,
                    backgroundImage: slide.backgroundImage
                      ? `url(${slide.backgroundImage})`
                      : (slide.backgroundGradient || 'none'),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {slide.elements.length === 0 ? (
                    <div className="slide-empty-indicator">
                      <i className="fas fa-plus"></i>
                      <span>Empty slide</span>
                    </div>
                  ) : (
                    renderSlidePreview(slide)
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {contextMenu.show && (
        <>
          <div className="context-menu-overlay" onClick={closeContextMenu} />
          <div 
            className="context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button 
              className="context-menu-item"
              onClick={() => handleContextMenuAction('duplicate')}
            >
              <i className="fas fa-copy"></i>
              Duplicate slide
            </button>
            {slides.length > 1 && (
              <button 
                className="context-menu-item"
                onClick={() => handleContextMenuAction('delete')}
              >
                <i className="fas fa-trash"></i>
                Delete slide
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default SlidePanel;
