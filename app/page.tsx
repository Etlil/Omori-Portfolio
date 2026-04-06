'use client';

import { useState } from 'react';

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <p>Taps: {count}</p>
      <button
        style={{
          fontSize: '24px',
          padding: '20px 40px',
          background: 'black',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          display: 'block',
          marginBottom: '20px',
        }}
        onClick={() => setCount(c => c + 1)}
      >
        TAP ME
      </button>
    </div>
  );
}