import React from 'react';
import ReactDOM from 'react-dom/client';
import { flushSync } from 'react-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ShapeRenderer from '../components/ShapeRenderer/ShapeRenderer';
import { cloneChartCanvas } from './chartRenderer';

const SLIDE_WIDTH = 960;
const SLIDE_HEIGHT = 540;
const EXPORT_SCALE = 2;
const DEFAULT_TEXT_PADDING = 8;

const sanitizeNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const sanitizeText = (value, placeholder = '') => {
  if (value === null || value === undefined) return placeholder;
  if (typeof value === 'string') return value.replace(/\r\n?/g, '\n');
  return String(value);
};

const resolveLineHeightPx = (fontSize, lineHeight) => {
  if (typeof lineHeight === 'string' && lineHeight.toLowerCase().includes('px')) {
    const value = parseFloat(lineHeight);
    if (Number.isFinite(value) && value > 0) return value;
  }
  const numeric = sanitizeNumber(lineHeight, 0);
  if (numeric > 0 && numeric <= 10) {
    return Math.max(numeric * fontSize, fontSize);
  }
  if (numeric > 0) return numeric;
  return Math.max(fontSize * 1.25, fontSize);
};

const estimateWrappedLines = (content, width, fontSize) => {
  const safeWidth = Math.max(1, width);
  const approxCharWidth = Math.max(fontSize * 0.55, 5);
  const maxCharsPerLine = Math.max(1, Math.floor(safeWidth / approxCharWidth));
  return content.split('\n').reduce((total, line) => {
    const trimmed = line.replace(/\s+/g, ' ');
    const length = Math.max(1, trimmed.length);
    return total + Math.max(1, Math.ceil(length / maxCharsPerLine));
  }, 0);
};

const estimateTextHeightPx = (element) => {
  const fontSize = sanitizeNumber(element?.fontSize, 18);
  const padding = sanitizeNumber(element?.padding ?? element?.textPadding, DEFAULT_TEXT_PADDING);
  const content = sanitizeText(element?.content ?? element?.text ?? element?.placeholder ?? '', '');
  const width = Math.min(Math.max(1, sanitizeNumber(element?.width, 300)), SLIDE_WIDTH);
  const lines = estimateWrappedLines(content, width, fontSize);
  const lineHeight = resolveLineHeightPx(fontSize, element?.lineHeight);
  return lines * lineHeight + padding * 2;
};

const sortElementsForStacking = (elements = []) => {
  return [...elements].sort((a, b) => {
    const zIndexA = sanitizeNumber(a?.zIndex, 0);
    const zIndexB = sanitizeNumber(b?.zIndex, 0);
    if (zIndexA !== zIndexB) return zIndexA - zIndexB;
    const createdA = sanitizeNumber(a?.createdAt, 0);
    const createdB = sanitizeNumber(b?.createdAt, 0);
    if (createdA !== createdB) return createdA - createdB;
    return 0;
  });
};

const applyRotation = (node, rotation) => {
  const angle = sanitizeNumber(rotation, 0);
  if (angle) {
    node.style.transform = `rotate(${angle}deg)`;
    node.style.transformOrigin = 'center center';
  } else {
    node.style.transform = 'none';
  }
};

const getFlexAlign = (value, fallback) => {
  const normalized = typeof value === 'string' ? value.toLowerCase() : '';
  if (normalized === 'center' || normalized === 'middle') return 'center';
  if (normalized === 'top' || normalized === 'flex-start') return 'flex-start';
  if (normalized === 'bottom' || normalized === 'flex-end') return 'flex-end';
  if (normalized === 'left') return 'flex-start';
  if (normalized === 'right') return 'flex-end';
  return fallback;
};

