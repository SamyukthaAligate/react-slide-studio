import React, { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header/Header';
import Toolbar from './components/Toolbar/Toolbar';
import SlidePanel from './components/SlidePanel/SlidePanel';
import Canvas from './components/Canvas/Canvas';
import PresentationMode from './components/PresentationMode/PresentationMode';
import HelpModal from './components/HelpModal/HelpModal';
import ShareModal from './components/ShareModal/ShareModal';
import ChartModal from './components/ChartModal/ChartModal';
import { exportToPDF } from './utils/pdfExport';
import './App.css';
import { exportToPDFBlobUrl } from './utils/pdfExport';
import { exportToPPTX } from './utils/pptxExport';

function App() {
  const [slides, setSlides] = useState([
    {
      id: uuidv4(),
      elements: [],
      background: '#ffffff',
      theme: 'default'
    }
  ]);
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presentationSlideIndex, setPresentationSlideIndex] = useState(0);
  const [presentationTitle, setPresentationTitle] = useState('Untitled Presentation');
  const [currentPresentationId, setCurrentPresentationId] = useState(null);
  const [savedPresentations, setSavedPresentations] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100); // Zoom level in percentage
  const [showRulers, setShowRulers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toolbarActiveTab, setToolbarActiveTab] = useState(null);
  
  // Undo/Redo functionality
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);

  // Load saved presentations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedPresentations');
    if (saved) {
      try {
        setSavedPresentations(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading presentations:', e);
      }
    }
  }, []);

  // Save presentation to localStorage
  const savePresentation = useCallback(() => {
    const presentation = {
      id: currentPresentationId || uuidv4(),
      title: presentationTitle,
      slides: slides,
      lastModified: new Date().toISOString()
    };

    const existingIndex = savedPresentations.findIndex(p => p.id === presentation.id);
    let updatedPresentations;

    if (existingIndex >= 0) {
      updatedPresentations = [...savedPresentations];
      updatedPresentations[existingIndex] = presentation;
    } else {
      updatedPresentations = [...savedPresentations, presentation];
    }

    setSavedPresentations(updatedPresentations);
    localStorage.setItem('savedPresentations', JSON.stringify(updatedPresentations));
    setCurrentPresentationId(presentation.id);
    
    alert('Presentation saved successfully!');
  }, [slides, presentationTitle, currentPresentationId, savedPresentations]);

  // Create new presentation
  const createNewPresentation = useCallback(() => {
    if (window.confirm('Create a new presentation? Any unsaved changes will be lost.')) {
      setSlides([{
        id: uuidv4(),
        elements: [],
        background: '#ffffff',
        theme: 'default'
      }]);
      setCurrentSlideIndex(0);
      setSelectedElement(null);
      setPresentationTitle('Untitled Presentation');
      setCurrentPresentationId(null);
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, []);

  // Open existing presentation
  const openPresentation = useCallback((presentationId) => {
    const presentation = savedPresentations.find(p => p.id === presentationId);
    if (presentation) {
      setSlides(presentation.slides);
      setPresentationTitle(presentation.title);
      setCurrentPresentationId(presentation.id);
      setCurrentSlideIndex(0);
      setSelectedElement(null);
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, [savedPresentations]);

  // Delete presentation
  const deletePresentation = useCallback((presentationId) => {
    if (window.confirm('Are you sure you want to delete this presentation?')) {
      const updatedPresentations = savedPresentations.filter(p => p.id !== presentationId);
      setSavedPresentations(updatedPresentations);
      localStorage.setItem('savedPresentations', JSON.stringify(updatedPresentations));
      
      // If deleting current presentation, create new one
      if (currentPresentationId === presentationId) {
        createNewPresentation();
      }
    }
  }, [savedPresentations, currentPresentationId]);

  // Download as PDF
  const downloadAsPDF = useCallback(async () => {
    try {
      alert('Generating PDF... This may take a few moments.');
      const result = await exportToPDF(slides, presentationTitle);
      if (result.success) {
        alert('PDF downloaded successfully!');
      } else {
        alert(`Error generating PDF: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to generate PDF. Please try again.');
      console.error('PDF export error:', error);
    }
  }, [slides, presentationTitle]);

  // Export as PPTX using pptxgenjs
  const exportAsPPTX = useCallback(async () => {
    try {
      const result = await exportToPPTX(slides, presentationTitle);
      if (result && result.success) {
        // exportToPPTX triggers file download via library
      } else {
        alert('Failed to export PPTX' + (result && result.error ? `: ${result.error}` : ''));
      }
    } catch (err) {
      console.error('Export PPTX error', err);
      alert('Failed to export PPTX');
    }
  }, [slides, presentationTitle]);

  // Import presentation from a JSON file (simple import)
  const importPresentation = useCallback(() => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data && Array.isArray(data.slides)) {
            if (window.confirm('Importing will replace your current presentation. Continue?')) {
              setSlides(data.slides);
              setPresentationTitle(data.title || 'Imported Presentation');
              setCurrentPresentationId(null);
              setCurrentSlideIndex(0);
              setSelectedElement(null);
              setHistory([]);
              setHistoryIndex(-1);
              alert('Presentation imported successfully');
            }
          } else {
            alert('Invalid presentation file');
          }
        } catch (err) {
          console.error('Import error', err);
          alert('Failed to import presentation');
        }
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
      lastModified: new Date().toISOString()
    };
    const updated = [...savedPresentations, copy];
    setSavedPresentations(updated);
    localStorage.setItem('savedPresentations', JSON.stringify(updated));
    alert('A copy of the presentation was saved.');
  }, [slides, presentationTitle, savedPresentations]);

  // Save state to history for undo/redo
  const saveToHistory = useCallback((newSlides) => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newSlides)));
      return newHistory.slice(-50); // Keep last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Handle adding elements from header menu
  const handleHeaderAddElement = useCallback((elementType) => {
    const fileInput = document.createElement('input');
    
    const addElementWrapper = (element) => {
      const newElement = {
        ...element,
        id: uuidv4()
      };
      
      const newSlides = slides.map((slide, i) => 
        i === currentSlideIndex 
          ? { ...slide, elements: [...slide.elements, newElement] }
          : slide
      );
      setSlides(newSlides);
      saveToHistory(newSlides);
    };
    
    switch(elementType) {
      case 'text':
        addElementWrapper({
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
        break;
      
      case 'image':
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              addElementWrapper({
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
        fileInput.click();
        break;
      
      case 'video':
        fileInput.type = 'file';
        fileInput.accept = 'video/*';
        fileInput.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              addElementWrapper({
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
        fileInput.click();
        break;
      
      case 'shape':
        addElementWrapper({
          type: 'shape',
          shapeType: 'rectangle',
          x: 150,
          y: 150,
          width: 100,
          height: 80,
          fill: '#4285f4',
          stroke: '#1a73e8',
          strokeWidth: 2
        });
        break;
      
      case 'chart':
        addElementWrapper({
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
        });
        break;
      
      default:
        break;
    }
  }, [slides, currentSlideIndex, saveToHistory]);

  // Undo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const previousState = history[historyIndex - 1];
      setSlides(JSON.parse(JSON.stringify(previousState)));
      setHistoryIndex(prev => prev - 1);
      setSelectedElement(null);
    }
  }, [history, historyIndex]);

  // Redo functionality
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const nextState = history[historyIndex + 1];
      setSlides(JSON.parse(JSON.stringify(nextState)));
      setHistoryIndex(prev => prev + 1);
      setSelectedElement(null);
    }
  }, [history, historyIndex]);

  const addSlide = useCallback(() => {
    const newSlide = {
      id: uuidv4(),
      elements: [],
      background: '#ffffff',
      theme: 'default'
    };
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    setCurrentSlideIndex(slides.length);
    saveToHistory(newSlides);
  }, [slides, saveToHistory]);

  const deleteSlide = useCallback((index) => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, i) => i !== index);
      setSlides(newSlides);
      if (currentSlideIndex >= index && currentSlideIndex > 0) {
        setCurrentSlideIndex(prev => prev - 1);
      }
      saveToHistory(newSlides);
    }
  }, [slides, currentSlideIndex, saveToHistory]);

  const duplicateSlide = useCallback((index) => {
    const slideToClone = slides[index];
    const newSlide = {
      ...slideToClone,
      id: uuidv4(),
      elements: slideToClone.elements.map(el => ({
        ...el,
        id: uuidv4()
      }))
    };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    setSlides(newSlides);
    saveToHistory(newSlides);
  }, [slides, saveToHistory]);

  const updateSlide = useCallback((index, updatedSlide) => {
    const newSlides = slides.map((slide, i) => i === index ? updatedSlide : slide);
    setSlides(newSlides);
    saveToHistory(newSlides);
  }, [slides, saveToHistory]);

  const addElement = useCallback((element) => {
    const newElement = {
      ...element,
      id: uuidv4()
    };
    
    const newSlides = slides.map((slide, i) => 
      i === currentSlideIndex 
        ? { ...slide, elements: [...slide.elements, newElement] }
        : slide
    );
    setSlides(newSlides);
    saveToHistory(newSlides);
  }, [currentSlideIndex, slides, saveToHistory]);

  const updateElement = useCallback((elementId, updates) => {
    const newSlides = slides.map((slide, i) => 
      i === currentSlideIndex 
        ? {
            ...slide,
            elements: slide.elements.map(el => 
              el.id === elementId ? { ...el, ...updates } : el
            )
          }
        : slide
    );
    setSlides(newSlides);
    saveToHistory(newSlides);
    // If the updated element is currently selected, update selectedElement too
    setSelectedElement(prev => prev && prev.id === elementId ? { ...prev, ...updates } : prev);
  }, [currentSlideIndex, slides, saveToHistory]);

  const deleteElement = useCallback((elementId) => {
    const newSlides = slides.map((slide, i) => 
      i === currentSlideIndex 
        ? {
            ...slide,
            elements: slide.elements.filter(el => el.id !== elementId)
          }
        : slide
    );
    setSlides(newSlides);
    setSelectedElement(null);
    saveToHistory(newSlides);
  }, [currentSlideIndex, slides, saveToHistory]);

  const startPresentation = useCallback(() => {
    setIsPresentationMode(true);
    setPresentationSlideIndex(currentSlideIndex);
  }, [currentSlideIndex]);

  const exitPresentation = useCallback(() => {
    setIsPresentationMode(false);
  }, []);

  // Zoom functionality
  const zoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 10, 200)); // Max 200%
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 10, 50)); // Min 50%
  }, []);

  const fitToScreen = useCallback(() => {
    // Compute zoom that fits the canvas (base 800px width) into the available viewport/container width
    try {
      const container = document.querySelector('.canvas-container');
      const availableWidth = container ? (container.clientWidth - 40) : window.innerWidth - 40; // some padding
      const scale = Math.floor((availableWidth / 800) * 100);
      const clamped = Math.max(50, Math.min(scale, 200));
      setZoomLevel(clamped);
    } catch (e) {
      setZoomLevel(100);
    }
  }, []);

  // Tools functionality
  const toggleRulers = useCallback(() => {
    setShowRulers(prev => !prev);
  }, []);

  const arrangeObjects = useCallback((arrangement) => {
    if (!selectedElement) {
      alert('Please select an element first');
      return;
    }

    const currentSlide = slides[currentSlideIndex];
    const elementIndex = currentSlide.elements.findIndex(el => el.id === selectedElement.id);
    
    if (elementIndex === -1) return;

    const newElements = [...currentSlide.elements];
    const element = newElements.splice(elementIndex, 1)[0];

    switch(arrangement) {
      case 'bring-to-front':
        newElements.push(element);
        break;
      case 'send-to-back':
        newElements.unshift(element);
        break;
      case 'bring-forward':
        if (elementIndex < newElements.length) {
          newElements.splice(elementIndex + 1, 0, element);
        } else {
          newElements.push(element);
        }
        break;
      case 'send-backward':
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
    updateSlide(currentSlideIndex, updatedSlide);
  }, [selectedElement, slides, currentSlideIndex, updateSlide]);

  const spellCheck = useCallback(() => {
    const textElements = slides[currentSlideIndex].elements.filter(el => el.type === 'text');
    if (textElements.length === 0) {
      alert('No text elements found on this slide');
      return;
    }
    alert(`Spell check feature: Found ${textElements.length} text element(s) on this slide. Full spell check functionality coming soon!`);
  }, [slides, currentSlideIndex]);

  const groupElements = useCallback(() => {
    alert('Group Elements: Select multiple elements (Ctrl+Click) to group them together. Feature coming soon!');
  }, []);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        } else if (e.key === 's') {
          e.preventDefault();
          savePresentation();
        } else if (e.key === 'n') {
          e.preventDefault();
          createNewPresentation();
        } else if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          zoomIn();
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          zoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          fitToScreen();
        }
      } else if (e.key === 'F5') {
        e.preventDefault();
        startPresentation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, savePresentation, createNewPresentation, startPresentation, zoomIn, zoomOut, fitToScreen]);

  // Global error handlers so uncaught exceptions surface visibly
  React.useEffect(() => {
    const onError = (event) => {
      console.error('Global window error:', event.error || event.message, event);
    };
    const onRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason || event);
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  // expose PDF blob helper for ShareModal to call
  React.useEffect(() => {
    window.exportToPDFForShare = async (slides, title) => {
      return await exportToPDFBlobUrl(slides, title);
    };
    return () => { delete window.exportToPDFForShare; };
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
        onStartPresentation={startPresentation}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        presentationTitle={presentationTitle}
        onTitleChange={setPresentationTitle}
        onSave={savePresentation}
        onNew={createNewPresentation}
        onOpen={openPresentation}
        onDelete={deletePresentation}
        onDownloadPDF={downloadAsPDF}
  onExportPPTX={exportAsPPTX}
  onImport={importPresentation}
  onMakeCopy={makeCopy}
        savedPresentations={savedPresentations}
        onAddElement={handleHeaderAddElement}
        onShowHelp={() => setShowHelp(true)}
        onShowShare={() => setShowShare(true)}
        onShowChartModal={() => setShowChartModal(true)}
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
      />
      <Toolbar 
        onAddElement={addElement}
        selectedElement={selectedElement}
        onUpdateElement={updateElement}
        onDeleteElement={deleteElement}
        slides={slides}
        currentSlideIndex={currentSlideIndex}
        onUpdateSlide={updateSlide}
        toolbarActiveTab={toolbarActiveTab}
        setToolbarActiveTab={setToolbarActiveTab}
      />
      <div className="main-content">
        <SlidePanel
          slides={slides}
          currentSlideIndex={currentSlideIndex}
          onSlideSelect={setCurrentSlideIndex}
          onAddSlide={addSlide}
          onDeleteSlide={deleteSlide}
          onDuplicateSlide={duplicateSlide}
        />
        <Canvas
          slide={slides[currentSlideIndex]}
          onUpdateSlide={(updatedSlide) => updateSlide(currentSlideIndex, updatedSlide)}
          selectedElement={selectedElement}
          onSelectElement={setSelectedElement}
          onUpdateElement={updateElement}
          onDeleteElement={deleteElement}
          onAddElement={addElement}
          zoomLevel={zoomLevel}
          showRulers={showRulers}
          onToggleRulers={toggleRulers}
        />
      </div>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
  {showShare && <ShareModal onClose={() => setShowShare(false)} presentationTitle={presentationTitle} savedPresentations={savedPresentations} />}
      {showChartModal && <ChartModal onClose={() => setShowChartModal(false)} onCreateChart={addElement} />}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-cog"></i> Settings</h2>
              <button className="close-btn" onClick={() => setShowSettings(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-content">
              <div className="settings-section">
                <h3>Display Settings</h3>
                <label className="settings-option">
                  <input type="checkbox" checked={showRulers} onChange={toggleRulers} />
                  <span>Show Rulers & Guides</span>
                </label>
              </div>
              <div className="settings-section">
                <h3>Zoom Settings</h3>
                <p>Current Zoom: {zoomLevel}%</p>
                <div className="zoom-controls">
                  <button onClick={zoomOut} className="settings-btn">-</button>
                  <button onClick={fitToScreen} className="settings-btn">Reset</button>
                  <button onClick={zoomIn} className="settings-btn">+</button>
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
