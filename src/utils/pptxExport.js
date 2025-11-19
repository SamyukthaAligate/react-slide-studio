import PptxGenJS from 'pptxgenjs';

const DEFAULT_DPI = 96;
const DEFAULT_TEXT_PADDING = 8;

const pxToInches = (value = 0) => {
  const numeric = typeof value === 'number' ? value : parseFloat(value);
  if (!Number.isFinite(numeric)) return 0;
  return numeric / DEFAULT_DPI;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const sanitizeNumber = (value, fallback = 0) => {
  const numeric = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizeRotation = (rotation) => {
  const numeric = sanitizeNumber(rotation, 0);
  if (!numeric) return undefined;
  const normalized = numeric % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

const parseColorString = (color) => {
  if (!color || typeof color !== 'string') return null;
  const value = color.trim().toLowerCase();
  if (!value || value === 'transparent' || value === 'none') return null;

  if (value.startsWith('#')) {
    let hex = value.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map((ch) => ch + ch).join('');
    }
    if (hex.length === 8) {
      const alpha = parseInt(hex.slice(6), 16) / 255;
      hex = hex.slice(0, 6);
      return { hex: hex.toUpperCase(), alpha: clamp(alpha, 0, 1) };
    }
    if (hex.length === 6) {
      return { hex: hex.toUpperCase(), alpha: 1 };
    }
    return null;
  }

  const rgbMatch = value.match(/^rgba?\(([^)]+)\)$/);
  if (rgbMatch) {
    const parts = rgbMatch[1]
      .split(',')
      .map((part) => part.trim())
      .map((part) => (part.endsWith('%') ? (parseFloat(part) / 100) * 255 : parseFloat(part)));

    if (parts.length >= 3) {
      const [r, g, b] = parts;
      const alpha = parts.length === 4 ? clamp(parts[3], 0, 1) : 1;
      if ([r, g, b].every((channel) => Number.isFinite(channel))) {
        const toHex = (channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0');
        return {
          hex: `${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase(),
          alpha,
        };
      }
    }
  }

  if (/^[0-9a-f]{6}$/i.test(value)) {
    return { hex: value.toUpperCase(), alpha: 1 };
  }

  return null;
};

const getColorHex = (color, fallback) => {
  const parsed = parseColorString(color);
  if (parsed) return parsed.hex;
  if (fallback) {
    const fallbackParsed = parseColorString(fallback);
    return fallbackParsed ? fallbackParsed.hex : undefined;
  }
  return undefined;
};

const getColorWithAlpha = (color, fallback) => {
  const parsed = parseColorString(color);
  if (parsed) return parsed;
  const fallbackParsed = parseColorString(fallback);
  return fallbackParsed || null;
};

const buildFill = (color, opacity = 1, fallback) => {
  const parsed = getColorWithAlpha(color, fallback);
  if (!parsed) return null;
  const effectiveOpacity = clamp((parsed.alpha ?? 1) * clamp(opacity, 0, 1), 0, 1);
  return {
    color: parsed.hex,
    transparency: clamp(Math.round((1 - effectiveOpacity) * 100), 0, 100),
  };
};

const buildLine = (color, widthPx, opacity = 1, fallback) => {
  const parsed = getColorWithAlpha(color, fallback);
  const strokeWidth = sanitizeNumber(widthPx, 0);
  if (!parsed || parsed.alpha === 0 || strokeWidth <= 0) {
    return { type: 'none' };
  }
  const effectiveOpacity = clamp((parsed.alpha ?? 1) * clamp(opacity, 0, 1), 0, 1);
  return {
    color: parsed.hex,
    transparency: clamp(Math.round((1 - effectiveOpacity) * 100), 0, 100),
    width: clamp(strokeWidth * 0.75, 0.1, 12),
  };
};

const isBoldFont = (fontWeight) => {
  if (!fontWeight) return false;
  if (typeof fontWeight === 'number') return fontWeight >= 600;
  const value = String(fontWeight).toLowerCase();
  return value === 'bold' || value === 'bolder' || parseInt(value, 10) >= 600;
};

const hasUnderline = (decoration) =>
  typeof decoration === 'string' && decoration.toLowerCase().includes('underline');

const hasStrike = (decoration) =>
  typeof decoration === 'string' &&
  (decoration.toLowerCase().includes('line-through') || decoration.toLowerCase().includes('strikethrough'));

const mapAlign = (align) => {
  if (!align) return undefined;
  const value = String(align).toLowerCase();
  if (['left', 'center', 'right', 'justify'].includes(value)) return value;
  return undefined;
};

const mapVerticalAlign = (valign) => {
  if (!valign) return undefined;
  const value = String(valign).toLowerCase();
  if (value === 'middle') return 'middle';
  if (['top', 'bottom'].includes(value)) return value;
  return undefined;
};

const parseLineHeightMultiple = (lineHeight, fontSize) => {
  if (!lineHeight) return undefined;
  const fontSizeNumber = sanitizeNumber(fontSize, 0);
  const value = typeof lineHeight === 'number' ? lineHeight : parseFloat(lineHeight);
  if (!Number.isFinite(value) || value <= 0) return undefined;

  if (typeof lineHeight === 'string' && lineHeight.toLowerCase().includes('px') && fontSizeNumber > 0) {
    return clamp(value / fontSizeNumber, 0.5, 3);
  }

  if (value > 0 && value <= 10) {
    return clamp(value, 0.5, 3);
  }

  if (fontSizeNumber > 0) {
    return clamp(value / fontSizeNumber, 0.5, 3);
  }

  return undefined;
};

const buildMargin = (paddingPx) => {
  const padding = pxToInches(paddingPx ?? DEFAULT_TEXT_PADDING);
  return [padding, padding, padding, padding];
};

const sanitizeText = (value, placeholder = '') => {
  if (value === null || value === undefined) return placeholder;
  if (typeof value === 'string') return value.replace(/\r\n?/g, '\n');
  return String(value);
};

const createShapeTypeResolver = (pptx) => {
  const map = {
    rectangle: pptx.ShapeType.rect,
    rect: pptx.ShapeType.rect,
    'rounded-rectangle': pptx.ShapeType.roundRect,
    roundrect: pptx.ShapeType.roundRect,
    circle: pptx.ShapeType.ellipse,
    ellipse: pptx.ShapeType.ellipse,
    triangle: pptx.ShapeType.triangle,
    diamond: pptx.ShapeType.diamond,
    parallelogram: pptx.ShapeType.parallelogram,
    'arrow-right': pptx.ShapeType.rightArrow,
    'arrow-left': pptx.ShapeType.leftArrow,
    'arrow-up': pptx.ShapeType.upArrow,
    'arrow-down': pptx.ShapeType.downArrow,
    'double-arrow': pptx.ShapeType.leftRightArrow,
    'star-5': pptx.ShapeType.star5,
    'star-6': pptx.ShapeType.star6,
    'star-8': pptx.ShapeType.star8,
    'speech-bubble': pptx.ShapeType.cloudCallout,
    'thought-bubble': pptx.ShapeType.cloud,
    'callout-rectangle': pptx.ShapeType.wedgeRectCallout,
    process: pptx.ShapeType.flowChartProcess,
    'flowchart-process': pptx.ShapeType.flowChartProcess,
    decision: pptx.ShapeType.flowChartDecision,
    'flowchart-decision': pptx.ShapeType.flowChartDecision,
    data: pptx.ShapeType.flowChartInputOutput,
    'flowchart-data': pptx.ShapeType.flowChartInputOutput,
    terminator: pptx.ShapeType.flowChartTerminator,
    'flowchart-terminator': pptx.ShapeType.flowChartTerminator,
  };

  return (shapeType) => {
    const key = String(shapeType || 'rectangle').toLowerCase();
    return map[key] || pptx.ShapeType.rect;
  };
};

const chartTypeMap = (pptx) => ({
  bar: pptx.ChartType.bar,
  column: pptx.ChartType.bar,
  line: pptx.ChartType.line,
  pie: pptx.ChartType.pie,
  doughnut: pptx.ChartType.doughnut,
});

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

export async function exportToPPTX(slides, title = 'Presentation') {
  try {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'Slide Studio';
    pptx.company = 'Slide Studio';
    pptx.subject = title;

    const resolveShapeType = createShapeTypeResolver(pptx);
    const chartTypes = chartTypeMap(pptx);

    (slides || []).forEach((slide) => {
      const s = pptx.addSlide();

      if (slide?.backgroundImage) {
        s.background = { data: slide.backgroundImage };
      } else if (slide?.background) {
        const bgColor = getColorHex(slide.background, 'FFFFFF');
        if (bgColor) {
          s.background = { fill: bgColor };
        }
      } else if (slide?.backgroundGradient) {
        const fallback = getColorHex(slide.background, 'FFFFFF') || 'FFFFFF';
        s.background = { fill: fallback };
      }

      const elements = sortElementsForStacking(slide?.elements || []);

      elements.forEach((el) => {
        try {
          if (el?.type === 'text') {
            const fontSize = sanitizeNumber(el.fontSize, 18);
            const textOptions = {
              x: pxToInches(el.x || 0),
              y: pxToInches(el.y || 0),
              w: pxToInches(el.width || 300),
              h: pxToInches(el.height || 50),
              fontSize,
              fontFace: el.fontFamily || 'Roboto',
              color: getColorHex(el.color, '000000') || '000000',
              bold: isBoldFont(el.fontWeight),
              italic: String(el.fontStyle || '').toLowerCase() === 'italic',
              underline: hasUnderline(el.textDecoration),
              strike: hasStrike(el.textDecoration),
              align: mapAlign(el.textAlign) || 'left',
              valign: mapVerticalAlign(el.verticalAlign) || 'top',
              rotate: normalizeRotation(el.rotation),
              margin: buildMargin(el.padding),
              wrap: true,
            };

            const lineSpacingMultiple = parseLineHeightMultiple(el.lineHeight, fontSize);
            if (lineSpacingMultiple) {
              textOptions.lineSpacingMultiple = lineSpacingMultiple;
            }

            const fill = buildFill(el.backgroundColor, 1, null);
            if (fill) {
              textOptions.fill = fill;
            }

            if (el.listType) {
              textOptions.bullet = String(el.listType).toLowerCase() === 'decimal' ? { type: 'number' } : true;
            }

            const textContent = sanitizeText(el.content, el.placeholder || '');
            s.addText(textContent, textOptions);
          } else if (el?.type === 'image' && el.src) {
            s.addImage({
              data: el.src,
              x: pxToInches(el.x || 0),
              y: pxToInches(el.y || 0),
              w: pxToInches(el.width || 200),
              h: pxToInches(el.height || 150),
              rotate: normalizeRotation(el.rotation),
            });
          } else if (el?.type === 'shape') {
            const shapeOptions = {
              x: pxToInches(el.x || 0),
              y: pxToInches(el.y || 0),
              w: pxToInches(el.width || 100),
              h: pxToInches(el.height || 80),
              rotate: normalizeRotation(el.rotation),
            };

            const fill = buildFill(el.fill, el.opacity ?? 1, '#4285f4');
            if (fill) {
              shapeOptions.fill = fill;
            }

            const line = buildLine(el.stroke, el.strokeWidth, el.opacity ?? 1, '#000000');
            if (line) {
              shapeOptions.line = line;
            }

            if (el.shadow) {
              shapeOptions.shadow = {
                type: 'outer',
                blur: 6,
                offset: 3,
                angle: 45,
                color: '000000',
                transparency: 70,
              };
            }

            const pptShape = resolveShapeType(el.shapeType);
            s.addShape(pptShape, shapeOptions);

            const textContent = sanitizeText(el.text ?? el.content ?? '', '').trim();
            if (textContent.length > 0) {
              const padding = Math.max(0, sanitizeNumber(el.textPadding, DEFAULT_TEXT_PADDING));
              const textX = pxToInches((el.x || 0) + padding);
              const textY = pxToInches((el.y || 0) + padding);
              const textW = pxToInches(Math.max((el.width || 100) - padding * 2, 10));
              const textH = pxToInches(Math.max((el.height || 80) - padding * 2, 10));

              const fontSize = sanitizeNumber(el.fontSize, 16);
              const textOptions = {
                x: textX,
                y: textY,
                w: textW,
                h: textH,
                fontFace: el.fontFamily || 'Roboto',
                fontSize,
                color: getColorHex(el.textColor, '#FFFFFF') || 'FFFFFF',
                bold: isBoldFont(el.fontWeight),
                italic: String(el.fontStyle || '').toLowerCase() === 'italic',
                underline: hasUnderline(el.textDecoration),
                strike: hasStrike(el.textDecoration),
                align: mapAlign(el.textAlign) || 'center',
                valign: mapVerticalAlign(el.verticalAlign) || 'middle',
                lineSpacingMultiple: parseLineHeightMultiple(el.lineHeight, fontSize),
                wrap: true,
                fill: { type: 'none' },
                margin: buildMargin(0),
              };

              s.addText(textContent, textOptions);
            }
          } else if (el?.type === 'chart') {
            const chartTypeKey = String(el.chartType || 'bar').toLowerCase();
            const pptChartType = chartTypes[chartTypeKey] || pptx.ChartType.bar;
            const seriesData = Array.isArray(el.data) ? el.data : [];

            if (seriesData.length > 0) {
              const labels = seriesData.map((d) => sanitizeText(d.label, ''));
              const values = seriesData.map((d) => sanitizeNumber(d.value, 0));
              const colorPalette = seriesData
                .map((d) => getColorHex(d.color, el.color))
                .filter(Boolean);

              const series = [
                {
                  name: sanitizeText(el.seriesName, 'Series 1'),
                  labels,
                  values,
                },
              ];

              const chartOptions = {
                x: pxToInches(el.x || 0),
                y: pxToInches(el.y || 0),
                w: pxToInches(el.width || 300),
                h: pxToInches(el.height || 200),
                showLegend: el.showLegend ?? chartTypeKey === 'pie',
                chartColors: colorPalette.length ? colorPalette : undefined,
                rotate: normalizeRotation(el.rotation),
              };

              if (chartTypeKey === 'pie' && colorPalette.length) {
                chartOptions.dataLabelPosition = 'bestFit';
                chartOptions.dataLabelColor = 'FFFFFF';
              }

              s.addChart(pptChartType, series, chartOptions);
            } else {
              s.addText('Chart (no data)', {
                x: pxToInches(el.x || 0),
                y: pxToInches(el.y || 0),
              });
            }
          } else if (el?.type === 'video' && el.src) {
            s.addMedia({
              type: 'video',
              data: el.src,
              x: pxToInches(el.x || 0),
              y: pxToInches(el.y || 0),
              w: pxToInches(el.width || 400),
              h: pxToInches(el.height || 300),
              loop: false,
              autoplay: false,
            });
          }
        } catch (elementError) {
          // eslint-disable-next-line no-console
          console.warn('Failed to export element to PPTX', elementError);
        }
      });
    });

    const fileName = `${(title || 'presentation').replace(/[^a-z0-9\-_]/gi, '_').toLowerCase()}.pptx`;
    await pptx.writeFile({ fileName });
    return { success: true };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('PPTX export failed', err);
    return { success: false, error: err.message || String(err) };
  }
}