const createTextNode = (element) => {
  const node = document.createElement('div');
  node.style.width = '100%';
  node.style.height = '100%';
  node.style.display = 'flex';
  node.style.flexDirection = 'column';
  node.style.alignItems = getFlexAlign(element?.textAlign, 'flex-start');
  node.style.justifyContent = getFlexAlign(element?.verticalAlign, 'flex-start');
  node.style.boxSizing = 'border-box';
  node.style.padding = Number.isFinite(element?.padding)
    ? `${element.padding}px`
    : '8px';
  node.style.fontSize = `${sanitizeNumber(element?.fontSize, 16)}px`;
  node.style.fontFamily = element?.fontFamily || 'Roboto';
  node.style.color = element?.color || '#000000';
  node.style.backgroundColor = element?.backgroundColor || 'transparent';
  node.style.fontWeight = element?.fontWeight || 'normal';
  node.style.fontStyle = element?.fontStyle || 'normal';
  node.style.textAlign = element?.textAlign || 'left';
  node.style.textDecoration = element?.textDecoration || 'none';
  node.style.whiteSpace = 'pre-wrap';
  node.style.wordBreak = 'break-word';
  node.style.overflowWrap = 'anywhere';
  node.style.overflow = 'hidden';
  node.style.opacity = element?.opacity != null ? String(element.opacity) : '1';

  const lineHeight = sanitizeNumber(element?.lineHeight, 0);
  if (lineHeight > 0) {
    if (typeof element.lineHeight === 'string' && element.lineHeight.toLowerCase().includes('px')) {
      node.style.lineHeight = element.lineHeight;
    } else {
      node.style.lineHeight = String(lineHeight);
    }
  }

  const letterSpacing = sanitizeNumber(element?.letterSpacing, Number.NaN);
  if (Number.isFinite(letterSpacing)) {
    node.style.letterSpacing = `${letterSpacing}px`;
  }

  const span = document.createElement('span');
  span.style.display = 'inline-block';
  span.style.width = '100%';
  span.style.textAlign = element?.textAlign || 'left';
  span.textContent = element?.content || '';

  node.appendChild(span);

  return node;
};

const createShapeNode = (element, cleanupCallbacks) => {
  const host = document.createElement('div');
  host.style.width = '100%';
  host.style.height = '100%';
  host.style.position = 'relative';
  host.style.display = 'flex';
  host.style.alignItems = 'center';
  host.style.justifyContent = 'center';
  host.style.pointerEvents = 'none';
  host.style.boxSizing = 'border-box';

  const shapeRoot = ReactDOM.createRoot(host);
  flushSync(() => {
    shapeRoot.render(<ShapeRenderer element={element} />);
  });
  cleanupCallbacks.push(() => {
    try {
      shapeRoot.unmount();
    } catch (err) {
      console.warn('Shape cleanup error:', err);
    }
  });

  if (element?.text || element?.textPlaceholder) {
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.display = 'flex';
    overlay.style.alignItems =
      element?.verticalAlign === 'top'
        ? 'flex-start'
        : element?.verticalAlign === 'bottom'
        ? 'flex-end'
        : 'center';
    overlay.style.justifyContent =
      element?.textAlign === 'left'
        ? 'flex-start'
        : element?.textAlign === 'right'
        ? 'flex-end'
        : 'center';
    overlay.style.padding = `${sanitizeNumber(element?.textPadding, 10)}px`;
    overlay.style.pointerEvents = 'none';
    overlay.style.whiteSpace = 'pre-wrap';
    overlay.style.wordBreak = 'break-word';
    overlay.style.overflowWrap = 'anywhere';
    overlay.style.boxSizing = 'border-box';
    overlay.style.zIndex = '2';
    overlay.style.overflow = 'hidden';

    const textSpan = document.createElement('span');
    textSpan.style.fontSize = `${sanitizeNumber(element?.fontSize, 16)}px`;
    textSpan.style.fontFamily = element?.fontFamily
      ? `${element.fontFamily}, sans-serif`
      : 'Roboto, sans-serif';
    textSpan.style.maxWidth = '100%';
    textSpan.style.display = 'block';
    textSpan.style.color = element?.text
      ? element?.textColor || '#FFFFFF'
      : 'rgba(255,255,255,0.55)';
    textSpan.style.fontWeight = element?.fontWeight || 'normal';
    textSpan.style.fontStyle = element?.text
      ? element?.fontStyle || 'normal'
      : 'italic';
    textSpan.style.textAlign = element?.textAlign || 'center';
    textSpan.style.textDecoration = element?.textDecoration || 'none';
    const shapeLineHeight = sanitizeNumber(element?.lineHeight, 0);
    if (shapeLineHeight > 0) {
      if (
        typeof element.lineHeight === 'string' &&
        element.lineHeight.toLowerCase().includes('px')
      ) {
        textSpan.style.lineHeight = element.lineHeight;
      } else {
        textSpan.style.lineHeight = String(shapeLineHeight);
      }
    }
    const shapeLetterSpacing = sanitizeNumber(element?.letterSpacing, Number.NaN);
    if (Number.isFinite(shapeLetterSpacing)) {
      textSpan.style.letterSpacing = `${shapeLetterSpacing}px`;
    }

    textSpan.textContent = element?.text || element?.textPlaceholder || '';
    overlay.appendChild(textSpan);
    host.appendChild(overlay);
  }

  return host;
};

