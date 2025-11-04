import React, { useMemo, useState } from "react";
import "./ChartModal.css";

const grayscalePalette = [
  "#0f0f0f",
  "#1f1f1f",
  "#2f2f2f",
  "#3f3f3f",
  "#4f4f4f",
  "#6f6f6f",
  "#8f8f8f",
  "#bfbfbf",
  "#efefef",
  "#ffffff",
];

const defaultChartData = [
  { label: "Alpha", value: 60, color: "#bfbfbf" },
  { label: "Beta", value: 48, color: "#8f8f8f" },
  { label: "Gamma", value: 36, color: "#4f4f4f" },
  { label: "Delta", value: 28, color: "#2f2f2f" },
];

const ChartModal = ({ onClose, onCreateChart, initialData }) => {
  const [chartType, setChartType] = useState("bar");
  const [chartData, setChartData] = useState(defaultChartData);
  const [chartColor, setChartColor] = useState("#6f6f6f");
  const [snapValues, setSnapValues] = useState(true);
  const [showGuides, setShowGuides] = useState(true);

  React.useEffect(() => {
    if (!initialData) return;
    setChartType(initialData.chartType || "bar");
    if (Array.isArray(initialData.data) && initialData.data.length) {
      setChartData(
        initialData.data.map((d) => ({
          label: d.label,
          value: typeof d.value === "number" ? d.value : 0,
          color: d.color,
        }))
      );
    }
    if (initialData.color) setChartColor(initialData.color);
  }, [initialData]);
  const maxValue = useMemo(() => {
    const max = Math.max(...chartData.map((item) => item.value || 0), 0);
    return max <= 0 ? 1 : max;
  }, [chartData]);

  const pieGradient = useMemo(() => {
    const total =
      chartData.reduce((acc, item) => acc + (item.value || 0), 0) || 1;
    let start = 0;
    const segments = chartData.map((item) => {
      const slice = ((item.value || 0) / total) * 100;
      const end = start + slice;
      const segment = `${item.color || "#bfbfbf"} ${start}% ${end}%`;
      start = end;
      return segment;
    });
    return `conic-gradient(${segments.join(", ")})`;
  }, [chartData]);

  const linePoints = useMemo(() => {
    if (chartData.length === 0) return "";
    const step = chartData.length === 1 ? 100 : 100 / (chartData.length - 1);
    return chartData
      .map((item, index) => {
        const safeValue = typeof item.value === "number" ? item.value : 0;
        const normalized = Math.max(Math.min(safeValue / maxValue, 1), 0);
        const x = index * step;
        const y = 100 - normalized * 100;
        return `${x},${y}`;
      })
      .join(" ");
  }, [chartData, maxValue]);

  const handlePaletteSelect = (value) => {
    if (chartType === "pie") return;
    setChartColor(value);
    setChartData((prev) => prev.map((item) => ({ ...item, color: value })));
  };

  const addDataPoint = () => {
    const paletteIndex = chartData.length % grayscalePalette.length;
    const rawValue = Math.max(
      5,
      Math.round((chartData[chartData.length - 1]?.value || 20) * 0.9)
    );
    const value = snapValues ? Math.round(rawValue / 5) * 5 : rawValue;
    setChartData((prev) => [
      ...prev,
      {
        label: `Series ${prev.length + 1}`,
        value,
        color:
          chartType === "pie" ? grayscalePalette[paletteIndex] : chartColor,
      },
    ]);
  };

  const removeDataPoint = (index) => {
    setChartData((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)
    );
  };

  const updateDataPoint = (index, field, value) => {
    setChartData((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (field === "value") {
          const numeric = Number(value);
          const safe = Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
          const snapped = snapValues ? Math.round(safe / 5) * 5 : safe;
          return { ...item, value: snapped };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const handleCreate = () => {
    const sizeByType = {
      bar: { width: 360, height: 260 },
      line: { width: 340, height: 240 },
      pie: { width: 320, height: 240 },
    };

    const { width, height } = sizeByType[chartType] || sizeByType.bar;

    onCreateChart({
      type: "chart",
      id: initialData?.id,
      chartType,
      x: 140,
      y: 120,
      width,
      height,
      data: chartData.map((item, index) => ({
        label: item.label || `Series ${index + 1}`,
        value: typeof item.value === "number" ? item.value : 0,
        color:
          chartType === "pie"
            ? item.color || grayscalePalette[index % grayscalePalette.length]
            : chartColor,
      })),
      color: chartType === "pie" ? undefined : chartColor,
      guides: showGuides,
      snap: snapValues,
    });
    onClose();
  };

  return (
    <div className="studio-overlay" onClick={onClose}>
      <div className="studio-panel" onClick={(e) => e.stopPropagation()}>
        <header className="studio-header">
          <div className="studio-title">
            <i className="fas fa-chart-area"></i>
            <div>
              <h2>Custom Chart Studio</h2>
              <p>Build data visualizations with precise, monochrome styling.</p>
            </div>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close chart studio"
          >
            <i className="fas fa-times"></i>
          </button>
        </header>

        <div className="studio-body">
          <section className="studio-controls">
            <div className="control-group">
              <span className="group-label">Chart type</span>
              <div className="segmented-control">
                <button
                  className={chartType === "bar" ? "active" : ""}
                  onClick={() => setChartType("bar")}
                >
                  <i className="fas fa-chart-bar"></i>
                  <span>Bar</span>
                </button>
                <button
                  className={chartType === "line" ? "active" : ""}
                  onClick={() => setChartType("line")}
                >
                  <i className="fas fa-chart-line"></i>
                  <span>Line</span>
                </button>
                <button
                  className={chartType === "pie" ? "active" : ""}
                  onClick={() => setChartType("pie")}
                >
                  <i className="fas fa-chart-pie"></i>
                  <span>Pie</span>
                </button>
              </div>
            </div>

            <div className="control-group">
              <span className="group-label">Data series</span>
              <div className="data-list">
                {chartData.map((item, index) => (
                  <div key={index} className="data-row">
                    <span className="row-index">{index + 1}</span>
                    <input
                      className="minimal-input"
                      value={item.label}
                      onChange={(e) =>
                        updateDataPoint(index, "label", e.target.value)
                      }
                      placeholder="Label"
                    />
                    <input
                      className="minimal-input value"
                      type="number"
                      value={item.value}
                      min={0}
                      onChange={(e) => {
  let val = parseFloat(e.target.value);
  if (snapValues) {
    val = Math.round(val / 5) * 5; // snap to nearest 5
  }
  updateDataPoint(index, "value", val);
}}
                    />
                    {chartType === "pie" ? (
                      <div className="inline-palette">
                        {grayscalePalette.map((color) => (
                          <button
                            key={`${index}-${color}`}
                            className={`swatch ${
                              item.color === color ? "selected" : ""
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() =>
                              updateDataPoint(index, "color", color)
                            }
                            aria-label={`Set color ${color}`}
                          />
                        ))}
                      </div>
                    ) : null}
                    <button
                      className="icon-button"
                      onClick={() => removeDataPoint(index)}
                      disabled={chartData.length === 1}
                      aria-label="Remove data row"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>
              <button className="ghost-button" onClick={addDataPoint}>
                <i className="fas fa-plus"></i>
                Add series
              </button>
            </div>

            {chartType !== "pie" && (
              <div className="control-group">
                <span className="group-label">Monochrome palette</span>
                <div className="inline-palette expanded">
                  {grayscalePalette.map((color) => (
                    <button
                      key={color}
                      className={`swatch ${
                        chartColor === color ? "selected" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handlePaletteSelect(color)}
                      aria-label={`Select ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="control-group options">
              <span className="group-label">Precision & layout</span>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={snapValues}
                  onChange={(e) => setSnapValues(e.target.checked)}
                />
                <span>Snap values to neat increments</span>
              </label>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={showGuides}
                  onChange={(e) => setShowGuides(e.target.checked)}
                />
                <span>Show alignment guides in preview</span>
              </label>
            </div>
          </section>

          <section className="studio-preview">
            <div className="preview-surface">
              {showGuides && (
                <>
                  <div className="guide vertical"></div>
                  <div className="guide horizontal"></div>
                </>
              )}

              {chartType === "bar" && (
                <div className="preview-bars">
                  {chartData.map((item, index) => (
                    <div key={index} className="preview-column">
                      <div
                        className="preview-bar"
                        style={{
                          height: `${((item.value || 0) / maxValue) * 100}%`,
                          background: `linear-gradient(180deg, ${item.color} 0%, #111 100%)`,
                        }}
                      />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {chartType === "line" && (
                <div className="preview-line">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline
                      points={linePoints}
                      fill="none"
                      stroke={chartColor}
                      strokeWidth="2"
                    />
                    {chartData.map((item, index) => {
                      const step =
                        chartData.length === 1
                          ? 100
                          : 100 / (chartData.length - 1);
                      const cx = index * step;
                      const cy = 100 - ((item.value || 0) / maxValue) * 100;
                      return (
                        <circle
                          key={index}
                          cx={cx}
                          cy={cy}
                          r={2.8}
                          fill="#ffffff"
                          stroke={chartColor}
                          strokeWidth="1"
                        />
                      );
                    })}
                  </svg>
                </div>
              )}

              {chartType === "pie" && (
                <div
                  className="preview-pie"
                  style={{ backgroundImage: pieGradient }}
                >
                  <div className="pie-center" />
                </div>
              )}
            </div>

            <div className="preview-meta">
              <div>
                <h4>Output specs</h4>
                <p>360 × 240 px canvas • mono palette • export ready</p>
              </div>
              <div className="legend-preview">
                {chartData.map((item, index) => (
                  <span key={index}>
                    <span
                      className="dot"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        <footer className="studio-footer">
          <button className="ghost-button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" onClick={handleCreate}>
            <i className="fas fa-check"></i>
            Insert chart
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ChartModal;
