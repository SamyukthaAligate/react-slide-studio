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
  showRulers,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  // refs for each dropdown container so we only measure alignment when menu opens
  const menuRefs = useRef({ file: null, insert: null, format: null, design: null, view: null });

  const handleTitleClick = () => setIsEditing(true);
  const handleTitleInputChange = (e) => onTitleChange && onTitleChange(e.target.value);
  const handleTitleBlur = () => setIsEditing(false);
  const handleTitleKeyPress = (e) => { if (e.key === 'Enter') setIsEditing(false); };

  const toggleMenu = (menuName) => setActiveMenu(activeMenu === menuName ? null : menuName);
  const toggleMobileMenu = () => { setIsMobileMenuOpen(!isMobileMenuOpen); setActiveMenu(null); };
  const [alignments, setAlignments] = useState({}); // { menuName: 'left'|'right' }

  // compute dropdown alignment to avoid overflow
  const measureAndSetAlignment = (menuName, menuButton) => {
    if (!menuButton) return;
    const rect = menuButton.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const dropdownWidth = 320; // safe estimate
    const spaceRight = viewportWidth - rect.left;
    const alignRight = spaceRight < dropdownWidth;
    const newAlign = alignRight ? 'right' : 'left';
    // avoid updating state if alignment did not change (prevents re-renders)
    setAlignments(prev => {
      if (prev[menuName] === newAlign) return prev;
      return { ...prev, [menuName]: newAlign };
    });
  };

  // When a menu is opened, measure its alignment once. Also re-measure on window resize.
  useEffect(() => {
    if (!activeMenu) return;
    const menuContainer = menuRefs.current[activeMenu];
    const menuButton = menuContainer ? menuContainer.querySelector('.menu-item') : null;
    measureAndSetAlignment(activeMenu, menuButton);

    const onResize = () => measureAndSetAlignment(activeMenu, menuButton);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [activeMenu]);

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
    if (typeof action === 'function') action();
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
          <div className="menu-dropdown" ref={el => { menuRefs.current.file = el; }}>
            <button
              className={`menu-item ${activeMenu === 'file' ? 'active' : ''}`}
              onClick={() => toggleMenu('file')}
            >
              File
            </button>
            {activeMenu === 'file' && (
              <div className={`dropdown-menu ${alignments.file === 'right' ? 'align-right' : ''}`}>
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
                            onClick={() => handleMenuAction(() => onOpen && onOpen(ppt.id))}
                          >
                            <i className="fas fa-file-powerpoint"></i>
                            {ppt.title}
                            <span className="file-date">{new Date(ppt.lastModified).toLocaleDateString()}</span>
                          </button>
                          <button
                            className="delete-file-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuAction(() => onDelete && onDelete(ppt.id));
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

          {/* Insert/Format/Design menus removed per request */}

          {/* View Menu */}
          <div className="menu-dropdown" ref={el => { menuRefs.current.view = el; }}>
            <button
              className={`menu-item ${activeMenu === 'view' ? 'active' : ''}`}
              onClick={() => toggleMenu('view')}
            >
              View
            </button>
            {activeMenu === 'view' && (
              <div className={`dropdown-menu ${alignments.view === 'right' ? 'align-right' : ''}`}>
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

          {/* duplicate Insert menu removed (handled earlier above) */}
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
