import PptxGenJS from 'pptxgenjs';

// Basic helper to convert px dimensions to inches assuming 96 DPI (CSS px)
const pxToInches = (px) => px / 96;

export async function exportToPPTX(slides, title = 'Presentation') {
  try {
    const pptx = new PptxGenJS();
    pptx.author = 'Slide Studio';
    pptx.company = 'Slide Studio';
    pptx.subject = title;

    // iterate slides and add simple text/image/shape placeholders
    slides.forEach((slide) => {
      const s = pptx.addSlide();
      
      // set slide background image if present (takes priority)
      if (slide.backgroundImage) {
        s.background = { data: slide.backgroundImage };
      }
      // set slide background color if present and no image
      else if (slide.background) {
        s.background = { fill: slide.background };
      }
      // set slide background gradient if present and no image/color
      else if (slide.backgroundGradient) {
        // PptxGenJS doesn't support CSS gradients directly, use color fallback
        s.background = { fill: slide.background || 'FFFFFF' };
      }

      slide.elements && slide.elements.forEach(el => {
        try {
          if (el.type === 'text') {
            s.addText(el.content || '', {
              x: pxToInches(el.x || 0),
              y: pxToInches(el.y || 0),
              w: pxToInches(el.width || 300),
              h: pxToInches(el.height || 50),
              fontSize: el.fontSize || 18,
              color: (el.color || '#000000').replace('#', ''),
              fontFace: el.fontFamily || 'Arial'
            });
          } else if (el.type === 'image' && el.src) {
            s.addImage({ data: el.src, x: pxToInches(el.x || 0), y: pxToInches(el.y || 0), w: pxToInches(el.width || 200), h: pxToInches(el.height || 150) });
          } else if (el.type === 'shape') {
            // Map known shapes to PPTX shape types
            const shapeType = (el.shapeType || 'rectangle').toLowerCase();
            let pptShape = pptx.ShapeType.rect;
            if (shapeType === 'circle' || shapeType === 'ellipse') pptShape = pptx.ShapeType.ellipse;
            if (shapeType === 'triangle') pptShape = pptx.ShapeType.triangle;

            s.addShape(pptShape, {
              x: pxToInches(el.x || 0),
              y: pxToInches(el.y || 0),
              w: pxToInches(el.width || 100),
              h: pxToInches(el.height || 80),
              fill: (el.fill || '#4285f4').replace('#', ''),
              line: { color: (el.stroke || '#000000').replace('#', '') }
            });
          } else if (el.type === 'chart') {
            try {
              // Convert simple chart data into pptxgenjs chart format
              const chartTypeMap = {
                bar: pptx.ChartType.bar,
                column: pptx.ChartType.bar,
                line: pptx.ChartType.line,
                pie: pptx.ChartType.pie,
                doughnut: pptx.ChartType.doughnut
              };
              const chartTypeKey = (el.chartType || 'bar').toLowerCase();
              const pptChartType = chartTypeMap[chartTypeKey] || pptx.ChartType.bar;

              // el.data expected as [{ label, value }, ...]
              if (Array.isArray(el.data) && el.data.length > 0) {
                const labels = el.data.map(d => d.label);
                const values = el.data.map(d => d.value);
                const series = [
                  { name: el.seriesName || 'Series 1', labels, values }
                ];

                s.addChart(pptChartType, series, {
                  x: pxToInches(el.x || 0),
                  y: pxToInches(el.y || 0),
                  w: pxToInches(el.width || 300),
                  h: pxToInches(el.height || 200),
                  showLegend: true
                });
              } else {
                s.addText('Chart (no data)', { x: pxToInches(el.x || 0), y: pxToInches(el.y || 0) });
              }
            } catch (e) {
              // fallback
              s.addText('Chart placeholder', { x: pxToInches(el.x || 0), y: pxToInches(el.y || 0) });
            }
          }
        } catch (e) {
          // don't let one element break the whole export
          // eslint-disable-next-line no-console
          console.warn('Failed to add element to PPTX', e);
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
