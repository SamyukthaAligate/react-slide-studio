import React, { useState } from "react";
import "./ShapesLibrary.css";

const ShapesLibrary = ({ onAddShape, onClose, slides, currentSlideIndex }) => {
  const [activeCategory, setActiveCategory] = useState("basic");
  
  // Helper: find a non-overlapping position for new shape on current slide
  const findNonOverlappingPosition = (width, height) => {
    const slide =
      slides && slides[currentSlideIndex] ? slides[currentSlideIndex] : null;
    const padding = 20;
    const canvasW = 960;
    const canvasH = 540;
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

  const shapes = {
    basic: [
      {
        id: "rectangle",
        name: "Rectangle",
        icon: "▭",
        shapeType: "rectangle",
        fill: "#4285f4",
        stroke: "#1a73e8",
        strokeWidth: 2,
      },
      {
        id: "rounded-rectangle",
        name: "Rounded Rectangle",
        icon: "▢",
        shapeType: "rounded-rectangle",
        fill: "#4285f4",
        stroke: "#1a73e8",
        strokeWidth: 2,
        cornerRadius: 12,
      },
      {
        id: "circle",
        name: "Circle",
        icon: "●",
        shapeType: "circle",
        fill: "#34a853",
        stroke: "#0f9d58",
        strokeWidth: 2,
      },
      {
        id: "ellipse",
        name: "Ellipse",
        icon: "⬭",
        shapeType: "ellipse",
        fill: "#34a853",
        stroke: "#0f9d58",
        strokeWidth: 2,
      },
      {
        id: "triangle",
        name: "Triangle",
        icon: "▲",
        shapeType: "triangle",
        fill: "#fbbc04",
        stroke: "#f9ab00",
        strokeWidth: 2,
      },
      {
        id: "diamond",
        name: "Diamond",
        icon: "◆",
        shapeType: "diamond",
        fill: "#ea4335",
        stroke: "#c5221f",
        strokeWidth: 2,
      },
    ],
    arrows: [
      {
        id: "arrow-right",
        name: "Arrow Right",
        icon: "→",
        shapeType: "arrow-right",
        fill: "#4285f4",
        stroke: "#1a73e8",
        strokeWidth: 2,
      },
      {
        id: "arrow-left",
        name: "Arrow Left",
        icon: "←",
        shapeType: "arrow-left",
        fill: "#4285f4",
        stroke: "#1a73e8",
        strokeWidth: 2,
      },
      {
        id: "arrow-up",
        name: "Arrow Up",
        icon: "↑",
        shapeType: "arrow-up",
        fill: "#4285f4",
        stroke: "#1a73e8",
        strokeWidth: 2,
      },
      {
        id: "arrow-down",
        name: "Arrow Down",
        icon: "↓",
        shapeType: "arrow-down",
        fill: "#4285f4",
        stroke: "#1a73e8",
        strokeWidth: 2,
      },
      {
        id: "double-arrow",
        name: "Double Arrow",
        icon: "⇄",
        shapeType: "double-arrow",
        fill: "#4285f4",
        stroke: "#1a73e8",
        strokeWidth: 2,
      },
    ],
    stars: [
      {
        id: "star-5",
        name: "5-Point Star",
        icon: "★",
        shapeType: "star-5",
        fill: "#fbbc04",
        stroke: "#f9ab00",
        strokeWidth: 2,
      },
      {
        id: "star-6",
        name: "6-Point Star",
        icon: "✶",
        shapeType: "star-6",
        fill: "#fbbc04",
        stroke: "#f9ab00",
        strokeWidth: 2,
      },
      {
        id: "star-8",
        name: "8-Point Star",
        icon: "✳",
        shapeType: "star-8",
        fill: "#fbbc04",
        stroke: "#f9ab00",
        strokeWidth: 2,
      },
    ],
    callouts: [
      {
        id: "speech-bubble",
        name: "Speech Bubble",
        icon: "💬",
        shapeType: "speech-bubble",
        fill: "#ffffff",
        stroke: "#5f6368",
        strokeWidth: 2,
      },
      {
        id: "thought-bubble",
        name: "Thought Bubble",
        icon: "💭",
        shapeType: "thought-bubble",
        fill: "#ffffff",
        stroke: "#5f6368",
        strokeWidth: 2,
      },
      {
        id: "callout-rectangle",
        name: "Callout Rectangle",
        icon: "▭",
        shapeType: "callout-rectangle",
        fill: "#e8f0fe",
        stroke: "#1a73e8",
        strokeWidth: 2,
      },
    ],
    flowchart: [
      {
        id: "process",
        name: "Process",
        icon: "▭",
        shapeType: "rectangle",
        fill: "#e8f0fe",
        stroke: "#1a73e8",
        strokeWidth: 2,
      },
      {
        id: "decision",
        name: "Decision",
        icon: "◆",
        shapeType: "diamond",
        fill: "#fce8e6",
        stroke: "#ea4335",
        strokeWidth: 2,
      },
      {
        id: "data",
        name: "Data",
        icon: "⬭",
        shapeType: "parallelogram",
        fill: "#e6f4ea",
        stroke: "#34a853",
        strokeWidth: 2,
      },
      {
        id: "terminator",
        name: "Terminator",
        icon: "▢",
        shapeType: "rounded-rectangle",
        fill: "#fef7e0",
        stroke: "#fbbc04",
        strokeWidth: 2,
        cornerRadius: 20,
      },
    ],
  };

  const categories = [
    { id: "basic", name: "Basic", icon: "▭" },
    { id: "arrows", name: "Arrows", icon: "→" },
    { id: "stars", name: "Stars", icon: "★" },
    { id: "callouts", name: "Callouts", icon: "💬" },
    { id: "flowchart", name: "Flowchart", icon: "◇" },
  ];

  const handleShapeClick = (shape) => {
    // Set appropriate dimensions based on shape type
    let width = 140;
    let height = 140;
    
    // Arrows should be wider
    if (shape.shapeType.includes("arrow-right") || shape.shapeType.includes("arrow-left") || shape.shapeType.includes("double-arrow")) {
      width = 180;
      height = 100;
    } else if (shape.shapeType.includes("arrow-up") || shape.shapeType.includes("arrow-down")) {
      width = 100;
      height = 180;
    }
    // Rectangles should be wider
    else if (shape.shapeType === "rectangle" || shape.shapeType === "rounded-rectangle") {
      width = 180;
      height = 120;
    }
    // Ellipses should be wider
    else if (shape.shapeType === "ellipse") {
      width = 180;
      height = 120;
    }
    // Callouts and speech bubbles
    else if (shape.shapeType.includes("callout") || shape.shapeType.includes("speech") || shape.shapeType.includes("thought")) {
      width = 160;
      height = 120;
    }
    // Flowchart shapes
    else if (shape.shapeType === "parallelogram") {
      width = 180;
      height = 100;
    }
    
    // Get smart positioning to avoid overlaps and stay within canvas
    const { x, y } = findNonOverlappingPosition(width, height);
    
    const newShape = {
      type: "shape",
      shapeType: shape.shapeType,
      x: x,
      y: y,
      width: width,
      height: height,
      fill: shape.fill,
      stroke: shape.stroke,
      strokeWidth: shape.strokeWidth,
      cornerRadius: shape.cornerRadius || 0,
      opacity: 0.95,
      shadow: true,
      rotation: 0,
      zIndex: 1,
      // Text properties
      text: "",
      textPlaceholder: "Double-click to add text",
      fontSize: 16,
      fontFamily: "Roboto",
      textColor: "#FFFFFF",
      textAlign: "center",
      verticalAlign: "middle",
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "none",
    };
    onAddShape(newShape);
    onClose(); // Close modal after adding shape
  };

  return (
    <div className="shapes-library-overlay" onClick={onClose}>
      <div className="shapes-library-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shapes-library-header">
          <h2>
            <i className="fas fa-shapes"></i>
            Shape Library
          </h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="shapes-library-content">
          <div className="shapes-categories">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-btn ${
                  activeCategory === category.id ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>

          <div className="shapes-grid">
            {shapes[activeCategory]?.map((shape) => (
              <button
                key={shape.id}
                className="shape-item"
                onClick={() => handleShapeClick(shape)}
                title={shape.name}
              >
                <div className="shape-icon" style={{ color: shape.fill }}>
                  {shape.icon}
                </div>
                <div className="shape-name">{shape.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="shapes-library-footer">
          <p className="shapes-tip">
            <i className="fas fa-info-circle"></i>
            Click any shape to add it to your slide
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShapesLibrary;
