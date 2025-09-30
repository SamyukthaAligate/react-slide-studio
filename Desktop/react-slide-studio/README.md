# React Slide Studio

A fully functional Google Slides replica built with React and CSS. This application provides a complete presentation creation experience with drag-and-drop functionality, text editing, shape insertion, image/video upload, save/load capabilities, and presentation mode.

## 🌟 New Features (v2.0)

### 💾 **Save & Load System**
- **Save Presentations**: Save your work locally with `Ctrl+S`
- **Multiple Presentations**: Create and manage multiple presentations
- **Open Recent**: Access all saved presentations from File menu
- **Persistent Storage**: Presentations saved in browser localStorage
- **Auto-Save Metadata**: Tracks title and last modified date

### 🎥 **Video Support**
- **Upload Videos**: Add MP4, WebM videos to slides
- **Video Controls**: Play, pause, and control volume in editor
- **Presentation Playback**: Videos work seamlessly in presentation mode
- **Drag & Resize**: Move and resize videos like any other element

### 📋 **Interactive Menus**
- **File Menu**: New, Save, Open Recent, Export options
- **Edit Menu**: Undo, Redo, Cut, Copy, Paste
- **View Menu**: Presentation mode, Zoom controls
- **Insert Menu**: Quick access to add elements
- **Format Menu**: Text formatting shortcuts
- **Tools Menu**: Advanced features and settings
- **Help Menu**: User guide, shortcuts, tips & tricks

### ❓ **Help System**
- **User Guide**: Step-by-step instructions
- **Keyboard Shortcuts**: Complete shortcut reference
- **Tips & Tricks**: Productivity tips for power users
- **Interactive Modal**: Beautiful tabbed interface

## Features

### 🎨 **Core Functionality**
- **Slide Management**: Add, delete, duplicate, and navigate between slides
- **Text Elements**: Add text boxes with full formatting options (font, size, color, alignment)
- **Shapes**: Insert rectangles, circles, and triangles with customizable colors and borders
- **Images**: Upload and insert images from your device
- **Videos**: Upload and insert videos with playback controls (NEW!)
- **Charts**: Create bar, pie, and line charts with sample data
- **Drag & Drop**: Move and resize elements with intuitive mouse interactions
- **Presentation Mode**: Full-screen presentation with keyboard navigation
- **Undo/Redo**: 50-level history for all actions

### 🎯 **User Interface**
- **Google Slides-inspired Design**: Clean, modern interface matching Google's design language
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile devices
- **Context Menus**: Right-click functionality for slide operations
- **Keyboard Shortcuts**: Standard shortcuts for navigation and editing
- **Real-time Editing**: Double-click text elements to edit inline

### 📱 **Responsive Design**
- **Desktop**: Full-featured experience with all tools visible
- **Tablet**: Optimized layout with collapsible panels
- **Mobile**: Touch-friendly interface with simplified controls

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   cd react-slide-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the application

## Usage Guide

### Basic Operations

#### **Creating Slides**
- Click the "+" button in the slide panel to add a new slide
- Right-click on any slide thumbnail for options (duplicate, delete)

#### **Adding Elements**
1. **Text**: Click "Text box" in the Insert tab to add editable text
2. **Shapes**: Use the Shape dropdown to insert rectangles, circles, or triangles
3. **Images**: Click Image → Upload to add images from your device

#### **Editing Elements**
- **Select**: Click on any element to select it
- **Move**: Drag selected elements to reposition them
- **Resize**: Use the corner handles to resize selected elements
- **Edit Text**: Double-click text elements to edit content inline
- **Format**: Use the Format tab to change colors, fonts, and styles

#### **Presentation Mode**
- Click the "Present" button to enter full-screen mode
- Use arrow keys or spacebar to navigate
- Press Escape to exit presentation mode

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| **File Operations** | |
| Save presentation | `Ctrl+S` |
| New presentation | `Ctrl+N` |
| **Editing** | |
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Y` |
| Delete selected element | `Delete` |
| Deselect element | `Escape` |
| **Text Formatting** | |
| Bold | `Ctrl+B` |
| Italic | `Ctrl+I` |
| Underline | `Ctrl+U` |
| **Presentation** | |
| Start presentation | `F5` |
| Next slide (presentation) | `→` or `Space` |
| Previous slide (presentation) | `←` |
| Exit presentation | `Escape` |

## Project Structure

```
src/
├── components/
│   ├── Header/           # Top navigation bar with menus
│   ├── Toolbar/          # Insert and format tools
│   ├── SlidePanel/       # Slide thumbnails sidebar
│   ├── Canvas/           # Main editing area
│   ├── PresentationMode/ # Full-screen presentation
│   └── HelpModal/        # Help system (NEW!)
├── App.js               # Main application component
├── App.css              # Global styles
├── index.js             # React entry point
└── index.css            # Base styles
```

## Documentation

- **[PROJECT_EXPLANATION.md](PROJECT_EXPLANATION.md)** - Complete project overview and technical details
- **[NEW_FEATURES.md](NEW_FEATURES.md)** - Detailed documentation of all new features
- **[USAGE_GUIDE.md](USAGE_GUIDE.md)** - Quick start guide and tutorials
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

## Technical Features

### **State Management**
- React hooks for component state
- Centralized slide data management
- Real-time element updates

### **Drag & Drop System**
- Custom mouse event handling
- Boundary detection and constraints
- Smooth resize and move operations

### **Responsive Design**
- CSS Grid and Flexbox layouts
- Mobile-first approach
- Touch-friendly interactions

### **Performance Optimizations**
- React.memo for component optimization
- useCallback for event handlers
- Efficient re-rendering strategies

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

This project is built with modern React patterns and follows best practices for:
- Component composition
- State management
- Event handling
- Responsive design
- Accessibility

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Inspired by Google Slides interface and functionality
- Built with React 18 and modern CSS features
- Uses Font Awesome for icons
- Roboto font for typography
