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
  onShowChartModal,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  zoomLevel,
  onSpellCheck,
  onToggleRulers,
  onArrangeObjects,
  onGroupElements,
  onShowSettings,
  showRulers
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActiveMenu(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuAction = (action) => {
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
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
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
        <div className={`menu-items ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
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
                <button className="dropdown-item" onClick={() => handleMenuAction(() => console.log('Cut'))}>
                  <i className="fas fa-cut"></i>
                  Cut
                  <span className="shortcut">Ctrl+X</span>
                </button>
                <button className="dropdown-item" onClick={() => handleMenuAction(() => console.log('Copy'))}>
                  <i className="fas fa-copy"></i>
                  Copy
                  <span className="shortcut">Ctrl+C</span>
                </button>
                <button className="dropdown-item" onClick={() => handleMenuAction(() => console.log('Paste'))}>
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
                <button className="dropdown-item" onClick={() => handleMenuAction(onZoomIn)}>
                  <i className="fas fa-search-plus"></i>
                  Zoom In
                  <span className="shortcut">Ctrl++</span>
                </button>
                <button className="dropdown-item" onClick={() => handleMenuAction(onZoomOut)}>
                  <i className="fas fa-search-minus"></i>
                  Zoom Out
                  <span className="shortcut">Ctrl+-</span>
                </button>
                <button className="dropdown-item" onClick={() => handleMenuAction(onFitToScreen)}>
                  <i className="fas fa-expand"></i>
                  Fit to Screen
                </button>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item zoom-level-display">
                  <i className="fas fa-percentage"></i>
                  Zoom: {zoomLevel}%
                </div>
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
                <button className="dropdown-item" onClick={() => handleMenuAction(() => console.log('Insert Table'))}>
                  <i className="fas fa-table"></i>
                  Table
                </button>
                <button className="dropdown-item" onClick={() => handleMenuAction(() => console.log('Insert Link'))}>
                  <i className="fas fa-link"></i>
                  Link
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
                <button className="dropdown-item" onClick={() => handleMenuAction(onSpellCheck)}>
                  <i className="fas fa-spell-check"></i>
                  Spell Check
                </button>
                <button className="dropdown-item" onClick={() => handleMenuAction(onToggleRulers)}>
                  <i className="fas fa-ruler"></i>
                  Ruler & Guides
                  {showRulers && <i className="fas fa-check" style={{ marginLeft: 'auto', color: '#34a853' }}></i>}
                </button>
                <div className="dropdown-divider"></div>
                <div className="dropdown-submenu">
                  <button className="dropdown-item">
                    <i className="fas fa-layer-group"></i>
                    Arrange Objects
                    <i className="fas fa-chevron-right"></i>
                  </button>
                  <div className="submenu-content arrange-submenu">
                    <button className="dropdown-item" onClick={() => handleMenuAction(() => onArrangeObjects('bring-to-front'))}>
                      <i className="fas fa-arrow-up"></i>
                      Bring to Front
                    </button>
                    <button className="dropdown-item" onClick={() => handleMenuAction(() => onArrangeObjects('bring-forward'))}>
                      <i className="fas fa-chevron-up"></i>
                      Bring Forward
                    </button>
                    <button className="dropdown-item" onClick={() => handleMenuAction(() => onArrangeObjects('send-backward'))}>
                      <i className="fas fa-chevron-down"></i>
                      Send Backward
                    </button>
                    <button className="dropdown-item" onClick={() => handleMenuAction(() => onArrangeObjects('send-to-back'))}>
                      <i className="fas fa-arrow-down"></i>
                      Send to Back
                    </button>
                  </div>
                </div>
                <button className="dropdown-item" onClick={() => handleMenuAction(onGroupElements)}>
                  <i className="fas fa-object-group"></i>
                  Group Elements
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => handleMenuAction(onShowSettings)}>
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
                <button className="dropdown-item" onClick={() => handleMenuAction(onShowHelp)}>
                  <i className="fas fa-lightbulb"></i>
                  Tips & Tricks
                </button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={() => handleMenuAction(() => console.log('About Slide Studio'))}>
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
