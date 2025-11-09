import React, { useState, useEffect, useRef } from "react";
import "./Toolbar.css";

const NEUTRAL_PALETTE = [
  "#0f0f0f",
  "#1f1f1f",
  "#2f2f2f",
  "#3f3f3f",
  "#4f4f4f",
  "#6f6f6f",
  "#8f8f8f",
  "#bfbfbf",
  "#dfdfdf",
  "#ffffff",
];

const CHART_PALETTE = [
  "#4F46E5",
  "#6366F1",
  "#0891B2",
  "#10B981",
  "#F59E0B",
  "#F97316",
  "#EF4444",
  "#EC4899",
  "#8B5CF6",
  "#F3F4F6",
];

const SHAPE_PALETTE = Array.from(
  new Set([...CHART_PALETTE, ...NEUTRAL_PALETTE])
);

const Toolbar = ({
  onAddElement,
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  slides,
  currentSlideIndex,
  onUpdateSlide,
  onAddSlide,
  onDeleteCurrentSlide,
  onDeletePreviousSlide,
  toolbarActiveTab,
  setToolbarActiveTab,
  onShowChartModal,
  onShowShapesLibrary,
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
  const [bulletColor, setBulletColor] = useState("#000000");
  const [gridOn, setGridOn] = useState(false);
  const [gridSize, setGridSize] = useState(24);

  const fontFamilies = [
    "Roboto",
    "Arial",
    "Times New Roman",
    "Helvetica",
    "Georgia",
    "Verdana",
    "Courier New",
    "Impact",
    "Comic Sans MS",
    "Trebuchet MS",
    "Palatino",
    "Garamond",
    "Bookman",
    "Avant Garde",
    "Lucida Console",
  ];

  const fontSizes = [
    8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72,
  ];

  const backgroundThemes = [
    {
      name: "Simple Light",
      backgroundColor: "#ffffff",
      gradient: "linear-gradient(135deg, #ffffff 0%, #eef2ff 100%)",
      previewBackground: "linear-gradient(135deg, #ffffff 0%, #eef2ff 100%)",
      accent: "#1a73e8",
      accentSecondary: "#fbbc04",
    },
    {
      name: "Spearmint",
      backgroundColor: "#d9f8ee",
      gradient: "linear-gradient(135deg, #d9f8ee 0%, #a6e3c9 100%)",
      previewBackground: "linear-gradient(135deg, #d9f8ee 0%, #a6e3c9 100%)",
      accent: "#0f9d58",
      accentSecondary: "#ffffff",
    },
    {
      name: "Midnight",
      backgroundColor: "#1f2933",
      gradient: "linear-gradient(135deg, #1f2933 0%, #111827 100%)",
      previewBackground: "linear-gradient(135deg, #1f2933 0%, #111827 100%)",
      accent: "rgba(255,255,255,0.85)",
      accentSecondary: "#4c6ef5",
    },
    {
      name: "Coral Sunset",
      backgroundColor: "#ff9a9e",
      gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
      previewBackground: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
      accent: "rgba(255,255,255,0.9)",
      accentSecondary: "#ff6f61",
    },
    {
      name: "Aurora",
      backgroundColor: "#36d1dc",
      gradient: "linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)",
      previewBackground: "linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)",
      accent: "rgba(255,255,255,0.85)",
      accentSecondary: "rgba(255,255,255,0.45)",
    },
    {
      name: "Golden Pastel",
      backgroundColor: "#fff4d6",
      gradient: "linear-gradient(135deg, #fff4d6 0%, #ffe4a1 100%)",
      previewBackground: "linear-gradient(135deg, #fff4d6 0%, #ffe4a1 100%)",
      accent: "#f29900",
      accentSecondary: "#ffffff",
    },
    {
      name: "Slate Focus",
      backgroundColor: "#f5f7fa",
      gradient: "linear-gradient(135deg, #f5f7fa 0%, #dbe4f3 100%)",
      previewBackground: "linear-gradient(135deg, #f5f7fa 0%, #dbe4f3 100%)",
      accent: "#1a73e8",
      accentSecondary: "#9aa0a6",
    },
    {
      name: "Vibrant Plum",
      backgroundColor: "#42275a",
      gradient: "linear-gradient(135deg, #42275a 0%, #734b6d 100%)",
      previewBackground: "linear-gradient(135deg, #42275a 0%, #734b6d 100%)",
      accent: "rgba(255,255,255,0.85)",
      accentSecondary: "#ff8a80",
    },
    {
      name: "Oceanic",
      backgroundColor: "#2193b0",
      gradient: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
      previewBackground: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)",
      accent: "rgba(255,255,255,0.8)",
      accentSecondary: "#0b3954",
    },
    {
      name: "Graphite",
      backgroundColor: "#1a1a1a",
      gradient: "linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)",
      previewBackground: "linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)",
      accent: "#4a5568",
      accentSecondary: "#718096",
    },
    {
      name: "Professional",
      backgroundColor: "#f8f9fa",
      gradient: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      previewBackground: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      accent: "#1a73e8",
      accentSecondary: "#34a853",
    },
    {
      name: "Sunset Boulevard",
      backgroundColor: "#f7971e",
      gradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
      previewBackground: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
      accent: "rgba(255,255,255,0.85)",
      accentSecondary: "rgba(34,34,34,0.6)",
    },
  ];

  const textColors = [
    "#000000",
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#800000",
    "#008000",
    "#000080",
    "#808000",
    "#800080",
    "#008080",
    "#c0c0c0",
    "#808080",
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#96ceb4",
    "#ffeaa7",
    "#dda0dd",
    "#98d8c8",
    "#f7dc6f",
  ];

  const bulletStyles = [
    { id: "disc", label: "Filled bullets", preview: "•", icon: "fa-circle" },
    { id: "circle", label: "Hollow bullets", preview: "◦", icon: "fa-circle-notch" },
    { id: "square", label: "Square bullets", preview: "▪", icon: "fa-square" },
    { id: "decimal", label: "Numbered list", preview: "1.", icon: "fa-list-ol" },
  ];

  const addTitleBox = () => {
    const { x, y } = findNonOverlappingPosition(720, 180);
    onAddElement({
      type: "text",
      content: "Click to add Title",
      x,
      y,
      width: 660,
      height: 160,
      fontSize: 42,
      fontFamily: "Roboto",
      color: "#000000",
      backgroundColor: "transparent",
      textAlign: "center",
      fontWeight: "bold",
      fontStyle: "normal",
    });
  };

  const addContentBox = () => {
    const { x, y } = findNonOverlappingPosition(520, 240);
    onAddElement({
      type: "text",
      content: "Click to add text",
      x,
      y,
      width: 540,
      height: 260,
      fontSize: 20,
      fontFamily: "Roboto",
      color: "#000000",
      backgroundColor: "transparent",
      textAlign: "left",
      fontWeight: "normal",
      fontStyle: "normal",
    });
  };

  const addBulletList = (style) => {
    const { x, y } = findNonOverlappingPosition(560, 280);
    const bulletContent = (() => {
      switch (style) {
        case "circle":
          return ["◦ First point", "◦ Second point", "◦ Third point"];
        case "square":
          return ["▪ First point", "▪ Second point", "▪ Third point"];
        case "decimal":
          return ["1. First point", "2. Second point", "3. Third point"];
        case "disc":
        default:
          return ["• First point", "• Second point", "• Third point"];
      }
    })().join("\n");
    onAddElement({
      type: "text",
      content: bulletContent,
      listType: style,
      x,
      y,
      width: 580,
      height: 280,
      fontSize: 20,
      fontFamily: "Roboto",
      color: bulletColor,
      backgroundColor: "transparent",
      textAlign: "left",
      fontWeight: "normal",
      fontStyle: "normal",
    });
  };

  const addShape = (shapeType) => {
    const primaryFill = "#2f2f2f";
    const primaryStroke = "#f4f4f4";
    const shapes = {
      rectangle: {
        type: "shape",
        shapeType: "rectangle",
        x: 150,
        y: 150,
        width: 160,
        height: 108,
        fill: primaryFill,
        stroke: primaryStroke,
        strokeWidth: 3,
        opacity: 0.95,
        cornerRadius: 18,
        shadow: true,
      },
      circle: {
        type: "shape",
        shapeType: "circle",
        x: 150,
        y: 150,
        width: 140,
        height: 140,
        fill: primaryFill,
        stroke: primaryStroke,
        strokeWidth: 3,
        opacity: 0.95,
        shadow: true,
      },
      triangle: {
        type: "shape",
        shapeType: "triangle",
        x: 150,
        y: 150,
        width: 160,
        height: 140,
        fill: primaryFill,
        stroke: primaryStroke,
        strokeWidth: 3,
        opacity: 0.95,
        shadow: true,
      },
    };

    const dims = shapes[shapeType];
    const { x, y } = findNonOverlappingPosition(dims.width, dims.height);
    onAddElement({ ...dims, x, y });
  };

  const addChart = (chartType) => {
    const charts = {
      bar: {
        type: "chart",
        chartType: "bar",
        x: 100,
        y: 100,
        width: 440,
        height: 300,
        data: [
          { label: "Alpha", value: 65, color: CHART_PALETTE[0] },
          { label: "Beta", value: 52, color: CHART_PALETTE[1] },
          { label: "Gamma", value: 78, color: CHART_PALETTE[2] },
        ],
        color: CHART_PALETTE[0],
      },
      pie: {
        type: "chart",
        chartType: "pie",
        x: 120,
        y: 120,
        width: 380,
        height: 280,
        data: [
          { label: "Alpha", value: 35, color: CHART_PALETTE[4] },
          { label: "Beta", value: 28, color: CHART_PALETTE[5] },
          { label: "Gamma", value: 22, color: CHART_PALETTE[6] },
          { label: "Delta", value: 15, color: CHART_PALETTE[7] },
        ],
      },
      line: {
        type: "chart",
        chartType: "line",
        x: 120,
        y: 120,
        width: 440,
        height: 300,
        data: [
          { label: "Q1", value: 22, color: CHART_PALETTE[0] },
          { label: "Q2", value: 35, color: CHART_PALETTE[1] },
          { label: "Q3", value: 44, color: CHART_PALETTE[2] },
          { label: "Q4", value: 29, color: CHART_PALETTE[3] },
        ],
        color: CHART_PALETTE[2],
      },
    };

    onAddElement(charts[chartType]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const { x, y } = findNonOverlappingPosition(200, 150);
        onAddElement({
          type: "image",
          src: event.target.result,
          x,
          y,
          width: 200,
          height: 150,
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
          type: "video",
          src: event.target.result,
          x,
          y,
          width: 400,
          height: 300,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper: find a non-overlapping position for new element on current slide
  const findNonOverlappingPosition = (width, height) => {
    const slide =
      slides && slides[currentSlideIndex] ? slides[currentSlideIndex] : null;
    const padding = 20;
    const canvasW = 960; // Updated to match actual canvas width
    const canvasH = 540; // Updated to match actual canvas height
    let x = padding;
    let y = padding;

    const overlaps = (r1, r2) =>
      !(
        r1.x + r1.width <= r2.x ||
        r2.x + r2.width <= r1.x ||
        r1.y + r1.height <= r2.y ||
        r2.y + r2.height <= r1.y
      );

    const existing = slide ? slide.elements || [] : [];

    let attempts = 0;
    while (attempts < 1000) {
      const rect = { x, y, width, height };
      const collision = existing.some((e) =>
        overlaps(rect, { x: e.x, y: e.y, width: e.width, height: e.height })
      );
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
        x = Math.max(
          padding,
          Math.min(
            canvasW - width - padding,
            Math.floor(Math.random() * (canvasW - width - padding))
          )
        );
        y = Math.max(
          padding,
          Math.min(
            canvasH - height - padding,
            Math.floor(Math.random() * (canvasH - height - padding))
          )
        );
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
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Prevent dropdown from closing when clicking inside dropdown content
  const handleDropdownClick = (e) => {
    e.stopPropagation();
  };

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
    if (selectedElement && selectedElement.type === "text") {
      const currentSize = selectedElement.fontSize || 16;
      const newSize = Math.min(currentSize + 2, 72);
      updateSelectedElement("fontSize", newSize);
    }
  };

  const decreaseFontSize = () => {
    if (selectedElement && selectedElement.type === "text") {
      const currentSize = selectedElement.fontSize || 16;
      const newSize = Math.max(currentSize - 2, 8);
      updateSelectedElement("fontSize", newSize);
    }
  };

  const updateShapeProperties = (updates) => {
    if (selectedElement && selectedElement.type === "shape") {
      onUpdateElement(selectedElement.id, updates);
    }
  };

  const updateChartProperties = (updates) => {
    if (!selectedElement || selectedElement.type !== "chart") return;

    let mergedUpdates = { ...updates };

    if (updates.color && selectedElement.chartType !== "pie") {
      const currentData = Array.isArray(selectedElement.data)
        ? selectedElement.data
        : [];
      mergedUpdates = {
        ...mergedUpdates,
        data: currentData.map((item) => ({
          ...item,
          color: updates.color,
        })),
      };
    }

    onUpdateElement(selectedElement.id, mergedUpdates);
  };

  const updateChartDataPoint = (index, field, value) => {
    if (!selectedElement || selectedElement.type !== "chart") return;
    const currentData = Array.isArray(selectedElement.data)
      ? [...selectedElement.data]
      : [];
    if (!currentData[index]) return;
    const updatedPoint = { ...currentData[index], [field]: value };
    currentData[index] = updatedPoint;
    updateChartProperties({ data: currentData });
  };

  const removeChartDataPoint = (index) => {
    if (!selectedElement || selectedElement.type !== "chart") return;
    const currentData = Array.isArray(selectedElement.data)
      ? [...selectedElement.data]
      : [];
    if (currentData.length <= 1) return;
    const nextData = currentData.filter((_, i) => i !== index);
    updateChartProperties({ data: nextData });
  };

  const addChartDataPoint = () => {
    if (!selectedElement || selectedElement.type !== "chart") return;
    const currentData = Array.isArray(selectedElement.data)
      ? [...selectedElement.data]
      : [];
    const nextIndex = currentData.length + 1;
    const paletteIndex = currentData.length % CHART_PALETTE.length;
    const baseColor = CHART_PALETTE[paletteIndex];
    const newPoint = {
      label: `Series ${nextIndex}`,
      value: 50,
      color: baseColor,
    };
    updateChartProperties({ data: [...currentData, newPoint] });
  };

  const applyBackgroundTheme = (theme) => {
    if (slides && slides[currentSlideIndex]) {
      onUpdateSlide(currentSlideIndex, {
        background: theme.backgroundColor || "#ffffff",
        backgroundGradient: theme.gradient || null,
        backgroundImage: null,
        theme: theme.name,
        themeAccent: theme.accent,
        themeAccentSecondary: theme.accentSecondary,
      });
    }
    setShowBackgroundPicker(false);
  };

  const toolbarContentClasses = [
    "toolbar-content",
    activeDropdown ? "dropdown-open" : "",
    activeTab === "insert" ? "insert-mode" : "",
    activeTab === "format" ? "format-mode" : "",
    activeTab === "design" ? "design-mode" : "",
    !selectedElement && activeTab === "format" ? "no-selection-mode" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="toolbar">
      {/* Header controls toolbar tab state now */}

      <div ref={toolbarRef} className={toolbarContentClasses}>
        {activeTab === "insert" && (
          <div className="insert-tools">
            <div className="tool-group">
              <div
                className={`tool-dropdown ${
                  activeDropdown === "textOptions" ? "open" : ""
                }`}
              >
                <button
                  className="tool-btn dropdown-toggle"
                  title="Insert title or text"
                  onClick={() => toggleDropdown("textOptions")}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M4 5h16v2H13v12h-2V7H4V5z" fill="currentColor" />
                  </svg>
                  <span>Title & Text</span>
                </button>
                <div className="dropdown-content" onClick={handleDropdownClick}>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      addTitleBox();
                    }}
                  >
                    <i className="fas fa-heading"></i>
                    Title Box
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      addContentBox();
                    }}
                  >
                    <i className="fas fa-font"></i>
                    Content Box
                  </button>
                </div>
              </div>

              <div
                className={`tool-dropdown ${
                  activeDropdown === "bullet" ? "open" : ""
                }`}
              >
                <button
                  className="tool-btn dropdown-toggle"
                  title="Insert bullet list"
                  onClick={() => toggleDropdown("bullet")}
                >
                  <i className="fas fa-list-ul"></i>
                  <span>Bullets</span>
                </button>
                <div className="dropdown-content" onClick={handleDropdownClick} style={{ minWidth: '40px', padding: '8px 4px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {bulletStyles.map((style) => (
                      <button
                        key={style.id}
                        className="dropdown-item"
                        onClick={() => addBulletList(style.id)}
                        title={style.label}
                        style={{
                          padding: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <i className={`fas ${style.icon}`} style={{
                          fontSize: '16px',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}></i>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className={`tool-dropdown ${
                  activeDropdown === "image" ? "open" : ""
                }`}
              >
                <button
                  className="tool-btn dropdown-toggle"
                  title="Insert image"
                  onClick={() => toggleDropdown("image")}
                >
                  <i className="fas fa-image"></i>
                  <span>Image</span>
                </button>
                <div className="dropdown-content" onClick={handleDropdownClick}>
                  <label className="dropdown-item">
                    <i className="fas fa-upload"></i>
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        handleImageUpload(e);
                      }}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>

              <div
                className={`tool-dropdown ${
                  activeDropdown === "video" ? "open" : ""
                }`}
              >
                <button
                  className="tool-btn dropdown-toggle"
                  title="Insert video"
                  onClick={() => toggleDropdown("video")}
                >
                  <i className="fas fa-video"></i>
                  <span>Video</span>
                </button>
                <div className="dropdown-content" onClick={handleDropdownClick}>
                  <label className="dropdown-item">
                    <i className="fas fa-upload"></i>
                    Upload Video
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        handleVideoUpload(e);
                      }}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>

              <div
                className={`tool-dropdown ${
                  activeDropdown === "shape" ? "open" : ""
                }`}
              >
                <button
                  className="tool-btn dropdown-toggle"
                  title="Insert shape"
                  onClick={() => toggleDropdown("shape")}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 3h8v8H3V3zm10 10h8v8h-8v-8z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>Shape</span>
                </button>
                <div className="dropdown-content" onClick={handleDropdownClick}>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      addShape("rectangle");
                    }}
                  >
                    <i className="fas fa-square"></i>
                    Rectangle
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      addShape("circle");
                    }}
                  >
                    <i className="fas fa-circle"></i>
                    Circle
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      addShape("triangle");
                    }}
                  >
                    <i className="fas fa-play"></i>
                    Triangle
                  </button>
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      if (onShowShapesLibrary) {
                        onShowShapesLibrary();
                      }
                    }}
                    style={{ fontWeight: '600', color: '#1a73e8' }}
                  >
                    <i className="fas fa-shapes"></i>
                    More Shapes...
                  </button>
                </div>
              </div>

              <div
                className={`tool-dropdown ${
                  activeDropdown === "chart" ? "open" : ""
                }`}
              >
                <button
                  className="tool-btn dropdown-toggle"
                  title="Insert chart"
                  onClick={() => toggleDropdown("chart")}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 20h16v-2H4v2zm3-6h2v6H7v-6zm4-4h2v10h-2V10zm4 2h2v8h-2v-8z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>Chart</span>
                </button>
                <div className="dropdown-content" onClick={handleDropdownClick}>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      addChart("bar");
                    }}
                  >
                    <i className="fas fa-chart-bar"></i>
                    Bar Chart
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      addChart("pie");
                    }}
                  >
                    <i className="fas fa-chart-pie"></i>
                    Pie Chart
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      addChart("line");
                    }}
                  >
                    <i className="fas fa-chart-line"></i>
                    Line Chart
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      onShowChartModal();
                    }}
                  >
                    <i className="fas fa-chart-network"></i>
                    Custom Chart
                  </button>
                </div>
              </div>
            </div>
            <div className="tool-group">
              <button
                className="tool-btn"
                onClick={() => {
                  if (typeof onAddSlide === "function") {
                    onAddSlide();
                  }
                }}
                title="Add slide"
              >
                <i className="fas fa-plus-square"></i>
                <span>New Slide</span>
              </button>
              <button
                className="tool-btn"
                onClick={() => {
                  if (typeof onDeleteCurrentSlide === "function") {
                    onDeleteCurrentSlide();
                  }
                }}
                disabled={!slides || slides.length <= 1}
                title="Delete current slide"
              >
                <i className="fas fa-minus-square"></i>
                <span>Delete Slide</span>
              </button>
              <button
                className="tool-btn"
                onClick={() => {
                  if (typeof onDeletePreviousSlide === "function") {
                    onDeletePreviousSlide();
                  }
                }}
                disabled={
                  !slides || slides.length <= 1 || currentSlideIndex === 0
                }
                title="Delete previous slide"
              >
                <i className="fas fa-backward"></i>
                <span>Delete Prev</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "format" && (
          <div className="format-tools">
            {selectedElement ? (
              selectedElement.type === "chart" ? (
                // Chart-specific formatting options
                <div className="tool-group">
                  <div
                    className={`tool-dropdown ${
                      activeDropdown === "chartType" ? "open" : ""
                    }`}
                  >
                    <button
                      className="tool-btn dropdown-toggle"
                      title="Change chart type"
                      onClick={() => toggleDropdown("chartType")}
                    >
                      <i className="fas fa-chart-pie"></i>
                      <span>
                        {selectedElement.chartType === "bar"
                          ? "Bar Chart"
                          : selectedElement.chartType === "pie"
                          ? "Pie Chart"
                          : selectedElement.chartType === "line"
                          ? "Line Chart"
                          : "Chart Type"}
                      </span>
                    </button>
                    <div className="dropdown-content" onClick={handleDropdownClick}>
                      <button
                        className={`dropdown-item ${
                          selectedElement.chartType === "bar" ? "active" : ""
                        }`}
                        onClick={() => {
                          updateChartProperties({ chartType: "bar" });
                        }}
                      >
                        <i className="fas fa-chart-bar"></i>
                        Bar Chart
                      </button>
                      <button
                        className={`dropdown-item ${
                          selectedElement.chartType === "pie" ? "active" : ""
                        }`}
                        onClick={() => {
                          updateChartProperties({ chartType: "pie" });
                        }}
                      >
                        <i className="fas fa-chart-pie"></i>
                        Pie Chart
                      </button>
                      <button
                        className={`dropdown-item ${
                          selectedElement.chartType === "line" ? "active" : ""
                        }`}
                        onClick={() => {
                          updateChartProperties({ chartType: "line" });
                        }}
                      >
                        <i className="fas fa-chart-line"></i>
                        Line Chart
                      </button>
                    </div>
                  </div>

                  <input
                    type="color"
                    value={selectedElement.color || "#4F46E5"}
                    onChange={(e) =>
                      updateChartProperties({ color: e.target.value })
                    }
                    className="color-input-large"
                    title="Chart Color"
                  />

                  <div
                    className={`tool-dropdown ${
                      activeDropdown === "dataPoints" ? "open" : ""
                    }`}
                  >
                    <button
                      className="tool-btn dropdown-toggle"
                      title="Manage data points"
                      onClick={() => toggleDropdown("dataPoints")}
                    >
                      <i className="fas fa-database"></i>
                      <span>
                        Data ({Array.isArray(selectedElement.data) ? selectedElement.data.length : 0} points)
                      </span>
                    </button>
                    <div className="dropdown-content" onClick={handleDropdownClick}>
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          addChartDataPoint();
                        }}
                      >
                        <i className="fas fa-plus"></i>
                        Add Data Point
                      </button>
                      {Array.isArray(selectedElement.data) &&
                        selectedElement.data.map((point, index) => (
                          <div key={index} className="data-point-item">
                            <div className="data-point-controls">
                              <input
                                type="text"
                                placeholder="Label"
                                value={point.label || ""}
                                onChange={(e) =>
                                  updateChartDataPoint(index, "label", e.target.value)
                                }
                                className="data-point-input"
                              />
                              <input
                                type="number"
                                placeholder="Value"
                                value={point.value || 0}
                                onChange={(e) =>
                                  updateChartDataPoint(index, "value", parseFloat(e.target.value) || 0)
                                }
                                className="data-point-input"
                              />
                              <input
                                type="color"
                                value={point.color || "#4F46E5"}
                                onChange={(e) =>
                                  updateChartDataPoint(index, "color", e.target.value)
                                }
                                className="data-point-color"
                              />
                              {selectedElement.data.length > 1 && (
                                <button
                                  className="remove-data-point"
                                  onClick={() => removeChartDataPoint(index)}
                                  title="Remove data point"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <button
                    className="tool-btn"
                    onClick={() => {
                      if (typeof window.openChartEditor === "function") {
                        window.openChartEditor(selectedElement);
                      }
                    }}
                    title="Edit chart in detail"
                  >
                    <i className="fas fa-edit"></i>
                    <span>Edit Chart</span>
                  </button>

                  <button
                    className="tool-btn"
                    onClick={deleteSelectedElement}
                    title="Delete chart"
                  >
                    <i className="fas fa-trash"></i>
                    <span>Delete</span>
                  </button>
                </div>
              ) : (
                // Text/shape formatting options (existing code)
                <div className="tool-group">
                  {selectedElement.type === "text" && (
                    <>
                      <div
                        className={`tool-dropdown ${
                          activeDropdown === "fontFamily" ? "open" : ""
                        }`}
                      >
                        <button
                          className="tool-btn dropdown-toggle"
                          title="Select font family"
                          onClick={() => toggleDropdown("fontFamily")}
                        >
                          <i className="fas fa-font"></i>
                          <span>{selectedElement.fontFamily || "Roboto"}</span>
                        </button>
                        <div className="dropdown-content" onClick={handleDropdownClick}>
                          {fontFamilies.map((font) => (
                            <button
                              key={font}
                              className={`dropdown-item ${
                                selectedElement.fontFamily === font ? "active" : ""
                              }`}
                              onClick={() => {
                                updateSelectedElement("fontFamily", font);
                              }}
                              style={{ fontFamily: font }}
                            >
                              {font}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div
                        className={`tool-dropdown ${
                          activeDropdown === "fontSize" ? "open" : ""
                        }`}
                      >
                        <button
                          className="tool-btn dropdown-toggle"
                          title="Select font size"
                          onClick={() => toggleDropdown("fontSize")}
                        >
                          <i className="fas fa-text-height"></i>
                          <span>{selectedElement.fontSize || 16}px</span>
                        </button>
                        <div className="dropdown-content" onClick={handleDropdownClick}>
                          {fontSizes.map((size) => (
                            <button
                              key={size}
                              className={`dropdown-item ${
                                selectedElement.fontSize === size ? "active" : ""
                              }`}
                              onClick={() => {
                                updateSelectedElement("fontSize", size);
                              }}
                            >
                              {size}px
                            </button>
                          ))}
                        </div>
                      </div>

                      <input
                        type="color"
                        value={selectedElement.color || "#000000"}
                        onChange={(e) =>
                          updateSelectedElement("color", e.target.value)
                        }
                        className="color-input-large"
                        title="Text Color"
                      />
                    </>
                  )}

                  {(selectedElement.type === "shape" || selectedElement.type === "text") && (
                    <input
                      type="color"
                      value={
                        selectedElement.type === "shape"
                          ? selectedElement.fill || "#2f2f2f"
                          : selectedElement.backgroundColor === "transparent"
                          ? "#ffffff"
                          : selectedElement.backgroundColor || "#ffffff"
                      }
                      onChange={(e) => {
                        if (selectedElement.type === "shape") {
                          updateSelectedElement("fill", e.target.value);
                        } else {
                          updateSelectedElement("backgroundColor", e.target.value);
                        }
                      }}
                      className="color-input-large"
                      title={
                        selectedElement.type === "shape"
                          ? "Shape Fill Color"
                          : "Background Color"
                      }
                    />
                  )}

                  <button
                    className="tool-btn"
                    onClick={deleteSelectedElement}
                    title="Delete element"
                  >
                    <i className="fas fa-trash"></i>
                    <span>Delete</span>
                  </button>
                </div>
              )
            ) : (
              <div className="select-element-info">
                <i className="fas fa-mouse-pointer"></i>
                <span>Select an element to format</span>
              </div>
            )}
          </div>
        )}

        {activeTab === "design" && (
          <div className="design-tools">
            <div className="tool-group">
              <div
                className={`tool-dropdown ${
                  activeDropdown === "backgroundThemes" ? "open" : ""
                }`}
              >
                <button
                  className="tool-btn dropdown-toggle"
                  title="Select background theme"
                  onClick={() => toggleDropdown("backgroundThemes")}
                >
                  <i className="fas fa-palette"></i>
                  <span>Background Themes</span>
                </button>
                <div className="dropdown-content" onClick={handleDropdownClick}>
                  {backgroundThemes.map((theme) => (
                    <button
                      key={theme.name}
                      className="dropdown-item"
                      style={{
                        border:
                          slides[currentSlideIndex]?.theme === theme.name
                            ? "3px solid #1a73e8"
                            : "1px solid #2b2b2b",
                      }}
                      onClick={() => applyBackgroundTheme(theme)}
                      title={theme.name}
                    >
                      <div
                        className="theme-preview"
                        style={{
                          background:
                            theme.previewBackground || theme.backgroundColor,
                        }}
                      >
                        <div
                          className="theme-preview-shape primary"
                          style={{
                            background: theme.accent || "rgba(0,0,0,0.2)",
                          }}
                        />
                        <div
                          className="theme-preview-shape secondary"
                          style={{
                            background:
                              theme.accentSecondary || "rgba(0,0,0,0.1)",
                          }}
                        />
                      </div>
                      <span className="theme-name">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="custom-bg-controls">
                <label>Custom Background Color:</label>
                <input
                  type="color"
                  value={slides[currentSlideIndex]?.background || "#ffffff"}
                  onChange={(e) => {
                    onUpdateSlide(currentSlideIndex, {
                      background: e.target.value,
                      backgroundGradient: null,
                      backgroundImage: null,
                      theme: "custom",
                      themeAccent: null,
                      themeAccentSecondary: null,
                    });
                  }}
                  className="color-input-large"
                />
                <span className="color-value">
                  {slides[currentSlideIndex]?.background || "#ffffff"}
                </span>
              </div>

              <div className="bg-image-controls">
                <label>Background Image:</label>
                <label className="upload-bg-btn tool-btn">
                  <i className="fas fa-image" style={{ marginRight: "8px" }}></i>
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          onUpdateSlide(currentSlideIndex, {
                            backgroundImage: event.target.result,
                            backgroundGradient: null,
                            theme: "custom",
                            themeAccent: null,
                            themeAccentSecondary: null,
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: "none" }}
                  />
                </label>
                {slides[currentSlideIndex]?.backgroundImage && (
                  <button
                    className="tool-btn"
                    onClick={() => {
                      onUpdateSlide(currentSlideIndex, {
                        backgroundImage: null,
                      });
                    }}
                    title="Remove background image"
                  >
                    <i className="fas fa-times"></i>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
