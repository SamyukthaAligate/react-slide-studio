import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportToPDF = async (slides, presentationTitle) => {
  try {
    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [800, 600]
    });

    // Create a temporary container for rendering slides
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      
      // Create slide element
      const slideElement = document.createElement('div');
      slideElement.style.width = '800px';
      slideElement.style.height = '600px';
      slideElement.style.position = 'relative';
      slideElement.style.backgroundColor = slide.background || '#ffffff';
      
      // Add background image if exists
      if (slide.backgroundImage) {
        slideElement.style.backgroundImage = `url(${slide.backgroundImage})`;
        slideElement.style.backgroundSize = 'cover';
        slideElement.style.backgroundPosition = 'center';
        slideElement.style.backgroundRepeat = 'no-repeat';
      }

      // Render all elements
      slide.elements.forEach(element => {
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.left = `${element.x}px`;
        el.style.top = `${element.y}px`;
        el.style.width = `${element.width}px`;
        el.style.height = `${element.height}px`;

        if (element.type === 'text') {
          el.textContent = element.content;
          el.style.fontSize = `${element.fontSize || 16}px`;
          el.style.fontFamily = element.fontFamily || 'Roboto';
          el.style.color = element.color || '#000000';
          el.style.backgroundColor = element.backgroundColor || 'transparent';
          el.style.textAlign = element.textAlign || 'left';
          el.style.fontWeight = element.fontWeight || 'normal';
          el.style.fontStyle = element.fontStyle || 'normal';
          el.style.textDecoration = element.textDecoration || 'none';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.padding = '8px';
          el.style.wordWrap = 'break-word';
        } else if (element.type === 'image') {
          const img = document.createElement('img');
          img.src = element.src;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          el.appendChild(img);
        } else if (element.type === 'shape') {
          el.style.backgroundColor = element.fill || '#4285f4';
          el.style.border = `${element.strokeWidth || 2}px solid ${element.stroke || '#1a73e8'}`;
          if (element.shapeType === 'circle') {
            el.style.borderRadius = '50%';
          } else if (element.shapeType === 'triangle') {
            el.style.width = '0';
            el.style.height = '0';
            el.style.backgroundColor = 'transparent';
            el.style.borderLeft = `${element.width / 2}px solid transparent`;
            el.style.borderRight = `${element.width / 2}px solid transparent`;
            el.style.borderBottom = `${element.height}px solid ${element.fill}`;
          }
        }

        slideElement.appendChild(el);
      });

      container.appendChild(slideElement);

      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the slide as canvas
      const canvas = await html2canvas(slideElement, {
        backgroundColor: slide.background || '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');

      // Add page to PDF (add new page for all slides except the first)
      if (i > 0) {
        pdf.addPage();
      }

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, 800, 600);

      // Remove the slide element
      container.removeChild(slideElement);
    }

    // Remove temporary container
    document.body.removeChild(container);

    // Save the PDF
    const fileName = `${presentationTitle || 'Presentation'}.pdf`;
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
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [800, 600] });
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.height = '600px';
    document.body.appendChild(container);

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideElement = document.createElement('div');
      slideElement.style.width = '800px';
      slideElement.style.height = '600px';
      slideElement.style.position = 'relative';
      slideElement.style.backgroundColor = slide.background || '#ffffff';

      if (slide.backgroundImage) {
        slideElement.style.backgroundImage = `url(${slide.backgroundImage})`;
        slideElement.style.backgroundSize = 'cover';
        slideElement.style.backgroundPosition = 'center';
        slideElement.style.backgroundRepeat = 'no-repeat';
      }

      slide.elements.forEach(element => {
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.left = `${element.x}px`;
        el.style.top = `${element.y}px`;
        el.style.width = `${element.width}px`;
        el.style.height = `${element.height}px`;

        if (element.type === 'text') {
          el.textContent = element.content;
          el.style.fontSize = `${element.fontSize || 16}px`;
          el.style.fontFamily = element.fontFamily || 'Roboto';
          el.style.color = element.color || '#000000';
          el.style.backgroundColor = element.backgroundColor || 'transparent';
          el.style.textAlign = element.textAlign || 'left';
          el.style.fontWeight = element.fontWeight || 'normal';
          el.style.fontStyle = element.fontStyle || 'normal';
          el.style.textDecoration = element.textDecoration || 'none';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.padding = '8px';
          el.style.wordWrap = 'break-word';
        } else if (element.type === 'image') {
          const img = document.createElement('img');
          img.src = element.src;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'cover';
          el.appendChild(img);
        } else if (element.type === 'shape') {
          el.style.backgroundColor = element.fill || '#4285f4';
          el.style.border = `${element.strokeWidth || 2}px solid ${element.stroke || '#1a73e8'}`;
          if (element.shapeType === 'circle') {
            el.style.borderRadius = '50%';
          } else if (element.shapeType === 'triangle') {
            el.style.width = '0';
            el.style.height = '0';
            el.style.backgroundColor = 'transparent';
            el.style.borderLeft = `${element.width / 2}px solid transparent`;
            el.style.borderRight = `${element.width / 2}px solid transparent`;
            el.style.borderBottom = `${element.height}px solid ${element.fill}`;
          }
        }

        slideElement.appendChild(el);
      });

      container.appendChild(slideElement);
      await new Promise(resolve => setTimeout(resolve, 100));
      const canvas = await html2canvas(slideElement, { backgroundColor: slide.background || '#ffffff', scale: 2, logging: false, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, 0, 800, 600);
      container.removeChild(slideElement);
    }

    document.body.removeChild(container);
    const data = pdf.output('blob');
    const url = URL.createObjectURL(data);
    return { success: true, url };
  } catch (error) {
    console.error('Error exporting to PDF blob URL:', error);
    return { success: false, error: error.message };
  }
};
