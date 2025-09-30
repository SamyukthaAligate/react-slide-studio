import React, { useState, useRef, useEffect } from 'react';
import './Header.css';

const Header = ({ 
  onStartPresentation, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo,
  presentationTitle,
  onTitleChange,
  onSave,
  onNew,
  onOpen,
  onDelete,
  onDownloadPDF,
  savedPresentations,
  onAddElement,
  onShowHelp,
  onShowShare,
  onShowChartModal
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleTitleInputChange = (e) => {
    onTitleChange(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
  };

  const handleTitleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    }
  };

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuAction = (action) => {
    setActiveMenu(null);
    action();
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
              onChange={handleTitleInputChange}
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
      
      <div className="header-center" ref={menuRef}>
        <div className="menu-items">
          {/* File Menu */}
          <div className="menu-dropdown">
            <button 
              className={`menu-item ${activeMenu === 'file' ? 'active' : ''}`}
              onClick={() => toggleMenu('file')}
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => handleMenuAction(onNew)}>
                  <i className="fas fa-file"></i>
                  New Presentation
                  <span className="shortcut">Ctrl+N</span>
                </button>
                <button className="dropdown-item" onClick={() => handleMenuAction(onSave)}>
                  <i className="fas fa-save"></i>
                  Save
                  <span className="shortcut">Ctrl+S</span>
                </button>
                <div className="dropdown-divider"></div>
                <div className="dropdown-submenu">
                  <button className="dropdown-item">
                    <i className="fas fa-folder-open"></i>
                    Open Recent
                    <i className="fas fa-chevron-right"></i>
                  </button>
                  <div className="submenu-content">
                    {savedPresentations && savedPresentations.length > 0 ? (
                      savedPresentations.map((ppt, index) => (
                        <div key={index} className="submenu-item-wrapper">
                          <button 
                            className="dropdown-item"
                            onClick={() => handleMenuAction(() => onOpen(ppt.id))}
                          >
                            <i className="fas fa-file-powerpoint"></i>
                            {ppt.title}
                            <span className="file-date">{new Date(ppt.lastModified).toLocaleDateString()}</span>
                          </button>
                          <button
                            className="delete-file-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuAction(() => onDelete(ppt.id));
                            }}
                            title="Delete presentation"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="dropdown-item disabled">No saved presentations</div>
                    )}
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => handleMenuAction(onDownloadPDF)}>
                  <i className="fas fa-download"></i>
                  Download as PDF
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="menu-dropdown">
            <button 
              className={`menu-item ${activeMenu === 'edit' ? 'active' : ''}`}
              onClick={() => toggleMenu('edit')}
            >
              Edit
            </button>
            {activeMenu === 'edit' && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => handleMenuAction(onUndo)} disabled={!canUndo}>
                  <i className="fas fa-undo"></i>
                  Undo
                  <span className="shortcut">Ctrl+Z</span>
                </button>
                <button className="dropdown-item" onClick={() => handleMenuAction(onRedo)} disabled={!canRedo}>
                  <i className="fas fa-redo"></i>
                  Redo
                  <span className="shortcut">Ctrl+Y</span>
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">
                  <i className="fas fa-cut"></i>
                  Cut
                  <span className="shortcut">Ctrl+X</span>
                </button>
                <button className="dropdown-item">
                  <i className="fas fa-copy"></i>
                  Copy
                  <span className="shortcut">Ctrl+C</span>
                </button>
                <button className="dropdown-item">
                  <i className="fas fa-paste"></i>
                  Paste
                  <span className="shortcut">Ctrl+V</span>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="menu-dropdown">
            <button 
              className={`menu-item ${activeMenu === 'view' ? 'active' : ''}`}
              onClick={() => toggleMenu('view')}
            >
              View
            </button>
            {activeMenu === 'view' && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => handleMenuAction(onStartPresentation)}>
                  <i className="fas fa-play"></i>
                  Start Presentation
                  <span className="shortcut">F5</span>
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">
                  <i className="fas fa-search-plus"></i>
                  Zoom In
                  <span className="shortcut">Ctrl++</span>
                </button>
                <button className="dropdown-item">
                  <i className="fas fa-search-minus"></i>
                  Zoom Out
                  <span className="shortcut">Ctrl+-</span>
                </button>
                <button className="dropdown-item">
                  <i className="fas fa-expand"></i>
                  Fit to Screen
                </button>
              </div>
            )}
          </div>

          {/* Insert Menu */}
          <div className="menu-dropdown">
            <button 
              className={`menu-item ${activeMenu === 'insert' ? 'active' : ''}`}
              onClick={() => toggleMenu('insert')}
            >
              Insert
            </button>
            {activeMenu === 'insert' && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => handleMenuAction(() => onAddElement('text'))}>
                  <i className="fas fa-font"></i>
                  Text Box
                </button>
                <button className="dropdown-item" onClick={() => handleMenuAction(() => onAddElement('image'))}>
                  <i className="fas fa-image"></i>
                  Image
                </button>
                <button className="dropdown-item" onClick={() => handleMenuAction(() => onAddElement('video'))}>
                  <i className="fas fa-video"></i>
                  Video
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => handleMenuAction(() => onAddElement('shape'))}>
                  <i className="fas fa-shapes"></i>
                  Shape
                </button>
                <button className="dropdown-item" onClick={() => handleMenuAction(onShowChartModal)}>
                  <i className="fas fa-chart-bar"></i>
                  Custom Chart
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">
                  <i className="fas fa-table"></i>
                  Table
                </button>
                <button className="dropdown-item">
                  <i className="fas fa-link"></i>
                  Link
                </button>
              </div>
            )}
          </div>

          {/* Format Menu */}
          <div className="menu-dropdown">
            <button 
              className={`menu-item ${activeMenu === 'format' ? 'active' : ''}`}
              onClick={() => toggleMenu('format')}
            >
              Format
            </button>
            {activeMenu === 'format' && (
              <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                <button className="dropdown-item" onClick={() => handleMenuAction(() => console.log('Bold'))}>
                  <i className="fas fa-bold"></i>
                  Bold
                  <span className="shortcut">Ctrl+B</span>
                </button>
                <button className="dropdown-item" onClick={() => handleMenuAction(() => console.log('Italic'))}>
                  <i className="fas fa-italic"></i>
                  Italic
                  <span className="shortcut">Ctrl+I</span>
                </button>
                <button className="dropdown-item" onClick={() => handleMenuAction(() => console.log('Underline'))}>
                  <i className="fas fa-underline"></i>
                  Underline
                  <span className="shortcut">Ctrl+U</span>
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => handleMenuAction(() => console.log('Align Left'))}>
                  <i className="fas fa-align-left"></i>
                  Align Left
                </button>
                <button className="dropdown-item" onClick={() => handleMenuAction(() => console.log('Align Center'))}>
                  <i className="fas fa-align-center"></i>
                  Align Center
                </button>
                <button className="dropdown-item" onClick={() => handleMenuAction(() => console.log('Align Right'))}>
                  <i className="fas fa-align-right"></i>
                  Align Right
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => handleMenuAction(() => console.log('Text Color'))}>
                  <i className="fas fa-palette"></i>
                  Text Color
                </button>
                <button className="dropdown-item" onClick={() => handleMenuAction(() => console.log('Background Color'))}>
                  <i className="fas fa-fill-drip"></i>
                  Background Color
                </button>
              </div>
            )}
          </div>

          {/* Tools Menu */}
          <div className="menu-dropdown">
            <button 
              className={`menu-item ${activeMenu === 'tools' ? 'active' : ''}`}
              onClick={() => toggleMenu('tools')}
            >
              Tools
            </button>
            {activeMenu === 'tools' && (
              <div className="dropdown-menu">
                <button className="dropdown-item">
                  <i className="fas fa-spell-check"></i>
                  Spell Check
                </button>
                <button className="dropdown-item">
                  <i className="fas fa-ruler"></i>
                  Ruler & Guides
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">
                  <i className="fas fa-layer-group"></i>
                  Arrange Objects
                </button>
                <button className="dropdown-item">
                  <i className="fas fa-object-group"></i>
                  Group Elements
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">
                  <i className="fas fa-cog"></i>
                  Settings
                </button>
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div className="menu-dropdown">
            <button 
              className={`menu-item ${activeMenu === 'help' ? 'active' : ''}`}
              onClick={() => toggleMenu('help')}
            >
              Help
            </button>
            {activeMenu === 'help' && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => handleMenuAction(onShowHelp)}>
                  <i className="fas fa-question-circle"></i>
                  User Guide
                </button>
                <button className="dropdown-item" onClick={() => handleMenuAction(onShowHelp)}>
                  <i className="fas fa-keyboard"></i>
                  Keyboard Shortcuts
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">
                  <i className="fas fa-lightbulb"></i>
                  Tips & Tricks
                </button>
                <button className="dropdown-item">
                  <i className="fas fa-video"></i>
                  Video Tutorials
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item">
                  <i className="fas fa-info-circle"></i>
                  About Slide Studio
                </button>
              </div>
            )}
          </div>
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
        <button className="share-btn" onClick={onShowShare}>
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