const createImageNode = (element, asyncTasks) => {
  const img = document.createElement('img');
  img.src = element?.src || '';
  img.alt = element?.alt || '';
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = element?.objectFit || 'contain';
  img.style.borderRadius = element?.borderRadius ? `${element.borderRadius}px` : '0';
  img.style.pointerEvents = 'none';

  if (!img.complete) {
    asyncTasks.push(
      new Promise((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      })
    );
  }

  return img;
};

const createChartNode = (element, asyncTasks) => {
  const chartWrapper = document.createElement('div');
  chartWrapper.style.width = '100%';
  chartWrapper.style.height = '100%';
  chartWrapper.style.display = 'block';
  chartWrapper.style.position = 'relative';
  chartWrapper.style.overflow = 'hidden';

  asyncTasks.push(
    cloneChartCanvas(element)?.then((chartCanvas) => {
      if (!chartCanvas) return;
      chartCanvas.style.width = '100%';
      chartCanvas.style.height = '100%';
      chartCanvas.style.display = 'block';
      chartWrapper.appendChild(chartCanvas);
    }) ?? Promise.resolve()
  );

  return chartWrapper;
};

const createVideoPlaceholder = (element) => {
  const wrapper = document.createElement('div');
  wrapper.style.width = '100%';
  wrapper.style.height = '100%';
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'center';
  wrapper.style.backgroundColor = '#0f172a';
  wrapper.style.color = '#e2e8f0';
  wrapper.style.borderRadius = '12px';
  wrapper.style.boxShadow = 'inset 0 0 0 2px rgba(255,255,255,0.08)';
  wrapper.style.gap = '10px';
  wrapper.style.fontFamily = 'Roboto, sans-serif';
  wrapper.style.textAlign = 'center';
  wrapper.style.padding = '24px';
  wrapper.style.pointerEvents = 'none';

  const playIcon = document.createElement('div');
  playIcon.style.width = '52px';
  playIcon.style.height = '52px';
  playIcon.style.borderRadius = '50%';
  playIcon.style.display = 'flex';
  playIcon.style.alignItems = 'center';
  playIcon.style.justifyContent = 'center';
  playIcon.style.background = 'rgba(255,255,255,0.12)';
  playIcon.style.boxShadow = '0 14px 32px rgba(15, 23, 42, 0.28)';
  playIcon.style.fontSize = '22px';
  playIcon.textContent = '▶';

  const title = document.createElement('div');
  title.style.fontSize = '16px';
  title.style.fontWeight = '600';
  title.textContent = element?.title || 'Embedded video';

  const note = document.createElement('div');
  note.style.fontSize = '13px';
  note.style.opacity = '0.8';
  note.textContent = 'Video playback is not supported in exported PDFs.';

  wrapper.appendChild(playIcon);
  wrapper.appendChild(title);
  wrapper.appendChild(note);

  return wrapper;
};

