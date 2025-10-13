# React Slide Studio 🎨

A fully functional, modern presentation tool built with React and CSS. Create stunning presentations with an intuitive interface, powerful features, and complete responsiveness across all devices.

![Version](https://img.shields.io/badge/version-3.0-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Latest Features (v3.0)

### 📝 **Enhanced Text & Title Insertion**
- **Title & Content Presets**: Quick-add title or body text boxes from the Insert tab with improved default sizing and formatting.
- **Default Slide Title**: First slide now starts with a centered `Click to add Title` placeholder for faster composition.

### • **Rich Bullet Lists**
- **Multiple Styles**: Choose from filled, hollow, square, or numbered bullet formats directly under Insert → Bullets.
- **Color Picker**: Assign bullet text colors before inserting, with custom color support.
- **Smart Editing**: Press Enter to continue the active bullet style; Backspace cleanly removes bullet markers; list numbering auto-adjusts.

### 🗂️ **Slide Management Workflow**
- **Toolbar Controls**: Add, delete current, or delete previous slides without leaving the Insert tab.
- **Slides Menu**: Dedicated header dropdown with quick actions (add, delete, move up/down).
- **Drag & Drop Reordering**: Rearrange slides in the sidebar with visual feedback, maintaining selection and history.

### 🔗 **Streamlined Sharing Controls**
- **Share Dropdown**: Access copy link, email, and social sharing directly from the header with the same glassmorphism styling as other menus.
- **Status Feedback**: Instant clipboard success/error badges keep users informed.
- **Advanced Options**: Launch the full `ShareModal` for PDF exports and detailed distribution flows.

### 📐 **Element Resizing & Dimensions**
- **Universal Size Controls**: Increase/decrease size for all element types (10% increments)
- **Precise Dimensions**: Direct width/height input controls (50-800px width, 30-600px height)
- **Responsive Scaling**: Elements scale properly across all screen sizes
- **Visual Feedback**: Real-time dimension display while editing

### 📱 **Fully Responsive Interface**
- **Mobile Hamburger Menu**: Smooth slide-in navigation for tablets and mobile
- **Adaptive Dropdowns**: All menus optimized for touch devices (44px min touch targets)
- **Breakpoint System**: 
  - Desktop (>1024px): Full features
  - Tablet (768px-1024px): Compact layouts
  - Mobile (480px-768px): Touch-optimized
  - Small mobile (<480px): Ultra-compact

### 🔍 **Zoom Functionality**
- **Zoom Range**: 50% to 200% with 10% increments
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + +` - Zoom In
  - `Ctrl/Cmd + -` - Zoom Out
  - `Ctrl/Cmd + 0` - Fit to Screen (100%)
- **Visual Indicator**: Real-time zoom level display in View menu
- **Smooth Scaling**: Canvas scales with proper transform origin

### 🛠️ **Tools Menu**
- **Spell Check**: Scans text elements on current slide
- **Ruler & Guides**: 
  - Toggleable horizontal and vertical rulers
  - Pixel markers every 50px
  - Corner close button for easy removal
  - Responsive sizing for different screens
- **Arrange Objects**: 
  - Bring to Front / Send to Back
  - Bring Forward / Send Backward
  - Layer management for selected elements
- **Group Elements**: Multi-select grouping (coming soon)
- **Settings Modal**: 
  - Display settings (rulers toggle)
  - Zoom controls
  - About section

### 💾 **Save & Load System**
- **Local Storage**: Save presentations in browser
- **Multiple Presentations**: Create and manage unlimited presentations
- **Open Recent**: Quick access to saved presentations with delete option
- **Auto-Save Metadata**: Tracks title and last modified date
- **PDF Export**: Download presentations as PDF

### 🎥 **Media Support**
- **Images**: Upload and insert images with drag & drop
- **Videos**: Add MP4, WebM videos with playback controls
- **Charts**: Create bar, pie, and line charts with custom data
- **Shapes**: Rectangles, circles, triangles with customizable colors

## 🚀 Features

### 🎨 **Core Functionality**
- **Slide Management**: Add, delete, duplicate, and navigate between slides
- **Text Elements**: Full formatting (15+ fonts, sizes 8-72px, colors, alignment)
- **Drag & Drop**: Intuitive mouse interactions for all elements
- **Presentation Mode**: Full-screen with keyboard navigation
- **Undo/Redo**: 50-level history for all actions
- **Real-time Editing**: Double-click text to edit inline

### 🎯 **User Interface**
- **Modern Design**: Clean, Google Slides-inspired interface
- **Interactive Menus**: File, Edit, View, Insert, Tools, Help
- **Context Menus**: Right-click for slide operations
- **Help System**: User guide, shortcuts, tips & tricks
- **Accessibility**: High contrast mode, reduced motion support

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
- Use **Insert → New Slide** in the toolbar or the **Slides** header menu to add a fresh slide template
- Click the "+" button in the slide panel for a quick add
- Drag thumbnails in the slide panel to reorder; the active slide follows your drop location
- Right-click any slide thumbnail for duplicate/delete context actions

#### **Adding Elements**
1. **Title & Text Boxes**: Use the **Title & Text** dropdown to insert pre-sized title or content placeholders (the first slide starts with a default title box automatically)
2. **Bullets**: Open the **Bullets** dropdown to select filled, hollow, square, or numbered styles and pick a text color before inserting
3. **Shapes**: Use the Shape dropdown to insert rectangles, circles, or triangles
4. **Images**: Click Image → Upload to add images from your device

#### **Editing Elements**
- **Select**: Click on any element to select it
- **Move**: Drag selected elements to reposition them
- **Resize**: Use the corner handles to resize selected elements
- **Edit Text**: Double-click text elements to edit content inline; pressing **Enter** continues the current bullet style, while **Backspace** removes bullet markers cleanly
- **Format**: Use the Format tab to change colors, fonts, and styles
- **Undo/Redo**: Press `Ctrl+Z` / `Cmd+Z` (and `Ctrl+Shift+Z` / `Cmd+Shift+Z`) while typing to undo or redo without leaving edit mode

#### **Presentation Mode**
- Click the "Present" button to enter full-screen mode
- Use arrow keys or spacebar to navigate
- Press Escape to exit presentation mode

#### **Sharing Your Presentation**
- Use the **Share** dropdown in the header to copy the presentation link, send a quick email, or post to Twitter, LinkedIn, Facebook, and WhatsApp with consistent styling and feedback.
- Choose **Advanced share options…** for PDF export workflows and saved presentation sharing via the modal.

### ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| **File Operations** | |
| Save presentation | `Ctrl+S` / `Cmd+S` |
| New presentation | `Ctrl+N` / `Cmd+N` |
| **Editing** | |
| Undo | `Ctrl+Z` / `Cmd+Z` |
| Redo | `Ctrl+Y` / `Cmd+Y` |
| Delete selected element | `Delete` |
| Deselect element | `Escape` |
| **Text Formatting** | |
| Bold | `Ctrl+B` / `Cmd+B` |
| Italic | `Ctrl+I` / `Cmd+I` |
| Underline | `Ctrl+U` / `Cmd+U` |
| **View & Zoom** | |
| Zoom In | `Ctrl++` / `Cmd++` |
| Zoom Out | `Ctrl+-` / `Cmd+-` |
| Fit to Screen | `Ctrl+0` / `Cmd+0` |
| **Presentation** | |
| Start presentation | `F5` |
| Next slide | `→` or `Space` |
| Previous slide | `←` |
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

## 🏗️ Technical Features

### **State Management**
- React hooks for component state
- Centralized slide data management
- Real-time element updates

### **Drag & Drop System**
- Custom mouse event handling
- Boundary detection and constraints
- Smooth resize and move operations
- **Context Menu Enhancements**: Right-clicking empty canvas surfaces opens a context menu aligned to cursor position (with viewport clamping) offering `Paste`; element context menus provide `Cut`, `Copy`, and `Paste` hooks for consistent clipboard handling.
- **Layout Consistency**: Canvas wrapper and context dropdown styling align with the updated modern glass aesthetic for a cohesive editing feel.

### **Responsive Design**
- CSS Grid and Flexbox layouts
- Mobile-first approach
- Touch-friendly interactions

### **Performance Optimizations**
- React.memo for component optimization
- useCallback for event handlers
- Efficient re-rendering strategies

## 🌐 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📊 Project Stats

- **Components**: 10+ React components
- **Lines of Code**: 5000+
- **Features**: 50+ implemented features
- **Responsive Breakpoints**: 4 (1024px, 768px, 480px, 360px)
- **Keyboard Shortcuts**: 15+

## 🤝 Contributing

This project is built with modern React patterns and follows best practices for:
- Component composition and reusability
- State management with hooks
- Event handling and performance optimization
- Responsive design and mobile-first approach
- Accessibility (WCAG 2.1 guidelines)
- Clean code and documentation

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Inspired by Google Slides interface and functionality
- Built with React 18 and modern CSS features
- Uses Font Awesome for icons
- Roboto font family for typography
- HTML5 Canvas API for rendering

## 📞 Support

For issues, questions, or suggestions:
- Create an issue on GitHub
- Check the Help menu in the application
- Review keyboard shortcuts with `?` key

---

**Made with ❤️ using React**
