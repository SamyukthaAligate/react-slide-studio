import React, { useState, useCallback, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import Header from "./components/Header/Header";
import Toolbar from "./components/Toolbar/Toolbar";
import SlidePanel from "./components/SlidePanel/SlidePanel";
import Canvas from "./components/Canvas/Canvas";
import PresentationMode from "./components/PresentationMode/PresentationMode";
import HelpModal from "./components/HelpModal/HelpModal";
import ShareModal from "./components/ShareModal/ShareModal";
import ShapesLibrary from "./components/ShapesLibrary/ShapesLibrary";
import { exportToPDF } from "./utils/pdfExport";
import { exportToPPTX } from "./utils/pptxExport";
import "./App.css";

function createTitlePlaceholder() {
  const canvasWidth = 960;
  const canvasHeight = 540;
  const titleWidth = 640; // Optimized width to fit within canvas with proper margins
  const titleHeight = 100;
  
  return {
    id: uuidv4(),
    type: "text",
    content: "",
    placeholder: "Click to add title",
    x: (canvasWidth - titleWidth) / 2, // Center horizontally (160px margin on each side)
    y: (canvasHeight - titleHeight) / 2 - 60, // Center vertically with offset for subtitle
    width: titleWidth,
    height: titleHeight,
    fontSize: 44,
    fontFamily: "Roboto",
    color: "#000000",
    backgroundColor: "transparent",
    textAlign: "center",
    fontWeight: "bold",
    fontStyle: "normal",
    rotation: 0,
  };
}

function createSubtitlePlaceholder() {
  const canvasWidth = 960;
  const canvasHeight = 540;
  const subtitleWidth = 640; // Optimized width to fit within canvas with proper margins
  const subtitleHeight = 60;
  
  return {
    id: uuidv4(),
    type: "text",
    content: "",
    placeholder: "Click to add subtitle",
    x: (canvasWidth - subtitleWidth) / 2, // Center horizontally (160px margin on each side)
    y: (canvasHeight - subtitleHeight) / 2 + 60, // Center vertically below title
    width: subtitleWidth,
    height: subtitleHeight,
    fontSize: 20,
    fontFamily: "Roboto",
    color: "#666666",
    backgroundColor: "transparent",
    textAlign: "center",
    fontWeight: "normal",
    fontStyle: "normal",
    rotation: 0,
  };
}

function App() {
  const [slides, setSlides] = useState([
    {
      id: uuidv4(),
      elements: [createTitlePlaceholder(), createSubtitlePlaceholder()],
      background: "#ffffff",
      backgroundGradient: null,
      backgroundImage: null,
      theme: "default",
      themeAccent: null,
      themeAccentSecondary: null,
    },
  ]);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presentationSlideIndex, setPresentationSlideIndex] = useState(0);
  const [presentationTitle, setPresentationTitle] = useState(
    "Presentation"
  );
  const [currentPresentationId, setCurrentPresentationId] = useState(null);
  const [savedPresentations, setSavedPresentations] = useState([]);
  const [recentPdfs, setRecentPdfs] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showShapesLibrary, setShowShapesLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [toolbarActiveTab, setToolbarActiveTab] = useState("insert");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleSelectElement = useCallback((element) => {
    setSelectedElement(element);
    setToolbarActiveTab(element ? "format" : "insert");
  }, []);

  // Save presentation to localStorage
  const pruneStorage = useCallback((presentations) => {
    if (!Array.isArray(presentations)) return [];
    // keep the latest 10 entries to control quota usage
    return presentations
      .slice()
      .sort((a, b) => {
        const timeA = a?.lastModified ? new Date(a.lastModified).getTime() : 0;
        const timeB = b?.lastModified ? new Date(b.lastModified).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 10);
  }, []);

  const persistPresentations = useCallback(
    (presentations) => {
      const trimmed = pruneStorage(presentations);
      setSavedPresentations(trimmed);
      try {
        localStorage.setItem("savedPresentations", JSON.stringify(trimmed));
      } catch (error) {
        console.warn(
          "Failed to write saved presentations, attempting cleanup",
          error
        );
        const smallerList = trimmed.slice(0, Math.max(trimmed.length - 1, 0));
        setSavedPresentations(smallerList);
        try {
          localStorage.setItem(
            "savedPresentations",
            JSON.stringify(smallerList)
          );
          alert(
            "Storage is nearly full. Oldest presentation removed to complete save."
          );
        } catch (err) {
          console.error(
            "Unable to persist presentations even after cleanup.",
            err
          );
          alert(
            "Unable to save presentation because browser storage quota is full. Please delete unused presentations."
          );
        }
      }
    },
    [pruneStorage]
  );

  const handleSave = useCallback(() => {
    const presentation = {
      id: currentPresentationId || Date.now().toString(),
      title: presentationTitle.trim() || "Presentation",
      slides: JSON.parse(JSON.stringify(slides)),
      lastModified: new Date().toISOString(),
    };

    const existingIndex = savedPresentations.findIndex(
      (p) => p.id === presentation.id
    );
    let updatedPresentations;

    if (existingIndex >= 0) {
      updatedPresentations = [...savedPresentations];
      updatedPresentations[existingIndex] = presentation;
    } else {
      updatedPresentations = [...savedPresentations, presentation];
    }

    persistPresentations(updatedPresentations);
    setCurrentPresentationId(presentation.id);

    alert("Presentation saved successfully!");
  }, [
    slides,
    presentationTitle,
    currentPresentationId,
    savedPresentations,
    persistPresentations,
  ]);

  // Create new presentation
  const createNewPresentation = useCallback(() => {
    if (
      window.confirm(
        "Create a new presentation? Any unsaved changes will be lost."
      )
    ) {
      setSlides([
        {
          id: uuidv4(),
          elements: [createTitlePlaceholder(), createSubtitlePlaceholder()],
          background: "#ffffff",
          backgroundGradient: null,
          backgroundImage: null,
          theme: "default",
          themeAccent: null,
          themeAccentSecondary: null,
        },
      ]);
      setCurrentSlideIndex(0);
      handleSelectElement(null);
      setPresentationTitle("Presentation");
      setCurrentPresentationId(null);
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, []);

  // Open existing presentation
  const openPresentation = useCallback(
    (presentationId) => {
      const presentation = savedPresentations.find(
        (p) => p.id === presentationId
      );
      if (presentation) {
        setSlides(presentation.slides);
        setPresentationTitle(presentation.title);
        setCurrentPresentationId(presentation.id);
        setCurrentSlideIndex(0);
        handleSelectElement(null);
        setHistory([]);
        setHistoryIndex(-1);
      }
    },
    [savedPresentations]
  );

  // Delete presentation
  const deletePresentation = useCallback(
    (presentationId) => {
      if (
        window.confirm("Are you sure you want to delete this presentation?")
      ) {
        const updatedPresentations = savedPresentations.filter(
          (p) => p.id !== presentationId
        );
        persistPresentations(updatedPresentations);

        // If deleting current presentation, create new one
        if (currentPresentationId === presentationId) {
          createNewPresentation();
        }
      }
    },
    [
      savedPresentations,
      currentPresentationId,
      persistPresentations,
      createNewPresentation,
    ]
  );

  // Download as PDF
  const addRecentPdf = useCallback((slidesSnapshot, title) => {
    setRecentPdfs((prev) => {
      const record = {
        id: uuidv4(),
        title: title || "Presentation",
        slides: slidesSnapshot,
        createdAt: new Date().toISOString(),
      };
      const updated = [record, ...prev].slice(0, 10);
      return updated;
    });
  }, []);

  const deleteRecentPdf = useCallback((id) => {
    setRecentPdfs((prev) => prev.filter((record) => record.id !== id));
  }, []);

  const openRecentPdf = useCallback(
    async (id) => {
      const record = recentPdfs.find((item) => item.id === id);
      if (!record) {
        alert("Recent PDF not found.");
        return;
      }
      const result = await exportToPDF(record.slides, record.title);
      if (!result.success && result.error) {
        alert(`Failed to open PDF: ${result.error}`);
      }
    },
    [recentPdfs]
  );

  const downloadAsPDF = useCallback(async () => {
    try {
      alert("Generating PDF... This may take a few moments.");
      const slidesSnapshot = JSON.parse(JSON.stringify(slides));
      const result = await exportToPDF(slidesSnapshot, presentationTitle);
      if (result.success) {
        alert("PDF downloaded successfully!");
        addRecentPdf(slidesSnapshot, presentationTitle);
      } else {
        alert(`Error generating PDF: ${result.error}`);
      }
    } catch (error) {
      alert("Failed to generate PDF. Please try again.");
      console.error("PDF export error:", error);
    }
  }, [slides, presentationTitle, addRecentPdf]);

  // Load saved data on mount
  useEffect(() => {
    try {
      // Load saved presentations
      const saved = localStorage.getItem("savedPresentations");
      if (saved && saved !== 'undefined' && saved !== 'null' && saved.trim() !== '') {
        try {
          const parsed = JSON.parse(saved);
          setSavedPresentations(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error("Error parsing savedPresentations:", e);
          localStorage.removeItem("savedPresentations");
          setSavedPresentations([]);
        }
      } else {
        setSavedPresentations([]);
      }

      // Load recent PDFs
      const storedRecent = localStorage.getItem("recentPdfs");
      if (storedRecent && storedRecent !== 'undefined' && storedRecent !== 'null' && storedRecent.trim() !== '') {
        try {
          const parsed = JSON.parse(storedRecent);
          setRecentPdfs(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error("Error parsing recentPdfs:", e);
          localStorage.removeItem("recentPdfs");
          setRecentPdfs([]);
        }
      } else {
        setRecentPdfs([]);
      }

      // Restore current work if available
      const currentWork = localStorage.getItem("currentWork");
      if (currentWork && currentWork !== 'undefined' && currentWork !== 'null' && currentWork.trim() !== '') {
        try {
          const parsed = JSON.parse(currentWork);
          if (parsed.slides && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
            setSlides(parsed.slides);
            if (parsed.title) {
              setPresentationTitle(parsed.title);
            }
          }
        } catch (e) {
          console.error("Error parsing currentWork:", e);
          localStorage.removeItem("currentWork");
        }
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      // Clear potentially corrupted data
      localStorage.removeItem("savedPresentations");
      localStorage.removeItem("recentPdfs");
      localStorage.removeItem("currentWork");
      setSavedPresentations([]);
      setRecentPdfs([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("recentPdfs", JSON.stringify(recentPdfs));
    } catch (error) {
      console.warn(
        "Unable to persist recent PDFs due to storage limits.",
        error
      );
    }
  }, [recentPdfs]);

  // Export as PPTX using pptxgenjs
  const exportAsPPTX = useCallback(async () => {
    try {
      const result = await exportToPPTX(slides, presentationTitle);
      if (result && result.success) {
        // exportToPPTX triggers file download via library
      } else {
        alert(
          "Failed to export PPTX" +
            (result && result.error ? `: ${result.error}` : "")
        );
      }
    } catch (err) {
      console.error("Export PPTX error", err);
      alert("Failed to export PPTX");
    }
  }, [slides, presentationTitle]);

  // Import presentation from a JSON file (simple import)
  const importPresentation = useCallback(() => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json,application/json";
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size too large. Please select a file smaller than 10MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data && Array.isArray(data.slides)) {
            if (
              window.confirm(
                "Importing will replace your current presentation. Continue?"
              )
            ) {
              setSlides(data.slides);
              setPresentationTitle(data.title || "Imported Presentation");
              setCurrentPresentationId(null);
              setCurrentSlideIndex(0);
              setSelectedElement(null);
              setHistory([]);
              setHistoryIndex(-1);
              alert("Presentation imported successfully");
            }
          } else {
            alert("Invalid presentation file format");
          }
        } catch (err) {
          console.error("Import error", err);
          alert("Failed to import presentation. Please check the file format.");
        }
      };
      reader.onerror = () => {
        alert("Error reading file. Please try again.");
      };
      reader.readAsText(file);
    };
    fileInput.click();
  }, []);

  // Make a copy of current presentation (save as new)
  const makeCopy = useCallback(() => {
    const copy = {
      id: uuidv4(),
      title: `${presentationTitle} (Copy)`,
      slides: JSON.parse(JSON.stringify(slides)),
      lastModified: new Date().toISOString(),
    };
    const updated = [...savedPresentations, copy];
    persistPresentations(updated);
    alert("A copy of the presentation was saved.");
  }, [slides, presentationTitle, savedPresentations, persistPresentations]);

  // Save state to history for undo/redo and persist to localStorage
  const saveToHistory = useCallback(
    (newSlides) => {
      if (isUndoRedoAction.current) {
        isUndoRedoAction.current = false;
        return;
      }

      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(newSlides)));
        return newHistory.slice(-50); // Keep last 50 states
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));

      // Auto-save current work to localStorage
      try {
        const currentWork = {
          slides: newSlides,
          title: presentationTitle,
          lastModified: new Date().toISOString(),
        };
        localStorage.setItem('currentWork', JSON.stringify(currentWork));
      } catch (error) {
        console.warn('Failed to auto-save current work:', error);
      }
    },
    [historyIndex, presentationTitle]
  );

  // Undo functionality
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      setHistoryIndex((prev) => prev - 1);
      setSlides(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  // Redo functionality
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      setHistoryIndex((prev) => prev + 1);
      setSlides(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Set up global undo/redo handlers
  useEffect(() => {
    window.onUndoAction = handleUndo;
    window.onRedoAction = handleRedo;

    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      delete window.onUndoAction;
      delete window.onRedoAction;
    };
  }, [handleUndo, handleRedo]);

  // Handle adding elements from header menu
  const handleHeaderAddElement = useCallback(
    (elementType) => {
      const fileInput = document.createElement("input");

      const addElementWrapper = (element) => {
        const newElement = {
          ...element,
          id: uuidv4(),
        };

        const newSlides = slides.map((slide, i) =>
          i === currentSlideIndex
            ? { ...slide, elements: [...slide.elements, newElement] }
            : slide
        );
        setSlides(newSlides);
        saveToHistory(newSlides);
      };

      switch (elementType) {
        case "text":
          addElementWrapper({
            type: "text",
            content: "",
            placeholder: "Click to add text",
            x: 100,
            y: 100,
            width: 200,
            height: 50,
            fontSize: 16,
            fontFamily: "Roboto",
            color: "#000000",
            backgroundColor: "transparent",
            textAlign: "left",
            fontWeight: "normal",
            fontStyle: "normal",
          });
          break;

        case "image":
          fileInput.type = "file";
          fileInput.accept = "image/*";
          fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                addElementWrapper({
                  type: "image",
                  src: event.target.result,
                  x: 100,
                  y: 100,
                  width: 200,
                  height: 150,
                });
              };
              reader.readAsDataURL(file);
            }
          };
          fileInput.click();
          break;

        case "video":
          fileInput.type = "file";
          fileInput.accept = "video/*";
          fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                addElementWrapper({
                  type: "video",
                  src: event.target.result,
                  x: 100,
                  y: 100,
                  width: 400,
                  height: 300,
                });
              };
              reader.readAsDataURL(file);
            }
          };
          fileInput.click();
          break;

        case "shape":
          addElementWrapper({
            type: "shape",
            shapeType: "rectangle",
            x: 150,
            y: 150,
            width: 100,
            height: 80,
            fill: "#4285f4",
            stroke: "#1a73e8",
            strokeWidth: 2,
          });
          break;

        case "chart":
          addElementWrapper({
            type: "chart",
            chartType: "bar",
            x: 100,
            y: 100,
            width: 300,
            height: 200,
            data: [
              { label: "Jan", value: 65 },
              { label: "Feb", value: 59 },
              { label: "Mar", value: 80 },
              { label: "Apr", value: 81 },
              { label: "May", value: 56 },
            ],
            color: "#4285f4",
          });
          break;

        default:
          break;
      }
    },
    [slides, currentSlideIndex, saveToHistory]
  );

  // Undo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const previousState = history[historyIndex - 1];
      setSlides(JSON.parse(JSON.stringify(previousState)));
      setHistoryIndex((prev) => prev - 1);
      setSelectedElement(null);
    }
  }, [history, historyIndex]);

  // Redo functionality
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const nextState = history[historyIndex + 1];
      setSlides(JSON.parse(JSON.stringify(nextState)));
      setHistoryIndex((prev) => prev + 1);
      setSelectedElement(null);
    }
  }, [history, historyIndex]);

  useEffect(() => {
    // map to your real functions
    window.onUndoAction = undo;
    window.onRedoAction = redo;

    return () => {
      delete window.onUndoAction;
      delete window.onRedoAction;
    };
  }, [undo, redo]);

  const addSlide = useCallback(() => {
    const canvasWidth = 960;
    const canvasHeight = 540;
    
    // Always add title/subtitle containers for "New Slide" button
    // Create centered title placeholder
    const titleWidth = 640;
    const titleHeight = 100;
    const titleElement = {
      id: uuidv4(),
      type: "text",
      content: "",
      placeholder: "Click to add title",
      x: (canvasWidth - titleWidth) / 2,
      y: (canvasHeight - titleHeight) / 2 - 60,
      width: titleWidth,
      height: titleHeight,
      fontSize: 44,
      fontFamily: "Roboto",
      color: "#000000",
      backgroundColor: "transparent",
      textAlign: "center",
      fontWeight: "bold",
      fontStyle: "normal",
      rotation: 0,
    };
    
    // Create centered subtitle placeholder
    const subtitleWidth = 640;
    const subtitleHeight = 60;
    const subtitleElement = {
      id: uuidv4(),
      type: "text",
      content: "",
      placeholder: "Click to add subtitle",
      x: (canvasWidth - subtitleWidth) / 2,
      y: (canvasHeight - subtitleHeight) / 2 + 60,
      width: subtitleWidth,
      height: subtitleHeight,
      fontSize: 20,
      fontFamily: "Roboto",
      color: "#666666",
      backgroundColor: "transparent",
      textAlign: "center",
      fontWeight: "normal",
      fontStyle: "normal",
      rotation: 0,
    };
    
    const elements = [titleElement, subtitleElement];

    const newSlide = {
      id: uuidv4(),
      elements: elements,
      background: "#ffffff",
      backgroundGradient: null,
      backgroundImage: null,
      theme: "default",
      themeAccent: null,
      themeAccentSecondary: null,
    };
    const insertIndex = Math.min(currentSlideIndex + 1, slides.length);
    const newSlides = [...slides];
    newSlides.splice(insertIndex, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(insertIndex);
    saveToHistory(newSlides);
  }, [slides, currentSlideIndex, saveToHistory]);

  const addEmptySlide = useCallback(() => {
    const newSlide = {
      id: uuidv4(),
      elements: [],
      background: "#ffffff",
      backgroundGradient: null,
      backgroundImage: null,
      theme: "default",
      themeAccent: null,
      themeAccentSecondary: null,
    };
    const insertIndex = Math.min(currentSlideIndex + 1, slides.length);
    const newSlides = [...slides];
    newSlides.splice(insertIndex, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(insertIndex);
    saveToHistory(newSlides);
  }, [slides, currentSlideIndex, saveToHistory]);

  const deleteSlide = useCallback(
    (index) => {
      if (slides.length > 1) {
        const newSlides = slides.filter((_, i) => i !== index);
        setSlides(newSlides);
        if (currentSlideIndex >= index && currentSlideIndex > 0) {
          setCurrentSlideIndex((prev) => prev - 1);
        }
        saveToHistory(newSlides);
      }
    },
    [slides, currentSlideIndex, saveToHistory]
  );

  const deleteCurrentSlide = useCallback(() => {
    deleteSlide(currentSlideIndex);
  }, [deleteSlide, currentSlideIndex]);

  const deletePreviousSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      deleteSlide(currentSlideIndex - 1);
    }
  }, [deleteSlide, currentSlideIndex]);

  const reorderSlides = useCallback(
    (sourceIndex, targetIndex) => {
      if (
        sourceIndex === targetIndex ||
        sourceIndex < 0 ||
        targetIndex < 0 ||
        sourceIndex >= slides.length ||
        targetIndex >= slides.length
      ) {
        return;
      }

      const newSlides = [...slides];
      const [movedSlide] = newSlides.splice(sourceIndex, 1);
      newSlides.splice(targetIndex, 0, movedSlide);
      setSlides(newSlides);
      const newIndex = targetIndex;
      setCurrentSlideIndex(newIndex);
      saveToHistory(newSlides);
    },
    [slides, saveToHistory]
  );

  const moveCurrentSlideUp = useCallback(() => {
    if (currentSlideIndex <= 0) return;
    reorderSlides(currentSlideIndex, currentSlideIndex - 1);
  }, [currentSlideIndex, reorderSlides]);

  const moveCurrentSlideDown = useCallback(() => {
    if (currentSlideIndex >= slides.length - 1) return;
    reorderSlides(currentSlideIndex, currentSlideIndex + 1);
  }, [currentSlideIndex, slides.length, reorderSlides]);

  const duplicateSlide = useCallback(
    (index) => {
      const slideToClone = slides[index];
      const newSlide = {
        ...slideToClone,
        id: uuidv4(),
        elements: slideToClone.elements.map((el) => ({
          ...el,
          id: uuidv4(),
        })),
      };
      const newSlides = [...slides];
      newSlides.splice(index + 1, 0, newSlide);
      setSlides(newSlides);
      saveToHistory(newSlides);
    },
    [slides, saveToHistory]
  );

  const updateSlide = useCallback(
    (index, updatedFields) => {
      const newSlides = slides.map((slide, i) => {
        if (i !== index) return slide;
        const previousTheme = slide.theme;
        const merged = {
          ...slide,
          ...updatedFields,
        };
        if (updatedFields.theme && updatedFields.theme !== previousTheme) {
          merged.elements = slide.elements.map((element) => {
            if (element.type !== "text") return element;
            return {
              ...element,
              color: updatedFields.themeAccent || element.color,
              backgroundColor:
                updatedFields.themeAccentSecondary || element.backgroundColor,
            };
          });
        }
        return merged;
      });
      setSlides(newSlides);
      saveToHistory(newSlides);
    },
    [slides, saveToHistory]
  );

  const addElement = useCallback(
    (element, options = {}) => {
      const selectElement = options.select !== false;
      const newElement = {
        ...element,
        id: uuidv4(),
      };

      const newSlides = slides.map((slide, i) =>
        i === currentSlideIndex
          ? { ...slide, elements: [...slide.elements, newElement] }
          : slide
      );
      setSlides(newSlides);
      saveToHistory(newSlides);
      if (selectElement) {
        handleSelectElement(newElement);
      }
    },
    [currentSlideIndex, slides, saveToHistory, handleSelectElement]
  );

  const updateElement = useCallback(
    (elementId, updates) => {
      const newSlides = slides.map((slide, i) =>
        i === currentSlideIndex
          ? {
              ...slide,
              elements: slide.elements.map((el) =>
                el.id === elementId ? { ...el, ...updates } : el
              ),
            }
          : slide
      );
      setSlides(newSlides);
      saveToHistory(newSlides);
      // If the updated element is currently selected, update selectedElement too
      setSelectedElement((prev) =>
        prev && prev.id === elementId ? { ...prev, ...updates } : prev
      );
    },
    [currentSlideIndex, slides, saveToHistory]
  );

  const deleteElement = useCallback(
    (elementId) => {
      const newSlides = slides.map((slide, i) =>
        i === currentSlideIndex
          ? {
              ...slide,
              elements: slide.elements.filter((el) => el.id !== elementId),
            }
          : slide
      );
      setSlides(newSlides);
      handleSelectElement(null);
      saveToHistory(newSlides);
    },
    [currentSlideIndex, slides, saveToHistory, handleSelectElement]
  );

  const copyElement = useCallback((element) => {
    if (!element) return;
    const cloned = JSON.parse(JSON.stringify(element));
    delete cloned.id;
    setClipboard(cloned);
  }, []);

  const cutElement = useCallback(
    (element) => {
      if (!element) return;
      const cloned = JSON.parse(JSON.stringify(element));
      delete cloned.id;
      setClipboard(cloned);
      deleteElement(element.id);
    },
    [deleteElement]
  );

  const pasteElement = useCallback(
    (position = {}) => {
      if (!clipboard) return;
      const canvasWidth = 960;
      const canvasHeight = 540;
      const baseElement = JSON.parse(JSON.stringify(clipboard));
      const width = baseElement.width || 200;
      const height = baseElement.height || 100;
      const fallbackX = selectedElement ? selectedElement.x + 24 : 120;
      const fallbackY = selectedElement ? selectedElement.y + 24 : 120;
      const rawX = typeof position.x === "number" ? position.x : fallbackX;
      const rawY = typeof position.y === "number" ? position.y : fallbackY;
      baseElement.x = Math.max(0, Math.min(canvasWidth - width, rawX));
      baseElement.y = Math.max(0, Math.min(canvasHeight - height, rawY));
      delete baseElement.id;
      addElement(baseElement);
    },
    [addElement, clipboard, selectedElement]
  );

  const duplicateElement = useCallback(
    (element) => {
      if (!element) return;
      const canvasWidth = 960;
      const canvasHeight = 540;
      const cloned = JSON.parse(JSON.stringify(element));
      const width = cloned.width || 200;
      const height = cloned.height || 100;
      cloned.x = Math.max(
        0,
        Math.min(canvasWidth - width, (element.x || 0) + 32)
      );
      cloned.y = Math.max(
        0,
        Math.min(canvasHeight - height, (element.y || 0) + 32)
      );
      delete cloned.id;
      addElement(cloned);
    },
    [addElement]
  );

  const reorderElement = useCallback(
    (elementId, action) => {
      const activeSlide = slides[currentSlideIndex];
      if (!activeSlide) return;
      const elements = [...activeSlide.elements];
      const index = elements.findIndex((el) => el.id === elementId);
      if (index === -1) return;
      const [element] = elements.splice(index, 1);
      if (action === "bringToFront") {
        elements.push(element);
      } else if (action === "sendToBack") {
        elements.unshift(element);
      } else if (action === "bringForward") {
        elements.splice(Math.min(index + 1, elements.length), 0, element);
      } else if (action === "sendBackward") {
        elements.splice(Math.max(index - 1, 0), 0, element);
      } else {
        elements.splice(index, 0, element);
      }
      const newSlides = slides.map((slide, i) =>
        i === currentSlideIndex ? { ...slide, elements } : slide
      );
      setSlides(newSlides);
      saveToHistory(newSlides);
      handleSelectElement(element);
    },
    [currentSlideIndex, slides, saveToHistory, handleSelectElement]
  );

  const startPresentation = useCallback(() => {
    setIsPresentationMode(true);
    setPresentationSlideIndex(currentSlideIndex);
  }, [currentSlideIndex]);

  const exitPresentation = useCallback(() => {
    setIsPresentationMode(false);
  }, []);

  // Zoom functionality
  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 10, 200)); // Max 200%
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 10, 50)); // Min 50%
  }, []);

  const fitToScreen = useCallback(() => {
    // Compute zoom that fits the slide (base 960x540) within the visible canvas container
    try {
      const container = document.querySelector(".canvas-container");
      const baseWidth = 960;
      const baseHeight = 540;

      const containerWidth = container
        ? container.clientWidth
        : window.innerWidth;
      const containerHeight = container
        ? container.clientHeight
        : window.innerHeight;

      const availableWidth = Math.max(containerWidth - 48, 320);
      const availableHeight = Math.max(containerHeight - 48, 240);

      const widthScale = availableWidth / baseWidth;
      const heightScale = availableHeight / baseHeight;

      const scalePercentage = Math.floor(
        Math.min(widthScale, heightScale) * 100
      );
      const clamped = Math.max(50, Math.min(scalePercentage || 100, 200));
      setZoomLevel(clamped);
    } catch (e) {
      setZoomLevel(100);
    }
  }, []);

  // Tools functionality
  const toggleRulers = useCallback(() => {
    setShowRulers((prev) => !prev);
  }, []);

  const arrangeObjects = useCallback(
    (arrangement) => {
      if (!selectedElement) {
        alert("Please select an element first");
        return;
      }

      const currentSlide = slides[currentSlideIndex];
      const elementIndex = currentSlide.elements.findIndex(
        (el) => el.id === selectedElement.id
      );

      if (elementIndex === -1) return;

      const newElements = [...currentSlide.elements];
      const element = newElements.splice(elementIndex, 1)[0];

      switch (arrangement) {
        case "bring-to-front":
          newElements.push(element);
          break;
        case "send-to-back":
          newElements.unshift(element);
          break;
        case "bring-forward":
          if (elementIndex < newElements.length) {
            newElements.splice(elementIndex + 1, 0, element);
          } else {
            newElements.push(element);
          }
          break;
        case "send-backward":
          if (elementIndex > 0) {
            newElements.splice(elementIndex - 1, 0, element);
          } else {
            newElements.unshift(element);
          }
          break;
        default:
          newElements.splice(elementIndex, 0, element);
      }

      const updatedSlide = { ...currentSlide, elements: newElements };
      // updateSlide(currentSlideIndex, updatedSlide);
      updateSlide(currentSlideIndex, { elements: newElements });
    },
    [selectedElement, slides, currentSlideIndex, updateSlide]
  );

  const spellCheck = useCallback(() => {
    const textElements = slides[currentSlideIndex].elements.filter(
      (el) => el.type === "text"
    );
    if (textElements.length === 0) {
      alert("No text elements found on this slide");
      return;
    }
    alert(
      `Spell check feature: Found ${textElements.length} text element(s) on this slide. Full spell check functionality coming soon!`
    );
  }, [slides, currentSlideIndex]);

  const groupElements = useCallback(() => {
    alert(
      "Group Elements: Select multiple elements (Ctrl+Click) to group them together. Feature coming soon!"
    );
  }, []);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if (e.key === "y" || (e.key === "z" && e.shiftKey)) {
          e.preventDefault();
          redo();
        } else if (e.key === "s") {
          e.preventDefault();
          handleSave();
        } else if (e.key === "n") {
          e.preventDefault();
          createNewPresentation();
        } else if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          zoomIn();
        } else if (e.key === "-" || e.key === "_") {
          e.preventDefault();
          zoomOut();
        } else if (e.key === "0") {
          e.preventDefault();
          fitToScreen();
        }
      } else if (e.key === "F5") {
        e.preventDefault();
        startPresentation();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    undo,
    redo,
    handleSave,
    createNewPresentation,
    startPresentation,
    zoomIn,
    zoomOut,
    fitToScreen,
  ]);

  // Global error handlers so uncaught exceptions surface visibly
  React.useEffect(() => {
    const onError = (event) => {
      console.error(
        "Global window error:",
        event.error || event.message,
        event
      );
    };
    const onRejection = (event) => {
      console.error("Unhandled promise rejection:", event.reason || event);
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  // expose PDF blob helper for ShareModal to call
  React.useEffect(() => {
    window.exportToPDFForShare = async (slides, title) => {
      try {
        const result = await exportToPDF(slides, title);
        return result;
      } catch (error) {
        console.error("Export PDF error:", error);
        return { success: false, error: error.message };
      }
    };
    return () => {
      delete window.exportToPDFForShare;
    };
  }, []);

  if (isPresentationMode) {
    return (
      <PresentationMode
        slides={slides}
        currentSlideIndex={presentationSlideIndex}
        onSlideChange={setPresentationSlideIndex}
        onExit={exitPresentation}
      />
    );
  }

  return (
    <div className="app">
      <Header
        savedPresentations={savedPresentations}
        recentPdfs={recentPdfs}
        onOpenRecentPdf={openRecentPdf}
        onDeleteRecentPdf={deleteRecentPdf}
        onAddElement={handleHeaderAddElement}
        onShowHelp={() => setShowHelp(true)}
        onShowShare={() => setShowShare(true)}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitToScreen={fitToScreen}
        zoomLevel={zoomLevel}
        onSpellCheck={spellCheck}
        onToggleRulers={toggleRulers}
        onArrangeObjects={arrangeObjects}
        onGroupElements={groupElements}
        onShowSettings={() => setShowSettings(true)}
        showRulers={showRulers}
        toolbarActiveTab={toolbarActiveTab}
        setToolbarActiveTab={setToolbarActiveTab}
        slideCount={slides.length}
        currentSlideIndex={currentSlideIndex}
        onAddSlide={addSlide}
        onAddEmptySlide={addEmptySlide}
        onDeleteCurrentSlide={deleteCurrentSlide}
        onDeletePreviousSlide={deletePreviousSlide}
        onMoveSlideUp={moveCurrentSlideUp}
        onMoveSlideDown={moveCurrentSlideDown}
        onStartPresentation={startPresentation}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        presentationTitle={presentationTitle}
        onTitleChange={setPresentationTitle}
        onNew={createNewPresentation}
        onSave={handleSave}
        onOpen={openPresentation}
        onDelete={deletePresentation}
        onDownloadPDF={downloadAsPDF}
        onExportPPTX={exportAsPPTX}
        onImport={importPresentation}
        onMakeCopy={makeCopy}
      />
      <div className="app-content">
<Toolbar
        onAddElement={addElement}
        selectedElement={selectedElement}
        onUpdateElement={updateElement}
        onDeleteElement={deleteElement}
        slides={slides}
        currentSlideIndex={currentSlideIndex}
        onUpdateSlide={updateSlide}
        onAddSlide={addSlide}
        onAddEmptySlide={addEmptySlide}
        onDeleteCurrentSlide={deleteCurrentSlide}
        onDeletePreviousSlide={deletePreviousSlide}
        toolbarActiveTab={toolbarActiveTab}
        setToolbarActiveTab={setToolbarActiveTab}
        onShowShapesLibrary={() => setShowShapesLibrary(true)}
      />
      <div className="main-content">
        <SlidePanel
          slides={slides}
          currentSlideIndex={currentSlideIndex}
          onSlideSelect={setCurrentSlideIndex}
          onAddSlide={addSlide}
          onAddEmptySlide={addEmptySlide}
          onDeleteSlide={deleteSlide}
          onDuplicateSlide={duplicateSlide}
          onReorderSlides={reorderSlides}
        />
        <Canvas
          slide={slides[currentSlideIndex] || slides[0] || {id: "placeholder", elements: [], background: "#ffffff", theme: "default"}}
          onUpdateSlide={(updatedSlide) =>
            updateSlide(currentSlideIndex, updatedSlide)
          }
          selectedElement={selectedElement}
          onSelectElement={handleSelectElement}
          onUpdateElement={updateElement}
          onDeleteElement={deleteElement}
          onAddElement={addElement}
          onCopyElement={copyElement}
          onCutElement={cutElement}
          onPasteElement={pasteElement}
          onDuplicateElement={duplicateElement}
          onReorderElement={reorderElement}
          clipboard={clipboard}
          zoomLevel={zoomLevel}
          showRulers={showRulers}
          onToggleRulers={toggleRulers}
        />
      </div>

      </div>
      
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showShare && (
        <ShareModal
          onClose={() => setShowShare(false)}
          presentationTitle={presentationTitle}
          savedPresentations={savedPresentations}
        />
      )}
      {showShapesLibrary && (
        <ShapesLibrary
          onClose={() => setShowShapesLibrary(false)}
          onAddShape={addElement}
          slides={slides}
          currentSlideIndex={currentSlideIndex}
        />
      )}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button
                className="close-btn"
                onClick={() => setShowSettings(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-content">
              <div className="settings-section">
                <h3>Display Settings</h3>
                <label className="settings-option">
                  <input
                    type="checkbox"
                    checked={showRulers}
                    onChange={toggleRulers}
                  />
                  <span>Show Rulers & Guides</span>
                </label>
              </div>
              <div className="settings-section">
                <h3>Zoom Settings</h3>
                <p>Current Zoom: {zoomLevel}%</p>
                <div className="zoom-controls">
                  <button onClick={zoomOut} className="settings-btn">
                    -
                  </button>
                  <button onClick={fitToScreen} className="settings-btn">
                    Reset
                  </button>
                  <button onClick={zoomIn} className="settings-btn">
                    +
                  </button>
                </div>
              </div>
              <div className="settings-section">
                <h3>About</h3>
                <p>React Slide Studio v1.0</p>
                <p>A modern presentation tool built with React</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
