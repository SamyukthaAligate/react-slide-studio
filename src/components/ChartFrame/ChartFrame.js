import React, { useEffect, useRef, useState } from 'react';
import './ChartFrame.css';

const DEFAULT_SIZE = { width: 360, height: 260 };

const ensureSize = (value) => {
  if (!value) return DEFAULT_SIZE;
  const width = Math.max(Number(value.width) || DEFAULT_SIZE.width, 48);
  const height = Math.max(Number(value.height) || DEFAULT_SIZE.height, 48);
  return { width, height };
};

const ChartFrame = ({ children }) => {
  const containerRef = useRef(null);
  const [size, setSize] = useState(DEFAULT_SIZE);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    if (typeof ResizeObserver === 'undefined') {
      const rect = node.getBoundingClientRect();
      setSize(ensureSize(rect));
      return undefined;
    }

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const rect = entry.contentRect || node.getBoundingClientRect();
      setSize((prev) => {
        const next = ensureSize(rect);
        return prev.width === next.width && prev.height === next.height ? prev : next;
      });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="chart-frame" ref={containerRef}>
      <div className="chart-frame__body">
        {typeof children === 'function' ? children(size) : children}
      </div>
    </div>
  );
};

export default ChartFrame;
