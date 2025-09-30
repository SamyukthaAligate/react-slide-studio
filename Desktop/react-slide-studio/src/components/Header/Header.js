import React, { useState } from 'react';
import './Header.css';

const Header = ({ onStartPresentation, onUndo, onRedo, canUndo, canRedo }) => {
  const [presentationTitle, setPresentationTitle] = useState('Untitled Presentation');
  const [isEditing, setIsEditing] = useState(false);

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleTitleChange = (e) => {
    setPresentationTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
  };

  const handleTitleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <i className="fas fa-presentation"></i>
          <span>Slide Studio</span>
        </div>
        <div className="title-section">
          {isEditing ? (
            <input
              type="text"
              value={presentationTitle}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyPress={handleTitleKeyPress}
              className="title-input"
              autoFocus
            />
          ) : (
            <h1 className="presentation-title" onClick={handleTitleClick}>
              {presentationTitle}
            </h1>
          )}
        </div>
      </div>
      
      <div className="header-center">
        <div className="menu-items">
          <button className="menu-item">File</button>
          <button className="menu-item">Edit</button>
          <button className="menu-item">View</button>
          <button className="menu-item">Insert</button>
          <button className="menu-item">Format</button>
          <button className="menu-item">Tools</button>
          <button className="menu-item">Help</button>
        </div>
        <div className="undo-redo-controls">
          <button 
            className={`undo-btn ${!canUndo ? 'disabled' : ''}`}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <i className="fas fa-undo"></i>
          </button>
          <button 
            className={`redo-btn ${!canRedo ? 'disabled' : ''}`}
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <i className="fas fa-redo"></i>
          </button>
        </div>
      </div>

      <div className="header-right">
        <button className="share-btn">
          <i className="fas fa-share-alt"></i>
          Share
        </button>
        <button className="present-btn" onClick={onStartPresentation}>
          <i className="fas fa-play"></i>
          Present
        </button>
        <div className="user-avatar">
          <i className="fas fa-user-circle"></i>
        </div>
      </div>
    </header>
  );
};

export default Header;
