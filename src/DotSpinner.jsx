import React, { useState, useEffect } from 'react';

export default function DotSpinner({ className = '', style = {} }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => (c + 1) % 4); // 0..3 dots
    }, 300);
    return () => clearInterval(interval);
  }, []);
  return (
    <span className={className} style={style}>{'.'.repeat(count)}</span>
  );
}
