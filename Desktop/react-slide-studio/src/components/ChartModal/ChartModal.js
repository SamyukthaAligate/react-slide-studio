import React, { useState } from 'react';
import './ChartModal.css';

const ChartModal = ({ onClose, onCreateChart }) => {
  const [chartType, setChartType] = useState('bar');
  const [chartData, setChartData] = useState([
    { label: 'Item 1', value: 50, color: '#4285f4' },
    { label: 'Item 2', value: 75, color: '#34a853' },
    { label: 'Item 3', value: 60, color: '#fbbc04' }
  ]);
  const [chartColor, setChartColor] = useState('#4285f4');

  const addDataPoint = () => {
    const newItem = {
      label: `Item ${chartData.length + 1}`,
      value: 50,
      color: chartType === 'pie' ? `#${Math.floor(Math.random()*16777215).toString(16)}` : chartColor
    };
    setChartData([...chartData, newItem]);
  };

  const removeDataPoint = (index) => {
    if (chartData.length > 1) {
      setChartData(chartData.filter((_, i) => i !== index));
    }
  };

  const updateDataPoint = (index, field, value) => {
    const updated = chartData.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: field === 'value' ? parseFloat(value) || 0 : value };
      }
      return item;
    });
    setChartData(updated);
  };

  const handleCreate = () => {
    const chart = {
      type: 'chart',
      chartType: chartType,
      x: 100,
      y: 100,
      width: 300,
      height: 200,
      data: chartData,
      color: chartType === 'pie' ? undefined : chartColor
    };
    onCreateChart(chart);
    onClose();
  };

  return (
    <div className="chart-modal-overlay" onClick={onClose}>
      <div className="chart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="chart-modal-header">
          <h2>
            <i className="fas fa-chart-bar"></i>
            Create Custom Chart
          </h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="chart-modal-content">
          {/* Chart Type Selection */}
          <div className="chart-section">
            <h3>Chart Type</h3>
            <div className="chart-type-selector">
              <button
                className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                onClick={() => setChartType('bar')}
              >
                <i className="fas fa-chart-bar"></i>
                Bar Chart
              </button>
              <button
                className={`chart-type-btn ${chartType === 'pie' ? 'active' : ''}`}
                onClick={() => setChartType('pie')}
              >
                <i className="fas fa-chart-pie"></i>
                Pie Chart
              </button>
              <button
                className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
                onClick={() => setChartType('line')}
              >
                <i className="fas fa-chart-line"></i>
                Line Chart
              </button>
            </div>
          </div>

          {/* Chart Color (for bar and line charts) */}
          {chartType !== 'pie' && (
            <div className="chart-section">
              <h3>Chart Color</h3>
              <div className="color-picker-row">
                <input
                  type="color"
                  value={chartColor}
                  onChange={(e) => {
                    setChartColor(e.target.value);
                    // Update all data points with new color
                    setChartData(chartData.map(item => ({ ...item, color: e.target.value })));
                  }}
                  className="color-input-large"
                />
                <span className="color-value">{chartColor}</span>
              </div>
            </div>
          )}

          {/* Data Points */}
          <div className="chart-section">
            <div className="section-header">
              <h3>Data Points</h3>
              <button className="add-data-btn" onClick={addDataPoint}>
                <i className="fas fa-plus"></i>
                Add Data
              </button>
            </div>

            <div className="data-points-list">
              {chartData.map((item, index) => (
                <div key={index} className="data-point-row">
                  <div className="data-point-number">{index + 1}</div>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateDataPoint(index, 'label', e.target.value)}
                    placeholder="Label"
                    className="data-input label-input"
                  />
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) => updateDataPoint(index, 'value', e.target.value)}
                    placeholder="Value"
                    className="data-input value-input"
                    min="0"
                  />
                  {chartType === 'pie' && (
                    <input
                      type="color"
                      value={item.color}
                      onChange={(e) => updateDataPoint(index, 'color', e.target.value)}
                      className="data-color-input"
                      title="Color"
                    />
                  )}
                  <button
                    className="remove-data-btn"
                    onClick={() => removeDataPoint(index)}
                    disabled={chartData.length === 1}
                    title="Remove"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="chart-section">
            <h3>Preview</h3>
            <div className="chart-preview">
              {chartType === 'bar' && (
                <div className="preview-bar-chart">
                  {chartData.map((item, index) => (
                    <div key={index} className="preview-bar-item">
                      <div
                        className="preview-bar"
                        style={{
                          height: `${(item.value / Math.max(...chartData.map(d => d.value))) * 100}%`,
                          backgroundColor: item.color
                        }}
                      />
                      <span className="preview-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {chartType === 'pie' && (
                <div className="preview-pie-chart">
                  <div className="pie-legend">
                    {chartData.map((item, index) => (
                      <div key={index} className="legend-item">
                        <div
                          className="legend-color"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.label}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {chartType === 'line' && (
                <div className="preview-line-chart">
                  <div className="line-preview-text">
                    Line chart with {chartData.length} data points
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="chart-modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="create-btn" onClick={handleCreate}>
            <i className="fas fa-check"></i>
            Create Chart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartModal;
