import React, { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header/Header';
import Toolbar from './components/Toolbar/Toolbar';
import SlidePanel from './components/SlidePanel/SlidePanel';
import Canvas from './components/Canvas/Canvas';
import PresentationMode from './components/PresentationMode/PresentationMode';
import HelpModal from './components/HelpModal/HelpModal';
import './App.css';

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
        }
      } else if (e.key === 'F5') {
        e.preventDefault();
        startPresentation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, savePresentation, createNewPresentation, startPresentation]);

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
        savedPresentations={savedPresentations}
        onAddElement={handleHeaderAddElement}
        onShowHelp={() => setShowHelp(true)}
      />
      <Toolbar 
        onAddElement={addElement}
        selectedElement={selectedElement}
        onUpdateElement={updateElement}
        onDeleteElement={deleteElement}
        slides={slides}
        currentSlideIndex={currentSlideIndex}
        onUpdateSlide={updateSlide}
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
        />
      </div>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default App;