const prepareSlideElement = (slide, cleanupCallbacks, asyncTasks) => {
  const slideElement = document.createElement('div');
  slideElement.style.width = `${SLIDE_WIDTH}px`;
  slideElement.style.height = `${SLIDE_HEIGHT}px`;
  slideElement.style.position = 'relative';
  slideElement.style.overflow = 'hidden';
  slideElement.style.display = 'block';
  slideElement.style.boxSizing = 'border-box';

  const backgroundColor = slide?.background || '#ffffff';
  slideElement.style.backgroundColor = backgroundColor;

  if (slide?.backgroundGradient) {
    slideElement.style.backgroundImage = slide.backgroundGradient;
  }

  if (slide?.backgroundImage) {
    slideElement.style.backgroundImage = `url(${slide.backgroundImage})`;
    slideElement.style.backgroundSize = slide?.backgroundSize || 'cover';
    slideElement.style.backgroundPosition = slide?.backgroundPosition || 'center';
    slideElement.style.backgroundRepeat = slide?.backgroundRepeat || 'no-repeat';
  }

  const elements = sortElementsForStacking(slide?.elements || []);

  elements.forEach((element, index) => {
    const base = document.createElement('div');

    const width = clamp(sanitizeNumber(element?.width, 0), 0, SLIDE_WIDTH);
    const rawHeight = clamp(sanitizeNumber(element?.height, 0), 0, SLIDE_HEIGHT);
    const estimatedHeight = element?.type === 'text' ? estimateTextHeightPx(element) : rawHeight;
    const height = Math.max(rawHeight, Math.min(estimatedHeight, SLIDE_HEIGHT));
    const left = sanitizeNumber(element?.x, 0);
    const topLimit = Math.max(0, SLIDE_HEIGHT - height);
    const top = clamp(sanitizeNumber(element?.y, 0), 0, topLimit);

    base.style.position = 'absolute';
    base.style.left = `${left}px`;
    base.style.top = `${top}px`;
    base.style.width = `${width}px`;
    base.style.minHeight = `${height}px`;
    base.style.height = element?.type === 'text' ? 'auto' : `${height}px`;
    base.style.zIndex = String(sanitizeNumber(element?.zIndex, index));
    base.style.boxSizing = 'border-box';
    base.style.pointerEvents = 'none';
    base.style.overflow = 'visible';

    applyRotation(base, element?.rotation);

    let renderedNode = null;

    switch (element?.type) {
      case 'text':
        renderedNode = createTextNode(element);
        break;
      case 'shape':
        renderedNode = createShapeNode(element, cleanupCallbacks);
        break;
      case 'image':
        renderedNode = createImageNode(element, asyncTasks);
        break;
      case 'chart':
        renderedNode = createChartNode(element, asyncTasks);
        break;
      case 'video':
        renderedNode = createVideoPlaceholder(element);
        break;
      default:
        renderedNode = document.createElement('div');
        renderedNode.style.width = '100%';
        renderedNode.style.height = '100%';
    }

    if (renderedNode) {
      base.appendChild(renderedNode);
    }

    slideElement.appendChild(base);
  });

  return slideElement;
};

const renderSlidesToPdf = async (slides = []) => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [SLIDE_WIDTH, SLIDE_HEIGHT],
  });

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${SLIDE_WIDTH}px`;
  container.style.height = `${SLIDE_HEIGHT}px`;
  container.style.pointerEvents = 'none';
  container.style.zIndex = '-9999';
  container.setAttribute('aria-hidden', 'true');

  document.body.appendChild(container);

  try {
    const slidesArray = Array.isArray(slides) ? slides : [];

    for (let index = 0; index < slidesArray.length; index += 1) {
      const cleanupCallbacks = [];
      const asyncTasks = [];
      const slide = slidesArray[index] || {};
      const slideElement = prepareSlideElement(slide, cleanupCallbacks, asyncTasks);

      container.appendChild(slideElement);

      if (asyncTasks.length > 0) {
        await Promise.all(asyncTasks);
      }

      await new Promise((resolve) =>
        requestAnimationFrame(() => setTimeout(resolve, 60))
      );

      const canvas = await html2canvas(slideElement, {
        backgroundColor: slide?.background || '#ffffff',
        scale: EXPORT_SCALE,
        logging: false,
        useCORS: true,
        width: SLIDE_WIDTH,
        height: SLIDE_HEIGHT,
      });

      const imgData = canvas.toDataURL('image/png');

      if (index > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'PNG', 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT);

      cleanupCallbacks.forEach((callback) => {
        try {
          callback();
        } catch (err) {
          console.warn('Cleanup callback failed:', err);
        }
      });

      container.removeChild(slideElement);
    }

    return pdf;
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
};

export const exportToPDF = async (slides, presentationTitle) => {
  try {
    const pdf = await renderSlidesToPdf(slides);
    const fileName = `${(presentationTitle || 'Presentation').trim() || 'Presentation'}.pdf`;
    pdf.save(fileName);
    return { success: true };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return { success: false, error: error.message };
  }
};

// helper to get a blob URL for sharing without automatically saving file
export const exportToPDFBlobUrl = async (slides, presentationTitle) => {
  try {
    const pdf = await renderSlidesToPdf(slides);
    const data = pdf.output('blob');
    const url = URL.createObjectURL(data);
    return { success: true, url };
  } catch (error) {
    console.error('Error exporting to PDF blob URL:', error);
    return { success: false, error: error.message };
  }
};
