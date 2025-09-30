import React, { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header/Header';
import Toolbar from './components/Toolbar/Toolbar';
import SlidePanel from './components/SlidePanel/SlidePanel';
import Canvas from './components/Canvas/Canvas';
import PresentationMode from './components/PresentationMode/PresentationMode';
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
  
  // Undo/Redo functionality
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);

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
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

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
    </div>
  );
}

export default App;
