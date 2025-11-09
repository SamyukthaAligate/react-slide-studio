import React, { useState, useRef, useEffect } from "react";
import "./Header.css";

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
  onExportPPTX,
  onImport,
  onMakeCopy,
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
  toolbarActiveTab,
  setToolbarActiveTab,
  savedPresentations,
  slideCount,
  currentSlideIndex,
  onAddSlide,
  onAddEmptySlide,
  onDeleteCurrentSlide,
  onDeletePreviousSlide,
  onMoveSlideUp,
  onMoveSlideDown,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [fileSubmenusOpen, setFileSubmenusOpen] = useState({ recent: false });
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("idle");
  const menuRef = useRef(null);
  const shareMenuRef = useRef(null);
  // refs for each dropdown container so we only measure alignment when menu opens
  const menuRefs = useRef({
    file: null,
    insert: null,
    format: null,
    design: null,
    view: null,
    slides: null,
  });
  const shareUrl = React.useMemo(() => window.location.href, []);

  const sortedSavedPresentations = React.useMemo(() => {
    if (!savedPresentations || savedPresentations.length === 0) return [];
    return [...savedPresentations].sort((a, b) => {
      const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return dateB - dateA;
    });
  }, [savedPresentations]);

  const handleTitleClick = () => setIsEditing(true);
  const handleTitleInputChange = (e) =>
    onTitleChange && onTitleChange(e.target.value);
  const handleTitleBlur = () => setIsEditing(false);
  const handleTitleKeyPress = (e) => {
    if (e.key === "Enter") setIsEditing(false);
  };

  const toggleMenu = (menuName) => {
    console.log("Toggling menu:", menuName, "Current active:", activeMenu);
    if (isShareMenuOpen) {
      setIsShareMenuOpen(false);
      setCopyStatus("idle");
    }
    setActiveMenu((prev) => {
      const next = prev === menuName ? null : menuName;
      if (next !== "file") {
        setFileSubmenusOpen({ recent: false });
      }
      return next;
    });
  };
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActiveMenu(null);
    if (isShareMenuOpen) {
      setIsShareMenuOpen(false);
      setCopyStatus("idle");
    }
  };
  const [alignments, setAlignments] = useState({}); // { menuName: 'left'|'right' }

  const closeShareMenu = () => {
    setIsShareMenuOpen(false);
    setCopyStatus("idle");
  };

  const handleShareMenuToggle = () => {
    if (isShareMenuOpen) {
      closeShareMenu();
      return;
    }
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
    setFileSubmenusOpen({ recent: false });
    setIsShareMenuOpen(true);
  };

  const handleCopyShareLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const tempInput = document.createElement("textarea");
        tempInput.value = shareUrl;
        tempInput.setAttribute("readonly", "");
        tempInput.style.position = "absolute";
        tempInput.style.left = "-9999px";
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }
      setCopyStatus("success");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (err) {
      console.error("Unable to copy share link", err);
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  };

  const handleQuickEmailShare = () => {
    const subject = encodeURIComponent(
      `Check out my presentation: ${presentationTitle}`
    );
    const body = encodeURIComponent(`View the presentation at: ${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    closeShareMenu();
  };

  const handleShareToPlatform = (platform) => {
    const text = encodeURIComponent(
      `Check out my presentation: ${presentationTitle}`
    );
    const url = encodeURIComponent(shareUrl);
    let shareLink = "";

    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${text}%20${url}`;
        break;
      default:
        shareLink = "";
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "width=600,height=400");
      closeShareMenu();
    }
  };

  const handleOpenShareModal = () => {
    closeShareMenu();
    if (typeof onShowShare === "function") {
      onShowShare();
    }
  };

  // compute dropdown alignment to avoid overflow
  const measureAndSetAlignment = (menuName, menuButton) => {
    if (!menuButton) return;
    const rect = menuButton.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const dropdownWidth = 320; // safe estimate
    const spaceRight = viewportWidth - rect.left;
    const alignRight = spaceRight < dropdownWidth;
    const newAlign = alignRight ? "right" : "left";
    // avoid updating state if alignment did not change (prevents re-renders)
    setAlignments((prev) => {
      if (prev[menuName] === newAlign) return prev;
      return { ...prev, [menuName]: newAlign };
    });
  };

  // When a menu is opened, measure its alignment once. Also re-measure on window resize.
  useEffect(() => {
    if (!activeMenu) return;
    const menuContainer = menuRefs.current[activeMenu];
    const menuButton = menuContainer
      ? menuContainer.querySelector(".menu-item")
      : null;
    measureAndSetAlignment(activeMenu, menuButton);
    const onResize = () => measureAndSetAlignment(activeMenu, menuButton);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeMenu]);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        activeMenu &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        console.log("Clicking outside, closing menu");
        setActiveMenu(null);
        setIsMobileMenuOpen(false);
        setFileSubmenusOpen({ recent: false });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenu]);

  useEffect(() => {
    if (!isShareMenuOpen) return;
    const handleClickOutsideShare = (event) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target)
      ) {
        closeShareMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutsideShare);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideShare);
  }, [isShareMenuOpen]);

  const handleMenuAction = (action, shouldCloseMenu = true) => {
    console.log("Menu action triggered:", action);
    if (shouldCloseMenu) {
      setActiveMenu(null);
      setIsMobileMenuOpen(false);
      setFileSubmenusOpen({ recent: false });
      closeShareMenu();
    }
    if (typeof action === "function") action();
  };

  useEffect(() => {
    if (activeMenu !== "file") {
      setFileSubmenusOpen({ recent: false });
    }
  }, [activeMenu]);

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <i className="fas fa-chalkboard"></i>
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
          <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}></i>
        </button>

        <div className={`menu-items ${isMobileMenuOpen ? "mobile-open" : ""}`}>
          {/* Insert Menu */}
          <div
            className="menu-dropdown"
            ref={(el) => {
              menuRefs.current.insert = el;
            }}
          >
            <button
              className={`menu-item ${
                toolbarActiveTab === "insert" ? "active" : ""
              }`}
              onClick={() => setToolbarActiveTab("insert")}
            >
              Insert
            </button>
          </div>

          {/* Format Menu */}
          <div
            className="menu-dropdown"
            ref={(el) => {
              menuRefs.current.format = el;
            }}
          >
            <button
              className={`menu-item ${
                toolbarActiveTab === "format" ? "active" : ""
              }`}
              onClick={() => setToolbarActiveTab("format")}
            >
              Format
            </button>
          </div>

          {/* Design Menu */}
          <div
            className="menu-dropdown"
            ref={(el) => {
              menuRefs.current.design = el;
            }}
          >
            <button
              className={`menu-item ${
                toolbarActiveTab === "design" ? "active" : ""
              }`}
              onClick={() => setToolbarActiveTab("design")}
            >
              Design
            </button>
          </div>

          {/* Undo/Redo Buttons */}
          <div className="menu-dropdown">
            <button
              className="menu-item"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              <i className="fas fa-undo"></i>
            </button>
          </div>
          <div className="menu-dropdown">
            <button
              className="menu-item"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
            >
              <i className="fas fa-redo"></i>
            </button>
          </div>

          {/* File Menu */}
          <div
            className="menu-dropdown"
            ref={(el) => {
              menuRefs.current.file = el;
            }}
          >
            <button
              className={`menu-item ${activeMenu === "file" ? "active" : ""}`}
              onClick={() => toggleMenu("file")}
            >
              File
            </button>
            {activeMenu === "file" && (
              <div
                className={`dropdown-menu ${
                  alignments.file === "right" ? "align-right" : ""
                }`}
              >
                <button
                  className="dropdown-item"
                  onClick={() => handleMenuAction(onNew, false)}
                >
                  <span className="item-label">
                    <i className="fas fa-file"></i>
                    <span>New Presentation</span>
                  </span>
                  <span className="shortcut">Ctrl+N</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleMenuAction(onSave, false)}
                >
                  <span className="item-label">
                    <i className="fas fa-save"></i>
                    <span>Save</span>
                  </span>
                  <span className="shortcut">Ctrl+S</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleMenuAction(onMakeCopy, false)}
                >
                  <span className="item-label">
                    <i className="fas fa-copy"></i>
                    <span>Make a copy</span>
                  </span>
                </button>
                <div className="dropdown-divider"></div>
                <div className="dropdown-submenu">
                  <button
                    className={`dropdown-item submenu-toggle ${
                      fileSubmenusOpen.recent ? "open" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setFileSubmenusOpen((prev) => ({
                        ...prev,
                        recent: !prev.recent,
                      }));
                    }}
                  >
                    <span className="item-label">
                      <i className="fas fa-folder-open"></i>
                      Open Recent
                    </span>
                    <i
                      className={`fas ${
                        fileSubmenusOpen.recent
                          ? "fa-chevron-up"
                          : "fa-chevron-right"
                      }`}
                    ></i>
                  </button>
                  {fileSubmenusOpen.recent && (
                    <div className="submenu-content">
                      {sortedSavedPresentations &&
                      sortedSavedPresentations.length > 0 ? (
                        sortedSavedPresentations.map((ppt) => (
                          <div key={ppt.id} className="submenu-item-wrapper">
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                handleMenuAction(() => onOpen && onOpen(ppt.id), false)
                              }
                            >
                              <span className="item-label">
                                <i className="fas fa-file-powerpoint"></i>
                                <span>{ppt.title}</span>
                              </span>
                              <span className="file-date">
                                {ppt.lastModified
                                  ? new Date(ppt.lastModified).toLocaleString()
                                  : "Unsaved"}
                              </span>
                            </button>
                            <button
                              className="delete-file-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMenuAction(
                                  () => onDelete && onDelete(ppt.id),
                                  false
                                );
                              }}
                              title="Delete presentation"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="dropdown-item disabled">
                          No saved presentations
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item"
                  onClick={() => handleMenuAction(onExportPPTX, false)}
                >
                  <span className="item-label">
                    <i className="fas fa-file-archive"></i>
                    <span>Export as PPTX</span>
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div
            className="menu-dropdown"
            ref={(el) => {
              menuRefs.current.view = el;
            }}
          >
            <button
              className={`menu-item ${activeMenu === "view" ? "active" : ""}`}
              onClick={() => toggleMenu("view")}
            >
              View
            </button>
            {activeMenu === "view" && (
              <div
                className={`dropdown-menu ${
                  alignments.view === "right" ? "align-right" : ""
                }`}
              >
                <button
                  className="dropdown-item"
                  onClick={() => handleMenuAction(onStartPresentation, false)}
                >
                  <span className="item-label">
                    <i className="fas fa-play"></i>
                    <span>Start Presentation</span>
                  </span>
                  <span className="shortcut">F5</span>
                </button>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item"
                  onClick={() => handleMenuAction(onZoomIn, false)}
                >
                  <span className="item-label">
                    <i className="fas fa-search-plus"></i>
                    <span>Zoom In</span>
                  </span>
                  <span className="shortcut">Ctrl++</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleMenuAction(onZoomOut, false)}
                >
                  <span className="item-label">
                    <i className="fas fa-search-minus"></i>
                    <span>Zoom Out</span>
                  </span>
                  <span className="shortcut">Ctrl+-</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleMenuAction(onFitToScreen, false)}
                >
                  <span className="item-label">
                    <i className="fas fa-expand"></i>
                    <span>Fit to Screen</span>
                  </span>
                </button>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item zoom-level-display">
                  <span className="item-label">
                    <i className="fas fa-percentage"></i>
                    <span>Zoom: {zoomLevel}%</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Slides Menu */}
          <div
            className="menu-dropdown"
            ref={(el) => {
              menuRefs.current.slides = el;
            }}
          >
            <button
              className={`menu-item ${activeMenu === "slides" ? "active" : ""}`}
              onClick={() => toggleMenu("slides")}
            >
              Slides
            </button>
            {activeMenu === "slides" && (
              <div
                className={`dropdown-menu ${
                  alignments.slides === "right" ? "align-right" : ""
                }`}
              >
                <button
                  className="dropdown-item"
                  onClick={() => handleMenuAction(onAddSlide, false)}
                >
                  <span className="item-label">
                    <i className="fas fa-plus-square"></i>
                    <span>Add New Slide</span>
                  </span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleMenuAction(onAddEmptySlide, false)}
                >
                  <span className="item-label">
                    <i className="far fa-square"></i>
                    <span>Add Empty Slide</span>
                  </span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleMenuAction(onDeleteCurrentSlide, false)}
                  disabled={!onDeleteCurrentSlide || slideCount <= 1}
                >
                  <span className="item-label">
                    <i className="fas fa-minus-square"></i>
                    <span>Delete Current Slide</span>
                  </span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleMenuAction(onDeletePreviousSlide, false)}
                  disabled={
                    !onDeletePreviousSlide ||
                    slideCount <= 1 ||
                    currentSlideIndex === 0
                  }
                >
                  <span className="item-label">
                    <i className="fas fa-backward"></i>
                    <span>Delete Previous Slide</span>
                  </span>
                </button>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item"
                  onClick={() => handleMenuAction(onMoveSlideUp, false)}
                  disabled={
                    typeof onMoveSlideUp !== "function" ||
                    currentSlideIndex <= 0
                  }
                >
                  <span className="item-label">
                    <i className="fas fa-arrow-up"></i>
                    <span>Move Slide Up</span>
                  </span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => handleMenuAction(onMoveSlideDown, false)}
                  disabled={
                    typeof onMoveSlideDown !== "function" ||
                    currentSlideIndex >= slideCount - 1
                  }
                >
                  <span className="item-label">
                    <i className="fas fa-arrow-down"></i>
                    <span>Move Slide Down</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="menu-dropdown share-menu" ref={shareMenuRef}>
          <button
            className={`menu-item ${isShareMenuOpen ? "active" : ""}`}
            onClick={handleShareMenuToggle}
            type="button"
            title="Share"
          >
            <i className="fas fa-share-alt"></i>
            <i
              className={`fas ${
                isShareMenuOpen ? "fa-chevron-up" : "fa-chevron-down"
              }`}
            ></i>
          </button>
          {isShareMenuOpen && (
            <div className="dropdown-menu align-right share-dropdown">
              <button
                className="dropdown-item"
                onClick={handleCopyShareLink}
                type="button"
              >
                <span className="item-label">
                  <i className="fas fa-link"></i>
                  <span>
                    {copyStatus === "success"
                      ? "Link copied to clipboard"
                      : copyStatus === "error"
                      ? "Unable to copy link"
                      : "Copy share link"}
                  </span>
                </span>
                {copyStatus === "success" && (
                  <span className="shortcut success">Done</span>
                )}
                {copyStatus === "error" && (
                  <span className="shortcut error">Retry</span>
                )}
                {copyStatus === "idle" && (
                  <span className="shortcut">Ctrl+C</span>
                )}
              </button>
              <button
                className="dropdown-item"
                onClick={handleQuickEmailShare}
                type="button"
              >
                <span className="item-label">
                  <i className="fas fa-envelope"></i>
                  <span>Share via email</span>
                </span>
              </button>
              <div className="dropdown-divider"></div>
              <button
                className="dropdown-item"
                onClick={() => handleShareToPlatform("twitter")}
                type="button"
              >
                <span className="item-label">
                  <i className="fab fa-twitter"></i>
                  <span>Share on Twitter</span>
                </span>
              </button>
              <button
                className="dropdown-item"
                onClick={() => handleShareToPlatform("linkedin")}
                type="button"
              >
                <span className="item-label">
                  <i className="fab fa-linkedin"></i>
                  <span>Share on LinkedIn</span>
                </span>
              </button>
              <button
                className="dropdown-item"
                onClick={() => handleShareToPlatform("facebook")}
                type="button"
              >
                <span className="item-label">
                  <i className="fab fa-facebook"></i>
                  <span>Share on Facebook</span>
                </span>
              </button>
              <button
                className="dropdown-item"
                onClick={() => handleShareToPlatform("whatsapp")}
                type="button"
              >
                <span className="item-label">
                  <i className="fab fa-whatsapp"></i>
                  <span>Share on WhatsApp</span>
                </span>
              </button>
            </div>
          )}
        </div>
        <button 
          className="present-btn" 
          onClick={onStartPresentation}
          title="Present"
        >
          <i className="fas fa-play"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
