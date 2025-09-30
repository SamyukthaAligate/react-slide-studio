import React, { useState } from 'react';
import './HelpModal.css';

const HelpModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('guide');

  const shortcuts = [
    { keys: 'Ctrl + S', description: 'Save presentation' },
    { keys: 'Ctrl + N', description: 'New presentation' },
    { keys: 'Ctrl + Z', description: 'Undo' },
    { keys: 'Ctrl + Y', description: 'Redo' },
    { keys: 'Delete', description: 'Delete selected element' },
    { keys: 'Escape', description: 'Deselect element' },
    { keys: 'F5', description: 'Start presentation' },
    { keys: 'Arrow Keys', description: 'Navigate slides in presentation mode' },
    { keys: 'Ctrl + B', description: 'Bold text' },
    { keys: 'Ctrl + I', description: 'Italic text' },
    { keys: 'Ctrl + U', description: 'Underline text' },
  ];

  const guideSteps = [
    {
      title: '1. Create a New Presentation',
      description: 'Click File → New Presentation or press Ctrl+N to start fresh.',
      icon: 'fa-file'
    },
    {
      title: '2. Add Slides',
      description: 'Click the + button in the slide panel on the left to add more slides.',
      icon: 'fa-plus-square'
    },
    {
      title: '3. Insert Elements',
      description: 'Use the Insert tab in the toolbar to add text boxes, images, videos, shapes, and charts.',
      icon: 'fa-plus-circle'
    },
    {
      title: '4. Edit Text',
      description: 'Double-click any text box to edit. Use the Format tab to change fonts, colors, and alignment.',
      icon: 'fa-edit'
    },
    {
      title: '5. Move & Resize',
      description: 'Click and drag elements to move them. Drag corner handles to resize.',
      icon: 'fa-arrows-alt'
    },
    {
      title: '6. Apply Themes',
      description: 'Go to Design tab to choose from 12 beautiful themes and backgrounds.',
      icon: 'fa-palette'
    },
    {
      title: '7. Save Your Work',
      description: 'Click File → Save or press Ctrl+S to save your presentation locally.',
      icon: 'fa-save'
    },
    {
      title: '8. Present',
      description: 'Click the Present button or press F5 to start your presentation in fullscreen.',
      icon: 'fa-play'
    }
  ];

  const tips = [
    {
      title: 'Quick Text Formatting',
      description: 'Select text and use Ctrl+B for bold, Ctrl+I for italic, and Ctrl+U for underline.',
      icon: 'fa-font'
    },
    {
      title: 'Duplicate Slides',
      description: 'Right-click on any slide thumbnail and select "Duplicate" to create a copy.',
      icon: 'fa-copy'
    },
    {
      title: 'Undo Mistakes',
      description: 'Made a mistake? Press Ctrl+Z to undo. The app remembers your last 50 actions!',
      icon: 'fa-undo'
    },
    {
      title: 'Precise Positioning',
      description: 'Hold Shift while dragging to move elements in straight lines.',
      icon: 'fa-crosshairs'
    },
    {
      title: 'Multiple Presentations',
      description: 'Create multiple presentations and access them from File → Open Recent.',
      icon: 'fa-folder-open'
    },
    {
      title: 'Video Support',
      description: 'Add videos to your slides! Go to Insert → Video and upload your video file.',
      icon: 'fa-video'
    }
  ];

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h2>
            <i className="fas fa-question-circle"></i>
            Help & Support
          </h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="help-modal-tabs">
          <button 
            className={`help-tab ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            <i className="fas fa-book"></i>
            User Guide
          </button>
          <button 
            className={`help-tab ${activeTab === 'shortcuts' ? 'active' : ''}`}
            onClick={() => setActiveTab('shortcuts')}
          >
            <i className="fas fa-keyboard"></i>
            Shortcuts
          </button>
          <button 
            className={`help-tab ${activeTab === 'tips' ? 'active' : ''}`}
            onClick={() => setActiveTab('tips')}
          >
            <i className="fas fa-lightbulb"></i>
            Tips & Tricks
          </button>
        </div>

        <div className="help-modal-content">
          {activeTab === 'guide' && (
            <div className="guide-content">
              <div className="guide-intro">
                <h3>Welcome to React Slide Studio!</h3>
                <p>Follow these simple steps to create amazing presentations:</p>
              </div>
              <div className="guide-steps">
                {guideSteps.map((step, index) => (
                  <div key={index} className="guide-step">
                    <div className="step-icon">
                      <i className={`fas ${step.icon}`}></i>
                    </div>
                    <div className="step-content">
                      <h4>{step.title}</h4>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="shortcuts-content">
              <div className="shortcuts-intro">
                <h3>Keyboard Shortcuts</h3>
                <p>Speed up your workflow with these handy shortcuts:</p>
              </div>
              <div className="shortcuts-list">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="shortcut-item">
                    <kbd className="shortcut-keys">{shortcut.keys}</kbd>
                    <span className="shortcut-description">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="tips-content">
              <div className="tips-intro">
                <h3>Tips & Tricks</h3>
                <p>Get the most out of React Slide Studio:</p>
              </div>
              <div className="tips-list">
                {tips.map((tip, index) => (
                  <div key={index} className="tip-item">
                    <div className="tip-icon">
                      <i className={`fas ${tip.icon}`}></i>
                    </div>
                    <div className="tip-content">
                      <h4>{tip.title}</h4>
                      <p>{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="help-modal-footer">
          <p>Need more help? Check out our video tutorials or contact support.</p>
          <button className="primary-btn" onClick={onClose}>Got it!</button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
