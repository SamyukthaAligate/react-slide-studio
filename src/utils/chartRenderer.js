import React from 'react';
import ReactDOM from 'react-dom/client';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components and plugins
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels // Register the datalabels plugin
);

const safeNumber = (value, fallback) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const getChartType = (chartElement) => {
  return typeof chartElement?.chartType === 'string'
    ? chartElement.chartType.trim().toLowerCase()
    : '';
};

const formatChartData = (chartElement) => {
  if (!chartElement.data || !Array.isArray(chartElement.data)) {
    // Return empty dataset if data is invalid
    return {
      labels: [],
      datasets: [{
        label: 'No Data',
        data: [],
        backgroundColor: '#f0f0f0',
        borderColor: '#cccccc',
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 'flex',
        categoryPercentage: 0.8,
        barPercentage: 0.9,
      }]
    };
  }

  const chartType = getChartType(chartElement);

  if (chartType === 'pie' || chartType === 'doughnut') {
    return {
      labels: chartElement.data.map(item => item.label || ''),
      datasets: [{
        data: chartElement.data.map(item => item.value || 0),
        backgroundColor: chartElement.data.map(item => item.color || '#cccccc'),
        borderWidth: 1,
        borderColor: '#ffffff',
        borderRadius: 4
      }]
    };
  }

  // For bar and line charts
  return {
    labels: chartElement.data.map(item => item.label || ''),
    datasets: [{
      label: 'Data',
      data: chartElement.data.map(item => item.value || 0),
      backgroundColor: chartElement.color || '#4285f4',
      borderColor: chartElement.color || '#4285f4',
      borderWidth: 2,
      borderRadius: 4,
      barThickness: 'flex',
      categoryPercentage: 0.8,
      barPercentage: 0.9,
      fill: chartType === 'line',
      tension: 0.3,
      pointBackgroundColor: chartElement.color || '#4285f4',
      pointBorderColor: '#fff',
      pointHoverRadius: 6,
      pointHoverBorderWidth: 2
    }]
  };
};

export const renderChart = (element, chartElement) => {
  // Create a container for the chart with proper styling
  const chartContainer = document.createElement('div');
  chartContainer.style.width = '100%';
  chartContainer.style.height = '100%';
  chartContainer.style.padding = '16px';
  chartContainer.style.boxSizing = 'border-box';
  chartContainer.style.borderRadius = '18px';
  chartContainer.style.background = '#ffffff';
  chartContainer.style.boxShadow = '0 18px 42px rgba(15, 23, 42, 0.12)';
  chartContainer.style.overflow = 'hidden';
  
  // Clear any existing content
  element.innerHTML = '';
  element.appendChild(chartContainer);
  
  // Use legacy render for compatibility with html2canvas
  const root = ReactDOM.createRoot(chartContainer, {
    identifierPrefix: 'chart-',
    onRecoverableError: (error, errorInfo) => {
      console.warn('Chart render warning:', error, errorInfo);
    }
  });
  
  // Default options for all chart types
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    animations: {
      tension: { duration: 0 },
      numbers: { duration: 0 }
    },
    transitions: {
      active: { animation: false },
      resize: { animation: false }
    },
    layout: {
      padding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20
      }
    },
    plugins: {
      legend: {
        display: chartElement.showLegend !== false,
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 12,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 10,
        cornerRadius: 6,
        displayColors: true,
        mode: 'index',
        intersect: false
      },
      title: {
        display: !!chartElement.title,
        text: chartElement.title || '',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    }
  };
  
  const chartType = getChartType(chartElement);

  // Get chart type specific options
  const chartOptions = {
    ...defaultOptions,
    plugins: {
      ...defaultOptions.plugins,
      // Override specific plugin options for different chart types
      ...(chartType === 'pie' && {
        legend: {
          ...defaultOptions.plugins.legend,
          position: 'right',
          align: 'center'
        }
      })
    }
  };

  // Render the appropriate chart type
  const chartProps = {
    data: formatChartData(chartElement),
    options: chartOptions,
    width: '100%',
    height: '100%',
    style: {
      width: '100%',
      height: '100%',
      minHeight: '200px'
    }
  };

  switch (chartType) {
    case 'bar':
      root.render(<Bar {...chartProps} />);
      break;
    case 'pie':
    case 'doughnut':
      root.render(<Pie {...chartProps} />);
      break;
    case 'line':
      root.render(<Line {...chartProps} />);
      break;
    default:
      console.warn('Unsupported chart type:', chartElement?.chartType);
      return Promise.resolve();
  }
  
  return new Promise(resolve => {
    // Use requestAnimationFrame to ensure the chart is in the DOM
    requestAnimationFrame(() => {
      // Give the chart some time to render
      setTimeout(() => {
        // Use a more reliable way to ensure rendering is complete
        const checkRender = () => {
          if (chartContainer.querySelector('canvas')) {
            // Small delay to ensure all rendering is complete
            setTimeout(resolve, 100);
          } else {
            setTimeout(checkRender, 50);
          }
        };
        checkRender();
      }, 100);
    });
  }).catch(error => {
    console.error('Error in chart rendering:', error);
    // Continue with export even if there's an error
    return Promise.resolve();
  });
};

export const cloneChartCanvas = async (chartElement) => {
  const offscreen = document.createElement('div');
  offscreen.style.position = 'fixed';
  offscreen.style.left = '-9999px';
  offscreen.style.top = '0';
  offscreen.style.width = `${safeNumber(chartElement?.width, 300)}px`;
  offscreen.style.height = `${safeNumber(chartElement?.height, 200)}px`;
  offscreen.style.pointerEvents = 'none';
  offscreen.style.opacity = '0';
  offscreen.style.zIndex = '-1';

  document.body.appendChild(offscreen);

  try {
    await renderChart(offscreen, chartElement);
    const canvas = offscreen.querySelector('canvas');
    if (!canvas) {
      return null;
    }

    const clonedCanvas = document.createElement('canvas');
    clonedCanvas.width = canvas.width;
    clonedCanvas.height = canvas.height;
    const context = clonedCanvas.getContext('2d');
    context.drawImage(canvas, 0, 0);

    clonedCanvas.style.width = `${safeNumber(chartElement?.width, canvas.width)}px`;
    clonedCanvas.style.height = `${safeNumber(chartElement?.height, canvas.height)}px`;

    return clonedCanvas;
  } finally {
    document.body.removeChild(offscreen);
  }
};
